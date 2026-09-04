package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"agent-governance-gateway/internal/audit"
	"agent-governance-gateway/internal/discovery"
	"agent-governance-gateway/internal/models"
	"agent-governance-gateway/internal/router"
	"agent-governance-gateway/internal/sessionaudit"
)

type Server struct {
	router           *router.Router
	audits           *audit.Store
	policy           models.PolicyConfig
	scenarios        []models.Scenario
	discovery        *discovery.Manager
	sessionAuditPath string
	static           fs.FS
	logger           *slog.Logger
}

func New(r *router.Router, audits *audit.Store, policyConfig models.PolicyConfig, scenarios []models.Scenario, manager *discovery.Manager, sessionAuditPath string, static fs.FS, logger *slog.Logger) *Server {
	return &Server{router: r, audits: audits, policy: policyConfig, scenarios: scenarios, discovery: manager, sessionAuditPath: sessionAuditPath, static: static, logger: logger}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", s.health)
	mux.HandleFunc("GET /api/overview", s.overview)
	mux.HandleFunc("GET /api/decisions", s.listDecisions)
	mux.HandleFunc("GET /api/runtime-coverage", s.runtimeCoverage)
	mux.HandleFunc("GET /api/policies", s.listPolicies)
	mux.HandleFunc("GET /api/agents", s.listAgents)
	mux.HandleFunc("GET /api/scenarios", s.listScenarios)
	mux.HandleFunc("GET /api/discoveries", s.listDiscoveries)
	mux.HandleFunc("POST /api/discoveries/rescan", s.rescanDiscoveries)
	mux.HandleFunc("GET /api/approved-agents", s.listApprovedAgents)
	mux.HandleFunc("POST /api/approved-agents", s.saveApprovedAgent)
	mux.HandleFunc("DELETE /api/approved-agents/{id}", s.deleteApprovedAgent)
	mux.HandleFunc("GET /api/session-events", s.listSessionEvents)
	mux.HandleFunc("POST /api/route", s.route)
	mux.HandleFunc("POST /api/authorize", s.authorize)
	mux.HandleFunc("POST /api/runtime-events", s.ingestRuntimeEvent)
	mux.HandleFunc("POST /api/executions/{id}/complete", s.completeExecution)
	mux.HandleFunc("POST /api/demo-lab/{id}/run", s.runDemoScenario)
	mux.HandleFunc("GET /api/audits", s.listAudits)
	mux.Handle("/", http.FileServerFS(s.static))
	return s.middleware(mux)
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok", "service": "aegis-router", "repository": "agent-governance-gateway",
	})
}

func (s *Server) overview(w http.ResponseWriter, _ *http.Request) {
	records := s.audits.Recent(100)
	counts := map[models.Route]int{
		models.RouteAllow: 0, models.RouteRestrict: 0, models.RouteSandbox: 0,
		models.RouteDeny: 0, models.RouteEscalate: 0,
	}
	highRisk, violations := 0, 0
	for _, record := range records {
		counts[effectiveRoute(record)]++
		if record.RiskAssessment.Level == "high" {
			highRisk++
		}
		if len(record.RuntimeObservation.AuthorizationViolations) > 0 {
			violations++
		}
	}
	recent := records
	if len(recent) > 8 {
		recent = recent[:8]
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"decision_counts": counts, "high_risk_actions": highRisk,
		"authorization_boundary_violations": violations,
		"registered_agent_identities":       len(s.policy.Agents),
		"asset_registrations":               len(s.discovery.Registry()),
		"runtime_coverage":                  s.router.RuntimeCoverage(),
		"recent_decisions":                  recent,
	})
}

func (s *Server) listDecisions(w http.ResponseWriter, req *http.Request) {
	limit, ok := parseLimit(w, req, 30)
	if !ok {
		return
	}
	writeJSON(w, http.StatusOK, s.audits.Recent(limit))
}

func (s *Server) runtimeCoverage(w http.ResponseWriter, _ *http.Request) {
	coverage := s.router.RuntimeCoverage()
	writeJSON(w, http.StatusOK, map[string]any{
		"coverage":  coverage,
		"principle": "Unknown and disconnected sensors remain explicit; zero events never implies zero coverage gaps.",
	})
}

func (s *Server) listPolicies(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"policy":    s.policy,
		"principle": "Authorization is explicit; risk may tighten dispatch but never overrides an authorization denial.",
	})
}

func (s *Server) listAgents(w http.ResponseWriter, _ *http.Request) {
	agentIDs := make([]string, 0, len(s.policy.Agents))
	for agentID := range s.policy.Agents {
		agentIDs = append(agentIDs, agentID)
	}
	sort.Strings(agentIDs)
	identities := make([]map[string]any, 0, len(agentIDs))
	for _, agentID := range agentIDs {
		item := s.policy.Agents[agentID]
		identities = append(identities, map[string]any{
			"agent_id": agentID, "workload_ids": item.WorkloadIDs,
			"policy_profiles": len(item.Capabilities),
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"governed_identities": identities,
		"asset_registry":      s.discovery.Registry(),
		"agent_types":         s.discovery.AgentTypes(),
		"discovery":           privacySafeDiscovery(s.discovery.Report()),
		"principle":           "Asset registration permits a workload to participate; behavioral permissions live in policy.",
	})
}

func (s *Server) listScenarios(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.scenarios)
}

func (s *Server) listDiscoveries(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, privacySafeDiscovery(s.discovery.Report()))
}

func (s *Server) rescanDiscoveries(w http.ResponseWriter, req *http.Request) {
	if !requireLocalAdmin(w, req) {
		return
	}
	report, err := s.discovery.Rescan()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "discovery_rescan_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, privacySafeDiscovery(report))
}

func (s *Server) listApprovedAgents(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"approved_agents": s.discovery.Registry(),
		"agent_types":     s.discovery.AgentTypes(),
		"principle":       "Approval permits the Agent to exist; it never bypasses per-action policy or audit.",
	})
}

func (s *Server) saveApprovedAgent(w http.ResponseWriter, req *http.Request) {
	if !requireLocalAdmin(w, req) {
		return
	}
	defer req.Body.Close()
	var entry discovery.RegistryEntry
	if err := decodeJSON(req, &entry); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_approval", err.Error())
		return
	}
	saved, report, err := s.discovery.SaveApproval(entry)
	if err != nil {
		writeError(w, http.StatusBadRequest, "approval_not_saved", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"approved_agent": saved, "discovery": privacySafeDiscovery(report)})
}

func (s *Server) deleteApprovedAgent(w http.ResponseWriter, req *http.Request) {
	if !requireLocalAdmin(w, req) {
		return
	}
	report, err := s.discovery.DeleteApproval(req.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusNotFound, "approval_not_found", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"deleted": true, "discovery": privacySafeDiscovery(report)})
}

func (s *Server) listSessionEvents(w http.ResponseWriter, req *http.Request) {
	limit, ok := parseLimit(w, req, 30)
	if !ok {
		return
	}
	events, err := sessionaudit.Recent(s.sessionAuditPath, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "session_audit_unavailable", err.Error())
		return
	}
	observer, selfReported := 0, 0
	for _, event := range events {
		switch event.Trust {
		case sessionaudit.TrustObserver:
			observer++
		case sessionaudit.TrustSelfReported:
			selfReported++
		}
	}
	coverage := "no_session_data"
	if observer > 0 || selfReported > 0 {
		coverage = "wrapper_and_self_reported_only"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"events": events,
		"summary": map[string]any{
			"total": len(events), "observer_recorded": observer, "self_reported": selfReported,
			"coverage": coverage,
		},
		"limitation": "Agent behavior is not independently corroborated until OS and network sensors are connected.",
	})
}

func (s *Server) route(w http.ResponseWriter, req *http.Request) {
	s.authorize(w, req)
}

func (s *Server) authorize(w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()
	var input models.Request
	if err := decodeJSON(req, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}
	record, err := s.router.Authorize(input)
	if err != nil {
		writeError(w, http.StatusBadRequest, "authorization_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, record)
}

func (s *Server) ingestRuntimeEvent(w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()
	var event models.RuntimeEvent
	if err := decodeJSON(req, &event); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_runtime_event", err.Error())
		return
	}
	switch event.Source {
	case models.RuntimeSourceInstrumentedAdapter, models.RuntimeSourceAgentSelfReported:
		// These sources state exactly what the endpoint can substantiate. Stronger
		// gateway/demo/OS/network labels are reserved for internal integrations.
	default:
		writeError(w, http.StatusBadRequest, "reserved_runtime_source", "this endpoint accepts instrumented_adapter or agent_self_reported evidence only")
		return
	}
	evaluation, err := s.router.IngestRuntimeEvent(event)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "runtime_event_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, evaluation)
}

func (s *Server) completeExecution(w http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()
	var completion models.ExecutionCompletion
	if err := decodeJSON(req, &completion); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_execution_completion", err.Error())
		return
	}
	requestID := req.PathValue("id")
	if completion.RequestID == "" {
		completion.RequestID = requestID
	} else if completion.RequestID != requestID {
		writeError(w, http.StatusBadRequest, "execution_binding_mismatch", "path id must match request_id")
		return
	}
	record, err := s.router.CompleteExecution(completion)
	if err != nil {
		writeError(w, http.StatusBadRequest, "execution_completion_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, record)
}

func (s *Server) runDemoScenario(w http.ResponseWriter, req *http.Request) {
	var scenario *models.Scenario
	for index := range s.scenarios {
		if s.scenarios[index].ID == req.PathValue("id") {
			scenario = &s.scenarios[index]
			break
		}
	}
	if scenario == nil {
		writeError(w, http.StatusNotFound, "demo_scenario_not_found", "demo scenario was not found")
		return
	}
	record, err := s.router.Authorize(scenario.Request)
	if err != nil {
		writeError(w, http.StatusBadRequest, "demo_authorization_failed", err.Error())
		return
	}
	if record.AuthorizationEnvelope == nil {
		writeJSON(w, http.StatusOK, record)
		return
	}
	permit := record.AuthorizationEnvelope
	terminated := false
	for index, fixture := range scenario.SimulatedDemo {
		fixture.EventID = firstNonEmpty(fixture.EventID, fmt.Sprintf("demo-%s-%d", scenario.ID, index+1))
		fixture.PermitID = permit.PermitID
		fixture.RequestID = record.RequestID
		fixture.SessionID = permit.SessionID
		fixture.AgentID = permit.AgentID
		fixture.WorkloadID = permit.WorkloadID
		fixture.Source = models.RuntimeSourceSimulatedDemo
		fixture.TrustLevel = models.RuntimeTrustSimulated
		evaluation, ingestErr := s.router.IngestRuntimeEvent(fixture)
		if ingestErr != nil {
			writeError(w, http.StatusInternalServerError, "demo_runtime_event_failed", ingestErr.Error())
			return
		}
		if evaluation.Terminated {
			terminated = true
			break
		}
	}
	if !terminated {
		record, err = s.router.CompleteExecution(models.ExecutionCompletion{
			RequestID: record.RequestID, PermitID: permit.PermitID, Status: "completed",
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "demo_completion_failed", err.Error())
			return
		}
	} else if latest, ok := s.audits.Get(record.RequestID); ok {
		record = latest
	}
	writeJSON(w, http.StatusOK, record)
}

func (s *Server) listAudits(w http.ResponseWriter, req *http.Request) {
	limit, ok := parseLimit(w, req, 20)
	if !ok {
		return
	}
	writeJSON(w, http.StatusOK, s.audits.Recent(limit))
}

func parseLimit(w http.ResponseWriter, req *http.Request, defaultLimit int) (int, bool) {
	limit := defaultLimit
	if value := req.URL.Query().Get("limit"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 1 || parsed > 100 {
			writeError(w, http.StatusBadRequest, "invalid_limit", "limit must be between 1 and 100")
			return 0, false
		}
		limit = parsed
	}
	return limit, true
}

func (s *Server) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		started := time.Now()
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'")
		next.ServeHTTP(w, req)
		s.logger.Info("request", "method", req.Method, "path", req.URL.Path, "duration_ms", time.Since(started).Milliseconds())
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]string{"error": code, "message": strings.TrimSpace(message)})
}

func decodeJSON(req *http.Request, value any) error {
	decoder := json.NewDecoder(io.LimitReader(req.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(value); err != nil {
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return fmt.Errorf("request body must contain one JSON object")
	}
	return nil
}

func requireLocalAdmin(w http.ResponseWriter, req *http.Request) bool {
	if req.Header.Get("X-Agent-Governance-Admin") != "local-ui" {
		writeError(w, http.StatusForbidden, "local_admin_header_required", "local registry changes require the Aegis Router admin header")
		return false
	}
	return true
}

func effectiveRoute(record models.AuditRecord) models.Route {
	if record.DispatchDecision.Route != "" {
		return record.DispatchDecision.Route
	}
	return record.PolicyDecision.Route
}

func privacySafeDiscovery(report discovery.Report) discovery.Report {
	result := report
	result.Roots = make([]string, len(report.Roots))
	for index, root := range report.Roots {
		result.Roots[index] = classifyLocalPath(root)
	}
	result.Gaps = append([]discovery.CoverageGap(nil), report.Gaps...)
	for index := range result.Gaps {
		if filepath.IsAbs(result.Gaps[index].Source) {
			result.Gaps[index].Source = classifyLocalPath(result.Gaps[index].Source)
		}
	}
	result.Agents = make([]discovery.DiscoveredAgent, len(report.Agents))
	for index, agent := range report.Agents {
		result.Agents[index] = agent
		switch agent.Status {
		case discovery.StatusShadow:
			result.Agents[index].Name = "Unregistered " + agent.AgentType + " workload candidate"
		case discovery.StatusUnassessed:
			result.Agents[index].Name = "Available " + agent.AgentType + " integration evidence"
		}
		result.Agents[index].Evidence = append([]discovery.Evidence(nil), agent.Evidence...)
		for evidenceIndex := range result.Agents[index].Evidence {
			result.Agents[index].Evidence[evidenceIndex].Source = privacySafeEvidenceSource(result.Agents[index].Evidence[evidenceIndex].Source)
		}
	}
	return result
}

func privacySafeEvidenceSource(source string) string {
	if filepath.IsAbs(source) {
		return classifyLocalPath(source)
	}
	normalized := filepath.ToSlash(filepath.Clean(source))
	parts := strings.Split(normalized, "/")
	for index, part := range parts {
		switch strings.ToLower(part) {
		case ".workbuddy", "workbuddy", ".codex", ".claude":
			return strings.Join(parts[index:], "/")
		case "users":
			if index+2 < len(parts) {
				return strings.Join(parts[index+2:], "/")
			}
		}
	}
	return normalized
}

func classifyLocalPath(path string) string {
	normalized := strings.ToLower(filepath.ToSlash(filepath.Clean(path)))
	switch {
	case strings.Contains(normalized, "/examples/shadow-agent-sample"):
		return "DEMO_FIXTURE"
	case strings.Contains(normalized, "/.workbuddy") || strings.Contains(normalized, "/workbuddy"):
		return "USER_PROFILE / AGENT_CONFIG"
	case strings.Contains(normalized, "/users/"):
		return "USER_PROFILE"
	case filepath.IsAbs(path):
		return "LOCAL_SCAN_ROOT"
	default:
		return filepath.ToSlash(path)
	}
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
