// Package keyprovider defines the local signing-key boundary used by Aegis
// permit issuers and verifiers. It deliberately contains no KMS, cloud, or
// persistence policy; callers may load a persistent key and supply it through
// NewStatic while the Provider interface leaves room for a rotating keyring.
package keyprovider

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"unicode"
)

var (
	ErrInvalidKey   = errors.New("invalid Ed25519 key")
	ErrInvalidKeyID = errors.New("invalid signing key id")
	ErrUnknownKeyID = errors.New("unknown signing key id")
)

// SigningKey is the active Ed25519 key returned to the permit issuer. The
// private key must never be logged or serialized.
type SigningKey struct {
	KeyID      string
	PrivateKey ed25519.PrivateKey
}

func (key SigningKey) String() string {
	return fmt.Sprintf("SigningKey{KeyID:%q, PrivateKey:<redacted>}", key.KeyID)
}

func (key SigningKey) GoString() string { return key.String() }

func (key SigningKey) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		KeyID      string `json:"key_id"`
		PrivateKey string `json:"private_key"`
	}{KeyID: key.KeyID, PrivateKey: "<redacted>"})
}

func (key SigningKey) PublicKey() ed25519.PublicKey {
	if len(key.PrivateKey) != ed25519.PrivateKeySize {
		return nil
	}
	publicKey := key.PrivateKey.Public().(ed25519.PublicKey)
	return append(ed25519.PublicKey(nil), publicKey...)
}

// VerificationProvider resolves a public key by the untrusted kid selector.
// Implementations must return ErrUnknownKeyID instead of falling back to an
// unrelated key.
type VerificationProvider interface {
	VerificationKey(keyID string) (ed25519.PublicKey, error)
}

// Provider separates key storage/lifecycle from permit logic. CurrentSigningKey
// may change after rotation; VerificationKey must continue resolving any still-
// valid key IDs retained by a future keyring implementation.
type Provider interface {
	VerificationProvider
	CurrentSigningKey() (SigningKey, error)
}

// Static is a single-key provider. It is suitable for an ephemeral development
// key or for a persistent local key loaded by the embedding process.
type Static struct {
	key SigningKey
}

func NewStatic(keyID string, privateKey ed25519.PrivateKey) (*Static, error) {
	if err := ValidateKeyID(keyID); err != nil {
		return nil, err
	}
	if len(privateKey) != ed25519.PrivateKeySize {
		return nil, ErrInvalidKey
	}
	return &Static{key: SigningKey{KeyID: keyID, PrivateKey: append(ed25519.PrivateKey(nil), privateKey...)}}, nil
}

// NewEphemeral generates one process-local development key. Its derived key ID
// is stable for that key but changes after process restart.
func NewEphemeral() (*Static, error) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("generate ephemeral signing key: %w", err)
	}
	digest := sha256.Sum256(publicKey)
	return NewStatic("dev-ed25519-"+hex.EncodeToString(digest[:8]), privateKey)
}

func (provider *Static) CurrentSigningKey() (SigningKey, error) {
	if provider == nil || len(provider.key.PrivateKey) != ed25519.PrivateKeySize {
		return SigningKey{}, ErrInvalidKey
	}
	return SigningKey{
		KeyID:      provider.key.KeyID,
		PrivateKey: append(ed25519.PrivateKey(nil), provider.key.PrivateKey...),
	}, nil
}

func (provider *Static) VerificationKey(keyID string) (ed25519.PublicKey, error) {
	if provider == nil || len(provider.key.PrivateKey) != ed25519.PrivateKeySize {
		return nil, ErrInvalidKey
	}
	if keyID != provider.key.KeyID {
		return nil, ErrUnknownKeyID
	}
	return provider.key.PublicKey(), nil
}

func ValidateKeyID(keyID string) error {
	if keyID == "" || len(keyID) > 128 || strings.IndexFunc(keyID, unicode.IsControl) >= 0 {
		return ErrInvalidKeyID
	}
	for _, char := range keyID {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') || strings.ContainsRune("._:-", char) {
			continue
		}
		return ErrInvalidKeyID
	}
	return nil
}
