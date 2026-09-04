package discovery

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Registry struct {
	ApprovedAgents []RegistryEntry `json:"approved_agents"`
}

func LoadRegistry(path string, fallback []RegistryEntry) ([]RegistryEntry, error) {
	if path == "" {
		return normalizeRegistry(fallback), nil
	}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return normalizeRegistry(fallback), nil
	}
	if err != nil {
		return nil, fmt.Errorf("read approval registry: %w", err)
	}
	var registry Registry
	if err := json.Unmarshal(data, &registry); err != nil {
		return nil, fmt.Errorf("parse approval registry: %w", err)
	}
	return normalizeRegistry(registry.ApprovedAgents), nil
}

func SaveRegistry(path string, entries []RegistryEntry) error {
	if path == "" {
		return fmt.Errorf("approval registry is read-only because no storage path is configured")
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return fmt.Errorf("create approval registry directory: %w", err)
	}
	data, err := json.MarshalIndent(Registry{ApprovedAgents: normalizeRegistry(entries)}, "", "  ")
	if err != nil {
		return fmt.Errorf("encode approval registry: %w", err)
	}
	data = append(data, '\n')
	temporary, err := os.CreateTemp(filepath.Dir(path), ".approved-agents-*.tmp")
	if err != nil {
		return fmt.Errorf("create temporary approval registry: %w", err)
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)
	if err := temporary.Chmod(0o600); err == nil {
		_, err = temporary.Write(data)
	}
	if closeErr := temporary.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return fmt.Errorf("write approval registry: %w", err)
	}
	if err := os.Rename(temporaryPath, path); err != nil {
		return fmt.Errorf("replace approval registry: %w", err)
	}
	return nil
}

func ValidateRegistryEntry(entry RegistryEntry, knownTypes []string) error {
	displayName := strings.TrimSpace(entry.DisplayName)
	if displayName == "" {
		displayName = strings.TrimSpace(entry.Name)
	}
	fields := map[string]string{
		"display_name": displayName, "agent_type": entry.AgentType, "path_contains": entry.PathContains, "owner": entry.Owner,
	}
	for name, value := range fields {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%s is required", name)
		}
		if len(value) > 160 {
			return fmt.Errorf("%s must be 160 characters or fewer", name)
		}
	}
	if filepath.IsAbs(entry.PathContains) || strings.TrimSpace(entry.PathContains) == "." {
		return fmt.Errorf("path_contains must be a relative evidence-path fragment")
	}
	if entry.Fingerprint != "" && (!strings.HasPrefix(entry.Fingerprint, "sha256:") || len(entry.Fingerprint) != 31) {
		return fmt.Errorf("fingerprint must be a scanner sha256 fingerprint")
	}
	if !containsFold(knownTypes, entry.AgentType) {
		return fmt.Errorf("agent_type %q is not configured as a discovery signature", entry.AgentType)
	}
	if entry.State != "" && !strings.EqualFold(entry.State, "active") && !strings.EqualFold(entry.State, "suspended") {
		return fmt.Errorf("state must be active or suspended")
	}
	if entry.ExpiresOn != "" {
		if _, err := time.Parse("2006-01-02", entry.ExpiresOn); err != nil {
			return fmt.Errorf("expires_on must use YYYY-MM-DD")
		}
	}
	if len(entry.ApprovalRef) > 160 {
		return fmt.Errorf("approval_ref must be 160 characters or fewer")
	}
	for name, value := range map[string]string{
		"agent_id": entry.AgentID, "workload_identity": entry.WorkloadID, "environment": entry.Environment,
		"framework": entry.Framework, "policy_profile": entry.PolicyProfile,
	} {
		if len(value) > 160 {
			return fmt.Errorf("%s must be 160 characters or fewer", name)
		}
	}
	return nil
}

func normalizeRegistry(entries []RegistryEntry) []RegistryEntry {
	result := make([]RegistryEntry, 0, len(entries))
	for _, entry := range entries {
		entry.AgentID = strings.TrimSpace(entry.AgentID)
		entry.WorkloadID = strings.TrimSpace(entry.WorkloadID)
		entry.DisplayName = strings.TrimSpace(entry.DisplayName)
		entry.Name = strings.TrimSpace(entry.Name)
		if entry.DisplayName == "" {
			entry.DisplayName = entry.Name
		}
		if entry.Name == "" {
			entry.Name = entry.DisplayName
		}
		entry.AgentType = strings.TrimSpace(entry.AgentType)
		entry.Environment = strings.TrimSpace(entry.Environment)
		entry.Framework = strings.TrimSpace(entry.Framework)
		entry.PolicyProfile = strings.TrimSpace(entry.PolicyProfile)
		entry.Fingerprint = strings.ToLower(strings.TrimSpace(entry.Fingerprint))
		entry.PathContains = filepath.ToSlash(strings.TrimSpace(entry.PathContains))
		entry.Owner = strings.TrimSpace(entry.Owner)
		entry.ApprovalRef = strings.TrimSpace(entry.ApprovalRef)
		entry.ExpiresOn = strings.TrimSpace(entry.ExpiresOn)
		entry.State = strings.ToLower(strings.TrimSpace(entry.State))
		if entry.State == "" {
			entry.State = "active"
		}
		if entry.ID == "" {
			entry.ID = "approval-" + strings.TrimPrefix(fingerprint(entry.AgentID+"\x00"+entry.WorkloadID+"\x00"+entry.Name+"\x00"+entry.AgentType+"\x00"+entry.Fingerprint+"\x00"+entry.PathContains), "sha256:")
		}
		result = append(result, entry)
	}
	return result
}
