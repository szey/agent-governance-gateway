package discovery

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type Scanner struct {
	config    Config
	clock     func() time.Time
	walkDir   func(string, fs.WalkDirFunc) error
	truncated bool
	gapCount  int
}

func NewScanner(cfg Config) *Scanner {
	if cfg.MaxFileBytes <= 0 {
		cfg.MaxFileBytes = 2 << 20
	}
	if cfg.MaxFindings <= 0 {
		cfg.MaxFindings = 500
	}
	return &Scanner{config: cfg, clock: time.Now, walkDir: filepath.WalkDir}
}

func (s *Scanner) Scan(roots []string) (Report, error) {
	if len(roots) == 0 {
		return Report{}, fmt.Errorf("at least one scan root is required")
	}

	report := Report{
		ScannedAt: s.clock().UTC(), Roots: make([]string, 0, len(roots)),
		Agents: []DiscoveredAgent{}, Gaps: []CoverageGap{},
	}
	s.truncated = false
	s.gapCount = 0
	findings := map[string]*DiscoveredAgent{}
	for _, root := range roots {
		absolute, err := filepath.Abs(root)
		if err != nil {
			return Report{}, fmt.Errorf("resolve scan root %q: %w", root, err)
		}
		info, err := os.Stat(absolute)
		if err != nil {
			return Report{}, fmt.Errorf("inspect scan root %q: %w", root, err)
		}
		if !info.IsDir() {
			return Report{}, fmt.Errorf("scan root %q is not a directory", root)
		}
		report.Roots = append(report.Roots, absolute)
		if err := s.scanRoot(absolute, findings, &report); err != nil {
			return Report{}, err
		}
	}

	keys := make([]string, 0, len(findings))
	for key := range findings {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		agent := findings[key]
		s.reconcile(agent)
		agent.Exposure = assessExposure(*agent)
		sort.Slice(agent.Evidence, func(i, j int) bool { return agent.Evidence[i].Source < agent.Evidence[j].Source })
		report.Agents = append(report.Agents, *agent)
		switch agent.Status {
		case StatusApproved:
			report.Summary.Approved++
		case StatusShadow:
			report.Summary.Shadow++
		case StatusUnassessed:
			report.Summary.Available++
		}
	}
	report.Summary.Total = len(report.Agents)
	report.Summary.CoverageGaps = s.gapCount
	report.Summary.Truncated = s.truncated
	return report, nil
}

func (s *Scanner) scanRoot(root string, findings map[string]*DiscoveredAgent, report *Report) error {
	return s.walkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			s.addCoverageGap(root, path, walkErr, report)
			return nil
		}
		if entry.IsDir() {
			if path != root && containsFold(s.config.SkipDirectories, entry.Name()) {
				return filepath.SkipDir
			}
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			s.addCoverageGap(root, path, err, report)
			return nil
		}
		for _, signature := range s.config.Signatures {
			if containsFold(signature.FileNames, entry.Name()) {
				s.addEvidence(root, path, signature, "configuration_file", entry.Name(), 0.95, findings)
			}
			if info.Size() <= s.config.MaxFileBytes && containsFold(signature.ContentFiles, entry.Name()) {
				data, err := os.ReadFile(path)
				if err != nil {
					s.addCoverageGap(root, path, err, report)
					continue
				}
				lower := strings.ToLower(string(data))
				for _, indicator := range signature.ContentIndicators {
					if strings.Contains(lower, strings.ToLower(indicator)) {
						s.addEvidence(root, path, signature, "dependency_or_config_indicator", indicator, 0.85, findings)
					}
				}
			}
		}
		return nil
	})
}

func (s *Scanner) addEvidence(root, path string, signature Signature, basis, indicator string, confidence float64, findings map[string]*DiscoveredAgent) {
	relative, err := filepath.Rel(root, path)
	if err != nil {
		relative = path
	}
	projectRoot := filepath.Dir(path)
	key := projectRoot + "\x00" + signature.AgentType
	agent, ok := findings[key]
	if !ok {
		if len(findings) >= s.config.MaxFindings {
			s.truncated = true
			return
		}
		state := deploymentState(root, relative, basis)
		agent = &DiscoveredAgent{
			Fingerprint: fingerprint(key), Name: filepath.Base(projectRoot) + " / " + signature.DisplayName,
			AgentType: signature.AgentType, DeploymentState: state, Status: governanceStatus(state), Evidence: []Evidence{},
		}
		findings[key] = agent
	} else if deploymentRank(deploymentState(root, relative, basis)) > deploymentRank(agent.DeploymentState) {
		agent.DeploymentState = deploymentState(root, relative, basis)
		agent.Status = governanceStatus(agent.DeploymentState)
	}
	agent.Evidence = append(agent.Evidence, Evidence{
		Scanner: "config", Basis: basis, Source: filepath.ToSlash(relative), Indicator: indicator, Confidence: confidence,
	})
	if confidence > agent.Confidence {
		agent.Confidence = confidence
	}
}

func (s *Scanner) reconcile(agent *DiscoveredAgent) {
	if agent.DeploymentState == DeploymentAvailable {
		agent.Status = StatusUnassessed
		return
	}
	for _, registered := range s.config.ApprovedAgents {
		if !approvalIsActive(registered, s.clock()) {
			continue
		}
		if !strings.EqualFold(registered.AgentType, agent.AgentType) {
			continue
		}
		if registered.Fingerprint != "" && !strings.EqualFold(registered.Fingerprint, agent.Fingerprint) {
			continue
		}
		if registered.PathContains != "" {
			matched := false
			for _, evidence := range agent.Evidence {
				if strings.Contains(strings.ToLower(evidence.Source), strings.ToLower(registered.PathContains)) {
					matched = true
					break
				}
			}
			if !matched {
				continue
			}
		}
		agent.Status = StatusApproved
		agent.ApprovalID = registered.ID
		agent.Name = registered.Name
		agent.Owner = registered.Owner
		return
	}
}

func assessExposure(agent DiscoveredAgent) ExposureAssessment {
	assessment := ExposureAssessment{
		Classification:        "discovery_evidence_only",
		PotentialCapabilities: []string{},
		Factors:               []string{},
	}
	switch agent.AgentType {
	case "mcp":
		assessment.PotentialCapabilities = append(assessment.PotentialCapabilities, "tool_integration")
	case "langchain", "crewai", "autogen", "openai-agents":
		assessment.PotentialCapabilities = append(assessment.PotentialCapabilities, "agent_workflow")
	}
	if agent.DeploymentState == DeploymentAvailable {
		assessment.Factors = []string{"dependency, catalog, marketplace, cache, or temporary evidence only; not counted as a deployed Agent"}
		return assessment
	}
	assessment.Classification = "configured_or_observed_workload"
	if agent.AgentType == "mcp" {
		assessment.Factors = append(assessment.Factors, "MCP configuration may expose tool capabilities")
	}
	if agent.Status == StatusShadow {
		assessment.Factors = append(assessment.Factors, "workload evidence is not matched to the asset registry")
	} else if agent.Status == StatusApproved {
		assessment.Factors = append(assessment.Factors, "workload evidence is matched to an active asset registration")
	}
	if len(assessment.Factors) == 0 {
		assessment.Factors = []string{"configuration evidence requires operator assessment"}
	}
	return assessment
}

func deploymentState(root, relative, basis string) DeploymentState {
	// A dependency string proves only that code or an integration may be
	// available. It does not prove a configured, deployed, or running Agent.
	if basis == "dependency_or_config_indicator" {
		return DeploymentAvailable
	}
	context := filepath.ToSlash(filepath.Join(filepath.Base(root), relative))
	for _, segment := range strings.Split(strings.ToLower(context), "/") {
		segment = strings.Trim(segment, ". ")
		if strings.Contains(segment, "marketplace") || segment == "catalog" || segment == "cache" || segment == "temp" {
			return DeploymentAvailable
		}
	}
	if basis == "configuration_file" {
		return DeploymentConfigured
	}
	return DeploymentInstalled
}

func deploymentRank(state DeploymentState) int {
	return map[DeploymentState]int{
		DeploymentAvailable: 1, DeploymentInstalled: 2, DeploymentConfigured: 3, DeploymentObserved: 4,
	}[state]
}

func governanceStatus(state DeploymentState) Status {
	if state == DeploymentAvailable {
		return StatusUnassessed
	}
	return StatusShadow
}

func approvalIsActive(entry RegistryEntry, now time.Time) bool {
	if entry.State != "" && !strings.EqualFold(entry.State, "active") {
		return false
	}
	if entry.ExpiresOn == "" {
		return true
	}
	expires, err := time.Parse("2006-01-02", entry.ExpiresOn)
	return err == nil && !expires.Before(now.UTC().Truncate(24*time.Hour))
}

func (s *Scanner) addCoverageGap(root, path string, err error, report *Report) {
	s.gapCount++
	if len(report.Gaps) >= 50 {
		return
	}
	relative, relErr := filepath.Rel(root, path)
	if relErr != nil || relative == "." {
		relative = filepath.Base(path)
	}
	report.Gaps = append(report.Gaps, CoverageGap{Source: filepath.ToSlash(relative), Reason: compactError(err)})
}

func compactError(err error) string {
	lower := strings.ToLower(err.Error())
	if strings.Contains(lower, "cannot find") || strings.Contains(lower, "no such file") || strings.Contains(lower, "not exist") {
		return "not_found"
	}
	if strings.Contains(lower, "access is denied") || strings.Contains(lower, "permission denied") {
		return "permission_denied"
	}
	return "unreadable"
}

func fingerprint(value string) string {
	sum := sha256.Sum256([]byte(strings.ToLower(filepath.Clean(value))))
	return "sha256:" + hex.EncodeToString(sum[:12])
}

func containsFold(items []string, target string) bool {
	for _, item := range items {
		if strings.EqualFold(item, target) {
			return true
		}
	}
	return false
}
