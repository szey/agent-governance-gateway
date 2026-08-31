package risk

import (
	"fmt"

	"agent-governance-gateway/internal/models"
)

type Scorer struct {
	config models.PolicyConfig
}

func New(cfg models.PolicyConfig) *Scorer {
	return &Scorer{config: cfg}
}

func (s *Scorer) Assess(req models.Request) models.RiskAssessment {
	score := 0
	var signals []string

	if resource, ok := s.config.Resources[req.TargetResource]; ok {
		points := map[string]int{"low": 0, "medium": 20, "high": 35, "critical": 50}[resource.Sensitivity]
		score += points
		if points > 0 {
			signals = append(signals, fmt.Sprintf("%s resource sensitivity (+%d)", resource.Sensitivity, points))
		}
		for _, required := range resource.Scopes {
			if !contains(req.TokenScopes, required) {
				score += 35
				signals = append(signals, "delegated scope mismatch (+35)")
				break
			}
		}
	} else {
		score += 50
		signals = append(signals, "unclassified resource (+50)")
	}

	if contains(s.config.SensitiveActions, req.RequestedCapability) {
		score += 20
		signals = append(signals, "sensitive capability (+20)")
	}
	if contains(s.config.ProhibitedActions, req.RequestedCapability) {
		score += 60
		signals = append(signals, "prohibited capability (+60)")
	}
	for _, action := range req.PlannedActions {
		if contains(s.config.SuspiciousActions, action) {
			score += 30
			signals = append(signals, "suspicious planned action (+30)")
			break
		}
	}

	if score > 100 {
		score = 100
	}
	level := "low"
	if score >= 70 {
		level = "high"
	} else if score >= 35 {
		level = "medium"
	}
	if len(signals) == 0 {
		signals = []string{"no elevated risk signals"}
	}
	return models.RiskAssessment{Score: score, Level: level, Signals: signals}
}

func contains(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}
