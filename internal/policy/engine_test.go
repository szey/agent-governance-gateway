package policy_test

import (
	"path/filepath"
	"testing"

	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/policy"
)

func TestUnknownAgentFailsClosed(t *testing.T) {
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	decision := policy.New(cfg).Evaluate(models.Request{
		AgentID: "unregistered-agent", TokenScopes: []string{"code.read"},
		RequestedCapability: "generate_code", TargetResource: "public_workspace",
	})
	if decision.Route != models.RouteDeny {
		t.Fatalf("route = %q, want deny", decision.Route)
	}
	if decision.Rules[0] != "identity.unknown_agent" {
		t.Fatalf("rule = %q, want identity.unknown_agent", decision.Rules[0])
	}
}

func TestMissingScopeFailsClosed(t *testing.T) {
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	decision := policy.New(cfg).Evaluate(models.Request{
		AgentID: "ops-agent", TokenScopes: []string{"code.read"},
		RequestedCapability: "read_config", TargetResource: "protected_config",
	})
	if decision.Route != models.RouteDeny || decision.Rules[0] != "scope.mismatch" {
		t.Fatalf("decision = %#v, want scope mismatch denial", decision)
	}
}
