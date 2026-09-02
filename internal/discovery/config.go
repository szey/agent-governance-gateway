package discovery

import (
	"encoding/json"
	"fmt"
	"os"
)

func LoadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Config{}, fmt.Errorf("read discovery config: %w", err)
	}
	var raw struct {
		Config
		RegisteredAgents []RegistryEntry `json:"registered_agents"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return Config{}, fmt.Errorf("parse discovery config: %w", err)
	}
	cfg := raw.Config
	if len(cfg.ApprovedAgents) == 0 && len(raw.RegisteredAgents) > 0 {
		cfg.ApprovedAgents = raw.RegisteredAgents
	}
	if len(cfg.Signatures) == 0 {
		return Config{}, fmt.Errorf("discovery config must contain at least one signature")
	}
	if cfg.MaxFileBytes <= 0 {
		cfg.MaxFileBytes = 2 << 20
	}
	if cfg.MaxFindings <= 0 {
		cfg.MaxFindings = 500
	}
	return cfg, nil
}
