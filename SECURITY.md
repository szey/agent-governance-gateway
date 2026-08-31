# Security policy

English | [简体中文](SECURITY.zh-CN.md)

## Reporting a vulnerability

Please do not disclose suspected vulnerabilities in a public issue. Use GitHub's private vulnerability reporting feature if it is enabled for the repository. Include:

- affected version or commit;
- a minimal reproduction;
- expected and observed security decisions;
- potential impact; and
- any suggested mitigation.

## Supported versions

Until the first tagged release, only the latest commit on the default branch is supported.

## Scope note

Agent Governance Gateway is currently an MVP. Its policy and audit flow is implemented, but executor actions are simulated. The current `sandbox` route must not be interpreted as host-level isolation.

Session-causality, indirect-injection, protected-read, and cross-tool sequence rules cover only metadata routed through Agent Governance Gateway or reported by an adapter. Causal state is currently local to one process and is not restored after restart; Agent-reported provenance, reads, or tool hashes are not independent evidence. `path_class` and `uri_class` must be classification labels—not full paths, URLs, prompts, or file contents.

The discovery scanner is read-only and must be run only against paths the operator is authorized to inspect. Findings are heuristic evidence, not definitive proof that an Agent executed. Reports may contain repository paths and dependency metadata; review them before sharing outside the organization.

Company endpoint pilots require written authorization and an approved data boundary. Do not collect other employees' activity, bypass endpoint controls, or transfer company-generated logs to personal repositories or external services. See the [enterprise pilot protocol](docs/experiments/enterprise-agent-pilot.md).

The local server binds to `127.0.0.1` by default. Exposing it on a LAN or public interface requires a separately reviewed authentication, TLS, firewall, and access-control design; the current MVP does not provide those controls.
