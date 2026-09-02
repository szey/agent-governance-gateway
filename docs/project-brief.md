# Agent Governance Gateway Project Brief

English | [简体中文](project-brief.zh-CN.md)

## One-line position

**Agent Governance Gateway is a zero-trust security control plane for AI Agents: it evaluates policy and dispatches high-risk actions before execution, observes behavioral drift during execution, and produces an auditable decision trail.**

Fixed English subtitle:

> Discover Shadow Agents, govern tool actions, and audit causal behavior

## Problem addressed

Once an Agent can use files, shells, databases, networks, and business APIs, risk is defined by what it ultimately does—not only by prompt content:

- Is the Agent acting for the correct human?
- Does delegated token scope cover the requested capability?
- Is it crossing into a sensitive resource?
- Does a read-only plan become a write or privilege action at runtime?
- Does the actual tool sequence depart from the declared plan?
- Can security decisions and execution be audited and reconstructed?

Agent Governance Gateway sits between the Agent and execution targets and turns these questions into an enforceable checkpoint.

Asset approval and action authorization are deliberately separate. Registry membership says an Agent may exist and has an accountable owner; it does not grant every tool, parameter, or resource. Every observable action from approved and Shadow Agents that reaches a connected control or observation point must be recorded, and actions crossing an enforcement point must be evaluated per action.

## Enterprise deployment needs a discovery plane

The original MVP governed only requests that passed through Agent Governance Gateway. It could not see an Agent that bypassed the Router, so it could not directly identify unregistered Shadow Agents inside an enterprise.

The enterprise architecture therefore has two planes:

1. **Discovery / Visibility Plane** collects evidence from configuration, processes, source control, network egress, API gateways, OAuth/IdP, and CI/CD; builds an Agent inventory; and reconciles it with an approved registry.
2. **Enforcement / Execution Plane** validates identity and authority, evaluates policy and risk, observes behavior, and audits requests that reach a control point.

Discovery and blocking are different. Passive sensors may detect suspicious behavior, but pre-execution blocking requires an egress gateway, API gateway, service mesh, endpoint control, or Agent Governance Gateway in the request path.

## Two design choices

### 1. Do not position this as an MoE inference gateway

MoE normally describes model-internal expert networks and token-level routing. Agent Governance Gateway performs model-external request/action security, authorization, and secure dispatch. Calling it MoE would confuse it with an inference architecture.

Preferred terminology:

- policy-driven;
- zero-trust;
- capability-based;
- secure dispatch;
- sandbox isolation;
- runtime observation; and
- audit trail.

### 2. Intent is only a supporting signal

Dangerous requests may look like ordinary configuration debugging, connection validation, or file organization. Policy must rely primarily on harder facts:

1. actor: human user, Agent identity, delegated authority;
2. requested capability: read, write, exec, network, database;
3. target: ordinary file, protected configuration, finance data, secret;
4. sufficient token scope; and
5. whether observed behavior departs from plan.

## Current MVP

The repository implements this minimal loop:

```text
Request
  → Identity / scope check
  → Capability and resource policy
  → Explainable risk scoring
  → Session causality / provenance / sequence detection
  → Allow / Restrict / Sandbox / Deny / Escalate
  → Planned vs observed behavior comparison
  → JSONL audit record
```

Policy, risk, routing, behavior comparison, and audit persistence execute for real. Executor activity is represented with safe `simulated_actions` so the demo does not gain host privileges. The `sandbox` value is a routing result, not Docker, gVisor, or Firecracker isolation.

The Router also implements deterministic in-session detections: input provenance and risk signals, tool identity/schema hashes, causal parents, protected open/read metadata, privacy budgets, accumulated risk, and sequence blocks for sensitive-read → external-send and poisoned-input → side-effect-tool chains. State is currently local to one Router process. The rules only see events routed through Agent Governance Gateway or reported by an adapter; they do not replace OS, EDR, or network sensors.

The first Shadow Agent Discovery stage is also implemented:

- read-only scanning of explicitly selected configuration/dependency directories;
- evidence provenance, rationale, and confidence;
- project/Agent fingerprints and deduplication;
- `available`, `installed`, and `configured` deployment states so marketplace/cache evidence is not automatically Shadow;
- reconciliation against a locally durable registry as `approved`, `shadow`, or `unassessed`;
- coverage-gap recording that continues past unreadable child directories;
- UI add, edit, suspend, and remove operations with immediate reconciliation; and
- explainable risk for unknown owners, MCP capability, and high-confidence findings.

Live process, network, OAuth, and cloud-audit sensors are not implemented.

An experimental `cmd/observe` session wrapper records child-process lifecycle for an approved CLI Agent. Agent JSONL is marked as self-reported evidence; classification and payload fingerprints are retained without raw commands, prompts, or output. Every valid Router request is recorded whether allowed, denied, or escalated, but GUI, IDE, background, and bypassed behavior still requires future OS/network sensors. The project has one sanitized company-endpoint trial report; the full controlled protocol remains incomplete. See [`experiments/enterprise-agent-pilot.md`](experiments/enterprise-agent-pilot.md).

## Six demo scenarios

### Safe coding request

- `coder-agent` has `code.read`;
- requests `generate_code`;
- targets low-sensitivity `public_workspace`;
- result: `allow → normal-executor`.

### Unauthorized finance access

- `coder-agent` attempts `finance_data`;
- policy explicitly denies that resource;
- delegated scope lacks `finance.read`;
- result: `deny → no execution`.

### Behavioral drift during debugging

- the request appears to read protected configuration;
- sensitivity routes it to `sandbox`;
- the declared plan contains only `read_config`;
- runtime includes `read_secret` and `invoke_admin_tool`;
- result: `sandbox → suspicious_behavior`, with unexpected actions audited.

### Indirect prompt injection

- untrusted retrieved input carries `instruction_like_content` and `tool_directive` risk signals;
- tool identity and schema hashes enter the audit;
- a deterministic rule fires before a side-effecting command executes;
- result: `deny → blocked`.

### Protected file read

- only operation, path class, sensitivity, and byte count are retained;
- full path and contents are not retained;
- the session privacy budget is charged;
- result: `sandbox` with a `data.sensitive_read_observed` finding.

### Sensitive read followed by egress

- an external request references a protected-read parent event;
- each call can look reasonable in isolation;
- the session triggers `sequence.sensitive_read_then_egress`;
- result: `deny → blocked`.

## GitHub presentation priorities

The project page should prioritize:

1. “an action control plane, not a prompt filter”;
2. a decision flow from identity through policy, risk, observation, and audit;
3. six repeatable demos, including indirect injection and cross-tool exfiltration;
4. a screenshot or short GIF of behavioral drift;
5. an honest security boundary; and
6. a roadmap from simulated execution toward a real isolated executor.

## Recommended next stage

In priority order:

1. Regress the classification, refresh, unreadable-directory, and registry failures exposed by the company-endpoint trial with isolated fixtures.
2. After renewed company authorization, complete the controlled audit pilot and add cross-platform process/file sensors to corroborate Agent self-reporting.
3. Persist the implemented causal-session state and connect Agent instance/full delegation chains to enterprise identity.
4. Define the executor adapter and connect the first real Docker sandbox.
5. Add human approval and one-time grants for `escalate`.
6. Add tamper-evident chaining and connect the existing schema-hash comparison to a signed tool registry.
7. Then consider network policy, OpenTelemetry, gVisor, Firecracker, or eBPF.

This sequence grows the project from an honest, complete demo loop into Agent security infrastructure without making the first release depend on heavyweight isolation technology.
