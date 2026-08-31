package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"
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
	discoveryRoot := flag.String("discovery-root", "examples/shadow-agent-sample", "directory represented in the discovery demo; empty disables discovery")
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
	report := discovery.Report{Agents: []discovery.DiscoveredAgent{}, Roots: []string{}}
	if *discoveryRoot != "" {
		discoveryCfg, discoveryErr := discovery.LoadConfig(*discoveryConfig)
		if discoveryErr != nil {
			logger.Warn("discovery demo disabled", "error", discoveryErr)
		} else {
			report, discoveryErr = discovery.NewScanner(discoveryCfg).Scan([]string{*discoveryRoot})
			if discoveryErr != nil {
				logger.Warn("discovery demo disabled", "error", discoveryErr)
				report = discovery.Report{Agents: []discovery.DiscoveredAgent{}, Roots: []string{}}
			}
		}
	}

	r := router.New(cfg, store)
	api := httpapi.New(r, store, scenarios, report, *sessionAuditPath, web.Assets(), logger)
	server := &http.Server{
		Addr:              *addr,
		Handler:           api.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	logger.Info("Agent Governance Gateway listening", "address", *addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
