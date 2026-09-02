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
	"testing"
	"testing/fstest"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/discovery"
	"agent-governance-gateway/internal/httpapi"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
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

func TestRouteEndpointRejectsUnknownFields(t *testing.T) {
	handler := testHandler(t)
	req := httptest.NewRequest(http.MethodPost, "/api/route", bytes.NewBufferString(`{"surprise":true}`))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", recorder.Code)
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
	return testHandlerWithSessionAudit(t, filepath.Join(t.TempDir(), "session-audit.jsonl"))
}

func testHandlerWithSessionAudit(t *testing.T, sessionAuditPath string) http.Handler {
	t.Helper()
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
	manager, err := discovery.NewManager(discoveryConfig, filepath.Join(t.TempDir(), "approved-agents.json"), nil)
	if err != nil {
		t.Fatal(err)
	}
	return httpapi.New(router.New(cfg, store), store, nil, manager, sessionAuditPath, static, logger).Handler()
}
