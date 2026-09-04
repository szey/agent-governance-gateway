package permit_test

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"agent-governance-gateway/internal/permit"
)

func TestIssuerCreatesVerifiableActionBoundPermit(t *testing.T) {
	now := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	publicKey, privateKey := keyPair(t)
	store := permit.NewMemoryStore()
	issuer, err := permit.NewIssuer("aegis-router", privateKey, store, permit.WithIssuerClock(func() time.Time { return now }))
	if err != nil {
		t.Fatal(err)
	}
	issued, err := issuer.Issue(issueRequest("p_test", 30*time.Second))
	if err != nil {
		t.Fatal(err)
	}
	if issued.PermitID != "p_test" || issued.Token() == "" {
		t.Fatalf("issued permit = %#v, token empty=%v", issued, issued.Token() == "")
	}
	claims, err := permit.VerifyToken(publicKey, issued.Token())
	if err != nil {
		t.Fatal(err)
	}
	if claims != issued.Claims {
		t.Fatalf("verified claims = %#v, want %#v", claims, issued.Claims)
	}
	if !claims.SingleUse || claims.Issuer != "aegis-router" || claims.ExpiresTime().Sub(claims.IssuedTime()) != 30*time.Second {
		t.Fatalf("unexpected lifecycle claims: %#v", claims)
	}
	if !claims.Obligations.IsolationRequired || !claims.Obligations.EnhancedAuditRequired {
		t.Fatalf("signed obligations missing: %#v", claims.Obligations)
	}
	if got := issuer.PublicKey(); string(got) != string(publicKey) {
		t.Fatal("Issuer.PublicKey did not return the signing public key")
	}
}

func TestVerifyTokenRejectsTamperingAndWrongKey(t *testing.T) {
	_, privateKey := keyPair(t)
	publicKey, _ := keyPair(t)
	claims := claimsForStore("p_test")
	token, err := permit.SignToken(privateKey, claims)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := permit.VerifyToken(publicKey, token); !errors.Is(err, permit.ErrInvalidSignature) {
		t.Fatalf("wrong-key error = %v, want ErrInvalidSignature", err)
	}

	parts := strings.Split(token, ".")
	last := parts[2][0]
	replacement := byte('A')
	if last == replacement {
		replacement = 'B'
	}
	parts[2] = string(replacement) + parts[2][1:]
	tampered := strings.Join(parts, ".")
	correctPublic := privateKey.Public().(ed25519.PublicKey)
	if _, err := permit.VerifyToken(correctPublic, tampered); !errors.Is(err, permit.ErrInvalidSignature) {
		t.Fatalf("tamper error = %v, want ErrInvalidSignature", err)
	}
}

func TestIssuedPermitJSONNeverContainsToken(t *testing.T) {
	now := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	_, privateKey := keyPair(t)
	store := permit.NewMemoryStore()
	issuer, err := permit.NewIssuer("aegis-router", privateKey, store, permit.WithIssuerClock(func() time.Time { return now }))
	if err != nil {
		t.Fatal(err)
	}
	issued, err := issuer.Issue(issueRequest("p_no_log", time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	encoded, err := json.Marshal(issued)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(encoded), issued.Token()) || strings.Contains(string(encoded), "permit_token") {
		t.Fatalf("serialized IssuedPermit leaked credential: %s", encoded)
	}
	for _, formatted := range []string{fmt.Sprintf("%v", issued), fmt.Sprintf("%+v", issued), fmt.Sprintf("%#v", issued)} {
		if strings.Contains(formatted, issued.Token()) {
			t.Fatalf("formatted IssuedPermit leaked credential: %s", formatted)
		}
	}
	if strings.Contains(string(encoded), "raw-secret-argument") {
		t.Fatalf("serialized claims leaked raw action arguments: %s", encoded)
	}
}

func TestIssuerRejectsRawDelegatedCredential(t *testing.T) {
	now := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	_, privateKey := keyPair(t)
	issuer, err := permit.NewIssuer("aegis-router", privateKey, permit.NewMemoryStore(), permit.WithIssuerClock(func() time.Time { return now }))
	if err != nil {
		t.Fatal(err)
	}
	request := issueRequest("p_raw_credential", time.Minute)
	request.DelegatedAuthorityFingerprint = "Bearer raw-secret-delegated-token"
	if _, err := issuer.Issue(request); !errors.Is(err, permit.ErrInvalidClaims) {
		t.Fatalf("Issue error = %v, want ErrInvalidClaims", err)
	}
}

func TestMemoryStoreLifecycleAndSafeListing(t *testing.T) {
	now := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	t.Run("consume then replay", func(t *testing.T) {
		store := permit.NewMemoryStore()
		claims := claimsForStore("p_consume")
		if err := store.Register(claims); err != nil {
			t.Fatal(err)
		}
		if got := store.Consume(claims.PermitID, now); got.Outcome != permit.ConsumeSucceeded || got.Record.State != permit.StateConsumed {
			t.Fatalf("first consume = %#v", got)
		}
		if got := store.Consume(claims.PermitID, now); got.Outcome != permit.ConsumeReplayed {
			t.Fatalf("second consume = %#v, want REPLAYED", got)
		}
	})

	t.Run("expire", func(t *testing.T) {
		store := permit.NewMemoryStore()
		claims := claimsForStore("p_expire")
		if err := store.Register(claims); err != nil {
			t.Fatal(err)
		}
		afterExpiry := claims.ExpiresTime().Add(time.Nanosecond)
		record, ok := store.Get(claims.PermitID, afterExpiry)
		if !ok || record.State != permit.StateExpired || record.ExpiredAt == nil {
			t.Fatalf("expired record = %#v, exists=%v", record, ok)
		}
		if got := store.Consume(claims.PermitID, afterExpiry); got.Outcome != permit.ConsumeExpired {
			t.Fatalf("consume expired = %#v", got)
		}
	})

	t.Run("revoke", func(t *testing.T) {
		store := permit.NewMemoryStore()
		claims := claimsForStore("p_revoke")
		if err := store.Register(claims); err != nil {
			t.Fatal(err)
		}
		record, err := store.Revoke(claims.PermitID, now)
		if err != nil || record.State != permit.StateRevoked || record.RevokedAt == nil {
			t.Fatalf("revoke = %#v, %v", record, err)
		}
		if got := store.Consume(claims.PermitID, now); got.Outcome != permit.ConsumeRevoked {
			t.Fatalf("consume revoked = %#v", got)
		}
	})

	t.Run("list contains safe state only", func(t *testing.T) {
		store := permit.NewMemoryStore()
		claims := claimsForStore("p_list")
		if err := store.Register(claims); err != nil {
			t.Fatal(err)
		}
		list := store.List(now)
		if len(list) != 1 || list[0].Claims.PermitID != claims.PermitID || list[0].State != permit.StateIssued {
			t.Fatalf("List = %#v", list)
		}
		encoded, err := json.Marshal(list)
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(string(encoded), "permit_token") || strings.Contains(string(encoded), "arguments") {
			t.Fatalf("safe list exposed a credential or arguments: %s", encoded)
		}
	})
}

func keyPair(t *testing.T) (ed25519.PublicKey, ed25519.PrivateKey) {
	t.Helper()
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	return publicKey, privateKey
}

func issueRequest(permitID string, ttl time.Duration) permit.IssueRequest {
	return permit.IssueRequest{
		PermitID: permitID, RequestID: "request-01", PrincipalID: "user-01",
		AgentID: "finance-agent", WorkloadID: "finance-agent-v3",
		DelegatedAuthorityFingerprint: "sha256:" + strings.Repeat("a", 64),
		Tool:                          "payment.send", Capability: "payment.transfer", Resource: "account-123", Operation: "transfer",
		ActionDigest:  "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
		PolicyVersion: "policy-v7", TTL: ttl,
		Obligations: permit.Obligations{IsolationRequired: true, EnhancedAuditRequired: true},
	}
}

func claimsForStore(permitID string) permit.Claims {
	issuedAt := time.Date(2026, 9, 4, 8, 0, 0, 0, time.UTC)
	request := issueRequest(permitID, time.Minute)
	return permit.Claims{
		PermitID: permitID, RequestID: request.RequestID,
		PrincipalID: request.PrincipalID, AgentID: request.AgentID, WorkloadID: request.WorkloadID,
		DelegatedAuthorityFingerprint: request.DelegatedAuthorityFingerprint,
		Tool:                          request.Tool, Capability: request.Capability, Resource: request.Resource, Operation: request.Operation,
		ActionDigest: request.ActionDigest, PolicyVersion: request.PolicyVersion, Obligations: request.Obligations,
		Issuer: "aegis-router", IssuedAt: issuedAt.Unix(), ExpiresAt: issuedAt.Add(time.Hour).Unix(), SingleUse: true,
	}
}
