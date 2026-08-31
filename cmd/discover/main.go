package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"text/tabwriter"

	"agent-governance-gateway/internal/discovery"
)

type pathsFlag []string

func (p *pathsFlag) String() string { return fmt.Sprint([]string(*p)) }
func (p *pathsFlag) Set(value string) error {
	*p = append(*p, value)
	return nil
}

func main() {
	var paths pathsFlag
	configPath := flag.String("config", "configs/discovery.json", "discovery signatures and registry path")
	format := flag.String("format", "table", "output format: table or json")
	flag.Var(&paths, "path", "directory to scan; repeat for multiple roots")
	flag.Parse()
	if len(paths) == 0 {
		paths = []string{"."}
	}

	cfg, err := discovery.LoadConfig(*configPath)
	if err != nil {
		fail(err)
	}
	report, err := discovery.NewScanner(cfg).Scan(paths)
	if err != nil {
		fail(err)
	}

	switch *format {
	case "json":
		encoder := json.NewEncoder(os.Stdout)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(report); err != nil {
			fail(err)
		}
	case "table":
		writer := tabwriter.NewWriter(os.Stdout, 0, 4, 2, ' ', 0)
		fmt.Fprintln(writer, "STATUS\tRISK\tCONFIDENCE\tTYPE\tNAME\tEVIDENCE")
		for _, agent := range report.Agents {
			fmt.Fprintf(writer, "%s\t%s/%d\t%.0f%%\t%s\t%s\t%d\n", agent.Status, agent.Risk.Level, agent.Risk.Score, agent.Confidence*100, agent.AgentType, agent.Name, len(agent.Evidence))
		}
		_ = writer.Flush()
		fmt.Printf("\nTotal: %d  Registered: %d  Shadow: %d\n", report.Summary.Total, report.Summary.Registered, report.Summary.Shadow)
	default:
		fail(fmt.Errorf("unsupported format %q; use table or json", *format))
	}
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, "discovery failed:", err)
	os.Exit(1)
}
