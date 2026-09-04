package verifier_test

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/json"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"agent-governance-gateway/internal/canonicalaction"
	"agent-governance-gateway/internal/permit"
	"agent-governance-gateway/internal/verifier"
)

func TestValidPermitVerifiesAndIsConsumed(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	result := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	if result.Outcome != verifier.OutcomeVerified || !result.Allowed() || result.State != permit.StateConsumed {
		t.Fatalf("VerifyAndConsume = %#v", result)
	}
	if result.PermitID != fixture.issued.PermitID || result.Claims == nil || result.Claims.ActionDigest == "" {
		t.Fatalf("safe result metadata missing: %#v", result)
	}
}

func TestInvalidSignatureIsRejected(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	_, otherPrivateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	forgedToken, err := permit.SignToken(otherPrivateKey, fixture.issued.Claims)
	if err != nil {
		t.Fatal(err)
	}
	result := fixture.verifier.VerifyAndConsume(forgedToken, fixture.action)
	assertOutcome(t, result, verifier.OutcomeInvalidSignature)
	assertIssued(t, fixture)
}

func TestExpiredPermitIsRejected(t *testing.T) {
	fixture := newFixture(t, 5*time.Second)
	fixture.now = fixture.issued.Claims.ExpiresTime()
	result := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	assertOutcome(t, result, verifier.OutcomeExpired)
}

func TestPermitThatExpiresDuringVerificationIsRejectedAtConsumeBoundary(t *testing.T) {
	fixture := newFixture(t, 5*time.Second)
	var calls atomic.Int32
	boundaryVerifier, err := verifier.New(fixture.publicKey, "aegis-router", fixture.store, verifier.WithClock(func() time.Time {
		if calls.Add(1) == 1 {
			return fixture.issued.Claims.IssuedTime()
		}
		return fixture.issued.Claims.ExpiresTime()
	}))
	if err != nil {
		t.Fatal(err)
	}
	result := boundaryVerifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	assertOutcome(t, result, verifier.OutcomeExpired)
}

func TestWrongActionBindingsAreRejectedWithoutConsumption(t *testing.T) {
	tests := []struct {
		name    string
		outcome verifier.Outcome
		mutate  func(*canonicalaction.Action)
	}{
		{"principal", verifier.OutcomeWrongPrincipal, func(action *canonicalaction.Action) { action.PrincipalID = "user-02" }},
		{"agent", verifier.OutcomeWrongAgent, func(action *canonicalaction.Action) { action.AgentID = "other-agent" }},
		{"workload", verifier.OutcomeWrongWorkload, func(action *canonicalaction.Action) { action.WorkloadID = "other-workload" }},
		{"delegation", verifier.OutcomeWrongDelegation, func(action *canonicalaction.Action) {
			action.DelegatedAuthorityFingerprint = "sha256:" + strings.Repeat("b", 64)
		}},
		{"tool", verifier.OutcomeWrongTool, func(action *canonicalaction.Action) { action.Tool = "payment.admin_send" }},
		{"capability", verifier.OutcomeWrongCapability, func(action *canonicalaction.Action) { action.Capability = "payment.refund" }},
		{"resource", verifier.OutcomeWrongResource, func(action *canonicalaction.Action) { action.Resource = "account-999" }},
		{"operation", verifier.OutcomeWrongOperation, func(action *canonicalaction.Action) { action.Operation = "refund" }},
		{"arguments", verifier.OutcomeActionMismatch, func(action *canonicalaction.Action) {
			action.Arguments = json.RawMessage(`{"amount":10000,"currency":"USD","recipient":"merchant-456"}`)
		}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			fixture := newFixture(t, time.Minute)
			action := fixture.action
			test.mutate(&action)
			result := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), action)
			assertOutcome(t, result, test.outcome)
			assertIssued(t, fixture)
		})
	}
}

func TestPermitReplayIsRejected(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	first := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	second := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	assertOutcome(t, first, verifier.OutcomeVerified)
	assertOutcome(t, second, verifier.OutcomeReplayed)
}

func TestConcurrentReplayExactlyOneSucceeds(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	const attempts = 2
	start := make(chan struct{})
	results := make(chan verifier.Result, attempts)
	var ready sync.WaitGroup
	ready.Add(attempts)
	for range attempts {
		go func() {
			ready.Done()
			<-start
			results <- fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
		}()
	}
	ready.Wait()
	close(start)

	var verified, replayed atomic.Int32
	for range attempts {
		result := <-results
		switch result.Outcome {
		case verifier.OutcomeVerified:
			verified.Add(1)
		case verifier.OutcomeReplayed:
			replayed.Add(1)
		default:
			t.Fatalf("unexpected concurrent outcome %#v", result)
		}
	}
	if verified.Load() != 1 || replayed.Load() != 1 {
		t.Fatalf("verified=%d replayed=%d, want exactly one each", verified.Load(), replayed.Load())
	}
}

func TestRevokedPermitIsRejected(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	if _, err := fixture.store.Revoke(fixture.issued.PermitID, fixture.now); err != nil {
		t.Fatal(err)
	}
	result := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	assertOutcome(t, result, verifier.OutcomeRevoked)
}

func TestIssuerAndStoreBindingsAreRejected(t *testing.T) {
	fixture := newFixture(t, time.Minute)

	t.Run("wrong issuer", func(t *testing.T) {
		other, err := verifier.New(fixture.publicKey, "other-issuer", fixture.store, verifier.WithClock(func() time.Time { return fixture.now }))
		if err != nil {
			t.Fatal(err)
		}
		assertOutcome(t, other.VerifyAndConsume(fixture.issued.Token(), fixture.action), verifier.OutcomeInvalidIssuer)
	})

	t.Run("unknown permit", func(t *testing.T) {
		emptyStore := permit.NewMemoryStore()
		other, err := verifier.New(fixture.publicKey, "aegis-router", emptyStore, verifier.WithClock(func() time.Time { return fixture.now }))
		if err != nil {
			t.Fatal(err)
		}
		assertOutcome(t, other.VerifyAndConsume(fixture.issued.Token(), fixture.action), verifier.OutcomeUnknownPermit)
	})

	t.Run("store claim mismatch", func(t *testing.T) {
		mismatchedStore := permit.NewMemoryStore()
		claims := fixture.issued.Claims
		claims.PolicyVersion = "different-policy"
		if err := mismatchedStore.Register(claims); err != nil {
			t.Fatal(err)
		}
		other, err := verifier.New(fixture.publicKey, "aegis-router", mismatchedStore, verifier.WithClock(func() time.Time { return fixture.now }))
		if err != nil {
			t.Fatal(err)
		}
		assertOutcome(t, other.VerifyAndConsume(fixture.issued.Token(), fixture.action), verifier.OutcomeInvalidPermit)
	})
}

func TestVerificationResultNeverLeaksTokenOrRawArguments(t *testing.T) {
	fixture := newFixture(t, time.Minute)
	result := fixture.verifier.VerifyAndConsume(fixture.issued.Token(), fixture.action)
	encoded, err := json.Marshal(result)
	if err != nil {
		t.Fatal(err)
	}
	for _, forbidden := range []string{fixture.issued.Token(), "permit_token", "super-secret-recipient", "arguments"} {
		if strings.Contains(string(encoded), forbidden) {
			t.Fatalf("verification result leaked %q: %s", forbidden, encoded)
		}
	}
}

type fixture struct {
	now       time.Time
	publicKey ed25519.PublicKey
	store     *permit.MemoryStore
	issued    permit.IssuedPermit
	action    canonicalaction.Action
	verifier  *verifier.Verifier
}

func newFixture(t *testing.T, ttl time.Duration) *fixture {
	t.Helper()
	now := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	action := canonicalaction.Action{
		PrincipalID: "user-01", AgentID: "finance-agent", WorkloadID: "finance-agent-v3",
		DelegatedAuthorityFingerprint: "sha256:" + strings.Repeat("a", 64),
		Tool:                          "payment.send", Capability: "payment.transfer", Resource: "account-123", Operation: "transfer",
		Arguments: json.RawMessage(`{"amount":100,"currency":"USD","recipient":"super-secret-recipient"}`),
	}
	digest, err := action.Digest()
	if err != nil {
		t.Fatal(err)
	}
	store := permit.NewMemoryStore()
	issuer, err := permit.NewIssuer("aegis-router", privateKey, store, permit.WithIssuerClock(func() time.Time { return now }))
	if err != nil {
		t.Fatal(err)
	}
	issued, err := issuer.Issue(permit.IssueRequest{
		PermitID: "p_fixture", RequestID: "request-01", PrincipalID: action.PrincipalID,
		AgentID: action.AgentID, WorkloadID: action.WorkloadID,
		DelegatedAuthorityFingerprint: action.DelegatedAuthorityFingerprint,
		Tool:                          action.Tool, Capability: action.Capability, Resource: action.Resource, Operation: action.Operation,
		ActionDigest: digest, PolicyVersion: "policy-v7", TTL: ttl,
	})
	if err != nil {
		t.Fatal(err)
	}
	fixture := &fixture{now: now, publicKey: publicKey, store: store, issued: issued, action: action}
	result, err := verifier.New(publicKey, "aegis-router", store, verifier.WithClock(func() time.Time { return fixture.now }))
	if err != nil {
		t.Fatal(err)
	}
	fixture.verifier = result
	return fixture
}

func assertOutcome(t *testing.T, result verifier.Result, want verifier.Outcome) {
	t.Helper()
	if result.Outcome != want {
		t.Fatalf("outcome = %s, want %s (result=%#v)", result.Outcome, want, result)
	}
	if want != verifier.OutcomeVerified && result.Allowed() {
		t.Fatalf("rejected result reports Allowed: %#v", result)
	}
}

func assertIssued(t *testing.T, fixture *fixture) {
	t.Helper()
	record, ok := fixture.store.Get(fixture.issued.PermitID, fixture.now)
	if !ok || record.State != permit.StateIssued {
		t.Fatalf("binding failure consumed permit: record=%#v exists=%v", record, ok)
	}
}
