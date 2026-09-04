# Aegis Router Project Brief

English | [简体中文](project-brief.zh-CN.md)

> **A Policy-Driven Security Router for AI Agents**

## One-line position

Aegis Router is a zero-trust security control plane between AI agents and their tools/resources. It verifies identity, delegation, capability, tool, resource, operation, and constraints before each action, issues an explicit execution permit, and evaluates provenance-labeled runtime events against that permit.

The repository remains named `agent-governance-gateway`; the product brand is **Aegis Router**.

## Core security principle

> **Approving an Agent to exist does not approve its behavior.**

Asset registration and behavioral authorization are separate controls:

- Asset registration asks: “may this workload participate in the governed environment, and who owns it?”
- Per-action authorization asks: “may this workload act for this principal, under this delegation, with this tool, on this resource, using this operation now?”

Even when WorkBuddy, Codex, or another Agent is registered, every tool call and resource access that enters Aegis Router is independently authorized and audited. Registration never bypasses policy.

## Product boundary

Runtime Gateway / Enforcement is the product center, followed by Runtime Observation + Audit. Agent Inventory / Discovery is an optional supporting visibility module. The intended weighting is roughly 60% / 25% / 15%.

Aegis Router is not:

- an EDR or universal endpoint-monitoring product;
- primarily a filesystem-based Shadow Agent inventory;
- a prompt-intent classifier;
- a gateway that authorizes by numerical risk alone;
- a sandbox that already provides real isolation;
- an MCP-only firewall or a complete enterprise RBAC platform.

## Request and authorization model

A request represents one action, not permanent permission for an Agent:

| Context | Key fields | Security meaning |
|---|---|---|
| `PrincipalContext` | principal ID/type, tenant/environment | The accountable human/service principal |
| `AgentIdentity` | agent/workload ID, owner, environment, framework/version | The workload that performs the action |
| `DelegatedAuthority` | credential fingerprint, issuer, subject, scopes, expiry | What the principal delegated; never a raw bearer token |
| `ToolContext` | tool ID/name, provider, schema hash | The tool capability used |
| `ActionRequest` | capability, operation, resource, side effect, destination | What this individual action attempts |

`claimed_intent` may be investigation context or a risk signal, but is not a primary authorization input. Policy relies on verifiable context: identity + delegation + capability + tool + resource + operation + constraints.

Policy must express workload identity, capabilities, allowed tools, resource grants, allowed operations per resource, required delegated scopes, network egress, secret access, and side-effect constraints. Unknown identity, capability, tool, resource, or operation fails closed.

## Policy, Risk, and Dispatch

These are separate stages:

1. **Policy Decision** asks whether the action is authorized; an explicit authorization failure always yields `DENY`.
2. **Risk Assessment** estimates the danger or uncertainty of an otherwise authorized action.
3. **Dispatch Decision** chooses `ALLOW / RESTRICT / SANDBOX / DENY / ESCALATE` from policy and risk.

For example, unauthorized finance access is denied regardless of its score. An authorized sensitive-config read may be routed to `RESTRICT` or `SANDBOX ROUTE` because of risk.

## AuthorizationEnvelope (Execution Permit): the runtime boundary

An executable decision issues a time-bounded `AuthorizationEnvelope` tied to the request, principal, and Agent. The API field is `authorization_envelope`; its identifier is `permit_id`. It records:

- the allowed capability, tool, resource, and operations;
- `network_egress`, `secret_access`, and `write_access` constraints;
- optional `max_bytes`, `max_duration`, and `executor_profile`;
- `permit_id`, `issued_at`, and `expires_at`.

The Agent's declared plan is not the security boundary. Runtime events are compared with the permit: in-permit events pass; secret reads outside the grant, writes under a read-only permit, egress when denied, expired permits, or binding mismatches produce explicit violation/rejection results.

## Runtime evidence and audit

The normal request API must not accept “simulated actions” and present them as independent observation. Runtime events enter through an explicit interface and carry request/permit ID, session, capability, tool, operation, resource/destination class, source, trust level, and timestamp.

Evidence sources include:

- `gateway_enforced`;
- `instrumented_adapter`;
- `agent_self_reported`;
- `os_sensor` / `network_sensor` only when connected;
- `simulated_demo`.

The audit chain retains request security context, policy result, risk assessment, dispatch, execution permit, runtime evidence source, events, violations, final verdict, duration, and causal/session relationships. It does not retain raw tokens, secret values, retrieved content, or full local paths.

## Demo Lab

Six synthetic scenarios remain as a clearly labeled Demo Lab and security regression suite. The core three are:

1. **Safe code request**: valid identity, delegation, capability, tool, resource, and operation → `ALLOW` + permit → demo event remains inside the permit.
2. **Unauthorized finance access**: a coder Agent has code scope but requests `finance.read` → pre-execution `DENY` → no permit and no executor.
3. **Authorization-boundary violation**: a permit allows only `config.read`; the server-owned Demo fixture submits `config.read` and then `secret.read` → the latter exceeds the permit → `AUTHORIZATION_BOUNDARY_VIOLATION`.

Indirect prompt injection, protected file read, and sensitive-read-then-egress remain regressions. Every synthetic event is labeled `simulated_demo`, never a production “Observed” event.

## Agent Inventory / Discovery

Discovery code remains, but as a supporting module:

- Registered Agent: a registered workload asset;
- Shadow workload: deployment evidence that does not match the registry;
- Discovery evidence: a configuration, dependency, process, or other signal;
- Available integration: a marketplace/catalog/cache component not proven deployed.

A dependency containing `autogen`, `@openai/agents`, or an MCP manifest is evidence, not an Agent identity. Discovery confidence and deployment state belong to Inventory; runtime risk belongs to a specific action/session.

## Real capabilities and limitations

The MVP can deterministically authorize structured actions that enter its control point, issue permits, receive provenance-labeled events, evaluate permit boundaries, and write local audit records. Demo Lab uses harmless server-owned event fixtures that traverse the same permit checks; it is not a real executor.

The MVP cannot:

- automatically observe or stop Agents that bypass the Router/adapter;
- independently see all OS file, process, syscall, or network activity;
- turn a `SANDBOX` route into Docker/gVisor/Firecracker isolation;
- guarantee that Agent self-reports are complete;
- provide production authentication, RBAC, multi-tenancy, central persistence, or tamper-evident audit.

Unconnected coverage is `UNKNOWN / not instrumented`, never “zero gaps.” A company environment improves realism but does not remove these blind spots.

## Next-stage order

1. Fix identity, delegation, tool, resource-operation, and permit semantics with automated tests.
2. Complete Runtime Event API, expired/wrong-binding/boundary negative tests, and final verdicts.
3. Connect the first real MCP/HTTP/tool adapter as an enforcement point.
4. Validate evidence, performance, and privacy in a re-authorized synthetic enterprise pilot.
5. Add independent OS/network sensors with explicit coverage labels.
6. Then evaluate a real isolation backend, permit revocation, enterprise authentication, and tamper-evident audit.

This order prioritizes one demonstrable property: an Agent action receives precise authorization before execution, cannot silently exceed that authorization during execution, and leaves an audit trail that does not overstate its evidence.
