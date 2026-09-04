// Package permit issues and tracks cryptographically signed, single-use Aegis
// execution permits. Permit claims contain only normalized metadata and an
// action digest; raw arguments and delegated credentials are never accepted.
package permit

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

var (
	ErrInvalidClaims    = errors.New("invalid execution permit claims")
	ErrInvalidKey       = errors.New("invalid Ed25519 key")
	ErrMalformedToken   = errors.New("malformed execution permit token")
	ErrInvalidSignature = errors.New("invalid execution permit signature")
	ErrUnsupportedToken = errors.New("unsupported execution permit token")

	actionDigestPattern = regexp.MustCompile(`^sha256:[0-9a-f]{64}$`)
	fingerprintPattern  = regexp.MustCompile(`^sha256:[0-9a-f]{64}$`)
)

// Obligations are requirements imposed on the executor. Aegis signs these
// requirements but does not claim to provide an isolation or sandbox backend.
type Obligations struct {
	IsolationRequired     bool `json:"isolation_required,omitempty"`
	NetworkEgressDenied   bool `json:"network_egress_denied,omitempty"`
	ReadOnly              bool `json:"read_only,omitempty"`
	HumanApprovalRequired bool `json:"human_approval_required,omitempty"`
	EnhancedAuditRequired bool `json:"enhanced_audit_required,omitempty"`
}

// Claims are the signed, action-bound contents of an execution permit. Time
// fields are UTC Unix seconds. The token itself is deliberately absent.
type Claims struct {
	PermitID                      string      `json:"jti"`
	RequestID                     string      `json:"request_id"`
	PrincipalID                   string      `json:"principal"`
	AgentID                       string      `json:"agent"`
	WorkloadID                    string      `json:"workload"`
	DelegatedAuthorityFingerprint string      `json:"delegated_authority_fingerprint,omitempty"`
	Tool                          string      `json:"tool"`
	Capability                    string      `json:"capability"`
	Resource                      string      `json:"resource"`
	Operation                     string      `json:"operation"`
	ActionDigest                  string      `json:"action_digest"`
	PolicyVersion                 string      `json:"policy_version"`
	Obligations                   Obligations `json:"obligations,omitempty"`
	Issuer                        string      `json:"iss"`
	IssuedAt                      int64       `json:"iat"`
	ExpiresAt                     int64       `json:"exp"`
	SingleUse                     bool        `json:"single_use"`
}

func (c Claims) IssuedTime() time.Time  { return time.Unix(c.IssuedAt, 0).UTC() }
func (c Claims) ExpiresTime() time.Time { return time.Unix(c.ExpiresAt, 0).UTC() }

// Validate verifies required claims without accepting raw payloads.
func (c Claims) Validate() error {
	fields := []struct {
		name  string
		value string
		limit int
	}{
		{"jti", c.PermitID, 160},
		{"request_id", c.RequestID, 160},
		{"principal", c.PrincipalID, 512},
		{"agent", c.AgentID, 512},
		{"workload", c.WorkloadID, 512},
		{"tool", c.Tool, 512},
		{"capability", c.Capability, 512},
		{"resource", c.Resource, 2048},
		{"operation", c.Operation, 512},
		{"policy_version", c.PolicyVersion, 512},
		{"iss", c.Issuer, 512},
	}
	for _, field := range fields {
		if err := validateMetadata(field.name, field.value, field.limit, true); err != nil {
			return err
		}
	}
	if err := validateMetadata("delegated_authority_fingerprint", c.DelegatedAuthorityFingerprint, 512, false); err != nil {
		return err
	}
	if c.DelegatedAuthorityFingerprint != "" && !fingerprintPattern.MatchString(c.DelegatedAuthorityFingerprint) {
		return fmt.Errorf("%w: delegated_authority_fingerprint must be an Aegis-bound, algorithm-qualified SHA-256 digest", ErrInvalidClaims)
	}
	if !actionDigestPattern.MatchString(c.ActionDigest) {
		return fmt.Errorf("%w: action_digest must be a lowercase algorithm-qualified SHA-256 digest", ErrInvalidClaims)
	}
	if c.IssuedAt <= 0 || c.ExpiresAt <= c.IssuedAt {
		return fmt.Errorf("%w: exp must be later than iat", ErrInvalidClaims)
	}
	if !c.SingleUse {
		return fmt.Errorf("%w: single_use must be true", ErrInvalidClaims)
	}
	return nil
}

func validateMetadata(name, value string, limit int, required bool) error {
	if required && value == "" {
		return fmt.Errorf("%w: %s is required", ErrInvalidClaims, name)
	}
	if value == "" {
		return nil
	}
	if !utf8.ValidString(value) || len(value) > limit {
		return fmt.Errorf("%w: %s is invalid or too long", ErrInvalidClaims, name)
	}
	if strings.IndexFunc(value, unicode.IsControl) >= 0 {
		return fmt.Errorf("%w: %s contains control characters", ErrInvalidClaims, name)
	}
	return nil
}
