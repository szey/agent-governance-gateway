package models

import "time"

type Route string

const (
	RouteAllow    Route = "allow"
	RouteRestrict Route = "restrict"
	RouteSandbox  Route = "sandbox"
	RouteDeny     Route = "deny"
	RouteEscalate Route = "escalate"
)

type AgentPolicy struct {
	AllowedCapabilities []string `json:"allowed_capabilities"`
	DeniedResources     []string `json:"denied_resources"`
}

type ResourcePolicy struct {
	Sensitivity string   `json:"sensitivity"`
	Scopes      []string `json:"required_scopes"`
}

type PolicyConfig struct {
	Agents            map[string]AgentPolicy    `json:"agents"`
	Resources         map[string]ResourcePolicy `json:"resources"`
	SensitiveActions  []string                  `json:"sensitive_actions"`
	RestrictedActions []string                  `json:"restricted_actions"`
	ProhibitedActions []string                  `json:"prohibited_actions"`
	SuspiciousActions []string                  `json:"suspicious_runtime_actions"`
	SessionControls   SessionControls           `json:"session_controls"`
}

type SessionControls struct {
	PrivacyReadBudget      int      `json:"privacy_read_budget"`
	CumulativeRiskLimit    int      `json:"cumulative_risk_limit"`
	EgressCapabilities     []string `json:"egress_capabilities"`
	SideEffectCapabilities []string `json:"side_effect_capabilities"`
	InjectionRiskSignals   []string `json:"injection_risk_signals"`
}

type InputSource struct {
	EventID       string   `json:"event_id,omitempty"`
	Kind          string   `json:"kind"`
	Trust         string   `json:"trust"`
	URIClass      string   `json:"uri_class,omitempty"`
	ContentSHA256 string   `json:"content_sha256,omitempty"`
	RiskSignals   []string `json:"risk_signals,omitempty"`
}

type ToolIdentity struct {
	Name                 string `json:"name"`
	Provider             string `json:"provider,omitempty"`
	SchemaSHA256         string `json:"schema_sha256,omitempty"`
	ExpectedSchemaSHA256 string `json:"expected_schema_sha256,omitempty"`
}

type DataAccess struct {
	Operation   string `json:"operation"`
	PathClass   string `json:"path_class,omitempty"`
	Protected   bool   `json:"protected"`
	Sensitivity string `json:"sensitivity,omitempty"`
	Bytes       int64  `json:"bytes,omitempty"`
}

type Destination struct {
	Kind          string `json:"kind"`
	TrustBoundary string `json:"trust_boundary,omitempty"`
	External      bool   `json:"external"`
}

type Request struct {
	RequestID           string        `json:"request_id,omitempty"`
	SessionID           string        `json:"session_id,omitempty"`
	ParentEventID       string        `json:"parent_event_id,omitempty"`
	UserID              string        `json:"user_id"`
	AgentID             string        `json:"agent_id"`
	TokenScopes         []string      `json:"token_scopes"`
	RequestedAction     string        `json:"requested_action"`
	ClaimedIntent       string        `json:"claimed_intent"`
	RequestedCapability string        `json:"requested_capability"`
	TargetResource      string        `json:"target_resource"`
	PlannedActions      []string      `json:"planned_actions"`
	SimulatedActions    []string      `json:"simulated_actions,omitempty"`
	InputSources        []InputSource `json:"input_sources,omitempty"`
	ToolIdentity        *ToolIdentity `json:"tool_identity,omitempty"`
	DataAccess          *DataAccess   `json:"data_access,omitempty"`
	Destination         *Destination  `json:"destination,omitempty"`
}

type PolicyDecision struct {
	Route   Route    `json:"route"`
	Reasons []string `json:"reasons"`
	Rules   []string `json:"matched_rules"`
}

type RiskAssessment struct {
	Score   int      `json:"score"`
	Level   string   `json:"level"`
	Signals []string `json:"signals"`
}

type RuntimeObservation struct {
	PlannedActions    []string `json:"planned_actions"`
	ActualActions     []string `json:"actual_actions"`
	UnexpectedActions []string `json:"unexpected_actions"`
	SuspiciousActions []string `json:"suspicious_actions"`
	DriftDetected     bool     `json:"drift_detected"`
}

type SecurityFinding struct {
	ID       string   `json:"id"`
	Category string   `json:"category"`
	Severity string   `json:"severity"`
	Rule     string   `json:"rule"`
	Summary  string   `json:"summary"`
	Evidence []string `json:"evidence"`
}

type CausalContext struct {
	SessionID              string   `json:"session_id"`
	EventID                string   `json:"event_id"`
	ParentEventID          string   `json:"parent_event_id,omitempty"`
	Ancestors              []string `json:"ancestors"`
	CumulativeRisk         int      `json:"cumulative_risk"`
	PrivacyBudgetRemaining int      `json:"privacy_budget_remaining"`
}

type AuditRecord struct {
	RequestID          string             `json:"request_id"`
	CreatedAt          time.Time          `json:"created_at"`
	Request            Request            `json:"request"`
	PolicyDecision     PolicyDecision     `json:"policy_decision"`
	RiskAssessment     RiskAssessment     `json:"risk_assessment"`
	SelectedExecutor   string             `json:"selected_executor"`
	RuntimeObservation RuntimeObservation `json:"runtime_observation"`
	SecurityFindings   []SecurityFinding  `json:"security_findings"`
	CausalContext      CausalContext      `json:"causal_context"`
	FinalVerdict       string             `json:"final_verdict"`
	DurationMS         int64              `json:"duration_ms"`
}

type Scenario struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Expected    Route   `json:"expected_route"`
	Request     Request `json:"request"`
}
