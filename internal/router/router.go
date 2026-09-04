package router

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/detection"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/observer"
	"agent-governance-gateway/internal/policy"
	"agent-governance-gateway/internal/risk"
)

type Router struct {
	policy    *policy.Engine
	risk      *risk.Scorer
	observer  *observer.Observer
	audit     *audit.Store
	detection *detection.Engine
	clock     func() time.Time
	permitTTL time.Duration

	mu      sync.RWMutex
	permits map[string]models.AuthorizationEnvelope
}

func New(cfg models.PolicyConfig, store *audit.Store) *Router {
	return NewWithClock(cfg, store, time.Now)
}

func NewWithClock(cfg models.PolicyConfig, store *audit.Store, clock func() time.Time) *Router {
	if clock == nil {
		clock = time.Now
	}
	ttl := time.Duration(cfg.Permits.TTLSeconds) * time.Second
	if ttl <= 0 {
		ttl = 5 * time.Minute
	}
	return &Router{
		policy: policy.New(cfg), risk: risk.New(cfg), observer: observer.New(cfg), audit: store,
		detection: detection.New(cfg.SessionControls), clock: clock, permitTTL: ttl,
		permits: make(map[string]models.AuthorizationEnvelope),
	}
}

// Process remains the compatibility entry point for /api/route. It performs
// pre-execution authorization only and never invents runtime events from the
// request body.
func (r *Router) Process(req models.Request) (models.AuditRecord, error) {
	return r.Authorize(req)
}

// Authorize evaluates identity/policy first, risk second, selects a route, and
// issues a least-privilege execution permit only when execution may proceed.
func (r *Router) Authorize(req models.Request) (models.AuditRecord, error) {
	if err := Validate(req); err != nil {
		return models.AuditRecord{}, err
	}
	started := r.clock().UTC()
	if req.RequestID == "" {
		req.RequestID = newIdentifier("req")
	}

	policyDecision := r.policy.Evaluate(req)
	assessment := r.risk.Assess(req)
	detected := r.detection.Evaluate(req, assessment.Score)
	assessment = applyDetectionRisk(assessment, detected)
	dispatch := dispatchFor(policyDecision, assessment, detected)

	observation := models.RuntimeObservation{
		Events: []models.RuntimeEvent{}, EventEvaluations: []models.RuntimeEventEvaluation{},
		AuthorizationViolations: []models.AuthorizationViolation{},
		PlannedActions:          nonNil(req.PlannedActions), ActualActions: []string{},
		UnexpectedActions: []string{}, SuspiciousActions: []string{},
		Coverage: r.RuntimeCoverage(),
	}

	var permit *models.AuthorizationEnvelope
	if executionPermitted(dispatch.Route) && policyDecision.Authorized && policyDecision.Grant != nil {
		issued := issuePermit(req, *policyDecision.Grant, dispatch, started, r.permitTTL)
		permit = &issued
		r.mu.Lock()
		r.permits[issued.PermitID] = issued
		r.mu.Unlock()
	}

	auditRequest := privacySafeRequest(req)
	record := models.AuditRecord{
		RequestID: req.RequestID, CreatedAt: started, Request: auditRequest,
		PolicyDecision: policyDecision, RiskAssessment: assessment, DispatchDecision: dispatch,
		AuthorizationEnvelope: permit, SelectedExecutor: dispatch.ExecutorProfile,
		RuntimeObservation: observation, SecurityFindings: nonNilFindings(detected.Findings),
		CausalContext: detected.Context, FinalVerdict: authorizationVerdict(dispatch.Route),
		DurationMS: elapsedMilliseconds(started, r.clock().UTC()),
	}
	if err := r.audit.Append(record); err != nil {
		if permit != nil {
			r.mu.Lock()
			delete(r.permits, permit.PermitID)
			r.mu.Unlock()
		}
		return models.AuditRecord{}, err
	}
	return record, nil
}

// IngestRuntimeEvent accepts privacy-preserving metadata from a named evidence
// source and evaluates it against the permit. Source/trust mismatches, expired
// permits, and identity/request mismatches are explicitly rejected.
func (r *Router) IngestRuntimeEvent(event models.RuntimeEvent) (models.RuntimeEventEvaluation, error) {
	now := r.clock().UTC()
	if event.Timestamp.IsZero() {
		event.Timestamp = now
	} else {
		event.Timestamp = event.Timestamp.UTC()
	}
	if violation := validateRuntimeMetadata(event); violation != nil {
		evaluation := rejectedEvaluation(event, *violation)
		if err := r.auditRejectedEvent(event, evaluation, false, now); err != nil {
			return evaluation, err
		}
		return evaluation, nil
	}

	r.mu.Lock()
	permit, ok := r.permits[event.PermitID]
	if !ok {
		r.mu.Unlock()
		evaluation := rejectedEvaluation(event, models.AuthorizationViolation{
			Rule: "runtime.permit_unknown", Summary: "runtime event references an unknown execution permit",
			Expected: "active permit", Actual: event.PermitID,
		})
		if err := r.auditRejectedEvent(event, evaluation, true, now); err != nil {
			return evaluation, err
		}
		return evaluation, nil
	}

	evaluation := r.observer.Evaluate(permit, event, now)
	if evaluation.Terminated {
		delete(r.permits, permit.PermitID)
	}
	r.mu.Unlock()
	record, ok := r.audit.Get(permit.RequestID)
	if !ok {
		return evaluation, fmt.Errorf("audit record %q for permit %q not found", permit.RequestID, permit.PermitID)
	}
	record.RuntimeObservation.Events = append(record.RuntimeObservation.Events, event)
	record.RuntimeObservation.EventEvaluations = append(record.RuntimeObservation.EventEvaluations, evaluation)
	record.RuntimeObservation.AuthorizationViolations = append(record.RuntimeObservation.AuthorizationViolations, evaluation.Violations...)
	record.RuntimeObservation.ActualActions = append(record.RuntimeObservation.ActualActions, event.Operation)
	record.RuntimeObservation.Coverage.ToolEvents = coverageFor(event)
	if len(evaluation.Violations) > 0 {
		for _, item := range evaluation.Violations {
			record.SecurityFindings = append(record.SecurityFindings, models.SecurityFinding{
				ID: event.EventID + ":" + item.Rule, Category: "authorization_boundary", Severity: "critical",
				Rule: item.Rule, Summary: item.Summary,
				Evidence: []string{"event_id=" + safeEvidence(event.EventID), "source=" + string(event.Source), "trust_level=" + string(event.TrustLevel)},
			})
		}
	}
	if !evaluation.Accepted {
		record.FinalVerdict = "RUNTIME_EVENT_REJECTED"
	}
	if evaluation.Accepted && !evaluation.WithinEnvelope {
		record.FinalVerdict = "AUTHORIZATION_BOUNDARY_VIOLATION"
	}
	if evaluation.Terminated {
		completed := now
		record.CompletedAt = &completed
	}
	record.DurationMS = elapsedMilliseconds(record.CreatedAt, now)
	if err := r.audit.Update(record); err != nil {
		return evaluation, err
	}
	return evaluation, nil
}

func (r *Router) CompleteExecution(completion models.ExecutionCompletion) (models.AuditRecord, error) {
	if !safeMetadataLabel(completion.RequestID) || !safeMetadataLabel(completion.PermitID) {
		return models.AuditRecord{}, fmt.Errorf("request_id and permit_id must be short metadata identifiers")
	}
	if completion.Status != "completed" && completion.Status != "failed" && completion.Status != "terminated" {
		return models.AuditRecord{}, fmt.Errorf("status must be completed, failed, or terminated")
	}
	receivedAt := r.clock().UTC()
	r.mu.Lock()
	permit, ok := r.permits[completion.PermitID]
	if !ok || permit.RequestID != completion.RequestID {
		r.mu.Unlock()
		return models.AuditRecord{}, fmt.Errorf("execution permit is unknown or bound to another request")
	}
	delete(r.permits, completion.PermitID)
	r.mu.Unlock()
	record, ok := r.audit.Get(completion.RequestID)
	if !ok {
		return models.AuditRecord{}, fmt.Errorf("audit record %q not found", completion.RequestID)
	}
	if !permit.ExpiresAt.After(receivedAt) || (!completion.CompletedAt.IsZero() && !permit.ExpiresAt.After(completion.CompletedAt.UTC())) {
		violation := models.AuthorizationViolation{
			Rule: "execution.permit_expired", Summary: "execution completion was reported after the authorization permit expired",
			Expected: "completion before " + permit.ExpiresAt.UTC().Format(time.RFC3339Nano), Actual: receivedAt.Format(time.RFC3339Nano),
		}
		record.RuntimeObservation.AuthorizationViolations = append(record.RuntimeObservation.AuthorizationViolations, violation)
		record.SecurityFindings = append(record.SecurityFindings, models.SecurityFinding{
			ID: safeEvidence(completion.RequestID) + ":execution.permit_expired", Category: "execution_completion", Severity: "high",
			Rule: violation.Rule, Summary: violation.Summary,
			Evidence: []string{"request_id=" + safeEvidence(completion.RequestID), "permit_id=" + safeEvidence(completion.PermitID)},
		})
		record.CompletedAt = &receivedAt
		record.FinalVerdict = "EXECUTION_PERMIT_EXPIRED"
		record.DurationMS = elapsedMilliseconds(record.CreatedAt, receivedAt)
		if err := r.audit.Update(record); err != nil {
			return models.AuditRecord{}, err
		}
		return record, nil
	}
	completed := receivedAt
	record.CompletedAt = &completed
	if record.FinalVerdict != "AUTHORIZATION_BOUNDARY_VIOLATION" && record.FinalVerdict != "RUNTIME_EVENT_REJECTED" {
		switch completion.Status {
		case "completed":
			record.FinalVerdict = "COMPLETED_WITHIN_AUTHORIZATION"
		case "failed":
			record.FinalVerdict = "EXECUTION_FAILED"
		case "terminated":
			record.FinalVerdict = "EXECUTION_TERMINATED"
		}
	}
	record.DurationMS = elapsedMilliseconds(record.CreatedAt, completed)
	if err := r.audit.Update(record); err != nil {
		return models.AuditRecord{}, err
	}
	return record, nil
}

func (r *Router) auditRejectedEvent(event models.RuntimeEvent, evaluation models.RuntimeEventEvaluation, includeEvent bool, now time.Time) error {
	if !safeMetadataLabel(event.RequestID) {
		return nil
	}
	record, ok := r.audit.Get(event.RequestID)
	if !ok {
		return nil
	}
	if includeEvent {
		record.RuntimeObservation.Events = append(record.RuntimeObservation.Events, event)
	}
	record.RuntimeObservation.EventEvaluations = append(record.RuntimeObservation.EventEvaluations, evaluation)
	record.RuntimeObservation.AuthorizationViolations = append(record.RuntimeObservation.AuthorizationViolations, evaluation.Violations...)
	for _, item := range evaluation.Violations {
		record.SecurityFindings = append(record.SecurityFindings, models.SecurityFinding{
			ID: safeEvidence(event.EventID) + ":" + item.Rule, Category: "runtime_event_rejection", Severity: "high",
			Rule: item.Rule, Summary: item.Summary,
			Evidence: []string{"event_id=" + safeEvidence(event.EventID), "source=" + string(event.Source), "trust_level=" + string(event.TrustLevel)},
		})
	}
	if record.FinalVerdict != "AUTHORIZATION_BOUNDARY_VIOLATION" {
		record.FinalVerdict = "RUNTIME_EVENT_REJECTED"
	}
	record.DurationMS = elapsedMilliseconds(record.CreatedAt, now)
	return r.audit.Update(record)
}

func (r *Router) RuntimeCoverage() models.RuntimeCoverage {
	return models.RuntimeCoverage{
		GatewayRequests: "instrumented", ToolEvents: "not_reported",
		Filesystem: "not_instrumented", Network: "not_instrumented", OSSyscalls: "not_instrumented",
		IsolationBackend: "not_connected",
	}
}

func Validate(req models.Request) error {
	if req.UsesStructuredContext() {
		principal := req.EffectivePrincipal()
		agent := req.EffectiveAgent()
		authority := req.EffectiveAuthority()
		tool := req.EffectiveTool()
		action := req.EffectiveAction()
		for name, value := range map[string]string{
			"principal.principal_id": principal.PrincipalID, "principal.principal_type": principal.PrincipalType,
			"agent.agent_id": agent.AgentID, "agent.workload_id": agent.WorkloadID,
			"tool.name": tool.Name, "action.capability": action.Capability,
			"action.operation": action.Operation, "action.target_resource": action.TargetResource,
		} {
			if strings.TrimSpace(value) == "" {
				return fmt.Errorf("%s is required", name)
			}
		}
		if principal.PrincipalType != "human" && principal.PrincipalType != "service" {
			return fmt.Errorf("principal.principal_type must be human or service")
		}
		if !sha256Pattern.MatchString(authority.CredentialFingerprint) {
			return fmt.Errorf("delegated_authority.credential_fingerprint must be a 64-character hex digest")
		}
		if err := validateStructuredLabels(principal, agent, authority, tool, action); err != nil {
			return err
		}
	} else {
		for name, value := range map[string]string{
			"user_id": req.UserID, "agent_id": req.AgentID,
			"requested_capability": req.RequestedCapability, "target_resource": req.TargetResource,
		} {
			if strings.TrimSpace(value) == "" {
				return fmt.Errorf("%s is required", name)
			}
			if !safeMetadataLabel(value) {
				return fmt.Errorf("%s must be a short metadata label", name)
			}
		}
		for index, scope := range req.TokenScopes {
			if !safeMetadataLabel(scope) {
				return fmt.Errorf("token_scopes[%d] must be a short metadata label", index)
			}
		}
	}
	if req.ClaimedIntent != "" && !safeMetadataLabel(req.ClaimedIntent) {
		return fmt.Errorf("claimed_intent must be a short metadata label, not prompt content")
	}
	for _, action := range req.PlannedActions {
		if !safeMetadataLabel(action) {
			return fmt.Errorf("planned_actions must contain metadata labels")
		}
	}
	for name, value := range map[string]string{"request_id": req.RequestID, "session_id": req.SessionID, "parent_event_id": req.ParentEventID} {
		if value != "" && !safeMetadataLabel(value) {
			return fmt.Errorf("%s must be a short metadata identifier", name)
		}
	}
	for index, source := range req.InputSources {
		if !safeMetadataLabel(source.Kind) || !safeMetadataLabel(source.Trust) {
			return fmt.Errorf("input_sources[%d] kind and trust must be metadata labels", index)
		}
		if source.URIClass != "" && !safeMetadataLabel(source.URIClass) {
			return fmt.Errorf("input_sources[%d].uri_class must be a class label, not a URL or path", index)
		}
		if source.ContentSHA256 != "" && !sha256Pattern.MatchString(source.ContentSHA256) {
			return fmt.Errorf("input_sources[%d].content_sha256 must be a 64-character hex digest", index)
		}
	}
	if req.DataAccess != nil {
		if !safeMetadataLabel(req.DataAccess.Operation) || (req.DataAccess.PathClass != "" && !safeMetadataLabel(req.DataAccess.PathClass)) {
			return fmt.Errorf("data_access operation and path_class must be metadata labels, not raw paths")
		}
		if req.DataAccess.Bytes < 0 {
			return fmt.Errorf("data_access.bytes cannot be negative")
		}
	}
	return nil
}

func validateStructuredLabels(principal models.PrincipalContext, agent models.AgentIdentity, authority models.DelegatedAuthority, tool models.ToolContext, action models.ActionRequest) error {
	labels := map[string]string{
		"principal.principal_id": principal.PrincipalID, "principal.principal_type": principal.PrincipalType,
		"principal.tenant": principal.Tenant, "principal.environment": principal.Environment,
		"agent.agent_id": agent.AgentID, "agent.workload_id": agent.WorkloadID, "agent.owner": agent.Owner,
		"agent.environment": agent.Environment, "agent.framework": agent.Framework, "agent.version": agent.Version,
		"delegated_authority.issuer": authority.Issuer, "delegated_authority.subject": authority.Subject,
		"tool.tool_id": tool.ToolID, "tool.name": tool.Name, "tool.provider": tool.Provider,
		"action.capability": action.Capability, "action.operation": action.Operation,
		"action.target_resource": action.TargetResource, "action.side_effect": action.SideEffect,
	}
	for name, value := range labels {
		if value != "" && !safeMetadataLabel(value) {
			return fmt.Errorf("%s must be a short metadata label", name)
		}
	}
	for index, scope := range authority.Scopes {
		if !safeMetadataLabel(scope) {
			return fmt.Errorf("delegated_authority.scopes[%d] must be a short metadata label", index)
		}
	}
	for key, value := range principal.Metadata {
		if !safeMetadataLabel(key) || !safeMetadataLabel(value) {
			return fmt.Errorf("principal.metadata must contain metadata labels only")
		}
	}
	for name, digest := range map[string]string{"schema_sha256": tool.SchemaSHA256, "expected_schema_sha256": tool.ExpectedSchemaSHA256} {
		if digest != "" && !sha256Pattern.MatchString(digest) {
			return fmt.Errorf("tool.%s must be a 64-character hex digest", name)
		}
	}
	if action.Bytes < 0 {
		return fmt.Errorf("action.bytes cannot be negative")
	}
	if action.Destination != nil {
		if !safeMetadataLabel(action.Destination.Kind) || (action.Destination.TrustBoundary != "" && !safeMetadataLabel(action.Destination.TrustBoundary)) {
			return fmt.Errorf("action.destination must use class labels, not a raw address")
		}
	}
	return nil
}

var sha256Pattern = regexp.MustCompile(`^[a-fA-F0-9]{64}$`)

func safeMetadataLabel(value string) bool {
	if len(value) < 1 || len(value) > 128 {
		return false
	}
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || strings.ContainsRune("._:-", char) {
			continue
		}
		return false
	}
	return true
}

func validateRuntimeMetadata(event models.RuntimeEvent) *models.AuthorizationViolation {
	labels := []string{event.EventID, event.PermitID, event.RequestID, event.AgentID, event.WorkloadID, event.Capability, event.Tool, event.Operation, event.Resource, event.ResourceClass, event.DestinationClass, event.SideEffect}
	for _, label := range labels {
		if label != "" && !safeMetadataLabel(label) {
			return &models.AuthorizationViolation{Rule: "runtime.metadata_invalid", Summary: "runtime event contains a raw or invalid metadata value", Expected: "short class labels", Actual: "invalid_or_sensitive_value"}
		}
	}
	if event.Bytes < 0 {
		return &models.AuthorizationViolation{Rule: "runtime.bytes_invalid", Summary: "runtime event byte count cannot be negative", Expected: ">=0", Actual: fmt.Sprintf("%d", event.Bytes)}
	}
	return nil
}

func applyDetectionRisk(assessment models.RiskAssessment, detected detection.Result) models.RiskAssessment {
	if detected.RiskDelta > 0 {
		if len(assessment.Signals) == 1 && assessment.Signals[0] == "no elevated risk signals" {
			assessment.Signals = []string{}
		}
		assessment.Score += detected.RiskDelta
		if assessment.Score > 100 {
			assessment.Score = 100
		}
		assessment.Level = riskLevel(assessment.Score)
	}
	for _, finding := range detected.Findings {
		assessment.Signals = append(assessment.Signals, finding.Summary)
	}
	return assessment
}

func dispatchFor(policyDecision models.PolicyDecision, assessment models.RiskAssessment, detected detection.Result) models.DispatchDecision {
	if !policyDecision.Authorized || policyDecision.Route == models.RouteDeny {
		return dispatch(models.RouteDeny, "none", "not_applicable", policyDecision.Reasons, policyDecision.Rules)
	}
	route := policyDecision.Route
	reasons := append([]string(nil), policyDecision.Reasons...)
	rules := append([]string(nil), policyDecision.Rules...)
	if routeRank(detected.RecommendedRoute) > routeRank(route) {
		route = detected.RecommendedRoute
		reasons = append(reasons, "pre-execution security signals require a stricter route")
		rules = append(rules, detectionRules(detected.Findings)...)
	}
	if assessment.Level == "high" && (route == models.RouteAllow || route == models.RouteRestrict) {
		route = models.RouteSandbox
		reasons = append(reasons, "high risk requires the sandbox route")
		rules = append(rules, "risk.high_sandbox_route")
	}
	profile, isolation := routeProfile(route)
	return dispatch(route, profile, isolation, reasons, uniqueStrings(rules))
}

func dispatch(route models.Route, profile, isolation string, reasons, rules []string) models.DispatchDecision {
	return models.DispatchDecision{
		Route: route, Reasons: nonNil(reasons), Rules: nonNil(rules), ExecutorProfile: profile,
		IsolationBackend: isolation, ExecutorInvoked: false,
	}
}

func routeProfile(route models.Route) (string, string) {
	switch route {
	case models.RouteAllow:
		return "standard-route", "not_applicable"
	case models.RouteRestrict:
		return "restricted-route", "policy_constraints_only"
	case models.RouteSandbox:
		return "sandbox-route", "not_connected"
	case models.RouteEscalate:
		return "approval-queue", "not_applicable"
	default:
		return "none", "not_applicable"
	}
}

func issuePermit(req models.Request, grant models.MatchedAuthorizationGrant, dispatch models.DispatchDecision, issuedAt time.Time, ttl time.Duration) models.AuthorizationEnvelope {
	principal := req.EffectivePrincipal()
	agent := req.EffectiveAgent()
	authority := req.EffectiveAuthority()
	action := req.EffectiveAction()
	constraints := grant.Constraints
	if constraints.ExecutorProfile == "" {
		constraints.ExecutorProfile = dispatch.ExecutorProfile
	}
	expiresAt := issuedAt.Add(ttl)
	if constraints.MaxDurationMS > 0 {
		constraintExpiry := issuedAt.Add(time.Duration(constraints.MaxDurationMS) * time.Millisecond)
		if constraintExpiry.Before(expiresAt) {
			expiresAt = constraintExpiry
		}
	}
	if authority.ExpiresAt != nil && authority.ExpiresAt.Before(expiresAt) {
		expiresAt = authority.ExpiresAt.UTC()
	}
	operation := action.Operation
	if operation == "" && len(grant.AllowedOperations) > 0 {
		operation = grant.AllowedOperations[0]
	}
	return models.AuthorizationEnvelope{
		PermitID: newIdentifier("permit"), RequestID: req.RequestID, SessionID: req.SessionID,
		PrincipalID: principal.PrincipalID, AgentID: agent.AgentID, WorkloadID: agent.WorkloadID,
		DelegatedCredentialFingerprint: authority.CredentialFingerprint,
		AllowedCapability:              grant.Capability, AllowedTool: grant.Tool, AllowedResource: grant.Resource,
		AllowedOperations: []string{operation}, Constraints: constraints,
		IssuedAt: issuedAt, ExpiresAt: expiresAt, Route: dispatch.Route,
	}
}

func privacySafeRequest(req models.Request) models.Request {
	// requested_action can contain prompt text in legacy clients. It is not an
	// authorization input and is deliberately omitted from the audit record.
	req.RequestedAction = ""
	return req
}

func authorizationVerdict(route models.Route) string {
	switch route {
	case models.RouteDeny:
		return "BLOCKED_BEFORE_EXECUTION"
	case models.RouteEscalate:
		return "APPROVAL_REQUIRED"
	case models.RouteRestrict:
		return "AUTHORIZED_RESTRICTED"
	case models.RouteSandbox:
		return "AUTHORIZED_SANDBOX_ROUTE"
	default:
		return "AUTHORIZED"
	}
}

func executionPermitted(route models.Route) bool {
	return route == models.RouteAllow || route == models.RouteRestrict || route == models.RouteSandbox
}

func rejectedEvaluation(event models.RuntimeEvent, item models.AuthorizationViolation) models.RuntimeEventEvaluation {
	return models.RuntimeEventEvaluation{
		EventID: event.EventID, PermitID: event.PermitID, Accepted: false, WithinEnvelope: false,
		Terminated: true, Verdict: "RUNTIME_EVENT_REJECTED", Violations: []models.AuthorizationViolation{item},
	}
}

func coverageFor(event models.RuntimeEvent) string {
	switch event.Source {
	case models.RuntimeSourceGatewayEnforced:
		return "gateway_enforced"
	case models.RuntimeSourceInstrumentedAdapter:
		return "adapter_reported"
	case models.RuntimeSourceAgentSelfReported:
		return "self_reported"
	case models.RuntimeSourceOSSensor:
		return "os_sensor"
	case models.RuntimeSourceNetworkSensor:
		return "network_sensor"
	case models.RuntimeSourceSimulatedDemo:
		return "simulated_demo"
	default:
		return "unknown"
	}
}

func detectionRules(findings []models.SecurityFinding) []string {
	rules := []string{}
	for _, finding := range findings {
		rules = append(rules, finding.Rule)
	}
	return rules
}

func routeRank(route models.Route) int {
	return map[models.Route]int{"": 0, models.RouteAllow: 1, models.RouteRestrict: 2, models.RouteSandbox: 3, models.RouteEscalate: 4, models.RouteDeny: 5}[route]
}

func riskLevel(score int) string {
	if score >= 70 {
		return "high"
	}
	if score >= 35 {
		return "medium"
	}
	return "low"
}

func newIdentifier(prefix string) string {
	data := make([]byte, 12)
	if _, err := rand.Read(data); err != nil {
		return fmt.Sprintf("%s-%d", prefix, time.Now().UnixNano())
	}
	return prefix + "-" + hex.EncodeToString(data)
}

func nonNil(items []string) []string {
	if items == nil {
		return []string{}
	}
	return items
}

func nonNilFindings(items []models.SecurityFinding) []models.SecurityFinding {
	if items == nil {
		return []models.SecurityFinding{}
	}
	return items
}

func uniqueStrings(items []string) []string {
	result := []string{}
	seen := map[string]bool{}
	for _, item := range items {
		if item != "" && !seen[item] {
			seen[item] = true
			result = append(result, item)
		}
	}
	return result
}

func elapsedMilliseconds(start, end time.Time) int64 {
	if end.Before(start) {
		return 0
	}
	return end.Sub(start).Milliseconds()
}

func safeEvidence(value string) string {
	if safeMetadataLabel(value) {
		return value
	}
	return "invalid_or_redacted"
}
