package router_test

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/canonicalaction"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/scenario"
)

func TestDemoScenariosHaveExpectedDispatch(t *testing.T) {
	cfg := loadConfig(t)
	scenarios, err := scenario.LoadDirectory(filepath.Join("..", "..", "examples"))
	if err != nil {
		t.Fatal(err)
	}
	store, _ := audit.NewStore("")
	r := router.New(cfg, store)

	for _, item := range scenarios {
		item := item
		t.Run(item.ID, func(t *testing.T) {
			record, err := r.Process(item.Request)
			if err != nil {
				t.Fatal(err)
			}
			if record.DispatchDecision.Route != item.Expected {
				t.Fatalf("dispatch = %q, want %q; policy=%#v risk=%#v", record.DispatchDecision.Route, item.Expected, record.PolicyDecision, record.RiskAssessment)
			}
			if record.RequestID == "" {
				t.Fatal("request ID was not generated")
			}
		})
	}

	if got := len(store.Recent(20)); got != len(scenarios) {
		t.Fatalf("stored %d audit records, want %d", got, len(scenarios))
	}
}

func TestSafeRequestAllowsAndIssuesLeastPrivilegePermit(t *testing.T) {
	r, store, now := testRouter(t)
	req := safeRequest()
	req.RequestedAction = "do not persist this prompt-like text"
	record, err := r.Authorize(req)
	if err != nil {
		t.Fatal(err)
	}
	if !record.PolicyDecision.Authorized || record.PolicyDecision.Route != models.RouteAllow || record.DispatchDecision.Route != models.RouteAllow {
		t.Fatalf("record = %#v", record)
	}
	permit := record.AuthorizationEnvelope
	if permit == nil {
		t.Fatal("allowed request did not receive a permit")
	}
	if permit.AllowedCapability != "generate_code" || permit.AllowedTool != "coder" || permit.AllowedResource != "public_workspace" {
		t.Fatalf("permit = %#v", permit)
	}
	if len(permit.AllowedOperations) != 1 || permit.AllowedOperations[0] != "generate" {
		t.Fatalf("permit operations = %v", permit.AllowedOperations)
	}
	if permit.ExpiresAt.Sub(now) != 30*time.Second {
		t.Fatalf("permit expiry = %s, want the policy max duration", permit.ExpiresAt)
	}
	if record.Request.RequestedAction != "" {
		t.Fatal("prompt-like legacy requested_action leaked into audit")
	}
	if got, ok := store.Get(record.RequestID); !ok || got.AuthorizationEnvelope == nil {
		t.Fatal("authorization chain was not stored")
	}
}

func TestSignedPermitCredentialStaysOutsideAuditAndIsSingleUse(t *testing.T) {
	r, store, _ := testRouter(t)
	req := safeRequest()
	req.Action.Arguments = json.RawMessage(`{"language":"go","marker":"sensitive-argument-marker"}`)
	result, err := r.AuthorizeAction(req)
	if err != nil {
		t.Fatal(err)
	}
	if result.Permit == nil || result.Permit.PermitToken == "" {
		t.Fatal("authorized action did not receive a permit credential")
	}
	stored, ok := store.Get(result.Decision.RequestID)
	if !ok {
		t.Fatal("authorization audit was not stored")
	}
	encoded, err := json.Marshal(stored)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(encoded, []byte(result.Permit.PermitToken)) {
		t.Fatal("permit token leaked into audit")
	}
	if bytes.Contains(encoded, []byte("sensitive-argument-marker")) {
		t.Fatal("raw action arguments leaked into audit")
	}
	first, err := r.VerifyRequestAndConsume(result.Permit.PermitToken, req)
	if err != nil || !first.Verified || first.Outcome != "VERIFIED" {
		t.Fatalf("first verification = %#v, err = %v", first, err)
	}
	second, err := r.VerifyRequestAndConsume(result.Permit.PermitToken, req)
	if err != nil || second.Verified || second.Outcome != "REPLAYED" {
		t.Fatalf("second verification = %#v, err = %v", second, err)
	}
}

func TestRevokedSignedPermitIsRejected(t *testing.T) {
	r, _, _ := testRouter(t)
	req := safeRequest()
	result, err := r.AuthorizeAction(req)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := r.RevokePermit(result.Permit.PermitID); err != nil {
		t.Fatal(err)
	}
	verification, err := r.VerifyRequestAndConsume(result.Permit.PermitToken, req)
	if err != nil {
		t.Fatal(err)
	}
	if verification.Verified || verification.Outcome != "REVOKED" {
		t.Fatalf("verification = %#v", verification)
	}
}

func TestValidationRejectsRawDelegatedCredential(t *testing.T) {
	req := safeRequest()
	req.Authority.CredentialFingerprint = "Bearer-real-secret-must-never-enter-audit"
	if err := router.Validate(req); err == nil {
		t.Fatal("raw delegated credential was accepted as a fingerprint")
	}
}

func TestRejectedRawDelegatedCredentialNeverReachesAudit(t *testing.T) {
	marker := "Bearer-secret-delegated-token-marker"
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	r := router.New(loadConfig(t), store)
	request := safeRequest()
	request.Authority.CredentialFingerprint = marker
	if _, err := r.AuthorizeAction(request); err == nil {
		t.Fatal("raw delegated credential was accepted")
	}
	encoded, err := json.Marshal(store.Recent(100))
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(encoded, []byte(marker)) {
		t.Fatal("raw delegated credential reached the in-memory audit")
	}
	if persisted, err := os.ReadFile(path); err == nil && bytes.Contains(persisted, []byte(marker)) {
		t.Fatal("raw delegated credential reached the persisted audit")
	} else if err != nil && !os.IsNotExist(err) {
		t.Fatal(err)
	}
}

func TestDigestShapedDelegatedInputIsReboundBeforeAudit(t *testing.T) {
	marker := strings.Repeat("0123456789abcdef", 4)
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	r := router.New(loadConfig(t), store)
	request := safeRequest()
	request.Authority.CredentialFingerprint = marker
	result, err := r.AuthorizeAction(request)
	if err != nil {
		t.Fatal(err)
	}
	bound, err := canonicalaction.BindDelegatedAuthorityFingerprint(marker)
	if err != nil {
		t.Fatal(err)
	}
	if result.Decision.Request.Authority.CredentialFingerprint != bound || result.Decision.AuthorizationEnvelope.DelegatedCredentialFingerprint != bound {
		t.Fatalf("delegated fingerprint was not rebound: %#v", result.Decision)
	}
	encoded, err := json.Marshal(store.Recent(100))
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(encoded, []byte(marker)) {
		t.Fatal("digest-shaped delegated input reached the in-memory audit verbatim")
	}
	persisted, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(persisted, []byte(marker)) {
		t.Fatal("digest-shaped delegated input reached the persisted audit verbatim")
	}
}

func TestUnauthorizedActionIsDeniedRegardlessOfHighRiskScore(t *testing.T) {
	r, _, _ := testRouter(t)
	req := safeRequest()
	req.Action = models.ActionRequest{Capability: "read_finance_data", Operation: "read", TargetResource: "finance_data", SideEffect: "read_only"}
	req.Tool.Name = "finance_reader"
	record, err := r.Authorize(req)
	if err != nil {
		t.Fatal(err)
	}
	if record.PolicyDecision.Authorized || record.PolicyDecision.Route != models.RouteDeny || record.DispatchDecision.Route != models.RouteDeny {
		t.Fatalf("authorization failure was overridden: %#v", record)
	}
	if record.AuthorizationEnvelope != nil {
		t.Fatal("denied request received a permit")
	}
}

func TestHighRiskRemainsAdvisoryAndAddsEnhancedAuditObligation(t *testing.T) {
	r, _, _ := testRouter(t)
	req := safeRequest()
	req.Agent = models.AgentIdentity{AgentID: "finance-agent", WorkloadID: "finance-workload-v1"}
	req.Authority.Scopes = []string{"finance.read"}
	req.Tool.Name = "finance_reader"
	req.Action = models.ActionRequest{Capability: "read_finance_data", Operation: "read", TargetResource: "finance_data", SideEffect: "read_only"}
	record, err := r.Authorize(req)
	if err != nil {
		t.Fatal(err)
	}
	if !record.PolicyDecision.Authorized || record.PolicyDecision.Route != models.RouteAllow {
		t.Fatalf("policy decision = %#v, want explicit authorization", record.PolicyDecision)
	}
	if record.RiskAssessment.Level != "high" || record.DispatchDecision.Route != models.RouteAllow || record.AuthorizationEnvelope == nil {
		t.Fatalf("risk/dispatch/permit = %#v / %#v / %#v", record.RiskAssessment, record.DispatchDecision, record.AuthorizationEnvelope)
	}
	if !record.AuthorizationEnvelope.Obligations.EnhancedAuditRequired || record.AuthorizationEnvelope.Obligations.IsolationRequired {
		t.Fatalf("advisory obligations = %#v", record.AuthorizationEnvelope.Obligations)
	}
	if record.DispatchDecision.ExecutorInvoked {
		t.Fatalf("authorization claimed execution: %#v", record.DispatchDecision)
	}
}

func TestRuntimeEventInsidePermitUpdatesAudit(t *testing.T) {
	r, store, _ := testRouter(t)
	record, err := r.Authorize(safeRequest())
	if err != nil {
		t.Fatal(err)
	}
	event := eventFor(record)
	evaluation, err := r.IngestRuntimeEvent(event)
	if err != nil {
		t.Fatal(err)
	}
	if !evaluation.Accepted || !evaluation.WithinEnvelope {
		t.Fatalf("evaluation = %#v", evaluation)
	}
	updated, _ := store.Get(record.RequestID)
	if len(updated.RuntimeObservation.Events) != 1 || updated.RuntimeObservation.Coverage.ToolEvents != "adapter_reported" {
		t.Fatalf("runtime observation = %#v", updated.RuntimeObservation)
	}
}

func TestTerminatingBoundaryViolationRevokesPermit(t *testing.T) {
	r, store, _ := testRouter(t)
	record, _ := r.Authorize(safeRequest())
	event := eventFor(record)
	event.EventID = "event-secret"
	event.SecretAccess = true
	first, err := r.IngestRuntimeEvent(event)
	if err != nil {
		t.Fatal(err)
	}
	if first.Verdict != "AUTHORIZATION_BOUNDARY_VIOLATION" || !first.Terminated {
		t.Fatalf("first evaluation = %#v", first)
	}
	event.EventID = "event-after-termination"
	second, err := r.IngestRuntimeEvent(event)
	if err != nil {
		t.Fatal(err)
	}
	if second.Accepted || !hasViolation(second, "runtime.permit_unknown") {
		t.Fatalf("revoked permit accepted another event: %#v", second)
	}
	updated, _ := store.Get(record.RequestID)
	if updated.FinalVerdict != "AUTHORIZATION_BOUNDARY_VIOLATION" {
		t.Fatalf("final verdict = %q", updated.FinalVerdict)
	}
}

func TestRejectedBoundEventRevokesPermit(t *testing.T) {
	r, _, _ := testRouter(t)
	record, _ := r.Authorize(safeRequest())
	event := eventFor(record)
	event.AgentID = "other-agent"
	first, _ := r.IngestRuntimeEvent(event)
	if first.Accepted || !hasViolation(first, "runtime.agent_binding_mismatch") {
		t.Fatalf("binding mismatch = %#v", first)
	}
	event.AgentID = record.AuthorizationEnvelope.AgentID
	event.EventID = "event-after-rejection"
	second, _ := r.IngestRuntimeEvent(event)
	if second.Accepted || !hasViolation(second, "runtime.permit_unknown") {
		t.Fatalf("permit was not revoked: %#v", second)
	}
}

func TestCompletionRevokesPermit(t *testing.T) {
	r, _, now := testRouter(t)
	record, _ := r.Authorize(safeRequest())
	completed, err := r.CompleteExecution(models.ExecutionCompletion{
		RequestID: record.RequestID, PermitID: record.AuthorizationEnvelope.PermitID, Status: "completed", CompletedAt: now.Add(time.Second),
	})
	if err != nil {
		t.Fatal(err)
	}
	if completed.FinalVerdict != "COMPLETED_WITHOUT_BOUNDARY_VERIFICATION" {
		t.Fatalf("completion = %#v", completed)
	}
	event := eventFor(record)
	event.EventID = "event-after-completion"
	evaluation, _ := r.IngestRuntimeEvent(event)
	if evaluation.Accepted || !hasViolation(evaluation, "runtime.permit_unknown") {
		t.Fatalf("completed permit accepted event: %#v", evaluation)
	}
}

func TestCompletionAfterPermitExpiryIsAudited(t *testing.T) {
	store, err := audit.NewStore("")
	if err != nil {
		t.Fatal(err)
	}
	current := time.Date(2026, 9, 3, 2, 0, 0, 0, time.UTC)
	r := router.NewWithClock(loadConfig(t), store, func() time.Time { return current })
	record, err := r.Authorize(safeRequest())
	if err != nil {
		t.Fatal(err)
	}
	current = current.Add(31 * time.Second)
	completed, err := r.CompleteExecution(models.ExecutionCompletion{
		RequestID: record.RequestID, PermitID: record.AuthorizationEnvelope.PermitID, Status: "completed",
	})
	if err != nil {
		t.Fatal(err)
	}
	if completed.FinalVerdict != "PERMIT_EXPIRED" || len(completed.RuntimeObservation.AuthorizationViolations) != 1 {
		t.Fatalf("expired completion = %#v", completed)
	}
}

func TestValidationMakesClaimedIntentOptional(t *testing.T) {
	req := safeRequest()
	req.ClaimedIntent = ""
	if err := router.Validate(req); err != nil {
		t.Fatalf("optional claimed_intent rejected: %v", err)
	}
}

func TestValidationRejectsRawPathInMetadata(t *testing.T) {
	req := safeRequest()
	req.DataAccess = &models.DataAccess{Operation: "read", PathClass: `C:\\Users\\person\\secret.txt`, Protected: true}
	if err := router.Validate(req); err == nil {
		t.Fatal("expected raw path metadata to be rejected")
	}
}

func TestLegacyValidationRejectsRawPathInAuditFields(t *testing.T) {
	req := models.Request{
		UserID: "user-01", AgentID: "coder-agent", TokenScopes: []string{"code.read"},
		RequestedCapability: "read_safe_files", TargetResource: `C:\\Users\\someone\\secrets.txt`,
	}
	if err := router.Validate(req); err == nil {
		t.Fatal("legacy request accepted a raw local path as target_resource")
	}
}

func TestPublicRequestShapeRejectsSimulatedActions(t *testing.T) {
	decoder := json.NewDecoder(bytes.NewBufferString(`{
		"principal":{"principal_id":"user-01","principal_type":"human"},
		"simulated_actions":["read_secret"]
	}`))
	decoder.DisallowUnknownFields()
	var req models.Request
	if err := decoder.Decode(&req); err == nil {
		t.Fatal("simulated_actions unexpectedly remained in the public request model")
	}
}

func testRouter(t *testing.T) (*router.Router, *audit.Store, time.Time) {
	t.Helper()
	store, err := audit.NewStore("")
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 9, 3, 2, 0, 0, 0, time.UTC)
	return router.NewWithClock(loadConfig(t), store, func() time.Time { return now }), store, now
}

func loadConfig(t *testing.T) models.PolicyConfig {
	t.Helper()
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	return cfg
}

func safeRequest() models.Request {
	return models.Request{
		Principal: models.PrincipalContext{PrincipalID: "user-01", PrincipalType: "human", Tenant: "demo", Environment: "local"},
		Agent:     models.AgentIdentity{AgentID: "coder-agent", WorkloadID: "coder-workload-v1", Owner: "engineering", Environment: "demo"},
		Authority: models.DelegatedAuthority{
			CredentialFingerprint: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			Issuer:                "demo-idp", Scopes: []string{"code.read"}, Subject: "user-01",
		},
		Tool: models.ToolContext{Name: "coder", Provider: "instrumented-demo"},
		Action: models.ActionRequest{
			Capability: "generate_code", Operation: "generate", TargetResource: "public_workspace", SideEffect: "none",
		},
		ClaimedIntent: "code_generation",
	}
}

func eventFor(record models.AuditRecord) models.RuntimeEvent {
	permit := record.AuthorizationEnvelope
	return models.RuntimeEvent{
		EventID: "event-01", PermitID: permit.PermitID, RequestID: permit.RequestID, SessionID: permit.SessionID,
		AgentID: permit.AgentID, WorkloadID: permit.WorkloadID,
		Source: models.RuntimeSourceInstrumentedAdapter, TrustLevel: models.RuntimeTrustAdapterReported,
		Capability: permit.AllowedCapability, Tool: permit.AllowedTool, Operation: permit.AllowedOperations[0], Resource: permit.AllowedResource,
	}
}

func hasViolation(result models.RuntimeEventEvaluation, rule string) bool {
	for _, item := range result.Violations {
		if item.Rule == rule {
			return true
		}
	}
	return false
}
