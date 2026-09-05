// Package intake defines the HTTP trust boundary for authorization context.
// Caller-supplied actions remain untrusted until an intake implementation has
// established principal, Agent/workload, and delegated-authority provenance.
package intake

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"agent-governance-gateway/internal/models"
)

var ErrTrustedContextRequired = errors.New("trusted authorization context is required")

const (
	SourceTrustedIntegration = "trusted_integration"
	SourceLocalDevelopment   = "local_development"
	AssuranceAuthenticated   = "authenticated_context"
	AssuranceDevelopmentOnly = "development_only"
)

// Authorization is the sealed output of a TrustedAuthorizationIntake. Its
// fields cannot be populated directly outside this package.
type Authorization struct {
	request    models.Request
	provenance models.AuthorizationContextProvenance
	resolved   bool
}

func (authorization Authorization) Request() models.Request { return authorization.request }

func (authorization Authorization) Provenance() models.AuthorizationContextProvenance {
	return authorization.provenance
}

func (authorization Authorization) Valid() bool { return authorization.resolved }

// NewTrustedAuthorization lets a custom authenticated middleware adapter mint
// the sealed value consumed by Router.AuthorizeTrustedAction. The adapter is
// responsible for authenticating the peer before calling this function.
func NewTrustedAuthorization(proposal models.Request, identity IdentityContext, providerID string, establishedAt time.Time) (Authorization, error) {
	providerID = strings.TrimSpace(providerID)
	if !safeProviderID(providerID) {
		return Authorization{}, fmt.Errorf("%w: provider id is missing or invalid", ErrTrustedContextRequired)
	}
	if establishedAt.IsZero() {
		establishedAt = time.Now().UTC()
	}
	return resolved(proposal, cloneIdentity(identity), models.AuthorizationContextProvenance{
		Source: SourceTrustedIntegration, ProviderID: providerID,
		Assurance: AssuranceAuthenticated, EstablishedAt: establishedAt.UTC(),
	}), nil
}

// TrustedAuthorizationIntake resolves security identity from a configured
// trust boundary. Implementations must not accidentally treat arbitrary HTTP
// body or header values as authenticated context.
type TrustedAuthorizationIntake interface {
	Resolve(request *http.Request, proposal models.Request) (Authorization, error)
}

// IdentityContext is supplied by an already-trusted integration (for example,
// authenticated middleware in an embedding process). Action/tool arguments
// remain from the proposal; all security identity fields are overwritten.
type IdentityContext struct {
	Principal          models.PrincipalContext
	Agent              models.AgentIdentity
	DelegatedAuthority models.DelegatedAuthority
}

type Static struct {
	identity   IdentityContext
	providerID string
	clock      func() time.Time
}

func NewStatic(identity IdentityContext, providerID string) (*Static, error) {
	providerID = strings.TrimSpace(providerID)
	if !safeProviderID(providerID) {
		return nil, fmt.Errorf("%w: provider id is missing or invalid", ErrTrustedContextRequired)
	}
	return &Static{identity: cloneIdentity(identity), providerID: providerID, clock: time.Now}, nil
}

func (provider *Static) Resolve(_ *http.Request, proposal models.Request) (Authorization, error) {
	if provider == nil || provider.providerID == "" {
		return Authorization{}, ErrTrustedContextRequired
	}
	return NewTrustedAuthorization(proposal, provider.identity, provider.providerID, provider.clock())
}

// RejectAll is the secure default for HTTP servers without a configured
// identity integration.
type RejectAll struct{}

func (RejectAll) Resolve(_ *http.Request, _ models.Request) (Authorization, error) {
	return Authorization{}, ErrTrustedContextRequired
}

// LoopbackDevelopment is an explicit development escape hatch. It accepts
// identity from the request body only when the direct peer is loopback and
// labels the resulting provenance as development-only, never authenticated.
type LoopbackDevelopment struct {
	providerID string
	clock      func() time.Time
}

func NewLoopbackDevelopment(providerID string) (*LoopbackDevelopment, error) {
	providerID = strings.TrimSpace(providerID)
	if !safeProviderID(providerID) {
		return nil, fmt.Errorf("%w: provider id is missing or invalid", ErrTrustedContextRequired)
	}
	return &LoopbackDevelopment{providerID: providerID, clock: time.Now}, nil
}

func (provider *LoopbackDevelopment) Resolve(request *http.Request, proposal models.Request) (Authorization, error) {
	if provider == nil || request == nil || !isLoopback(request.RemoteAddr) {
		return Authorization{}, fmt.Errorf("%w: development intake accepts loopback peers only", ErrTrustedContextRequired)
	}
	identity := IdentityContext{
		Principal: proposal.EffectivePrincipal(), Agent: proposal.EffectiveAgent(),
		DelegatedAuthority: proposal.EffectiveAuthority(),
	}
	return resolved(proposal, identity, models.AuthorizationContextProvenance{
		Source: SourceLocalDevelopment, ProviderID: provider.providerID,
		Assurance: AssuranceDevelopmentOnly, EstablishedAt: provider.clock().UTC(),
	}), nil
}

func resolved(proposal models.Request, identity IdentityContext, provenance models.AuthorizationContextProvenance) Authorization {
	structured := proposal.UsesStructuredContext()
	if !structured {
		// Preserve the deprecated flat request shape while replacing its identity
		// aliases from the trusted context. It cannot express workload or
		// delegation fingerprint separately and remains compatibility-only.
		proposal.Principal = models.PrincipalContext{}
		proposal.Agent = models.AgentIdentity{}
		proposal.Authority = models.DelegatedAuthority{}
		proposal.UserID = identity.Principal.PrincipalID
		proposal.AgentID = identity.Agent.AgentID
		proposal.TokenScopes = append([]string(nil), identity.DelegatedAuthority.Scopes...)
		return Authorization{request: proposal, provenance: provenance, resolved: true}
	}
	proposal.Principal = identity.Principal
	proposal.Agent = identity.Agent
	proposal.Authority = identity.DelegatedAuthority
	// Remove legacy identity aliases so the audit contains one unambiguous
	// server-resolved authorization context.
	proposal.UserID = ""
	proposal.AgentID = ""
	proposal.TokenScopes = nil
	return Authorization{request: proposal, provenance: provenance, resolved: true}
}

func isLoopback(remoteAddress string) bool {
	host, _, err := net.SplitHostPort(strings.TrimSpace(remoteAddress))
	if err != nil {
		host = strings.TrimSpace(remoteAddress)
	}
	if zone := strings.LastIndex(host, "%"); zone >= 0 {
		host = host[:zone]
	}
	ip := net.ParseIP(strings.Trim(host, "[]"))
	return ip != nil && ip.IsLoopback()
}

func cloneIdentity(identity IdentityContext) IdentityContext {
	clone := identity
	clone.Principal.Metadata = make(map[string]string, len(identity.Principal.Metadata))
	for key, value := range identity.Principal.Metadata {
		clone.Principal.Metadata[key] = value
	}
	if identity.Principal.Metadata == nil {
		clone.Principal.Metadata = nil
	}
	clone.DelegatedAuthority.Scopes = append([]string(nil), identity.DelegatedAuthority.Scopes...)
	if identity.DelegatedAuthority.ExpiresAt != nil {
		expiresAt := *identity.DelegatedAuthority.ExpiresAt
		clone.DelegatedAuthority.ExpiresAt = &expiresAt
	}
	return clone
}

func safeProviderID(value string) bool {
	if value == "" || len(value) > 128 {
		return false
	}
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') || strings.ContainsRune("._:-", char) {
			continue
		}
		return false
	}
	return true
}
