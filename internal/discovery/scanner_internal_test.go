package discovery

import (
	"io/fs"
	"path/filepath"
	"testing"
)

func TestScannerRecordsUnreadableDirectoryAndContinues(t *testing.T) {
	root := t.TempDir()
	scanner := NewScanner(Config{Signatures: []Signature{{AgentType: "mcp", DisplayName: "MCP", FileNames: []string{"mcp.json"}}}})
	scanner.walkDir = func(walkRoot string, visit fs.WalkDirFunc) error {
		if err := visit(walkRoot, fakeDirEntry{name: filepath.Base(walkRoot), directory: true}, nil); err != nil {
			return err
		}
		return visit(filepath.Join(walkRoot, "restricted"), nil, fs.ErrPermission)
	}
	report, err := scanner.Scan([]string{root})
	if err != nil {
		t.Fatal(err)
	}
	if report.Summary.CoverageGaps != 1 || len(report.Gaps) != 1 || report.Gaps[0].Reason != "permission_denied" {
		t.Fatalf("coverage gaps = %#v, summary = %#v", report.Gaps, report.Summary)
	}
}

type fakeDirEntry struct {
	name      string
	directory bool
}

func (entry fakeDirEntry) Name() string               { return entry.name }
func (entry fakeDirEntry) IsDir() bool                { return entry.directory }
func (entry fakeDirEntry) Type() fs.FileMode          { return 0 }
func (entry fakeDirEntry) Info() (fs.FileInfo, error) { return nil, fs.ErrInvalid }
