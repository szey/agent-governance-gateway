package httpapi_test

import (
	"bytes"
	"encoding/json"
	"io/fs"
	"log/slog"
	"net/http"
	"net/http/httptest"
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
	return httpapi.New(router.New(cfg, store), store, nil, discovery.Report{}, sessionAuditPath, static, logger).Handler()
}
