package discovery_test

import (
	"os"
	"path/filepath"
	"testing"

	"agent-governance-gateway/internal/discovery"
)

func TestScannerFindsAndReconcilesShadowAgent(t *testing.T) {
	root := t.TempDir()
	writeFile(t, filepath.Join(root, "package.json"), `{"dependencies":{"@modelcontextprotocol/sdk":"1.0.0"}}`)
	writeFile(t, filepath.Join(root, "mcp.json"), `{"mcpServers":{"ops":{"command":"node"}}}`)

	cfg := discovery.Config{
		MaxFileBytes: 1 << 20,
		Signatures: []discovery.Signature{{
			AgentType: "mcp", DisplayName: "MCP integration",
			FileNames: []string{"mcp.json"}, ContentFiles: []string{"package.json"},
			ContentIndicators: []string{"@modelcontextprotocol/sdk"},
		}},
	}
	report, err := discovery.NewScanner(cfg).Scan([]string{root})
	if err != nil {
		t.Fatal(err)
	}
	if report.Summary.Shadow != 1 || len(report.Agents) != 1 {
		t.Fatalf("summary = %#v, agents = %d", report.Summary, len(report.Agents))
	}
	agent := report.Agents[0]
	if agent.Status != discovery.StatusShadow {
		t.Fatalf("status = %q, want shadow", agent.Status)
	}
	if len(agent.Evidence) != 2 {
		t.Fatalf("evidence = %d, want 2", len(agent.Evidence))
	}
	if agent.Risk.Level != "high" {
		t.Fatalf("risk = %#v, want high", agent.Risk)
	}
	if agent.Fingerprint == "" {
		t.Fatal("fingerprint is empty")
	}

	cfg.RegisteredAgents = []discovery.RegistryEntry{{
		Name: "Approved MCP", AgentType: "mcp", PathContains: "mcp.json", Owner: "platform-security",
	}}
	reconciled, err := discovery.NewScanner(cfg).Scan([]string{root})
	if err != nil {
		t.Fatal(err)
	}
	registered := reconciled.Agents[0]
	if registered.Status != discovery.StatusRegistered || registered.Owner != "platform-security" {
		t.Fatalf("registered agent = %#v", registered)
	}
	if reconciled.Summary.Registered != 1 || reconciled.Summary.Shadow != 0 {
		t.Fatalf("summary = %#v", reconciled.Summary)
	}
}

func TestScannerSkipsConfiguredDirectories(t *testing.T) {
	root := t.TempDir()
	writeFile(t, filepath.Join(root, "node_modules", "mcp.json"), `{}`)
	cfg := discovery.Config{
		SkipDirectories: []string{"node_modules"},
		Signatures:      []discovery.Signature{{AgentType: "mcp", DisplayName: "MCP", FileNames: []string{"mcp.json"}}},
	}
	report, err := discovery.NewScanner(cfg).Scan([]string{root})
	if err != nil {
		t.Fatal(err)
	}
	if report.Summary.Total != 0 {
		t.Fatalf("found %d agents in skipped directory", report.Summary.Total)
	}
}

func TestScannerKeepsProjectsSeparate(t *testing.T) {
	root := t.TempDir()
	writeFile(t, filepath.Join(root, "alpha", "mcp.json"), `{}`)
	writeFile(t, filepath.Join(root, "beta", "mcp.json"), `{}`)
	cfg := discovery.Config{
		Signatures: []discovery.Signature{{AgentType: "mcp", DisplayName: "MCP", FileNames: []string{"mcp.json"}}},
	}
	report, err := discovery.NewScanner(cfg).Scan([]string{root})
	if err != nil {
		t.Fatal(err)
	}
	if report.Summary.Total != 2 || report.Summary.Shadow != 2 {
		t.Fatalf("summary = %#v, want two separate Shadow Agents", report.Summary)
	}
	if report.Agents[0].Fingerprint == report.Agents[1].Fingerprint {
		t.Fatal("separate projects received the same fingerprint")
	}
}

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
}
