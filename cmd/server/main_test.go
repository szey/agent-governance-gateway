package main

import (
	"testing"

	"agent-governance-gateway/internal/intake"
)

func TestConfigureAuthorizationIntakeSelectsOneExplicitMode(t *testing.T) {
	tests := []struct {
		name        string
		development bool
		cidrs       []string
		providerID  string
		mode        string
		kind        any
	}{
		{"secure default", false, nil, "", "reject_all", intake.RejectAll{}},
		{"development", true, nil, "", "loopback_development", (*intake.LoopbackDevelopment)(nil)},
		{"trusted proxy", false, []string{"127.0.0.1/32", "::1/128"}, "local-auth-gateway", "trusted_proxy", (*intake.TrustedProxy)(nil)},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			provider, mode, err := configureAuthorizationIntake(test.development, test.cidrs, test.providerID)
			if err != nil {
				t.Fatal(err)
			}
			if mode != test.mode {
				t.Fatalf("mode = %q, want %q", mode, test.mode)
			}
			switch test.kind.(type) {
			case intake.RejectAll:
				if _, ok := provider.(intake.RejectAll); !ok {
					t.Fatalf("provider = %T, want RejectAll", provider)
				}
			case *intake.LoopbackDevelopment:
				if _, ok := provider.(*intake.LoopbackDevelopment); !ok {
					t.Fatalf("provider = %T, want LoopbackDevelopment", provider)
				}
			case *intake.TrustedProxy:
				if _, ok := provider.(*intake.TrustedProxy); !ok {
					t.Fatalf("provider = %T, want TrustedProxy", provider)
				}
			}
		})
	}
}

func TestConfigureAuthorizationIntakeRejectsAmbiguousOrPartialProxyConfiguration(t *testing.T) {
	tests := []struct {
		name        string
		development bool
		cidrs       []string
		providerID  string
	}{
		{"development and trusted proxy", true, []string{"127.0.0.1/32"}, "local-auth-gateway"},
		{"development and provider only", true, nil, "local-auth-gateway"},
		{"CIDR without provider", false, []string{"127.0.0.1/32"}, ""},
		{"provider without CIDR", false, nil, "local-auth-gateway"},
		{"whitespace provider without CIDR", false, nil, "   "},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if _, _, err := configureAuthorizationIntake(test.development, test.cidrs, test.providerID); err == nil {
				t.Fatal("invalid authorization intake configuration was accepted")
			}
		})
	}
}
