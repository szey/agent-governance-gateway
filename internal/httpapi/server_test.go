package httpapi_test

import (
	"bytes"
	"encoding/json"
	"io/fs"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/discovery"
	"agent-governance-gateway/internal/httpapi"
	"agent-governance-gateway/internal/intake"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/scenario"
	"agent-governance-gateway/internal/sessionaudit"
)

func TestRouteEndpoint(t *testing.T) {
	handler := testHandler(t)
	input := models.Request{
		UserID: "user-01", AgentID: "coder-agent", TokenScopes: []string{"code.read"},
		RequestedAction: "Generate code", ClaimedIntent: "code_generation",
		RequestedCapability: "generate_code", TargetResource: "public_workspace",
		PlannedActions: []string{"read_safe_files", "generate_code"},
	}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/api/route", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", recorder.Code, recorder.Body.String())
	}
	var record models.AuditRecord
	if err := json.NewDecoder(recorder.Body).Decode(&record); err != nil {
		t.Fatal(err)
	}
	if record.PolicyDecision.Route != models.RouteAllow {
		t.Fatalf("route = %q, want allow", record.PolicyDecision.Route)
	}
	if got := recorder.Header().Get("Content-Security-Policy"); got == "" {
		t.Fatal("content security policy header is missing")
	}
}

func TestAuthorizationHTTPFailsClosedWithoutTrustedIntake(t *testing.T) {
	handler := testHandlerWithServerOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), nil, nil, httpapi.Options{
		AuthorizationIntake: intake.RejectAll{},
	})
	body, _ := json.Marshal(structuredSafeRequest())
	request := httptest.NewRequest(http.MethodPost, "/api/actions/authorize", bytes.NewReader(body))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusUnauthorized || !strings.Contains(response.Body.String(), "trusted_authorization_context_required") {
		t.Fatalf("status=%d body=%s", response.Code, response.Body.String())
	}
}

func TestTrustedIntakeOverridesForgedHTTPIdentityAndIsAudited(t *testing.T) {
	identity := intake.IdentityContext{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human", Environment: "test"},
		Agent:     models.AgentIdentity{AgentID: "coder-agent", WorkloadID: "coder-workload-v1", Environment: "test"},
		DelegatedAuthority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("a", 64), Scopes: []string{"code.read"}, Subject: "user-01",
		},
	}
	trustedIntake, err := intake.NewStatic(identity, "authenticated-test-middleware")
	if err != nil {
		t.Fatal(err)
	}
	handler := testHandlerWithServerOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), nil, nil, httpapi.Options{
		AuthorizationIntake: trustedIntake,
	})
	proposal := structuredSafeRequest()
	proposal.Principal.PrincipalID = "forged-user"
	proposal.Agent.AgentID = "forged-agent"
	proposal.Agent.WorkloadID = "forged-workload"
	proposal.Authority.CredentialFingerprint = strings.Repeat("b", 64)
	body, _ := json.Marshal(proposal)
	request := httptest.NewRequest(http.MethodPost, "/api/actions/authorize", bytes.NewReader(body))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", response.Code, response.Body.String())
	}
	var result models.ActionAuthorizationResponse
	if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result.Permit == nil || result.Decision.Request.Principal.PrincipalID != "user-01" || result.Decision.Request.Agent.AgentID != "coder-agent" {
		t.Fatalf("trusted identity did not replace caller metadata: %#v", result.Decision.Request)
	}
	provenance := result.Decision.AuthorizationContext
	if provenance == nil || provenance.ProviderID != "authenticated-test-middleware" || provenance.Assurance != intake.AssuranceAuthenticated {
		t.Fatalf("authorization provenance = %#v", provenance)
	}
}

func TestRouteEndpointRejectsUnknownFields(t *testing.T) {
	handler := testHandler(t)
	req := httptest.NewRequest(http.MethodPost, "/api/route", bytes.NewBufferString(`{"surprise":true}`))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", recorder.Code)
	}
}

func TestAuthorizeIssuesPermitWithoutInventingRuntimeEvents(t *testing.T) {
	handler := testHandler(t)
	input := structuredSafeRequest()
	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/api/authorize", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var record models.AuditRecord
	if err := json.NewDecoder(response.Body).Decode(&record); err != nil {
		t.Fatal(err)
	}
	if !record.PolicyDecision.Authorized || record.AuthorizationEnvelope == nil {
		t.Fatalf("authorization result = %#v", record)
	}
	if len(record.RuntimeObservation.Events) != 0 || len(record.RuntimeObservation.EventEvaluations) != 0 {
		t.Fatalf("authorize invented runtime evidence: %#v", record.RuntimeObservation)
	}
	if record.DispatchDecision.ExecutorInvoked {
		t.Fatal("routing must not claim that an unconnected executor ran")
	}
}

func TestActionPermitAPIReturnsCredentialOnceAndNeverListsIt(t *testing.T) {
	handler := testHandler(t)
	input := structuredSafeRequest()
	input.Action.Arguments = json.RawMessage(`{"task":"api-secret-marker","language":"go"}`)
	body, _ := json.Marshal(input)
	request := httptest.NewRequest(http.MethodPost, "/api/actions/authorize", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var authorized models.ActionAuthorizationResponse
	if err := json.NewDecoder(response.Body).Decode(&authorized); err != nil {
		t.Fatal(err)
	}
	if authorized.Permit == nil || authorized.Permit.PermitToken == "" || authorized.Permit.PermitID == "" {
		t.Fatalf("authorization response = %#v", authorized)
	}
	if authorized.Decision.ExecutionReceipt == nil || authorized.Decision.ExecutionReceipt.ActionDigest == "" {
		t.Fatalf("authorization receipt = %#v", authorized.Decision.ExecutionReceipt)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/permits?limit=10", nil)
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("permit list status = %d", response.Code)
	}
	listed := response.Body.String()
	if strings.Contains(listed, authorized.Permit.PermitToken) || strings.Contains(listed, "api-secret-marker") || strings.Contains(listed, "permit_token") {
		t.Fatalf("permit list leaked credential or raw arguments: %s", listed)
	}

	verificationBody, _ := json.Marshal(map[string]any{"permit_token": authorized.Permit.PermitToken, "action": input})
	request = httptest.NewRequest(http.MethodPost, "/api/permits/verify", bytes.NewReader(verificationBody))
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var first models.PermitVerification
	if err := json.NewDecoder(response.Body).Decode(&first); err != nil {
		t.Fatal(err)
	}
	if !first.Verified || first.Outcome != "VERIFIED" {
		t.Fatalf("first verification = %#v", first)
	}

	request = httptest.NewRequest(http.MethodPost, "/api/permits/verify", bytes.NewReader(verificationBody))
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var second models.PermitVerification
	if err := json.NewDecoder(response.Body).Decode(&second); err != nil {
		t.Fatal(err)
	}
	if second.Verified || second.Outcome != "REPLAYED" {
		t.Fatalf("second verification = %#v", second)
	}
}

func TestPrimaryPermitDemosExerciseFocusedOutcomes(t *testing.T) {
	handler := testHandler(t)
	cases := []struct {
		id              string
		outcome         string
		upstreamInvoked bool
		attempts        int
	}{
		{"valid-permit", "VERIFIED", true, 1},
		{"action-mutation", "ACTION_MISMATCH", false, 1},
		{"permit-replay", "REPLAYED", true, 2},
		{"expired-permit", "EXPIRED", false, 1},
	}
	for _, test := range cases {
		t.Run(test.id, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/demo-lab/"+test.id+"/run", bytes.NewBufferString(`{}`))
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != http.StatusOK {
				t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
			}
			var result struct {
				VerificationResult string                      `json:"verification_result"`
				EvidenceSource     models.RuntimeEventSource   `json:"evidence_source"`
				UpstreamInvoked    bool                        `json:"upstream_invoked"`
				Attempts           []models.PermitVerification `json:"attempts"`
				Decision           models.AuditRecord          `json:"decision"`
			}
			if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
				t.Fatal(err)
			}
			if result.VerificationResult != test.outcome || result.UpstreamInvoked != test.upstreamInvoked || len(result.Attempts) != test.attempts {
				t.Fatalf("demo result = %#v", result)
			}
			if result.EvidenceSource != models.RuntimeSourceSimulatedDemo {
				t.Fatalf("demo evidence source = %q", result.EvidenceSource)
			}
			auditRequest := httptest.NewRequest(http.MethodGet, "/api/audits?limit=100", nil)
			auditResponse := httptest.NewRecorder()
			handler.ServeHTTP(auditResponse, auditRequest)
			var records []models.AuditRecord
			if err := json.NewDecoder(auditResponse.Body).Decode(&records); err != nil {
				t.Fatal(err)
			}
			found := false
			for _, record := range records {
				if record.RequestID == result.Decision.RequestID {
					found = record.ExecutionReceipt != nil && record.ExecutionReceipt.EvidenceSource == models.RuntimeSourceSimulatedDemo
					break
				}
			}
			if !found {
				t.Fatalf("persisted demo audit did not retain simulated_demo provenance for %s", result.Decision.RequestID)
			}
		})
	}
}

func TestPublicRequestRejectsLegacySimulatedActionsField(t *testing.T) {
	handler := testHandler(t)
	req := httptest.NewRequest(http.MethodPost, "/api/authorize", bytes.NewBufferString(`{
		"user_id":"user-01","agent_id":"coder-agent","token_scopes":["code.read"],
		"requested_capability":"generate_code","target_resource":"public_workspace",
		"simulated_actions":["read_secret"]
	}`))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
}

func TestRuntimeEventEndpointEvaluatesPermitAndReservesDemoSource(t *testing.T) {
	handler := testHandler(t)
	authorizeBody, _ := json.Marshal(structuredSafeRequest())
	authorizeRequest := httptest.NewRequest(http.MethodPost, "/api/authorize", bytes.NewReader(authorizeBody))
	authorizeResponse := httptest.NewRecorder()
	handler.ServeHTTP(authorizeResponse, authorizeRequest)
	var record models.AuditRecord
	if err := json.NewDecoder(authorizeResponse.Body).Decode(&record); err != nil {
		t.Fatal(err)
	}
	if record.AuthorizationEnvelope == nil {
		t.Fatalf("authorize body = %s", authorizeResponse.Body.String())
	}
	permit := record.AuthorizationEnvelope
	event := models.RuntimeEvent{
		EventID: "event-1", PermitID: permit.PermitID, RequestID: record.RequestID,
		AgentID: permit.AgentID, WorkloadID: permit.WorkloadID,
		Source: models.RuntimeSourceInstrumentedAdapter, TrustLevel: models.RuntimeTrustAdapterReported,
		Capability: permit.AllowedCapability, Tool: permit.AllowedTool,
		Operation: permit.AllowedOperations[0], Resource: permit.AllowedResource,
	}
	eventBody, _ := json.Marshal(event)
	eventRequest := httptest.NewRequest(http.MethodPost, "/api/runtime-events", bytes.NewReader(eventBody))
	eventResponse := httptest.NewRecorder()
	handler.ServeHTTP(eventResponse, eventRequest)
	if eventResponse.Code != http.StatusOK {
		t.Fatalf("event status = %d, body = %s", eventResponse.Code, eventResponse.Body.String())
	}
	var evaluation models.RuntimeEventEvaluation
	if err := json.NewDecoder(eventResponse.Body).Decode(&evaluation); err != nil {
		t.Fatal(err)
	}
	if !evaluation.Accepted || !evaluation.WithinEnvelope {
		t.Fatalf("evaluation = %#v", evaluation)
	}

	event.EventID = "event-demo-forgery"
	event.Source = models.RuntimeSourceSimulatedDemo
	event.TrustLevel = models.RuntimeTrustSimulated
	eventBody, _ = json.Marshal(event)
	eventRequest = httptest.NewRequest(http.MethodPost, "/api/runtime-events", bytes.NewReader(eventBody))
	eventResponse = httptest.NewRecorder()
	handler.ServeHTTP(eventResponse, eventRequest)
	if eventResponse.Code != http.StatusBadRequest {
		t.Fatalf("reserved demo source status = %d, body = %s", eventResponse.Code, eventResponse.Body.String())
	}
}

func TestDemoLabRunsServerOwnedTelemetryAndShowsBoundaryViolation(t *testing.T) {
	handler := testHandlerWithDemoScenarios(t)
	req := httptest.NewRequest(http.MethodPost, "/api/demo-lab/authorization-boundary-violation/run", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var record models.AuditRecord
	if err := json.NewDecoder(response.Body).Decode(&record); err != nil {
		t.Fatal(err)
	}
	if record.FinalVerdict != "AUTHORIZATION_BOUNDARY_VIOLATION" {
		t.Fatalf("final verdict = %q", record.FinalVerdict)
	}
	if len(record.RuntimeObservation.Events) != 2 || len(record.RuntimeObservation.EventEvaluations) != 2 {
		t.Fatalf("runtime observation = %#v", record.RuntimeObservation)
	}
	for _, event := range record.RuntimeObservation.Events {
		if event.Source != models.RuntimeSourceSimulatedDemo || event.TrustLevel != models.RuntimeTrustSimulated {
			t.Fatalf("demo event provenance = %q/%q", event.Source, event.TrustLevel)
		}
	}
	if len(record.RuntimeObservation.AuthorizationViolations) == 0 {
		t.Fatal("boundary violation must be explicit in the audit record")
	}
}

func TestAdvancedDemoFixtureRemainsEvidenceOnlyCompatibility(t *testing.T) {
	handler := testHandlerWithDemoScenarios(t)
	req := httptest.NewRequest(http.MethodPost, "/api/demo-lab/safe-code/run", bytes.NewBufferString(`{}`))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var record models.AuditRecord
	if err := json.NewDecoder(response.Body).Decode(&record); err != nil {
		t.Fatal(err)
	}
	if record.FinalVerdict != "COMPLETED_WITHOUT_BOUNDARY_VERIFICATION" {
		t.Fatalf("final verdict = %q", record.FinalVerdict)
	}
	if len(record.RuntimeObservation.Events) != 1 || record.RuntimeObservation.Events[0].Source != models.RuntimeSourceSimulatedDemo {
		t.Fatalf("runtime observation = %#v", record.RuntimeObservation)
	}
}

func TestRuntimeCoverageNeverPresentsMissingSensorsAsZeroEvents(t *testing.T) {
	handler := testHandler(t)
	req := httptest.NewRequest(http.MethodGet, "/api/runtime-coverage", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var body struct {
		Coverage  models.RuntimeCoverage `json:"coverage"`
		Principle string                 `json:"principle"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body.Coverage.Filesystem != "not_instrumented" || body.Coverage.Network != "not_instrumented" || body.Coverage.IsolationBackend != "not_connected" {
		t.Fatalf("coverage = %#v", body.Coverage)
	}
	if !strings.Contains(body.Principle, "zero events never implies") {
		t.Fatalf("principle = %q", body.Principle)
	}
}

func TestExperimentalInventoryIsDisabledByDefault(t *testing.T) {
	handler := testHandlerWithServerOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), nil, nil, httpapi.Options{})
	request := httptest.NewRequest(http.MethodGet, "/api/agents", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusNotFound {
		t.Fatalf("inventory status = %d, want 404 while disabled", response.Code)
	}

	request = httptest.NewRequest(http.MethodGet, "/api/health", nil)
	response = httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var body struct {
		Features map[string]bool `json:"features"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body.Features["experimental_inventory"] {
		t.Fatal("health advertised experimental inventory as enabled by default")
	}
}

func TestDiscoveryAPIClassifiesLocalRootsAndKeepsEvidenceRelative(t *testing.T) {
	root := t.TempDir()
	privateSegment := "private-user-segment"
	configDir := filepath.Join(root, privateSegment, ".workbuddy")
	if err := os.MkdirAll(configDir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(configDir, "mcp.json"), []byte(`{}`), 0o600); err != nil {
		t.Fatal(err)
	}
	handler := testHandlerWithOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), nil, []string{root})
	req := httptest.NewRequest(http.MethodGet, "/api/discoveries", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var report discovery.Report
	if err := json.NewDecoder(response.Body).Decode(&report); err != nil {
		t.Fatal(err)
	}
	responseText := strings.ToLower(response.Body.String())
	if len(report.Roots) != 1 || filepath.IsAbs(report.Roots[0]) || strings.Contains(responseText, strings.ToLower(filepath.ToSlash(root))) || strings.Contains(responseText, privateSegment) {
		t.Fatalf("discovery API exposed a local root: %s", response.Body.String())
	}
	if len(report.Agents) != 1 || len(report.Agents[0].Evidence) == 0 || report.Agents[0].Evidence[0].Source != ".workbuddy/mcp.json" {
		t.Fatalf("evidence is not a relative inventory reference: %#v", report)
	}
}

func TestAgentsAPIDistinguishesGovernedIdentitiesFromAssetRegistry(t *testing.T) {
	handler := testHandler(t)
	req := httptest.NewRequest(http.MethodGet, "/api/agents", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var body struct {
		GovernedIdentities []map[string]any          `json:"governed_identities"`
		AssetRegistry      []discovery.RegistryEntry `json:"asset_registry"`
		Principle          string                    `json:"principle"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body.GovernedIdentities) != 4 || len(body.AssetRegistry) != 0 {
		t.Fatalf("agents response conflated policy identities and registration: %#v", body)
	}
	if !strings.Contains(strings.ToLower(body.Principle), "behavioral permissions live in policy") {
		t.Fatalf("principle = %q", body.Principle)
	}
}

func TestApprovedAgentRegistryRequiresAdminHeader(t *testing.T) {
	handler := testHandler(t)
	body := bytes.NewBufferString(`{"name":"WorkBuddy","agent_type":"mcp","path_contains":".mcp.json","owner":"security"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/approved-agents", body)
	req.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", response.Code)
	}
}

func TestApprovedAgentRegistryCanBeManagedFromLocalUI(t *testing.T) {
	handler := testHandler(t)
	body := bytes.NewBufferString(`{"name":"WorkBuddy","agent_type":"mcp","path_contains":".mcp.json","owner":"security"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/approved-agents", body)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Agent-Governance-Admin", "local-ui")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var result struct {
		Approved discovery.RegistryEntry `json:"approved_agent"`
	}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if result.Approved.ID == "" || result.Approved.Name != "WorkBuddy" {
		t.Fatalf("approved entry = %#v", result.Approved)
	}
}

func TestAllowAndDenyDecisionsAreBothAudited(t *testing.T) {
	handler := testHandler(t)
	requests := []models.Request{
		{
			UserID: "user-01", AgentID: "coder-agent", TokenScopes: []string{"code.read"},
			RequestedAction: "Generate code", ClaimedIntent: "code_generation", RequestedCapability: "generate_code",
			TargetResource: "public_workspace", PlannedActions: []string{"generate_code"},
		},
		{
			UserID: "user-01", AgentID: "coder-agent", TokenScopes: []string{"code.read"},
			RequestedAction: "Read finance", ClaimedIntent: "report_summary", RequestedCapability: "read_finance_data",
			TargetResource: "finance_data", PlannedActions: []string{"read_finance_data"},
		},
	}
	for _, input := range requests {
		body, _ := json.Marshal(input)
		req := httptest.NewRequest(http.MethodPost, "/api/route", bytes.NewReader(body))
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, req)
		if response.Code != http.StatusOK {
			t.Fatalf("route status = %d, body = %s", response.Code, response.Body.String())
		}
	}

	req := httptest.NewRequest(http.MethodGet, "/api/audits?limit=10", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	var records []models.AuditRecord
	if err := json.NewDecoder(response.Body).Decode(&records); err != nil {
		t.Fatal(err)
	}
	if len(records) != 2 || records[0].PolicyDecision.Route != models.RouteDeny || records[1].PolicyDecision.Route != models.RouteAllow {
		t.Fatalf("audits = %#v, want deny and allow", records)
	}
}

func TestSessionEventsEndpointDistinguishesEvidenceTrust(t *testing.T) {
	path := filepath.Join(t.TempDir(), "session-audit.jsonl")
	recorder, err := sessionaudit.New(path, "codex-pilot-001")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := recorder.RecordLifecycle("process.started", "running", []string{"pid=42"}); err != nil {
		t.Fatal(err)
	}
	if _, err := recorder.RecordJSONLine([]byte(`{"type":"item.completed","item":{"id":"item-1","type":"command_execution","status":"completed","exit_code":0}}`)); err != nil {
		t.Fatal(err)
	}
	if err := recorder.Close(); err != nil {
		t.Fatal(err)
	}

	handler := testHandlerWithSessionAudit(t, path)
	req := httptest.NewRequest(http.MethodGet, "/api/session-events?limit=10", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, req)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	var body struct {
		Events  []sessionaudit.Event `json:"events"`
		Summary struct {
			Observer     int    `json:"observer_recorded"`
			SelfReported int    `json:"self_reported"`
			Coverage     string `json:"coverage"`
		} `json:"summary"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if len(body.Events) != 2 || body.Summary.Observer != 1 || body.Summary.SelfReported != 1 {
		t.Fatalf("unexpected session report: %#v", body)
	}
	if body.Summary.Coverage != "wrapper_and_self_reported_only" {
		t.Fatalf("coverage = %q", body.Summary.Coverage)
	}
}

func testHandler(t *testing.T) http.Handler {
	t.Helper()
	return testHandlerWithOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), nil, nil)
}

func testHandlerWithSessionAudit(t *testing.T, sessionAuditPath string) http.Handler {
	t.Helper()
	return testHandlerWithOptions(t, sessionAuditPath, nil, nil)
}

func testHandlerWithDemoScenarios(t *testing.T) http.Handler {
	t.Helper()
	scenarios, err := scenario.LoadDirectory(filepath.Join("..", "..", "examples"))
	if err != nil {
		t.Fatal(err)
	}
	return testHandlerWithOptions(t, filepath.Join(t.TempDir(), "session-audit.jsonl"), scenarios, nil)
}

func testHandlerWithOptions(t *testing.T, sessionAuditPath string, scenarios []models.Scenario, discoveryRoots []string) http.Handler {
	return testHandlerWithServerOptions(t, sessionAuditPath, scenarios, discoveryRoots, httpapi.Options{ExperimentalInventory: true})
}

func testHandlerWithServerOptions(t *testing.T, sessionAuditPath string, scenarios []models.Scenario, discoveryRoots []string, options httpapi.Options) http.Handler {
	t.Helper()
	if options.AuthorizationIntake == nil {
		developmentIntake, err := intake.NewLoopbackDevelopment("httpapi-test")
		if err != nil {
			t.Fatal(err)
		}
		options.AuthorizationIntake = developmentIntake
	}
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	store, err := audit.NewStore("")
	if err != nil {
		t.Fatal(err)
	}
	static, err := fs.Sub(fstest.MapFS{"static/index.html": {Data: []byte("ok")}}, "static")
	if err != nil {
		t.Fatal(err)
	}
	logger := slog.New(slog.NewTextHandler(&bytes.Buffer{}, nil))
	discoveryConfig := filepath.Join(t.TempDir(), "discovery.json")
	if err := os.WriteFile(discoveryConfig, []byte(`{
		"signatures":[{"agent_type":"mcp","display_name":"MCP","file_names":["mcp.json"]}]
	}`), 0o600); err != nil {
		t.Fatal(err)
	}
	manager, err := discovery.NewManager(discoveryConfig, filepath.Join(t.TempDir(), "approved-agents.json"), discoveryRoots)
	if err != nil {
		t.Fatal(err)
	}
	handler := httpapi.NewWithOptions(router.New(cfg, store), store, cfg, scenarios, manager, sessionAuditPath, static, logger, options).Handler()
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		req.RemoteAddr = "127.0.0.1:54321"
		handler.ServeHTTP(w, req)
	})
}

func structuredSafeRequest() models.Request {
	return models.Request{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human", Environment: "test"},
		Agent:     models.AgentIdentity{AgentID: "coder-agent", WorkloadID: "coder-workload-v1", Environment: "test"},
		Authority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("a", 64), Scopes: []string{"code.read"}, Subject: "user-01",
		},
		Tool:   models.ToolContext{Name: "coder", Provider: "demo-adapter"},
		Action: models.ActionRequest{Capability: "generate_code", Operation: "generate", TargetResource: "public_workspace", SideEffect: "none"},
	}
}
