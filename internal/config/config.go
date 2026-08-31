package config

import (
	"encoding/json"
	"fmt"
	"os"

	"agent-governance-gateway/internal/models"
)

func Load(path string) (models.PolicyConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return models.PolicyConfig{}, fmt.Errorf("read policy config: %w", err)
	}

	var cfg models.PolicyConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return models.PolicyConfig{}, fmt.Errorf("parse policy config: %w", err)
	}
	if len(cfg.Agents) == 0 || len(cfg.Resources) == 0 {
		return models.PolicyConfig{}, fmt.Errorf("policy config must define agents and resources")
	}
	return cfg, nil
}
