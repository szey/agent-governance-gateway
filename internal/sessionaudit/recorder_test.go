package sessionaudit

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRecordJSONLineNormalizesWithoutPersistingCommand(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	recorder, err := New(path, "session-test")
	if err != nil {
		t.Fatal(err)
	}
	line := []byte(`{"type":"item.completed","item":{"id":"item-1","type":"command_execution","command":"cat super-secret.txt","status":"completed","exit_code":0}}`)
	event, err := recorder.RecordJSONLine(line)
	if err != nil {
		t.Fatal(err)
	}
	if err := recorder.Close(); err != nil {
		t.Fatal(err)
	}
	if event.ActionClass != "process.exec" || event.SourceEventID != "item-1" {
		t.Fatalf("unexpected normalized event: %#v", event)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(data), "super-secret") || strings.Contains(string(data), "cat ") {
		t.Fatalf("audit persisted sensitive command: %s", data)
	}
	var persisted Event
	if err := json.Unmarshal(data, &persisted); err != nil {
		t.Fatal(err)
	}
	if persisted.PayloadSHA256 == "" || persisted.Trust != TrustSelfReported {
		t.Fatalf("missing provenance fields: %#v", persisted)
	}
}

func TestInvalidJSONIsRecordedAsEvidence(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	recorder, err := New(path, "session-test")
	if err != nil {
		t.Fatal(err)
	}
	event, err := recorder.RecordJSONLine([]byte("not-json"))
	if err != nil {
		t.Fatal(err)
	}
	if err := recorder.Close(); err != nil {
		t.Fatal(err)
	}
	if event.EventType != "unparsed" || event.Status != "invalid_json" || event.PayloadSHA256 == "" {
		t.Fatalf("unexpected event: %#v", event)
	}
}

func TestHashArgumentsIsStableAndDoesNotExposeInput(t *testing.T) {
	first := HashArguments([]string{"exec", "--json", "secret prompt"})
	second := HashArguments([]string{"exec", "--json", "secret prompt"})
	if first != second || strings.Contains(first, "secret") {
		t.Fatalf("unexpected hash %q", first)
	}
}

func TestRecentReturnsNewestFirst(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	recorder, err := New(path, "session-test")
	if err != nil {
		t.Fatal(err)
	}
	for _, eventType := range []string{"first", "second", "third"} {
		if _, err := recorder.RecordLifecycle(eventType, "ok", nil); err != nil {
			t.Fatal(err)
		}
	}
	if err := recorder.Close(); err != nil {
		t.Fatal(err)
	}
	events, err := Recent(path, 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(events) != 2 || events[0].EventType != "third" || events[1].EventType != "second" {
		t.Fatalf("unexpected recent events: %#v", events)
	}
}

func TestRecentMissingFileIsEmpty(t *testing.T) {
	events, err := Recent(filepath.Join(t.TempDir(), "missing.jsonl"), 10)
	if err != nil || len(events) != 0 {
		t.Fatalf("events = %#v, err = %v", events, err)
	}
}
