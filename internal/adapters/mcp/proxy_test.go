package mcp_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"agent-governance-gateway/internal/adapters/mcp"
	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/intake"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
)

func TestValidPermitInvokesMCPUpstreamExactlyOnceAndAuditsReceipt(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		calls.Add(1)
		if req.Header.Get("Authorization") != "" || req.Header.Get(mcp.HeaderAgentID) != "" || req.Header.Get("Cookie") != "" || req.Header.Get("X-Upstream-Action") != "" || req.Header.Get("Content-Encoding") != "" {
			t.Error("credential, binding, or unbound transport headers leaked to upstream")
		}
		if req.Header.Get(mcp.HeaderProtocolVersion) != mcp.ProtocolVersion20260728 || req.Header.Get(mcp.HeaderMethod) != "tools/call" || req.Header.Get(mcp.HeaderName) != "coder" {
			t.Errorf("normalized MCP routing headers were not forwarded: %#v", req.Header)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `{"jsonrpc":"2.0","id":1,"result":{"content":[]}}`)
	}))
	defer upstream.Close()

	r, store, auditPath := testRouter(t)
	action := coderRequest(`{"task":"read-only-preview","language":"go"}`)
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, err := mcp.New(r, upstream.URL, nil)
	if err != nil {
		t.Fatal(err)
	}

	response := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if calls.Load() != 1 {
		t.Fatalf("upstream calls = %d, want 1", calls.Load())
	}
	record, ok := store.Get(authorized.Decision.RequestID)
	if !ok || record.FinalVerdict != "EXECUTED_WITH_VALID_PERMIT" {
		t.Fatalf("audit record = %#v", record)
	}
	if record.ExecutionReceipt == nil || record.ExecutionReceipt.VerificationOutcome != "VERIFIED" || !record.ExecutionReceipt.UpstreamAttempted {
		t.Fatalf("execution receipt = %#v", record.ExecutionReceipt)
	}
	if len(record.RuntimeObservation.Events) != 1 || record.RuntimeObservation.Events[0].Source != models.RuntimeSourceGatewayEnforced {
		t.Fatalf("runtime evidence = %#v", record.RuntimeObservation)
	}
	persisted, err := os.ReadFile(auditPath)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(persisted, []byte(authorized.Permit.PermitToken)) {
		t.Fatal("permit token leaked into audit")
	}
	if bytes.Contains(persisted, []byte("read-only-preview")) {
		t.Fatal("raw action arguments leaked into audit")
	}
}

func TestActionMutationNeverInvokesMCPUpstream(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls.Add(1)
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	r, store, _ := testRouter(t)
	action := paymentRequest(`{"amount":100,"currency":"USD","recipient":"merchant-456"}`)
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, _ := mcp.New(r, upstream.URL, nil)
	mutated := json.RawMessage(`{"recipient":"merchant-456","currency":"USD","amount":10000}`)
	response := invoke(t, proxy, authorized.Permit.PermitToken, action, "payment.send", mutated)
	if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), "ACTION_MISMATCH") {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if calls.Load() != 0 {
		t.Fatalf("failed verification invoked upstream %d times", calls.Load())
	}
	record, _ := store.Get(authorized.Decision.RequestID)
	if record.FinalVerdict != "PERMIT_ACTION_MISMATCH" || record.ExecutionReceipt == nil || record.ExecutionReceipt.UpstreamAttempted {
		t.Fatalf("failed verification audit = %#v", record)
	}
}

func TestInvalidSignatureNeverInvokesMCPUpstream(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls.Add(1)
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()
	r, store, auditPath := testRouter(t)
	action := coderRequest(`{"task":"preview"}`)
	authorized, _ := authorizeAction(t, r, action)
	token := authorized.Permit.PermitToken
	last := "A"
	if strings.HasSuffix(token, last) {
		last = "B"
	}
	token = token[:len(token)-1] + last
	proxy, _ := mcp.New(r, upstream.URL, nil)
	response := invoke(t, proxy, token, action, "coder", action.Action.Arguments)
	if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), "INVALID_SIGNATURE") {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if calls.Load() != 0 {
		t.Fatalf("invalid signature invoked upstream %d times", calls.Load())
	}
	records := store.Recent(10)
	if len(records) != 2 || records[0].FinalVerdict != "PERMIT_INVALID_SIGNATURE" || !strings.HasPrefix(records[0].RequestID, "verify-") {
		t.Fatalf("invalid-signature attempt was not independently audited: %#v", records)
	}
	persisted, err := os.ReadFile(auditPath)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(persisted, []byte(token)) {
		t.Fatal("invalid permit credential leaked into the audit")
	}
}

func TestAllBoundPermitFailuresNeverInvokeMCPUpstream(t *testing.T) {
	tests := []struct {
		name    string
		outcome string
		mutate  func(*models.Request, *string)
	}{
		{"wrong principal", "WRONG_PRINCIPAL", func(action *models.Request, _ *string) { action.Principal.PrincipalID = "user-02" }},
		{"wrong agent", "WRONG_AGENT", func(action *models.Request, _ *string) { action.Agent.AgentID = "other-agent" }},
		{"wrong workload", "WRONG_WORKLOAD", func(action *models.Request, _ *string) { action.Agent.WorkloadID = "other-workload" }},
		{"wrong delegation", "WRONG_DELEGATION", func(action *models.Request, _ *string) {
			action.Authority.CredentialFingerprint = strings.Repeat("c", 64)
		}},
		{"wrong tool", "WRONG_TOOL", func(_ *models.Request, tool *string) { *tool = "admin-tool" }},
		{"wrong capability", "WRONG_CAPABILITY", func(action *models.Request, _ *string) { action.Action.Capability = "admin" }},
		{"wrong resource", "WRONG_RESOURCE", func(action *models.Request, _ *string) { action.Action.TargetResource = "account-999" }},
		{"wrong operation", "WRONG_OPERATION", func(action *models.Request, _ *string) { action.Action.Operation = "delete" }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			var calls atomic.Int32
			upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				calls.Add(1)
				w.WriteHeader(http.StatusOK)
			}))
			defer upstream.Close()
			r, _, _ := testRouter(t)
			authorizedAction := paymentRequest(`{"amount":100,"currency":"USD","recipient":"merchant-456"}`)
			authorized, err := authorizeAction(t, r, authorizedAction)
			if err != nil {
				t.Fatal(err)
			}
			actual := authorizedAction
			tool := actual.Tool.Name
			test.mutate(&actual, &tool)
			proxy, _ := mcp.New(r, upstream.URL, nil)
			response := invoke(t, proxy, authorized.Permit.PermitToken, actual, tool, actual.Action.Arguments)
			if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), test.outcome) {
				t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
			}
			if calls.Load() != 0 {
				t.Fatalf("%s invoked upstream %d times", test.outcome, calls.Load())
			}
		})
	}
}

func TestReplayExpiredAndRevokedPermitsNeverAddAnUpstreamCall(t *testing.T) {
	t.Run("replay", func(t *testing.T) {
		var calls atomic.Int32
		upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			calls.Add(1)
			_, _ = io.WriteString(w, `{"jsonrpc":"2.0","id":1,"result":{}}`)
		}))
		defer upstream.Close()
		r, store, _ := testRouter(t)
		action := coderRequest(`{"task":"preview"}`)
		authorized, _ := authorizeAction(t, r, action)
		proxy, _ := mcp.New(r, upstream.URL, nil)
		if first := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments); first.Code != http.StatusOK {
			t.Fatalf("first status = %d, body = %s", first.Code, first.Body.String())
		}
		second := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
		if second.Code != http.StatusForbidden || !strings.Contains(second.Body.String(), "REPLAYED") {
			t.Fatalf("second status = %d, body = %s", second.Code, second.Body.String())
		}
		if calls.Load() != 1 {
			t.Fatalf("upstream calls = %d, want exactly 1", calls.Load())
		}
		record, _ := store.Get(authorized.Decision.RequestID)
		if record.FinalVerdict != "PERMIT_REPLAY" {
			t.Fatalf("final verdict = %q", record.FinalVerdict)
		}
	})

	t.Run("expired", func(t *testing.T) {
		var calls atomic.Int32
		upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			calls.Add(1)
			w.WriteHeader(http.StatusOK)
		}))
		defer upstream.Close()
		cfg, err := config.Load(filepath.Join("..", "..", "..", "configs", "policy.json"))
		if err != nil {
			t.Fatal(err)
		}
		current := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
		store, _ := audit.NewStore("")
		r := router.NewWithClock(cfg, store, func() time.Time { return current })
		action := coderRequest(`{"task":"preview"}`)
		authorized, _ := authorizeAction(t, r, action)
		current = authorized.Permit.ExpiresAt
		proxy, _ := mcp.New(r, upstream.URL, nil)
		response := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
		if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), "EXPIRED") || calls.Load() != 0 {
			t.Fatalf("status=%d calls=%d body=%s", response.Code, calls.Load(), response.Body.String())
		}
	})

	t.Run("revoked", func(t *testing.T) {
		var calls atomic.Int32
		upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			calls.Add(1)
			w.WriteHeader(http.StatusOK)
		}))
		defer upstream.Close()
		r, _, _ := testRouter(t)
		action := coderRequest(`{"task":"preview"}`)
		authorized, _ := authorizeAction(t, r, action)
		if _, err := r.RevokePermit(authorized.Permit.PermitID); err != nil {
			t.Fatal(err)
		}
		proxy, _ := mcp.New(r, upstream.URL, nil)
		response := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
		if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), "REVOKED") || calls.Load() != 0 {
			t.Fatalf("status=%d calls=%d body=%s", response.Code, calls.Load(), response.Body.String())
		}
	})
}

func TestFailedUpstreamDoesNotRestorePermitAndRetryRequiresNewAuthorization(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		if calls.Add(1) == 1 {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		_, _ = io.WriteString(w, `{"jsonrpc":"2.0","id":1,"result":{}}`)
	}))
	defer upstream.Close()

	r, store, _ := testRouter(t)
	action := coderRequest(`{"task":"retry-explicitly"}`)
	firstAuthorization, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, _ := mcp.New(r, upstream.URL, nil)
	failed := invoke(t, proxy, firstAuthorization.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if failed.Code != http.StatusServiceUnavailable || calls.Load() != 1 {
		t.Fatalf("failed attempt status=%d calls=%d body=%s", failed.Code, calls.Load(), failed.Body.String())
	}
	permitRecord, ok := r.GetPermit(firstAuthorization.Permit.PermitID)
	if !ok || permitRecord.State != "CONSUMED" {
		t.Fatalf("permit after upstream failure = %#v, exists=%v", permitRecord, ok)
	}
	auditRecord, _ := store.Get(firstAuthorization.Decision.RequestID)
	if auditRecord.FinalVerdict != "EXECUTION_FAILED" || auditRecord.ExecutionReceipt.ExecutionOutcome != "failed" || !auditRecord.ExecutionReceipt.UpstreamAttempted {
		t.Fatalf("failed execution receipt = %#v", auditRecord)
	}

	replayed := invoke(t, proxy, firstAuthorization.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if replayed.Code != http.StatusForbidden || !strings.Contains(replayed.Body.String(), "REPLAYED") || calls.Load() != 1 {
		t.Fatalf("reused failed-attempt permit status=%d calls=%d body=%s", replayed.Code, calls.Load(), replayed.Body.String())
	}

	secondAuthorization, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	if secondAuthorization.Permit.PermitID == firstAuthorization.Permit.PermitID {
		t.Fatal("retry authorization reused the prior permit id")
	}
	succeeded := invoke(t, proxy, secondAuthorization.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if succeeded.Code != http.StatusOK || calls.Load() != 2 {
		t.Fatalf("newly authorized retry status=%d calls=%d body=%s", succeeded.Code, calls.Load(), succeeded.Body.String())
	}
}

func TestTimedOutUpstreamDoesNotRestoreConsumedPermit(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		calls.Add(1)
		select {
		case <-req.Context().Done():
		case <-time.After(100 * time.Millisecond):
		}
	}))
	defer upstream.Close()

	r, store, _ := testRouter(t)
	action := coderRequest(`{"task":"timeout"}`)
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, err := mcp.New(r, upstream.URL, &http.Client{Timeout: 20 * time.Millisecond})
	if err != nil {
		t.Fatal(err)
	}
	failed := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if failed.Code != http.StatusBadGateway || calls.Load() != 1 {
		t.Fatalf("timeout status=%d calls=%d body=%s", failed.Code, calls.Load(), failed.Body.String())
	}
	permitRecord, ok := r.GetPermit(authorized.Permit.PermitID)
	if !ok || permitRecord.State != "CONSUMED" {
		t.Fatalf("permit after timeout = %#v, exists=%v", permitRecord, ok)
	}
	auditRecord, _ := store.Get(authorized.Decision.RequestID)
	if auditRecord.ExecutionReceipt == nil || !auditRecord.ExecutionReceipt.UpstreamAttempted || auditRecord.ExecutionReceipt.ExecutionOutcome != "failed" {
		t.Fatalf("timeout execution receipt = %#v", auditRecord.ExecutionReceipt)
	}
	replayed := invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
	if replayed.Code != http.StatusForbidden || !strings.Contains(replayed.Body.String(), "REPLAYED") || calls.Load() != 1 {
		t.Fatalf("timeout replay status=%d calls=%d body=%s", replayed.Code, calls.Load(), replayed.Body.String())
	}
}

func TestConcurrentMCPReplayInvokesUpstreamExactlyOnce(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls.Add(1)
		_, _ = io.WriteString(w, `{"jsonrpc":"2.0","id":1,"result":{}}`)
	}))
	defer upstream.Close()
	r, store, _ := testRouter(t)
	action := coderRequest(`{"task":"concurrent-preview"}`)
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, _ := mcp.New(r, upstream.URL, nil)

	start := make(chan struct{})
	responses := make(chan *httptest.ResponseRecorder, 2)
	var ready sync.WaitGroup
	ready.Add(2)
	for range 2 {
		go func() {
			ready.Done()
			<-start
			responses <- invoke(t, proxy, authorized.Permit.PermitToken, action, "coder", action.Action.Arguments)
		}()
	}
	ready.Wait()
	close(start)

	var succeeded, replayed int
	for range 2 {
		response := <-responses
		switch {
		case response.Code == http.StatusOK:
			succeeded++
		case response.Code == http.StatusForbidden && strings.Contains(response.Body.String(), "REPLAYED"):
			replayed++
		default:
			t.Fatalf("unexpected concurrent response: status=%d body=%s", response.Code, response.Body.String())
		}
	}
	if succeeded != 1 || replayed != 1 || calls.Load() != 1 {
		t.Fatalf("succeeded=%d replayed=%d upstream=%d, want 1/1/1", succeeded, replayed, calls.Load())
	}
	record, _ := store.Get(authorized.Decision.RequestID)
	if record.FinalVerdict != "PERMIT_REPLAY" || record.ExecutionReceipt.VerificationOutcome != "REPLAYED" {
		t.Fatalf("concurrent replay audit lost the violation: %#v", record)
	}
}

func TestUnsupportedIsolationObligationFailsClosedBeforeMCPUpstream(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls.Add(1)
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()
	r, store, _ := testRouter(t)
	action := configReadRequest()
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	if authorized.Decision.AuthorizationEnvelope == nil || !authorized.Decision.AuthorizationEnvelope.Obligations.IsolationRequired {
		t.Fatalf("expected signed isolation obligation: %#v", authorized.Decision.AuthorizationEnvelope)
	}
	proxy, _ := mcp.New(r, upstream.URL, nil)
	response := invoke(t, proxy, authorized.Permit.PermitToken, action, action.Tool.Name, action.Action.Arguments)
	if response.Code != http.StatusForbidden || !strings.Contains(response.Body.String(), "UNSATISFIED_OBLIGATION") || calls.Load() != 0 {
		t.Fatalf("status=%d calls=%d body=%s", response.Code, calls.Load(), response.Body.String())
	}
	record, _ := store.Get(authorized.Decision.RequestID)
	if record.FinalVerdict != "EXECUTION_OBLIGATION_UNSATISFIED" || record.ExecutionReceipt.ExecutionOutcome != "UNSATISFIED_OBLIGATION" || record.ExecutionReceipt.UpstreamAttempted {
		t.Fatalf("audit receipt = %#v", record)
	}
}

func TestModernMCPHeaderOrBodyAmbiguityNeverInvokesUpstream(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls.Add(1)
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()
	r, _, _ := testRouter(t)
	action := coderRequest(`{"task":"preview"}`)
	authorized, err := authorizeAction(t, r, action)
	if err != nil {
		t.Fatal(err)
	}
	proxy, err := mcp.New(r, upstream.URL, nil)
	if err != nil {
		t.Fatal(err)
	}

	validBody := modernToolCallBody(t, "coder", action.Action.Arguments)
	tests := []struct {
		name   string
		body   []byte
		mutate func(http.Header)
		code   int
	}{
		{"method header mismatch", validBody, func(header http.Header) { header.Set(mcp.HeaderMethod, "tools/list") }, -32020},
		{"name header mismatch", validBody, func(header http.Header) { header.Set(mcp.HeaderName, "admin-tool") }, -32020},
		{"protocol metadata mismatch", bytes.Replace(validBody, []byte(mcp.ProtocolVersion20260728), []byte("2025-11-25"), 1), nil, -32020},
		{"unknown future protocol", bytes.Replace(validBody, []byte(mcp.ProtocolVersion20260728), []byte("2099-01-01"), 1), func(header http.Header) { header.Set(mcp.HeaderProtocolVersion, "2099-01-01") }, -32022},
		{"custom mirrored header without schema", validBody, func(header http.Header) { header.Set("Mcp-Param-Region", "us-east-1") }, -32020},
		{"duplicate tool name", []byte(`{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"coder","name":"admin-tool","arguments":{},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}}`), nil, -32700},
		{"unbound MRTR params", []byte(`{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"coder","arguments":{},"requestState":"opaque","_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}}`), nil, -32602},
		{"unbound tool metadata", []byte(`{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"coder","arguments":{"task":"preview"},"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","vendor.example/actionMode":"admin"}}}`), nil, -32602},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/mcp", bytes.NewReader(test.body))
			setModernHeaders(request.Header, "tools/call", "coder")
			request.Header.Set("Authorization", "AegisPermit "+authorized.Permit.PermitToken)
			if test.mutate != nil {
				test.mutate(request.Header)
			}
			response := httptest.NewRecorder()
			proxy.ServeHTTP(response, request)
			if response.Code != http.StatusBadRequest || !strings.Contains(response.Body.String(), fmt.Sprintf(`"code":%d`, test.code)) {
				t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
			}
		})
	}
	if calls.Load() != 0 {
		t.Fatalf("ambiguous modern MCP request invoked upstream %d times", calls.Load())
	}
}

func TestModernServerDiscoverPassesThroughWithoutPermit(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		calls.Add(1)
		if req.Header.Get(mcp.HeaderMethod) != "server/discover" || req.Header.Get(mcp.HeaderProtocolVersion) != mcp.ProtocolVersion20260728 {
			t.Errorf("discover routing headers = %#v", req.Header)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `{"jsonrpc":"2.0","id":1,"result":{"resultType":"complete","supportedVersions":["2026-07-28"],"capabilities":{},"ttlMs":0,"cacheScope":"private"}}`)
	}))
	defer upstream.Close()
	r, _, _ := testRouter(t)
	proxy, _ := mcp.New(r, upstream.URL, nil)
	body := []byte(`{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}}`)
	request := httptest.NewRequest(http.MethodPost, "/mcp", bytes.NewReader(body))
	setModernHeaders(request.Header, "server/discover", "")
	response := httptest.NewRecorder()
	proxy.ServeHTTP(response, request)
	if response.Code != http.StatusOK || calls.Load() != 1 {
		t.Fatalf("status = %d, calls = %d, body = %s", response.Code, calls.Load(), response.Body.String())
	}
}

func invoke(t *testing.T, handler http.Handler, token string, action models.Request, tool string, arguments json.RawMessage) *httptest.ResponseRecorder {
	t.Helper()
	body := modernToolCallBody(t, tool, arguments)
	req := httptest.NewRequest(http.MethodPost, "/mcp", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "upstream-session=must-not-pass")
	req.Header.Set("X-Upstream-Action", "must-not-pass")
	req.Header.Set("Content-Encoding", "gzip")
	setModernHeaders(req.Header, "tools/call", tool)
	req.Header.Set("Authorization", "AegisPermit "+token)
	req.Header.Set(mcp.HeaderPrincipalID, action.Principal.PrincipalID)
	req.Header.Set(mcp.HeaderAgentID, action.Agent.AgentID)
	req.Header.Set(mcp.HeaderWorkloadID, action.Agent.WorkloadID)
	req.Header.Set(mcp.HeaderDelegationFingerprint, action.Authority.CredentialFingerprint)
	req.Header.Set(mcp.HeaderCapability, action.Action.Capability)
	req.Header.Set(mcp.HeaderResource, action.Action.TargetResource)
	req.Header.Set(mcp.HeaderOperation, action.Action.Operation)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	return response
}

func modernToolCallBody(t *testing.T, tool string, arguments json.RawMessage) []byte {
	t.Helper()
	body, err := json.Marshal(map[string]any{
		"jsonrpc": "2.0", "id": 1, "method": "tools/call",
		"params": map[string]any{
			"name": tool, "arguments": json.RawMessage(arguments),
			"_meta": map[string]any{"io.modelcontextprotocol/protocolVersion": mcp.ProtocolVersion20260728},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	return body
}

func setModernHeaders(header http.Header, method, name string) {
	header.Set(mcp.HeaderProtocolVersion, mcp.ProtocolVersion20260728)
	header.Set(mcp.HeaderMethod, method)
	if name != "" {
		header.Set(mcp.HeaderName, name)
	}
}

func authorizeAction(t *testing.T, r *router.Router, request models.Request) (models.ActionAuthorizationResponse, error) {
	t.Helper()
	authorization, err := intake.NewTrustedAuthorization(request, intake.IdentityContext{
		Principal: request.EffectivePrincipal(), Agent: request.EffectiveAgent(),
		DelegatedAuthority: request.EffectiveAuthority(),
	}, "mcp-test-trusted-integration", time.Now().UTC())
	if err != nil {
		t.Fatal(err)
	}
	return r.AuthorizeTrustedAction(authorization)
}

func testRouter(t *testing.T) (*router.Router, *audit.Store, string) {
	t.Helper()
	cfg, err := config.Load(filepath.Join("..", "..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	return router.New(cfg, store), store, path
}

func coderRequest(arguments string) models.Request {
	return models.Request{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human"},
		Agent:     models.AgentIdentity{AgentID: "coder-agent", WorkloadID: "coder-workload-v1"},
		Authority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("a", 64), Scopes: []string{"code.read"}, Subject: "user-01",
		},
		Tool: models.ToolContext{Name: "coder"},
		Action: models.ActionRequest{
			Capability: "generate_code", Operation: "generate", TargetResource: "public_workspace",
			Arguments: json.RawMessage(arguments), SideEffect: "none",
		},
	}
}

func paymentRequest(arguments string) models.Request {
	return models.Request{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human"},
		Agent:     models.AgentIdentity{AgentID: "finance-agent", WorkloadID: "finance-workload-v1"},
		Authority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("b", 64), Scopes: []string{"payment.transfer"}, Subject: "user-01",
		},
		Tool: models.ToolContext{Name: "payment.send"},
		Action: models.ActionRequest{
			Capability: "payment_transfer", Operation: "transfer", TargetResource: "account-123",
			Arguments: json.RawMessage(arguments), SideEffect: "financial_transaction",
		},
	}
}

func configReadRequest() models.Request {
	return models.Request{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human"},
		Agent:     models.AgentIdentity{AgentID: "coder-agent", WorkloadID: "coder-workload-v1"},
		Authority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("d", 64), Scopes: []string{"config.read"}, Subject: "user-01",
		},
		Tool: models.ToolContext{Name: "config_reader"},
		Action: models.ActionRequest{
			Capability: "read_config", Operation: "read", TargetResource: "protected_config",
			Arguments: json.RawMessage(`{"path_class":"approved-config"}`), SideEffect: "read_only",
		},
	}
}
