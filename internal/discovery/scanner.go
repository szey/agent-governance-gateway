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
	config Config
	clock  func() time.Time
}

func NewScanner(cfg Config) *Scanner {
	return &Scanner{config: cfg, clock: time.Now}
}

func (s *Scanner) Scan(roots []string) (Report, error) {
	if len(roots) == 0 {
		return Report{}, fmt.Errorf("at least one scan root is required")
	}

	report := Report{ScannedAt: s.clock().UTC(), Roots: make([]string, 0, len(roots)), Agents: []DiscoveredAgent{}}
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
		if err := s.scanRoot(absolute, findings); err != nil {
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
		agent.Risk = scoreRisk(*agent)
		sort.Slice(agent.Evidence, func(i, j int) bool { return agent.Evidence[i].Source < agent.Evidence[j].Source })
		report.Agents = append(report.Agents, *agent)
		if agent.Status == StatusRegistered {
			report.Summary.Registered++
		} else {
			report.Summary.Shadow++
		}
	}
	report.Summary.Total = len(report.Agents)
	return report, nil
}

func (s *Scanner) scanRoot(root string, findings map[string]*DiscoveredAgent) error {
	return filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return fmt.Errorf("walk %s: %w", path, walkErr)
		}
		if entry.IsDir() {
			if path != root && containsFold(s.config.SkipDirectories, entry.Name()) {
				return filepath.SkipDir
			}
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return fmt.Errorf("inspect %s: %w", path, err)
		}
		for _, signature := range s.config.Signatures {
			if containsFold(signature.FileNames, entry.Name()) {
				s.addEvidence(root, path, signature, "configuration_file", entry.Name(), 0.95, findings)
			}
			if info.Size() <= s.config.MaxFileBytes && containsFold(signature.ContentFiles, entry.Name()) {
				data, err := os.ReadFile(path)
				if err != nil {
					return fmt.Errorf("read candidate %s: %w", path, err)
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
		agent = &DiscoveredAgent{
			Fingerprint: fingerprint(key),
			Name:        filepath.Base(projectRoot) + " / " + signature.DisplayName,
			AgentType:   signature.AgentType,
			Status:      StatusShadow,
			Evidence:    []Evidence{},
		}
		findings[key] = agent
	}
	agent.Evidence = append(agent.Evidence, Evidence{
		Scanner: "config", Basis: basis, Source: filepath.ToSlash(relative), Indicator: indicator, Confidence: confidence,
	})
	if confidence > agent.Confidence {
		agent.Confidence = confidence
	}
}

func (s *Scanner) reconcile(agent *DiscoveredAgent) {
	for _, registered := range s.config.RegisteredAgents {
		if !strings.EqualFold(registered.AgentType, agent.AgentType) {
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
		agent.Status = StatusRegistered
		agent.Name = registered.Name
		agent.Owner = registered.Owner
		return
	}
}

func scoreRisk(agent DiscoveredAgent) RiskAssessment {
	score := 0
	var factors []string
	if agent.Status == StatusShadow {
		score += 45
		factors = append(factors, "not present in the registered agent inventory (+45)")
	}
	if agent.Owner == "" {
		score += 15
		factors = append(factors, "no accountable owner identified (+15)")
	}
	if agent.AgentType == "mcp" {
		score += 15
		factors = append(factors, "tool-capable MCP integration detected (+15)")
	}
	if agent.Confidence >= 0.9 {
		score += 10
		factors = append(factors, "high-confidence configuration evidence (+10)")
	}
	if score > 100 {
		score = 100
	}
	level := "low"
	if score >= 70 {
		level = "high"
	} else if score >= 40 {
		level = "medium"
	}
	if len(factors) == 0 {
		factors = []string{"registered agent with an accountable owner"}
	}
	return RiskAssessment{Score: score, Level: level, Factors: factors}
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
