package policy

import (
	"fmt"

	"agent-governance-gateway/internal/models"
)

type Engine struct {
	config models.PolicyConfig
}

func New(cfg models.PolicyConfig) *Engine {
	return &Engine{config: cfg}
}

func (e *Engine) Evaluate(req models.Request) models.PolicyDecision {
	agent, ok := e.config.Agents[req.AgentID]
	if !ok {
		return deny("identity.unknown_agent", fmt.Sprintf("agent %q has no registered policy", req.AgentID))
	}

	resource, ok := e.config.Resources[req.TargetResource]
	if !ok {
		return deny("resource.unknown", fmt.Sprintf("resource %q is not classified", req.TargetResource))
	}

	if contains(e.config.ProhibitedActions, req.RequestedCapability) {
		return deny("capability.prohibited", "the requested capability is globally prohibited")
	}
	if contains(agent.DeniedResources, req.TargetResource) {
		return deny("resource.agent_denylist", "the agent policy explicitly denies this resource")
	}
	if !contains(agent.AllowedCapabilities, req.RequestedCapability) {
		return deny("capability.not_granted", "the agent was not granted the requested capability")
	}

	missing := missingScopes(req.TokenScopes, resource.Scopes)
	if len(missing) > 0 {
		return deny("scope.mismatch", fmt.Sprintf("delegated token is missing required scopes: %v", missing))
	}

	if resource.Sensitivity == "critical" {
		return models.PolicyDecision{
			Route:   models.RouteEscalate,
			Reasons: []string{"critical resources require explicit human approval"},
			Rules:   []string{"resource.critical_approval"},
		}
	}
	if resource.Sensitivity == "high" {
		return models.PolicyDecision{
			Route:   models.RouteSandbox,
			Reasons: []string{"high-sensitivity resources execute in isolation"},
			Rules:   []string{"resource.high_isolation"},
		}
	}
	if contains(e.config.RestrictedActions, req.RequestedCapability) {
		return models.PolicyDecision{
			Route:   models.RouteRestrict,
			Reasons: []string{"side-effecting capability is limited to the restricted executor"},
			Rules:   []string{"capability.restricted"},
		}
	}

	return models.PolicyDecision{
		Route:   models.RouteAllow,
		Reasons: []string{"identity, capability, token scope, and resource policy all match"},
		Rules:   []string{"policy.allow"},
	}
}

func deny(rule, reason string) models.PolicyDecision {
	return models.PolicyDecision{Route: models.RouteDeny, Reasons: []string{reason}, Rules: []string{rule}}
}

func contains(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}

func missingScopes(actual, required []string) []string {
	var missing []string
	for _, scope := range required {
		if !contains(actual, scope) {
			missing = append(missing, scope)
		}
	}
	return missing
}
