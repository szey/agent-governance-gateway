package intake_test

import (
	"net/http/httptest"
	"strings"
	"testing"

	"agent-governance-gateway/internal/intake"
	"agent-governance-gateway/internal/models"
)

func TestStaticIntakeOverwritesCallerSuppliedSecurityIdentity(t *testing.T) {
	trusted := intake.IdentityContext{
		Principal: models.PrincipalContext{PrincipalID: "trusted-user", PrincipalType: "human"},
		Agent:     models.AgentIdentity{AgentID: "trusted-agent", WorkloadID: "trusted-workload"},
		DelegatedAuthority: models.DelegatedAuthority{
			CredentialFingerprint: strings.Repeat("a", 64), Scopes: []string{"code.read"}, Subject: "trusted-user",
		},
	}
	provider, err := intake.NewStatic(trusted, "test-auth-middleware")
	if err != nil {
		t.Fatal(err)
	}
	proposal := models.Request{
		Principal: models.PrincipalContext{PrincipalID: "forged-user"},
		Agent:     models.AgentIdentity{AgentID: "forged-agent", WorkloadID: "forged-workload"},
		Authority: models.DelegatedAuthority{CredentialFingerprint: strings.Repeat("b", 64)},
		Tool:      models.ToolContext{Name: "coder"},
		Action:    models.ActionRequest{Capability: "generate_code", Operation: "generate", TargetResource: "public_workspace"},
	}
	authorization, err := provider.Resolve(httptest.NewRequest("POST", "/api/actions/authorize", nil), proposal)
	if err != nil {
		t.Fatal(err)
	}
	resolved := authorization.Request()
	if resolved.Principal.PrincipalID != "trusted-user" || resolved.Agent.AgentID != "trusted-agent" || resolved.Agent.WorkloadID != "trusted-workload" {
		t.Fatalf("caller identity was not overwritten: %#v", resolved)
	}
	if resolved.Authority.CredentialFingerprint != strings.Repeat("a", 64) || authorization.Provenance().Assurance != intake.AssuranceAuthenticated {
		t.Fatalf("trusted authority/provenance missing: %#v / %#v", resolved.Authority, authorization.Provenance())
	}
}

func TestDevelopmentBodyIntakeIsLoopbackOnlyAndExplicitlyLowAssurance(t *testing.T) {
	provider, err := intake.NewLoopbackDevelopment("local-test")
	if err != nil {
		t.Fatal(err)
	}
	proposal := models.Request{
		Principal: models.PrincipalContext{PrincipalID: "developer", PrincipalType: "human"},
		Agent:     models.AgentIdentity{AgentID: "dev-agent", WorkloadID: "dev-workload"},
	}
	remote := httptest.NewRequest("POST", "/api/actions/authorize", nil)
	remote.RemoteAddr = "192.0.2.10:1234"
	if _, err := provider.Resolve(remote, proposal); err == nil {
		t.Fatal("non-loopback peer was accepted by development intake")
	}
	local := httptest.NewRequest("POST", "/api/actions/authorize", nil)
	local.RemoteAddr = "127.0.0.1:1234"
	authorization, err := provider.Resolve(local, proposal)
	if err != nil {
		t.Fatal(err)
	}
	if authorization.Provenance().Source != intake.SourceLocalDevelopment || authorization.Provenance().Assurance != intake.AssuranceDevelopmentOnly {
		t.Fatalf("development provenance = %#v", authorization.Provenance())
	}
}
