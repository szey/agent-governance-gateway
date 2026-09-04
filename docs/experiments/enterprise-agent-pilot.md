# Aegis Router Enterprise Agent Endpoint Pilot

English | [简体中文](enterprise-agent-pilot.zh-CN.md)

Status: **paused after exploratory configuration discovery; the formal controlled runtime pilot is incomplete.**

An earlier company-endpoint trial showed that the server starts and scoped discovery produces evidence. It also exposed access-denied scan aborts, marketplace/cache noise, stale UI snapshots, and a missing registry workflow. Synthetic fixtures drove local fixes, but the trial did not prove that Aegis Router independently observes or stops the company's real Agent behavior and did not reach `V3 pilot_verified`. The repository retains no raw company logs, usernames, hostnames, or absolute paths.

## What the pilot must now prove

The primary objective changes from “find an Agent” to validating one controlled action chain:

```text
Controlled adapter submits ActionRequest
  → Aegis verifies Principal / Agent / Delegation / Tool / Resource / Operation
  → Policy Decision remains separate from Risk Assessment
  → Dispatch Decision
  → executable result receives AuthorizationEnvelope / Permit
  → adapter or server-owned Demo fixture submits a provenance-labeled RuntimeEvent
  → event is evaluated against the permit
  → explainable Audit / Final Verdict
```

Showing hand-written JSON in the control desk is not a real integration. “The action crossed the enforcement point” can be tested only when an adapter actually sits between the Agent and the test tool. Configuration discovery proves an artifact; an Agent log proves only what the Agent reports. Neither is independent endpoint observation.

## Questions that must be answered

1. Can every action identify the human/service principal, Agent/workload, and delegated authority?
2. Does a raw bearer token stay out of requests, logs, and UI?
3. Does any capability, tool, resource operation, or scope mismatch deny before execution and issue no permit?
4. Are unapproved actions by an approved Agent still denied and audited?
5. Does high risk change only dispatch—not the authorization fact—for an authorized action?
6. Are in-permit events, secret reads, writes under read-only permits, and denied egress reliably separated?
7. Are expired permits and events bound to the wrong principal/Agent/request rejected?
8. Does the UI separate `instrumented_adapter`, `agent_self_reported`, and `simulated_demo`?
9. Are unconnected filesystem/network/OS surfaces shown as `UNKNOWN / not instrumented`?
10. Do CPU, memory, latency, log growth, and false denial remain inside pre-agreed limits?

## Exploratory feedback already received

| Observation | Conclusion | Product response already taken |
|---|---|---|
| Health check passed and a scoped scan found Agent/MCP evidence | Configuration discovery runs, but is not runtime proof | Retain evidence grades and coverage limits |
| A system-drive scan aborted at inaccessible directories | Full-disk scanning is neither compliant nor reliable | Require scoped roots; record denied children as gaps and continue |
| Marketplace/cache/temp produced many matches | Available is not installed, deployed, or running | Separate available/installed/configured/observed and collapse integrations |
| New CLI scan did not reach the running UI | Startup snapshots do not fit the workflow | Add scoped rescan and immediate reconciliation |
| No visible approved registry | Shadow results lacked an actionable explanation | Add a local registration workflow |
| “Approved” was read as “all behavior approved” | Asset admission and behavior authorization must be separate | Center the runtime UI/docs on per-action authorization |

These are product feedback and scoped system output, not enterprise-deployment proof.

## Authorization and prohibited scope

Before continuing, renew written approval from the device owner, IT/security, and relevant data owners. Define device, operator, Agent, adapter, test directories, time window, allowed fields, retention, destinations, rollback, and accountable owner.

Prohibited:

- scanning unapproved employee directories, mail, chat, browser data, customer data, or shared drives;
- capturing other employees' sessions or company-wide traffic;
- bypassing EDR, DLP, antivirus, proxy, certificate policy, or application allowlists;
- using production tokens, real secrets, customer data, or real company systems as violation bait;
- uploading company logs, paths, or device identifiers to personal GitHub/cloud storage/external AI services;
- treating `SANDBOX ROUTE` as real isolation;
- using this project as the sole production blocking control.

If company policy does not allow a self-built binary or adapter, stop at design and Demo Lab. IT decides the approved signing and distribution path.

## Staged pilot

### Gate 0: local synthetic regression

All authorization and runtime negative tests pass in development first. At minimum cover unknown Agent, missing scope, ungranted capability, disallowed tool, disallowed resource operation, safe permit, authorized high-risk dispatch, in-permit event, secret/write/egress violation, expired permit, wrong binding, and Demo label.

Any failure blocks company-endpoint work.

### Gate 1: company endpoint baseline

- Bind only to `127.0.0.1`.
- Use the company-approved source/binary transfer path and verify SHA-256.
- Do not start the real Agent; measure Aegis idle CPU, memory, disk, and listeners.
- Runtime Coverage must expose unconnected OS/filesystem/network sensors.
- Optional Discovery scans only one or two explicitly approved fixture directories.

### Gate 2: instrumented synthetic executor

Run only Demo Lab on the company machine:

| Case | Request | Expected result |
|---|---|---|
| Safe code | valid delegation + code tool + workspace read | `ALLOW` + permit; `simulated_demo` event remains inside |
| Finance denial | coder requests finance read | `DENY`; no permit, no executor |
| Boundary violation | permit allows config read, then secret read arrives | `AUTHORIZATION_BOUNDARY_VIOLATION` |
| Read-only violation | read-only permit followed by write | violation |
| Egress violation | no-egress permit followed by external destination | violation |
| Expiry/binding | expired or mismatched event | rejected outside normal event chain |

This gate still proves only Aegis's internal protocol and deterministic control path.

### Gate 3: one controlled real adapter

Proceed only when the Agent/tool system exposes a company-approved CLI, plugin, MCP/HTTP proxy, or event API. The adapter first calls authorization; only a returned permit allows a harmless fixture action. It then returns an `instrumented_adapter` event.

If WorkBuddy is a GUI/IDE Agent without an approved adapter/tool proxy, directory scanning cannot stand in for runtime testing. Keep the Inventory result, mark Runtime Coverage unconnected, and wait for a suitable adapter or independent sensor.

### Gate 4: evidence review and exit

Audit answers: principal, Agent/workload, delegation fingerprint/scopes, tool, resource class, operation, Policy, Risk, Dispatch, Permit, event source/trust, violation reason, final verdict, duration, and coverage gaps.

Then stop Aegis and test processes, revoke test credentials/permits, and let the company owner decide whether audit is retained or deleted. Only sanitized conclusions and synthetic minimal reproductions return to the public repository.

## Evidence trust table

| Source | Current meaning | Must not be generalized into |
|---|---|---|
| `gateway_enforced` | Request actually entered an Aegis authorization point | All Agent actions crossed it |
| `instrumented_adapter` | Connected adapter reported one test action | Independent OS proof or endpoint-wide coverage |
| `agent_self_reported` | Agent/log claims an event occurred | Complete, tamper-proof fact |
| `simulated_demo` | Server-owned Demo fixture generated and submitted a synthetic event | Real executor, real Agent, or production telemetry |
| `os_sensor` | Use only after an OS sensor is connected and verified | File-content safety or valid business intent |
| `network_sensor` | Use only after a network sensor is connected and verified | Full TLS semantics or offline activity |

## Privacy and low-spec target

By default retain only classified metadata—not prompt, command/output content, file contents, raw tokens, secrets, cookies, full paths, or usernames. Use resource classes such as `WORKSPACE / SOURCE`, `PROTECTED_CONFIG`, and `SECRET_STORE`.

The first pilot needs no Docker, Kubernetes, database, service installation, or auto-start. These are **unverified targets, not achieved commitments**:

| Metric | Pilot target |
|---|---:|
| Aegis average idle CPU | < 2% |
| Average CPU increase during test | < 5% |
| Aegis process memory | < 100 MB |
| One pilot audit file | < 50 MB |
| Median adapter-action latency increase | < 10% |

## Acceptance gate

The pilot reaches `V3 pilot_verified` only when all are true:

- written scope matches actual execution;
- actions actually cross an approved adapter/enforcement point;
- authorization and all negative permit cases pass repeatably;
- Demo, self-reported, and independent evidence are never conflated in UI/API;
- unconnected coverage remains UNKNOWN;
- no real sensitive data or unapproved target is touched;
- performance/privacy have raw local measurements and sanitized conclusions;
- audit stays inside the company-approved data boundary;
- rollback and cleanup complete.

Until then, status remains “local implementation / synthetic `V2` where tests support it,” never production-ready or company-pilot verified.
