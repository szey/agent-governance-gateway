package observer

import "agent-governance-gateway/internal/models"

type Observer struct {
	suspicious []string
}

func New(cfg models.PolicyConfig) *Observer {
	return &Observer{suspicious: cfg.SuspiciousActions}
}

func (o *Observer) Observe(planned, actual []string) models.RuntimeObservation {
	if len(actual) == 0 {
		actual = append([]string(nil), planned...)
	}

	unexpected := difference(actual, planned)
	var suspicious []string
	for _, action := range actual {
		if contains(o.suspicious, action) {
			suspicious = append(suspicious, action)
		}
	}

	return models.RuntimeObservation{
		PlannedActions:    nonNil(planned),
		ActualActions:     nonNil(actual),
		UnexpectedActions: nonNil(unexpected),
		SuspiciousActions: nonNil(suspicious),
		DriftDetected:     len(unexpected) > 0,
	}
}

func difference(left, right []string) []string {
	var result []string
	for _, item := range left {
		if !contains(right, item) {
			result = append(result, item)
		}
	}
	return result
}

func contains(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}

func nonNil(items []string) []string {
	if items == nil {
		return []string{}
	}
	return items
}
