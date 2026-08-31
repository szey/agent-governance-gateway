package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
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
	scenarios        []models.Scenario
	discovery        discovery.Report
	sessionAuditPath string
	static           fs.FS
	logger           *slog.Logger
}

func New(r *router.Router, audits *audit.Store, scenarios []models.Scenario, report discovery.Report, sessionAuditPath string, static fs.FS, logger *slog.Logger) *Server {
	return &Server{router: r, audits: audits, scenarios: scenarios, discovery: report, sessionAuditPath: sessionAuditPath, static: static, logger: logger}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", s.health)
	mux.HandleFunc("GET /api/scenarios", s.listScenarios)
	mux.HandleFunc("GET /api/discoveries", s.listDiscoveries)
	mux.HandleFunc("GET /api/session-events", s.listSessionEvents)
	mux.HandleFunc("POST /api/route", s.route)
	mux.HandleFunc("GET /api/audits", s.listAudits)
	mux.Handle("/", http.FileServerFS(s.static))
	return s.middleware(mux)
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "agent-governance-gateway"})
}

func (s *Server) listScenarios(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.scenarios)
}

func (s *Server) listDiscoveries(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.discovery)
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
	defer req.Body.Close()
	decoder := json.NewDecoder(io.LimitReader(req.Body, 1<<20))
	decoder.DisallowUnknownFields()
	var input models.Request
	if err := decoder.Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_request", err.Error())
		return
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "invalid_request", "request body must contain one JSON object")
		return
	}
	record, err := s.router.Process(input)
	if err != nil {
		writeError(w, http.StatusBadRequest, "routing_failed", err.Error())
		return
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
