package router_test

import (
	"path/filepath"
	"testing"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/scenario"
)

func TestDemoScenarios(t *testing.T) {
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	scenarios, err := scenario.LoadDirectory(filepath.Join("..", "..", "examples"))
	if err != nil {
		t.Fatal(err)
	}
	store, err := audit.NewStore("")
	if err != nil {
		t.Fatal(err)
	}
	r := router.New(cfg, store)

	for _, item := range scenarios {
		item := item
		t.Run(item.ID, func(t *testing.T) {
			record, err := r.Process(item.Request)
			if err != nil {
				t.Fatal(err)
			}
			if record.PolicyDecision.Route != item.Expected {
				t.Fatalf("route = %q, want %q; reasons: %v", record.PolicyDecision.Route, item.Expected, record.PolicyDecision.Reasons)
			}
			if record.RequestID == "" {
				t.Fatal("request ID was not generated")
			}
		})
	}

	if got := len(store.Recent(10)); got != len(scenarios) {
		t.Fatalf("stored %d audit records, want %d", got, len(scenarios))
	}
}

func TestBehavioralDriftProducesSuspiciousVerdict(t *testing.T) {
	cfg, err := config.Load(filepath.Join("..", "..", "configs", "policy.json"))
	if err != nil {
		t.Fatal(err)
	}
	store, _ := audit.NewStore("")
	r := router.New(cfg, store)
	record, err := r.Process(models.Request{
		UserID: "user-02", AgentID: "coder-agent", TokenScopes: []string{"config.read"},
		RequestedAction: "Debug configuration", ClaimedIntent: "debugging",
		RequestedCapability: "read_config", TargetResource: "protected_config",
		PlannedActions: []string{"read_config"}, SimulatedActions: []string{"read_config", "read_secret"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if !record.RuntimeObservation.DriftDetected {
		t.Fatal("expected runtime drift")
	}
	if record.FinalVerdict != "suspicious_behavior" {
		t.Fatalf("verdict = %q, want suspicious_behavior", record.FinalVerdict)
	}
	if record.PolicyDecision.Route != models.RouteSandbox {
		t.Fatalf("route = %q, want sandbox", record.PolicyDecision.Route)
	}
}

func TestValidationRejectsIncompleteRequest(t *testing.T) {
	err := router.Validate(models.Request{AgentID: "coder-agent"})
	if err == nil {
		t.Fatal("expected validation error")
	}
}

func TestValidationRejectsRawPathInMetadata(t *testing.T) {
	req := models.Request{
		UserID: "user-01", AgentID: "coder-agent", RequestedAction: "Read", ClaimedIntent: "test",
		RequestedCapability: "read_safe_files", TargetResource: "public_workspace", PlannedActions: []string{"read_safe_files"},
		DataAccess: &models.DataAccess{Operation: "read", PathClass: `C:\\Users\\person\\secret.txt`, Protected: true},
	}
	if err := router.Validate(req); err == nil {
		t.Fatal("expected raw path metadata to be rejected")
	}
}
