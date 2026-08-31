package audit

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"agent-governance-gateway/internal/models"
)

type Store struct {
	mu      sync.RWMutex
	path    string
	records []models.AuditRecord
}

func NewStore(path string) (*Store, error) {
	s := &Store{path: path, records: []models.AuditRecord{}}
	if path == "" {
		return s, nil
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, fmt.Errorf("create audit directory: %w", err)
	}
	if err := s.load(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) Append(record models.AuditRecord) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.path != "" {
		file, err := os.OpenFile(s.path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
		if err != nil {
			return fmt.Errorf("open audit log: %w", err)
		}
		encoded, err := json.Marshal(record)
		if err == nil {
			_, err = file.Write(append(encoded, '\n'))
		}
		closeErr := file.Close()
		if err != nil {
			return fmt.Errorf("write audit log: %w", err)
		}
		if closeErr != nil {
			return fmt.Errorf("close audit log: %w", closeErr)
		}
	}

	s.records = append(s.records, record)
	if len(s.records) > 100 {
		s.records = append([]models.AuditRecord(nil), s.records[len(s.records)-100:]...)
	}
	return nil
}

func (s *Store) Recent(limit int) []models.AuditRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if limit <= 0 || limit > len(s.records) {
		limit = len(s.records)
	}
	result := make([]models.AuditRecord, 0, limit)
	for i := len(s.records) - 1; i >= len(s.records)-limit; i-- {
		result = append(result, s.records[i])
	}
	return result
}

func (s *Store) load() error {
	file, err := os.Open(s.path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("open existing audit log: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var record models.AuditRecord
		if err := json.Unmarshal(scanner.Bytes(), &record); err != nil {
			return fmt.Errorf("parse existing audit log: %w", err)
		}
		s.records = append(s.records, record)
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("scan existing audit log: %w", err)
	}
	return nil
}
