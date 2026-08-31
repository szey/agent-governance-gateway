package observer_test

import (
	"testing"

	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/observer"
)

func TestObserverFindsUnexpectedAndSuspiciousActions(t *testing.T) {
	watcher := observer.New(models.PolicyConfig{SuspiciousActions: []string{"read_secret"}})
	result := watcher.Observe([]string{"read_config"}, []string{"read_config", "read_secret"})
	if !result.DriftDetected {
		t.Fatal("expected drift")
	}
	if len(result.UnexpectedActions) != 1 || result.UnexpectedActions[0] != "read_secret" {
		t.Fatalf("unexpected actions = %v", result.UnexpectedActions)
	}
	if len(result.SuspiciousActions) != 1 || result.SuspiciousActions[0] != "read_secret" {
		t.Fatalf("suspicious actions = %v", result.SuspiciousActions)
	}
}
