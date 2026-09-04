package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/discovery"
	"agent-governance-gateway/internal/httpapi"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/scenario"
	"agent-governance-gateway/web"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:8080", "HTTP listen address")
	policyPath := flag.String("policy", "configs/policy.json", "policy configuration path")
	scenarioPath := flag.String("scenarios", "examples", "demo scenario directory")
	auditPath := flag.String("audit", "data/audit.jsonl", "append-only audit log path")
	sessionAuditPath := flag.String("session-audit", "data/session-audit.jsonl", "local Agent session audit path")
	discoveryConfig := flag.String("discovery-config", "configs/discovery.json", "discovery signature and registry path")
	approvalRegistry := flag.String("approval-registry", "data/approved-agents.json", "local approved-Agent registry managed by the control desk")
	var discoveryRoots stringList
	flag.Var(&discoveryRoots, "discovery-root", "optional approved inventory root; repeat for multiple roots")
	flag.Parse()

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	cfg, err := config.Load(*policyPath)
	if err != nil {
		logger.Error("load policy", "error", err)
		os.Exit(1)
	}
	scenarios, err := scenario.LoadDirectory(*scenarioPath)
	if err != nil {
		logger.Error("load scenarios", "error", err)
		os.Exit(1)
	}
	store, err := audit.NewStore(*auditPath)
	if err != nil {
		logger.Error("open audit store", "error", err)
		os.Exit(1)
	}
	discoveryManager, err := discovery.NewManager(*discoveryConfig, *approvalRegistry, discoveryRoots)
	if err != nil {
		logger.Error("load discovery control plane", "error", err)
		os.Exit(1)
	}

	r := router.New(cfg, store)
	api := httpapi.New(r, store, cfg, scenarios, discoveryManager, *sessionAuditPath, web.Assets(), logger)
	server := &http.Server{
		Addr:              *addr,
		Handler:           api.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	logger.Info("Aegis Router listening", "address", *addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

type stringList []string

func (values *stringList) String() string {
	return strings.Join(*values, ",")
}

func (values *stringList) Set(value string) error {
	value = strings.TrimSpace(value)
	if value != "" {
		*values = append(*values, value)
	}
	return nil
}
