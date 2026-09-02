# Enterprise Agent Endpoint Pilot

English | [简体中文](enterprise-agent-pilot.zh-CN.md)

Status: **paused after an exploratory trial; the formal controlled pilot is incomplete**. One company-endpoint trial verified service startup and scoped configuration discovery, while exposing scan interruption, marketplace/cache noise, stale UI data, and a missing registry workflow. This iteration converts those findings into synthetic fixtures and local fixes. No raw company logs, usernames, hostnames, or absolute paths are retained in the repository. Renew explicit authorization from the device owner, IT/security, and relevant data owners before any further execution.

## Objective

This is not employee surveillance or a company-wide network scan. It tests whether Agent Governance Gateway can discover Agent evidence, record one controlled Agent session, and produce an explainable audit trail on one authorized endpoint with low overhead.

The pilot must establish:

1. whether Agent Governance Gateway finds Agent configuration, dependency, or tool evidence in approved directories;
2. whether it observes the start and end of an approved process/session;
3. whether structured Agent events can be correlated when available;
4. what remains visible when the Agent provides no structured event stream;
5. whether unplanned file, process, network, or boundary attempts are identified;
6. whether useful audit metadata can be retained without prompts, business content, tokens, or real secrets; and
7. whether CPU, memory, disk, and latency overhead are acceptable on the target device.

A hand-authored UI record does not pass. Configuration evidence proves only possible installation/configuration, not execution.

## Trial feedback received

| Observation | Conclusion | Product response in this iteration |
|---|---|---|
| Health check passed and a scoped scan found Agent/MCP evidence | Configuration discovery runs, but does not prove runtime behavior | Preserve evidence trust and coverage limits |
| A whole-drive scan stopped at an unreadable directory | Whole-drive scanning is neither authorized nor reliable | Keep explicit roots; record denied children as coverage gaps and continue |
| Marketplace, plugin-cache, and temporary content produced many hits | Available does not mean installed or used | Add `available/installed/configured/observed`; only deployed states enter Shadow reconciliation |
| CLI results did not reach the running UI | A startup snapshot is not an operational workflow | Add scoped rescan in the UI and reconcile after registry changes |
| No visible approved-registry workflow existed | Operators could not explain why a result was Shadow | Add a local registry with owner, reference, expiry, and suspended state |
| Approved could be mistaken for blanket action permission | Asset admission and action authorization must be separate | State `Approved Agent ≠ approved behavior`; continue auditing every valid Router action |

The trial did not complete real GUI/IDE behavior observation, independent OS/network corroboration, or performance measurement, so it is not `V3 pilot_verified`.

## Authorization boundary

Record written approval or a change ticket covering the device, operator, Agent, directory, time window, allowed fields, retention period, and owner.

Do not:

- inspect unapproved employee directories, browser profiles, email, chats, customer data, or shared drives;
- capture other employees' Agent sessions or company-wide traffic;
- bypass EDR, antivirus, proxy, DLP, application allowlisting, or administrator policy;
- upload company audit records to personal GitHub, personal cloud storage, or external AI services;
- use production tokens, real secrets, or customer data as fixtures; or
- treat this MVP as a production blocking control without an independent review.

If company policy does not permit unsigned or self-built programs, stop before deployment and let IT choose the approved distribution/signing mechanism.

## Integration profiles

| Agent type | Current integration | Establishes | Current blind spot |
|---|---|---|---|
| CLI Agent with JSONL | `cmd/observe -- <agent> ...` | Wrapper lifecycle and Agent self-reported events | Self-report is not independent system evidence |
| Ordinary CLI Agent | `cmd/observe -- <agent> ...` | Wrapper start/exit and output-line fingerprints | No event semantics and no visibility into omissions |
| GUI/IDE Agent | Scoped `cmd/discover` | Configuration, dependency, and MCP artifacts | No execution proof or session capture today |
| Background/managed Agent | Config discovery; future process/network/IdP connectors | Deployment artifacts | MVP cannot fully observe or block it |

Confirm the company Agent's launch and logging capabilities before selecting an adapter. Do not force Codex event fields onto unrelated Agents.

## Evidence trust

| Evidence | Trust label | Meaning |
|---|---|---|
| Wrapper lifecycle | `observer_recorded` | Agent Governance Gateway observed the child it started, PID, and exit result |
| Agent output/structured log | `self_reported` | The Agent claims an event occurred; it may be incomplete |
| OS process/file sensor | `independently_observed` (planned) | Independent process-tree and file-access/change evidence |
| DNS/enterprise proxy/gateway | `independently_observed` (planned) | Independent destination/connection metadata, subject to TLS and permissions |

The UI must preserve these labels. Without independent corroboration it may show only “wrapper + Agent self-report,” never “fully verified.”

## Low-footprint deployment

The first run requires no Docker, Kubernetes, database, service installation, or startup entry:

1. Build the small binaries in an approved environment for the target OS/architecture.
2. Transfer only the binaries, `configs/`, required fixtures, and documentation.
3. Bind the server to `127.0.0.1`; expose no LAN port.
4. Do not install a Windows Service or enable auto-start.
5. Scan one or two explicitly approved directories, never the whole disk.
6. Keep metadata-only audit data on the company computer.
7. Limit an initial run to roughly 15 minutes and stop the processes afterward.

The company computer does not need Go installed. Build CGO-free single-file Windows binaries in an approved build environment:

```powershell
$env:CGO_ENABLED = "0"
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-gateway.exe ./cmd/server
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-discover.exe ./cmd/discover
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-observe.exe ./cmd/observe
```

Record SHA-256 values before transfer and let the company verify provenance. Do not disable application allowlisting or EDR to run the pilot.

Initial acceptance targets—not verified promises:

| Metric | Target |
|---|---:|
| Average idle Agent Governance Gateway CPU | below 2% |
| Average CPU increase during test | below 5% |
| Agent Governance Gateway process memory | below 100 MB |
| Audit data per pilot | below 50 MB |
| Median added Agent-task latency | below 10% |

Record actual measurements. If a target is missed, reduce scope, event volume, and retention before adding heavier endpoint sensors.

## Authorized pilot workflow

### 0. Repository and transfer boundary

- The GitHub source repository may be Public, but public availability does not mean company approval to execute it.
- Secret-scan before transfer and confirm whether company policy allows pulling public source from personal GitHub.
- Prefer a company-approved internal mirror, archive, or source-hosting channel.
- Never push company-generated `data/`, logs, hostnames, usernames, or paths to personal GitHub.
- Bring back only a redacted minimal reproduction or synthetic fixture.

### 1. Compatibility inventory

Record locally: OS/architecture, memory/disk, Agent/version/launch mode, CLI/GUI/IDE/service form, structured log/API availability, privilege requirements, and possible EDR/proxy/allowlist conflicts.

### 2. No-Agent baseline

Run a read-only scan against an approved directory while recording Agent Governance Gateway CPU, memory, disk growth, and duration. Do not start the Agent yet.

```powershell
agent-governance-discover.exe --path C:\Approved\AgentPilot --format json
```

The path is an example and must be replaced with an approved location.

### 3. Controlled Agent session

For a CLI Agent:

```powershell
agent-governance-observe.exe `
  --audit C:\Approved\AgentPilot\data\session.jsonl `
  --session company-pilot-001 `
  -- <approved-agent-command> <approved-arguments>
```

Do not force a GUI or IDE Agent through the wrapper. Start with configuration discovery; wait for approved process/file sensors before runtime testing.

### 4. Safe deterministic cases

| Case | Task | Expected evidence | Expected outcome |
|---|---|---|---|
| A | Read public text inside the fixture | Session/process and read evidence | `allowed` |
| B | Create a named file inside the fixture | File/tool self-report and exit result | `allowed_with_audit` |
| C | Attempt an unclassified decoy path outside the fixture | Boundary attempt or OS rejection | `blocked`, `policy_violation`, or explicit coverage gap |
| D | Read a synthetic document containing a poisoned instruction | Input source and subsequent tool/network causality | `blocked`, `escalate`, or explicit coverage gap |

Decoys must not point to real company files. A network case may use only a company-approved test destination.

### 5. Audit review and cleanup

The audit should expose operator, Agent instance, session, time, evidence source/trust, action class, target class, result, policy reason, and coverage gap—without prompt/command/file/output contents, tokens, cookies, secrets, customer data, or full personal paths.

After the run, stop the processes, let the company owner retain or securely delete the audit, revoke test credentials, remove temporary exceptions, and return only redacted conclusions or synthetic reproductions to the development repository.

## Acceptance gate

- Authorization exists and actual scope matches it.
- The Agent integration profile and blind spots are documented.
- Tests repeat with stable event ordering and conclusions.
- Configuration evidence is not called execution evidence.
- Agent self-report is not called independent evidence.
- Boundary cases cannot touch real sensitive data.
- Unknown events retain a fingerprint and show `unparsed` or a coverage gap.
- The UI traces conclusions to source and policy reason.
- Performance meets the target or creates an explicit load-reduction item.
- Audit data stays inside the approved company storage boundary.

## Current implementation boundary

`cmd/observe` records wrapper lifecycle and normalizes JSONL, but cross-platform OS process/file sensors are not implemented. A real company environment improves sample realism; it does not remove product blind spots. A successful first pilot must document both what Agent Governance Gateway detects and why it misses anything else.
