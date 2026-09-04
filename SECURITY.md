# Security Policy

English | [简体中文](SECURITY.zh-CN.md)

This policy covers **Aegis Router — A Policy-Driven Security Router for AI Agents**. The repository remains named `agent-governance-gateway` for now.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue. If GitHub Private Vulnerability Reporting is enabled, use it and include the affected version/commit, a minimal security reproduction, expected and actual decisions, potential impact, and a practical mitigation if known.

Before the first tagged release, only the latest commit on the default branch is supported.

## Trust boundary

Aegis Router is currently an MVP, not a production security boundary. It can control only actions that enter its API, gateway, or a connected adapter. Installing the project does not automatically discover or stop an Agent that bypasses those enforcement points.

Asset registration governs workload admission; it grants no behavioral permission. Per-action authorization evaluates principal, Agent/workload, delegated scopes, capability, tool, resource, operation, and constraints. Unknown context fails closed, and a numeric risk score never overrides an explicit denial.

Allow/restrict/sandbox routes may issue an `AuthorizationEnvelope` (Execution Permit). Denied or escalated requests never receive an executable permit. Runtime events must bind to the correct, unexpired request/permit. Secret access outside the grant, writes under a read-only permit, egress when denied, and principal/Agent binding mismatches are rejection or authorization-boundary violations.

## Evidence trust and coverage

Every runtime record retains a source and trust level: `gateway_enforced`, `instrumented_adapter`, `agent_self_reported`, `os_sensor`, `network_sensor`, or `simulated_demo`. Demo and Agent self-reports must not appear as an unlabeled “Observed” state.

There is no universal OS, filesystem, syscall, or network sensor today. Unconnected sensors are `UNKNOWN / not instrumented`, never “zero coverage gaps.” The local CLI wrapper independently sees only the child-process lifecycle that it starts; structured Agent logs remain self-reported evidence.

`SANDBOX` is currently a dispatch result. Unless a Docker, gVisor, Firecracker, or equivalent isolation backend is connected and verified, UI, API, and documentation must say `SANDBOX ROUTE / isolation backend not connected`; they must not claim real isolation or reliable termination.

The public Runtime Event API does not yet authenticate or cryptographically attest adapter identity. It validates permitted `source`/`trust_level` pairings, permit binding, and metadata boundaries, so `instrumented_adapter` is still a caller assertion—not an independently proven fact. A real adapter requires authentication, integrity protection, and replay defense.

Demo Lab uses harmless server-owned synthetic event fixtures explicitly labeled `simulated_demo`; it does not start a real executor. A demo result proves a deterministic code path passed its tests; it does not prove production telemetry, endpoint coverage, or interception of arbitrary Agents.

## Sensitive data

Never retain or audit:

- raw bearer tokens, cookies, private keys, or secret values;
- prompt, retrieved document, file, or tool-output contents unless the operator explicitly enables a local Demo mode;
- full local paths, URLs, or Windows usernames in normal runtime audit;
- unsanitized employee, customer, or production data.

Delegated credentials retain only a stable fingerprint and necessary metadata. Paths/URIs are classified as values such as `USER_PROFILE / AGENT_CONFIG`, `WORKSPACE / SOURCE`, `PROTECTED_CONFIG`, and `SECRET_STORE`. Relative evidence paths needed for Inventory remain separated from Runtime Audit.

Local append-only JSONL is not yet tamper-evident or a central audit store. Where causal or permit state exists only in one process, restart gaps must remain explicit.

## Management plane and Discovery

The local approved registry may contain Agent names, path fragments, owners, and internal approval references; keep it inside the approved data boundary. A dedicated administrative header only reduces accidental browser requests. It is not authentication, authorization, complete CSRF protection, or RBAC. The server should remain bound to `127.0.0.1`; exposing it to a LAN or the internet requires separate authentication, TLS, anti-replay, firewall, and access-control design.

Discovery may only read explicit paths the operator is authorized to inspect. Configurations, dependencies, marketplace/cache entries, and MCP manifests are heuristic discovery evidence that can produce false positives and false negatives; they do not prove an Agent is running. Dependency presence cannot directly create an Agent identity, and discovery confidence is not runtime risk.

## Company endpoints and production exclusions

A company pilot requires written authorization from the device owner, IT/security, and relevant data owners. Use only synthetic files, non-production credentials, and approved destinations. Do not scan other employees' directories, capture colleague activity, bypass EDR/DLP/proxy/application allowlists, or upload company logs to a personal GitHub repository or external AI service.

Until independent security review, real adapter/enforcement-point validation, and a formal pilot are complete, do not place Aegis Router in front of production credentials or customer data as the sole blocking control. See the [Enterprise Agent Endpoint Pilot](docs/experiments/enterprise-agent-pilot.md).
