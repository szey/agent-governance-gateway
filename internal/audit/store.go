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

	if err := s.persist(record); err != nil {
		return err
	}

	s.records = append(s.records, record)
	if len(s.records) > 100 {
		s.records = append([]models.AuditRecord(nil), s.records[len(s.records)-100:]...)
	}
	return nil
}

// Update stores a later stage of an existing decision/evidence chain. The
// append-only file keeps the history, while Recent and Get expose the latest
// revision for each request.
func (s *Store) Update(record models.AuditRecord) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if record.RequestID == "" {
		return fmt.Errorf("audit record request_id is required")
	}
	indexToUpdate := -1
	for index := len(s.records) - 1; index >= 0; index-- {
		if s.records[index].RequestID == record.RequestID {
			indexToUpdate = index
			break
		}
	}
	if indexToUpdate < 0 {
		return fmt.Errorf("audit record %q not found", record.RequestID)
	}
	if err := s.persist(record); err != nil {
		return err
	}
	s.records[indexToUpdate] = record
	return nil
}

func (s *Store) Get(requestID string) (models.AuditRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for index := len(s.records) - 1; index >= 0; index-- {
		if s.records[index].RequestID == requestID {
			return s.records[index], true
		}
	}
	return models.AuditRecord{}, false
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
		updated := false
		for index := len(s.records) - 1; index >= 0; index-- {
			if record.RequestID != "" && s.records[index].RequestID == record.RequestID {
				s.records[index] = record
				updated = true
				break
			}
		}
		if !updated {
			s.records = append(s.records, record)
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("scan existing audit log: %w", err)
	}
	return nil
}

func (s *Store) persist(record models.AuditRecord) error {
	if s.path == "" {
		return nil
	}
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
	return nil
}
