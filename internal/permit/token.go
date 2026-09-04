package permit

import (
	"bytes"
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"agent-governance-gateway/internal/canonicalaction"
)

const (
	tokenType       = "AEGIS-PERMIT"
	tokenVersion    = 1
	maxCompactBytes = 64 << 10
)

type tokenHeader struct {
	Algorithm string `json:"alg"`
	Type      string `json:"typ"`
	Version   int    `json:"v"`
}

var compactHeader = tokenHeader{Algorithm: "EdDSA", Type: tokenType, Version: tokenVersion}

// SignToken creates an Ed25519-signed, JWS-shaped compact token. The wire
// shape is intentionally small but is not advertised as general JWT/JWS
// interoperability.
func SignToken(privateKey ed25519.PrivateKey, claims Claims) (string, error) {
	if len(privateKey) != ed25519.PrivateKeySize {
		return "", ErrInvalidKey
	}
	if err := claims.Validate(); err != nil {
		return "", err
	}
	headerJSON, err := json.Marshal(compactHeader)
	if err != nil {
		return "", err
	}
	payloadJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	encoding := base64.RawURLEncoding
	signingInput := encoding.EncodeToString(headerJSON) + "." + encoding.EncodeToString(payloadJSON)
	signature := ed25519.Sign(privateKey, []byte(signingInput))
	return signingInput + "." + encoding.EncodeToString(signature), nil
}

// VerifyToken authenticates and parses an Aegis compact token. Signature
// verification happens before the trusted claims are returned.
func VerifyToken(publicKey ed25519.PublicKey, token string) (Claims, error) {
	var claims Claims
	if len(publicKey) != ed25519.PublicKeySize {
		return claims, ErrInvalidKey
	}
	if token == "" || len(token) > maxCompactBytes {
		return claims, ErrMalformedToken
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 || parts[0] == "" || parts[1] == "" || parts[2] == "" {
		return claims, ErrMalformedToken
	}
	encoding := base64.RawURLEncoding
	signature, err := encoding.DecodeString(parts[2])
	if err != nil || len(signature) != ed25519.SignatureSize {
		return claims, ErrInvalidSignature
	}
	if encoding.EncodeToString(signature) != parts[2] {
		return claims, ErrInvalidSignature
	}
	signingInput := parts[0] + "." + parts[1]
	if !ed25519.Verify(publicKey, []byte(signingInput), signature) {
		return claims, ErrInvalidSignature
	}

	headerJSON, err := encoding.DecodeString(parts[0])
	if err != nil {
		return claims, fmt.Errorf("%w: header encoding", ErrMalformedToken)
	}
	payloadJSON, err := encoding.DecodeString(parts[1])
	if err != nil {
		return claims, fmt.Errorf("%w: payload encoding", ErrMalformedToken)
	}
	// CanonicalizeJSON is used here as a strict syntax and duplicate-key check;
	// the signed original JSON remains the data decoded below.
	if _, err := canonicalaction.CanonicalizeJSON(headerJSON); err != nil {
		return claims, fmt.Errorf("%w: invalid header JSON", ErrMalformedToken)
	}
	if _, err := canonicalaction.CanonicalizeJSON(payloadJSON); err != nil {
		return claims, fmt.Errorf("%w: invalid payload JSON", ErrMalformedToken)
	}
	var header tokenHeader
	if err := strictJSON(headerJSON, &header); err != nil {
		return claims, fmt.Errorf("%w: invalid header", ErrMalformedToken)
	}
	if header != compactHeader {
		return claims, ErrUnsupportedToken
	}
	if err := strictJSON(payloadJSON, &claims); err != nil {
		return Claims{}, fmt.Errorf("%w: invalid claims payload", ErrMalformedToken)
	}
	if err := claims.Validate(); err != nil {
		return Claims{}, err
	}
	return claims, nil
}

func strictJSON(input []byte, destination any) error {
	decoder := json.NewDecoder(bytes.NewReader(input))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	var trailing any
	if err := decoder.Decode(&trailing); err != io.EOF {
		if err == nil {
			return fmt.Errorf("unexpected trailing JSON")
		}
		return err
	}
	return nil
}
