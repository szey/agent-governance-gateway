package main

import (
	"flag"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"agent-governance-gateway/internal/adapters/mcp"
	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/config"
	"agent-governance-gateway/internal/discovery"
	"agent-governance-gateway/internal/httpapi"
	"agent-governance-gateway/internal/intake"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/scenario"
	"agent-governance-gateway/internal/semanticaction"
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
	enableExperimentalInventory := flag.Bool("enable-experimental-inventory", false, "enable frozen experimental inventory APIs and UI")
	mcpUpstream := flag.String("mcp-upstream", "", "enable permit-gated POST /mcp only when this exactly matches the server-owned payment.send/v1 upstream_url")
	allowDevelopmentIntake := flag.Bool("allow-development-intake", false, "accept caller-supplied authorization identity from loopback requests only (development only)")
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
	var discoveryManager *discovery.Manager
	if *enableExperimentalInventory {
		discoveryManager, err = discovery.NewManager(*discoveryConfig, *approvalRegistry, discoveryRoots)
		if err != nil {
			logger.Error("load experimental inventory", "error", err)
			os.Exit(1)
		}
	}

	r := router.New(cfg, store)
	var authorizationIntake intake.TrustedAuthorizationIntake = intake.RejectAll{}
	if *allowDevelopmentIntake {
		developmentIntake, intakeErr := intake.NewLoopbackDevelopment("server-loopback-development")
		if intakeErr != nil {
			logger.Error("configure development authorization intake", "error", intakeErr)
			os.Exit(1)
		}
		authorizationIntake = developmentIntake
	}
	var mcpHandler http.Handler
	if strings.TrimSpace(*mcpUpstream) != "" {
		profile, profileErr := semanticaction.NewPaymentSendV1(cfg.SemanticActions.PaymentSendV1)
		if profileErr != nil {
			logger.Error("configure payment.send/v1 semantic profile", "error", profileErr)
			os.Exit(1)
		}
		if strings.TrimSpace(*mcpUpstream) != profile.UpstreamURL() {
			logger.Error("configure MCP enforcement adapter", "error", "--mcp-upstream must exactly match semantic_actions.payment_send_v1.upstream_url")
			os.Exit(1)
		}
		proxy, proxyErr := mcp.New(r, profile, nil)
		if proxyErr != nil {
			logger.Error("configure MCP enforcement adapter", "error", proxyErr)
			os.Exit(1)
		}
		mcpHandler = proxy
	}
	api := httpapi.NewWithOptions(r, store, cfg, scenarios, discoveryManager, *sessionAuditPath, web.Assets(), logger, httpapi.Options{
		ExperimentalInventory: *enableExperimentalInventory,
		MCPHandler:            mcpHandler,
		AuthorizationIntake:   authorizationIntake,
	})
	server := &http.Server{
		Addr:              *addr,
		Handler:           api.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	logger.Info("Aegis Router listening", "address", *addr, "mcp_enforcement", mcpHandler != nil, "experimental_inventory", *enableExperimentalInventory, "development_intake", *allowDevelopmentIntake)
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
