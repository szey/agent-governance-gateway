package audit_test

import (
	"path/filepath"
	"testing"
	"time"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/models"
)

func TestUpdateKeepsOneLatestDecisionChainAndReloadsIt(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	record := models.AuditRecord{RequestID: "req-01", CreatedAt: time.Now().UTC(), FinalVerdict: "AUTHORIZED"}
	if err := store.Append(record); err != nil {
		t.Fatal(err)
	}
	record.FinalVerdict = "AUTHORIZATION_BOUNDARY_VIOLATION"
	record.RuntimeObservation.AuthorizationViolations = []models.AuthorizationViolation{{Rule: "envelope.secret_access_denied"}}
	if err := store.Update(record); err != nil {
		t.Fatal(err)
	}
	if got := store.Recent(10); len(got) != 1 || got[0].FinalVerdict != "AUTHORIZATION_BOUNDARY_VIOLATION" {
		t.Fatalf("recent = %#v", got)
	}

	reloaded, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if got := reloaded.Recent(10); len(got) != 1 || len(got[0].RuntimeObservation.AuthorizationViolations) != 1 {
		t.Fatalf("reloaded latest chain = %#v", got)
	}
}

func TestUpdateUnknownRecordDoesNotPersistIt(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	store, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if err := store.Update(models.AuditRecord{RequestID: "missing"}); err == nil {
		t.Fatal("expected missing audit update to fail")
	}
	reloaded, err := audit.NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if got := reloaded.Recent(10); len(got) != 0 {
		t.Fatalf("unknown update was persisted: %#v", got)
	}
}
