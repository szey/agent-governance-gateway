package permit

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"
)

const (
	DefaultTTL = 30 * time.Second
	MaxTTL     = 15 * time.Minute
)

type IssueRequest struct {
	PermitID                      string
	RequestID                     string
	PrincipalID                   string
	AgentID                       string
	WorkloadID                    string
	DelegatedAuthorityFingerprint string
	Tool                          string
	Capability                    string
	Resource                      string
	Operation                     string
	ActionDigest                  string
	PolicyVersion                 string
	Obligations                   Obligations
	TTL                           time.Duration
}

// IssuedPermit keeps its credential private from JSON and fmt's default struct
// formatting. Call Token only when returning the credential to its executor.
type IssuedPermit struct {
	PermitID string `json:"permit_id"`
	Claims   Claims `json:"claims"`
	token    string
}

func (p IssuedPermit) Token() string { return p.token }

// String and GoString prevent accidental credential disclosure through common
// structured logging and diagnostic formatting.
func (p IssuedPermit) String() string {
	return fmt.Sprintf("IssuedPermit{PermitID:%q, Token:<redacted>}", p.PermitID)
}

func (p IssuedPermit) GoString() string { return p.String() }

type IssuerOption func(*Issuer)

func WithIssuerClock(clock func() time.Time) IssuerOption {
	return func(issuer *Issuer) {
		if clock != nil {
			issuer.clock = clock
		}
	}
}

type Issuer struct {
	name       string
	privateKey ed25519.PrivateKey
	store      Store
	clock      func() time.Time
}

func NewIssuer(name string, privateKey ed25519.PrivateKey, store Store, options ...IssuerOption) (*Issuer, error) {
	if name == "" {
		return nil, fmt.Errorf("%w: issuer is required", ErrInvalidClaims)
	}
	if len(privateKey) != ed25519.PrivateKeySize {
		return nil, ErrInvalidKey
	}
	if store == nil {
		return nil, fmt.Errorf("%w: permit store is required", ErrInvalidClaims)
	}
	issuer := &Issuer{
		name:       name,
		privateKey: append(ed25519.PrivateKey(nil), privateKey...),
		store:      store,
		clock:      time.Now,
	}
	for _, option := range options {
		option(issuer)
	}
	return issuer, nil
}

func (i *Issuer) Issue(request IssueRequest) (IssuedPermit, error) {
	ttl := request.TTL
	if ttl == 0 {
		ttl = DefaultTTL
	}
	if ttl < time.Second || ttl > MaxTTL || ttl%time.Second != 0 {
		return IssuedPermit{}, fmt.Errorf("%w: TTL must be whole seconds between 1s and %s", ErrInvalidClaims, MaxTTL)
	}
	permitID := request.PermitID
	if permitID == "" {
		var err error
		permitID, err = newPermitID()
		if err != nil {
			return IssuedPermit{}, err
		}
	}
	now := i.clock().UTC().Truncate(time.Second)
	claims := Claims{
		PermitID: permitID, RequestID: request.RequestID,
		PrincipalID: request.PrincipalID, AgentID: request.AgentID, WorkloadID: request.WorkloadID,
		DelegatedAuthorityFingerprint: request.DelegatedAuthorityFingerprint,
		Tool:                          request.Tool, Capability: request.Capability, Resource: request.Resource, Operation: request.Operation,
		ActionDigest: request.ActionDigest, PolicyVersion: request.PolicyVersion, Obligations: request.Obligations,
		Issuer: i.name, IssuedAt: now.Unix(), ExpiresAt: now.Add(ttl).Unix(), SingleUse: true,
	}
	if err := claims.Validate(); err != nil {
		return IssuedPermit{}, err
	}
	token, err := SignToken(i.privateKey, claims)
	if err != nil {
		return IssuedPermit{}, err
	}
	if err := i.store.Register(claims); err != nil {
		return IssuedPermit{}, err
	}
	return IssuedPermit{PermitID: permitID, Claims: claims, token: token}, nil
}

func (i *Issuer) PublicKey() ed25519.PublicKey {
	key := i.privateKey.Public().(ed25519.PublicKey)
	return append(ed25519.PublicKey(nil), key...)
}

func newPermitID() (string, error) {
	random := make([]byte, 18)
	if _, err := rand.Read(random); err != nil {
		return "", fmt.Errorf("generate permit identifier: %w", err)
	}
	return "p_" + base64.RawURLEncoding.EncodeToString(random), nil
}
