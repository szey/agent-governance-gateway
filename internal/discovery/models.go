package discovery

import "time"

type Status string

const (
	StatusApproved   Status = "approved"
	StatusShadow     Status = "shadow"
	StatusUnassessed Status = "unassessed"
)

type DeploymentState string

const (
	DeploymentAvailable  DeploymentState = "available"
	DeploymentInstalled  DeploymentState = "installed"
	DeploymentConfigured DeploymentState = "configured"
	DeploymentObserved   DeploymentState = "observed"
)

type Evidence struct {
	Scanner    string  `json:"scanner"`
	Basis      string  `json:"basis"`
	Source     string  `json:"source"`
	Indicator  string  `json:"indicator"`
	Confidence float64 `json:"confidence"`
}

// ExposureAssessment describes what a discovery signal may enable. It is not
// a runtime risk score: runtime risk belongs to a concrete attempted action.
type ExposureAssessment struct {
	Classification        string   `json:"classification"`
	PotentialCapabilities []string `json:"potential_capabilities"`
	Factors               []string `json:"factors"`
}

type DiscoveredAgent struct {
	Fingerprint     string             `json:"fingerprint"`
	Name            string             `json:"name"`
	AgentType       string             `json:"agent_type"`
	DeploymentState DeploymentState    `json:"deployment_state"`
	Status          Status             `json:"status"`
	ApprovalID      string             `json:"approval_id,omitempty"`
	Owner           string             `json:"owner,omitempty"`
	Confidence      float64            `json:"confidence"`
	Evidence        []Evidence         `json:"evidence"`
	Exposure        ExposureAssessment `json:"potential_exposure"`
}

type Report struct {
	ScannedAt time.Time         `json:"scanned_at"`
	Roots     []string          `json:"roots"`
	Agents    []DiscoveredAgent `json:"agents"`
	Gaps      []CoverageGap     `json:"coverage_gaps"`
	Summary   Summary           `json:"summary"`
}

type Summary struct {
	Total        int  `json:"total"`
	Approved     int  `json:"approved"`
	Shadow       int  `json:"shadow"`
	Available    int  `json:"available"`
	CoverageGaps int  `json:"coverage_gaps"`
	Truncated    bool `json:"truncated"`
}

type CoverageGap struct {
	Source string `json:"source"`
	Reason string `json:"reason"`
}

type Signature struct {
	AgentType         string   `json:"agent_type"`
	DisplayName       string   `json:"display_name"`
	FileNames         []string `json:"file_names"`
	ContentFiles      []string `json:"content_files"`
	ContentIndicators []string `json:"content_indicators"`
}

type RegistryEntry struct {
	ID            string `json:"id"`
	AgentID       string `json:"agent_id,omitempty"`
	WorkloadID    string `json:"workload_identity,omitempty"`
	DisplayName   string `json:"display_name,omitempty"`
	Name          string `json:"name"`
	AgentType     string `json:"agent_type"`
	Environment   string `json:"environment,omitempty"`
	Framework     string `json:"framework,omitempty"`
	PolicyProfile string `json:"policy_profile,omitempty"`
	Fingerprint   string `json:"fingerprint,omitempty"`
	PathContains  string `json:"path_contains"`
	Owner         string `json:"owner"`
	ApprovalRef   string `json:"approval_ref,omitempty"`
	ExpiresOn     string `json:"expires_on,omitempty"`
	State         string `json:"state,omitempty"`
}

type Config struct {
	Signatures      []Signature     `json:"signatures"`
	ApprovedAgents  []RegistryEntry `json:"approved_agents"`
	SkipDirectories []string        `json:"skip_directories"`
	MaxFileBytes    int64           `json:"max_file_bytes"`
	MaxFindings     int             `json:"max_findings"`
}
