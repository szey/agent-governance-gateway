package router

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
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
}

func New(cfg models.PolicyConfig, store *audit.Store) *Router {
	return &Router{
		policy:    policy.New(cfg),
		risk:      risk.New(cfg),
		observer:  observer.New(cfg),
		audit:     store,
		detection: detection.New(cfg.SessionControls),
		clock:     time.Now,
	}
}

func (r *Router) Process(req models.Request) (models.AuditRecord, error) {
	if err := Validate(req); err != nil {
		return models.AuditRecord{}, err
	}
	started := r.clock()
	if req.RequestID == "" {
		req.RequestID = newRequestID()
	}

	decision := r.policy.Evaluate(req)
	assessment := r.risk.Assess(req)
	detected := r.detection.Evaluate(req, assessment.Score)
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
		decision.Reasons = append(decision.Reasons, finding.Summary)
		decision.Rules = append(decision.Rules, finding.Rule)
	}
	if decision.Route != models.RouteDeny && routeRank(detected.RecommendedRoute) > routeRank(decision.Route) {
		decision.Route = detected.RecommendedRoute
	}
	if assessment.Level == "high" && (decision.Route == models.RouteAllow || decision.Route == models.RouteRestrict) {
		decision.Route = models.RouteSandbox
		decision.Reasons = append(decision.Reasons, "high aggregate risk requires isolated execution")
		decision.Rules = append(decision.Rules, "risk.high_isolation")
	}

	observation := models.RuntimeObservation{
		PlannedActions:    nonNil(req.PlannedActions),
		ActualActions:     []string{},
		UnexpectedActions: []string{},
		SuspiciousActions: []string{},
	}
	if decision.Route != models.RouteDeny && decision.Route != models.RouteEscalate {
		observation = r.observer.Observe(req.PlannedActions, req.SimulatedActions)
	}

	record := models.AuditRecord{
		RequestID:          req.RequestID,
		CreatedAt:          started.UTC(),
		Request:            req,
		PolicyDecision:     decision,
		RiskAssessment:     assessment,
		SelectedExecutor:   executorFor(decision.Route),
		RuntimeObservation: observation,
		SecurityFindings:   detected.Findings,
		CausalContext:      detected.Context,
		FinalVerdict:       verdictFor(decision.Route, observation),
		DurationMS:         time.Since(started).Milliseconds(),
	}
	if err := r.audit.Append(record); err != nil {
		return models.AuditRecord{}, err
	}
	return record, nil
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

func routeRank(route models.Route) int {
	return map[models.Route]int{"": 0, models.RouteAllow: 1, models.RouteRestrict: 2, models.RouteSandbox: 3, models.RouteEscalate: 4, models.RouteDeny: 5}[route]
}

func Validate(req models.Request) error {
	fields := map[string]string{
		"user_id": req.UserID, "agent_id": req.AgentID, "requested_action": req.RequestedAction,
		"claimed_intent": req.ClaimedIntent, "requested_capability": req.RequestedCapability,
		"target_resource": req.TargetResource,
	}
	for name, value := range fields {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%s is required", name)
		}
	}
	if len(req.PlannedActions) == 0 {
		return fmt.Errorf("planned_actions must contain at least one action")
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
	if req.ToolIdentity != nil {
		if !safeMetadataLabel(req.ToolIdentity.Name) || (req.ToolIdentity.Provider != "" && !safeMetadataLabel(req.ToolIdentity.Provider)) {
			return fmt.Errorf("tool_identity name and provider must be metadata labels")
		}
		for name, digest := range map[string]string{"schema_sha256": req.ToolIdentity.SchemaSHA256, "expected_schema_sha256": req.ToolIdentity.ExpectedSchemaSHA256} {
			if digest != "" && !sha256Pattern.MatchString(digest) {
				return fmt.Errorf("tool_identity.%s must be a 64-character hex digest", name)
			}
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

func executorFor(route models.Route) string {
	switch route {
	case models.RouteAllow:
		return "normal-executor"
	case models.RouteRestrict:
		return "restricted-executor"
	case models.RouteSandbox:
		return "sandbox-executor"
	case models.RouteEscalate:
		return "approval-queue"
	default:
		return "none"
	}
}

func verdictFor(route models.Route, observation models.RuntimeObservation) string {
	if route == models.RouteDeny {
		return "blocked"
	}
	if route == models.RouteEscalate {
		return "approval_required"
	}
	if len(observation.SuspiciousActions) > 0 {
		return "suspicious_behavior"
	}
	if observation.DriftDetected {
		return "behavior_drift"
	}
	switch route {
	case models.RouteSandbox:
		return "sandboxed_safe"
	case models.RouteRestrict:
		return "restricted_execution"
	default:
		return "allowed"
	}
}

func newRequestID() string {
	data := make([]byte, 6)
	if _, err := rand.Read(data); err != nil {
		return fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	return "req-" + hex.EncodeToString(data)
}

func nonNil(items []string) []string {
	if items == nil {
		return []string{}
	}
	return items
}
