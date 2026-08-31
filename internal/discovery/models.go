package discovery

import "time"

type Status string

const (
	StatusRegistered Status = "registered"
	StatusShadow     Status = "shadow"
)

type Evidence struct {
	Scanner    string  `json:"scanner"`
	Basis      string  `json:"basis"`
	Source     string  `json:"source"`
	Indicator  string  `json:"indicator"`
	Confidence float64 `json:"confidence"`
}

type RiskAssessment struct {
	Score   int      `json:"score"`
	Level   string   `json:"level"`
	Factors []string `json:"factors"`
}

type DiscoveredAgent struct {
	Fingerprint string         `json:"fingerprint"`
	Name        string         `json:"name"`
	AgentType   string         `json:"agent_type"`
	Status      Status         `json:"status"`
	Owner       string         `json:"owner,omitempty"`
	Confidence  float64        `json:"confidence"`
	Evidence    []Evidence     `json:"evidence"`
	Risk        RiskAssessment `json:"risk"`
}

type Report struct {
	ScannedAt time.Time         `json:"scanned_at"`
	Roots     []string          `json:"roots"`
	Agents    []DiscoveredAgent `json:"agents"`
	Summary   Summary           `json:"summary"`
}

type Summary struct {
	Total      int `json:"total"`
	Registered int `json:"registered"`
	Shadow     int `json:"shadow"`
}

type Signature struct {
	AgentType         string   `json:"agent_type"`
	DisplayName       string   `json:"display_name"`
	FileNames         []string `json:"file_names"`
	ContentFiles      []string `json:"content_files"`
	ContentIndicators []string `json:"content_indicators"`
}

type RegistryEntry struct {
	Name         string `json:"name"`
	AgentType    string `json:"agent_type"`
	PathContains string `json:"path_contains"`
	Owner        string `json:"owner"`
}

type Config struct {
	Signatures       []Signature     `json:"signatures"`
	RegisteredAgents []RegistryEntry `json:"registered_agents"`
	SkipDirectories  []string        `json:"skip_directories"`
	MaxFileBytes     int64           `json:"max_file_bytes"`
}
