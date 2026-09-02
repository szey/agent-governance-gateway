package discovery

import (
	"fmt"
	"slices"
	"sync"
	"time"
)

type Manager struct {
	mu           sync.RWMutex
	configPath   string
	registryPath string
	roots        []string
	config       Config
	registry     []RegistryEntry
	report       Report
}

func NewManager(configPath, registryPath string, roots []string) (*Manager, error) {
	manager := &Manager{configPath: configPath, registryPath: registryPath, roots: slices.Clone(roots)}
	if err := manager.rescanLocked(); err != nil {
		return nil, err
	}
	return manager, nil
}

func (m *Manager) Report() Report {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return cloneReport(m.report)
}

func (m *Manager) Registry() []RegistryEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return slices.Clone(m.registry)
}

func (m *Manager) AgentTypes() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	result := make([]string, 0, len(m.config.Signatures))
	for _, signature := range m.config.Signatures {
		result = append(result, signature.AgentType)
	}
	return result
}

func (m *Manager) Rescan() (Report, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if err := m.rescanLocked(); err != nil {
		return Report{}, err
	}
	return cloneReport(m.report), nil
}

func (m *Manager) SaveApproval(entry RegistryEntry) (RegistryEntry, Report, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	knownTypes := make([]string, 0, len(m.config.Signatures))
	for _, signature := range m.config.Signatures {
		knownTypes = append(knownTypes, signature.AgentType)
	}
	if err := ValidateRegistryEntry(entry, knownTypes); err != nil {
		return RegistryEntry{}, Report{}, err
	}
	entry = normalizeRegistry([]RegistryEntry{entry})[0]
	updated := slices.Clone(m.registry)
	found := false
	for index := range updated {
		if updated[index].ID == entry.ID {
			updated[index] = entry
			found = true
			break
		}
	}
	if !found {
		updated = append(updated, entry)
	}
	if err := SaveRegistry(m.registryPath, updated); err != nil {
		return RegistryEntry{}, Report{}, err
	}
	m.registry = updated
	m.config.ApprovedAgents = updated
	if err := m.scanLocked(); err != nil {
		return RegistryEntry{}, Report{}, err
	}
	return entry, cloneReport(m.report), nil
}

func (m *Manager) DeleteApproval(id string) (Report, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	updated := make([]RegistryEntry, 0, len(m.registry))
	found := false
	for _, entry := range m.registry {
		if entry.ID == id {
			found = true
			continue
		}
		updated = append(updated, entry)
	}
	if !found {
		return Report{}, fmt.Errorf("approval %q was not found", id)
	}
	if err := SaveRegistry(m.registryPath, updated); err != nil {
		return Report{}, err
	}
	m.registry = updated
	m.config.ApprovedAgents = updated
	if err := m.scanLocked(); err != nil {
		return Report{}, err
	}
	return cloneReport(m.report), nil
}

func (m *Manager) rescanLocked() error {
	cfg, err := LoadConfig(m.configPath)
	if err != nil {
		return err
	}
	registry, err := LoadRegistry(m.registryPath, cfg.ApprovedAgents)
	if err != nil {
		return err
	}
	m.config = cfg
	m.registry = registry
	m.config.ApprovedAgents = registry
	return m.scanLocked()
}

func (m *Manager) scanLocked() error {
	if len(m.roots) == 0 {
		m.report = Report{Roots: []string{}, Agents: []DiscoveredAgent{}, Gaps: []CoverageGap{}}
		return nil
	}
	report, err := NewScanner(m.config).Scan(m.roots)
	if err != nil {
		source := "configured_root"
		if len(m.roots) > 0 {
			source = m.roots[0]
		}
		m.report = Report{
			ScannedAt: time.Now().UTC(), Roots: slices.Clone(m.roots), Agents: []DiscoveredAgent{},
			Gaps:    []CoverageGap{{Source: source, Reason: compactError(err)}},
			Summary: Summary{CoverageGaps: 1},
		}
		return nil
	}
	m.report = report
	return nil
}

func cloneReport(report Report) Report {
	result := report
	result.Roots = slices.Clone(report.Roots)
	result.Gaps = slices.Clone(report.Gaps)
	result.Agents = make([]DiscoveredAgent, len(report.Agents))
	for index, agent := range report.Agents {
		result.Agents[index] = agent
		result.Agents[index].Evidence = slices.Clone(agent.Evidence)
		result.Agents[index].Risk.Factors = slices.Clone(agent.Risk.Factors)
	}
	return result
}
