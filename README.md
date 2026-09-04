# Aegis Router

English | [简体中文](README.zh-CN.md)

**Execution Permits for AI Agent Actions**

Aegis Router is a framework-agnostic authorization layer for tool-using AI agents. Before a privileged tool action executes, Aegis makes a deterministic decision over the normalized action and issues a signed, short-lived, action-bound, single-use-by-default execution permit. The executor verifies and consumes that permit immediately before the real side effect.

If the Agent changes the tool, operation, resource, or security-relevant arguments after authorization, the permit no longer matches and the tool must not execute.

> **The action that was authorized must be exactly the action that executes.**

Aegis is not a sandbox, EDR, IAM system, Agent management platform, or enterprise Inventory product. The GitHub repository remains [`szey/agent-governance-gateway`](https://github.com/szey/agent-governance-gateway) to avoid a migration; the product name is **Aegis Router**.

## Core execution path

```text
Agent proposes action
  → normalize CanonicalAction
  → deterministic Policy authorization
  → issue Execution Permit
  → verify and consume Permit at the MCP execution boundary
  → call upstream tool only after VERIFIED
  → write a redacted Audit Receipt
```

The security boundary is **before the real tool side effect**. `POST /api/runtime-events` may still record during- or post-execution evidence, but an after-the-fact event is not the primary blocking mechanism.

## Core objects

### CanonicalAction

The authorizer and executor must derive the same normalized action from the same fields:

- principal identity;
- Agent and workload identity;
- delegated-authority fingerprint;
- tool, capability, resource, and operation;
- security-relevant arguments.

Arguments use deterministic canonical JSON and a SHA-256 digest. Empty arguments normalize to `{}`; object keys sort recursively by Unicode lexical order; duplicate keys, malformed UTF-8, and unpaired surrogates are rejected; arrays preserve order; and numbers normalize exactly without float conversion (`100.0` and `1e2` are equivalent). Object key order does not change the digest; changing an amount, resource, tool, operation, or another bound field does. The digest is `sha256:<64 lowercase hex>`. Normal audit records retain `action_digest`, not raw sensitive arguments.

### Execution Permit

The `AuthorizationEnvelope` concept is retained and strengthened into a signed execution credential. A permit binds at least:

```text
permit_id / jti      request_id
principal_id         agent_id / workload_id
delegation_digest    tool / capability
resource / operation action_digest
policy_version       issued_at / expires_at
single_use=true
```

The focused MVP uses an Ed25519-signed compact token: `base64url(header).base64url(payload).base64url(signature)`. Its header is `alg=EdDSA`, `typ=AEGIS-PERMIT`, and `v=1`. It is a project-specific JWS-shaped format and does not claim general JWT/JWS interoperability.

TTL uses whole seconds, defaults to 30 seconds, and is currently capped at 15 minutes.

`permit_id` is a safe correlation identifier; `permit_token` is the execution credential. An ID alone cannot authorize execution. Signing keys, `permit_token`, raw delegated credentials, and secret arguments must never enter the UI or audit log. Callers submit only a 64-hex SHA-256 credential fingerprint; Aegis hashes that declared fingerprint again into an algorithm-qualified binding before it enters CanonicalAction, Permit claims, or audit. This is defense in depth, not permission to submit a bearer token.

### Verification and replay defense

The execution boundary validates signature, issuer, expiry, principal/Agent/workload, tool, resource, operation, and action digest, then atomically consumes the permit. Only `VERIFIED` may call the upstream tool. Failure outcomes cover invalid signature, expiry, revocation, wrong binding, action mismatch, and replay. At most one of two concurrent consumption attempts for the same permit may succeed.

The lifecycle is `ISSUED → CONSUMED`, or `ISSUED → EXPIRED/REVOKED`.

## The only MVP adapter: MCP

The focused MVP has exactly one production-shaped execution boundary: MCP tool calls.

```text
MCP client
  → Aegis MCP adapter/proxy
  → normalize tools/call
  → authorize exact action
  → issue signed permit
  → verify + consume immediately before forwarding
  → upstream MCP server
  → audit result metadata
```

Every verification failure must occur before the upstream `tools/call`. This milestone does not implement HTTP, A2A, database, shell, or cloud-policy adapters.

Configure an upstream on the existing Server to mount permit-gated `POST /mcp`:

```bash
go run ./cmd/server --mcp-upstream http://127.0.0.1:3001/mcp
```

`tools/call` uses `Authorization: AegisPermit <permit_token>` plus `X-Aegis-Principal-Id`, `X-Aegis-Agent-Id`, `X-Aegis-Workload-Id`, `X-Aegis-Capability`, `X-Aegis-Resource`, and `X-Aegis-Operation`; the delegation-fingerprint header is optional. Tool name and arguments come directly from JSON-RPC `params`, so headers cannot replace them. The Proxy strips the credential, every `X-Aegis-*` header, cookies, content encodings, session context, and arbitrary extension headers. It forwards only normalized JSON content negotiation plus MCP routing headers rebuilt from the validated body. `initialize`, `notifications/initialized`, `ping`, and `tools/list` pass through as compatibility protocol methods; other unsupported methods fail closed.

For MCP `2026-07-28`, the Proxy also requires `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` to agree exactly with `params._meta` and the JSON-RPC body, then rebuilds forwarded routing headers from the validated body. Duplicate JSON keys are rejected before Permit verification. On `tools/call`, the only accepted `_meta` entry is the validated protocol version; unbound extension metadata is rejected. This is an intentionally narrow HTTP `POST` subset: `server/discover`, `tools/list`, and permit-gated `tools/call` are supported; full MCP conformance is not claimed. MRTR `inputResponses`/`requestState` and schema-aware `Mcp-Param-*` validation are not yet part of `CanonicalAction`, so they fail closed. The old `initialize` path remains compatibility-only when a modern version is not declared.

## Policy, Risk, and obligations

Authorization stays deterministic, with the conceptual outcomes:

- `AUTHORIZED`;
- `DENIED`;
- `REQUIRES_APPROVAL`.

Risk is optional advisory metadata. It cannot override an explicit denial and does not define the product. Isolation, read-only behavior, denied network egress, human approval, and enhanced audit are decision/permit obligations, for example:

```json
{
  "isolation_required": true,
  "network_egress_denied": true,
  "read_only": true,
  "human_approval_required": false,
  "enhanced_audit_required": true
}
```

`isolation_required: true` requires an external execution environment to supply isolation; Aegis does not implement or claim a sandbox. The focused MCP proxy therefore consumes and rejects a valid Permit when `isolation_required` or `human_approval_required` is still unsatisfied, records `EXECUTION_OBLIGATION_UNSATISFIED`, and never calls upstream. `read_only` and `network_egress_denied` remain signed requirements: the reference proxy binds the requested operation but cannot prove the internal behavior of an arbitrary upstream tool, so deployment needs a separately trusted executor/control for those semantics. `ALLOW / RESTRICT / SANDBOX / DENY / ESCALATE` in compatibility responses are legacy routing or obligation/profile hints.

## API direction

Focused APIs:

- `POST /api/actions/authorize` — authorize a normalized action; success returns a decision and a permit object containing `permit_id`, `permit_token`, and `expires_at`;
- `POST /api/permits/verify` — verify and atomically consume a Permit at a trusted execution boundary;
- `POST /api/permits/{id}/revoke` — revoke an unconsumed permit;
- `GET /api/permits` and `GET /api/permits/{id}` — return safe metadata only;
- `GET /api/decisions` and `GET /api/audits` — read authorization decisions and audit receipts.

The MCP adapter directly reuses the same verifier. `POST /api/actions/authorize` currently evaluates caller-supplied structured identity and delegation metadata; it does not authenticate a human, workload, or bearer credential. Place it behind an authenticated intake boundary before any real deployment. `POST /api/permits/verify` is for trusted, controlled integrations and is not network identity authentication. `/api/authorize`, `/api/runtime-events`, and `/api/route` remain temporarily as compatibility endpoints. They do not treat a `permit_id` as an execution credential or upgrade client-reported events into independent observation.

## UI

Primary navigation is limited to `Decisions / Permits / Audit / Demo`:

- the home view shows `AUTHORIZED`, `DENIED`, `PERMIT VIOLATIONS`, and `REPLAY BLOCKS`;
- permit details show `permit_id`, state, principal, Agent/workload, tool, capability, resource, operation, `action_digest`, policy version, issued/expires/consumed time, and verification result;
- the UI never shows `permit_token`, raw delegated credentials, secret values, or raw sensitive arguments;
- Inventory does not appear in normal navigation.

## Demo Lab

Four primary scenarios directly test the execution-permit invariant:

| Scenario | Expected result |
|---|---|
| Valid Permit | Exact action is `VERIFIED`, upstream is called, Permit becomes `CONSUMED` |
| Action Mutation / TOCTOU | A post-authorization argument change returns `PERMIT_ACTION_MISMATCH`; upstream is not called |
| Permit Replay | First use succeeds; second use returns `PERMIT_REPLAY` |
| Expired Permit | Execution after TTL returns `PERMIT_EXPIRED` |

Historical security scenarios may remain under `Advanced regression fixtures`. All Demo telemetry remains `simulated_demo`; it is not real Agent or production observation.

## Experimental Inventory

Discovery remains buildable but is frozen, disabled by default, and outside the primary product story. Related Server API/UI is exposed only after explicit enablement:

```bash
go run ./cmd/server --enable-experimental-inventory
```

The standalone read-only utility remains under `cmd/discover`. Process, OAuth, CI/CD, cloud, and central enterprise Agent Inventory expansion is not planned. Discovery evidence cannot prove runtime behavior.

## Quick start

Go 1.26 is required. Node.js is needed only when changing the TypeScript frontend.

```bash
go run ./cmd/server
```

Open [http://localhost:8080](http://localhost:8080), or run `docker compose up --build`. For MCP enforcement, add `--mcp-upstream <absolute-http(s)-url>` to the same Server and follow the [pilot protocol](docs/experiments/enterprise-agent-pilot.md) with a harmless controlled upstream first. Do not connect production tools or credentials directly.

## Audit and evidence truth

Each action produces an explainable, redacted receipt: request/decision/permit IDs, principal, Agent, tool, resource, operation, action digest, policy version, authorization decision, permit state, verification result, timestamp, and evidence source.

Runtime sources remain distinct: `gateway_enforced`, `instrumented_adapter`, `agent_self_reported`, `os_sensor`, `network_sensor`, and `simulated_demo`. Runtime evidence is secondary. Uninstrumented coverage remains `UNKNOWN / not instrumented`: `UNKNOWN != SAFE` and `UNKNOWN != ZERO`.

## Documentation and verification

Chinese is the semantic working source; English changes in the same commit:

| Topic | 简体中文 | English |
|---|---|---|
| Product brief | [中文](docs/project-brief.zh-CN.md) | [English](docs/project-brief.md) |
| MCP execution-permit pilot | [中文](docs/experiments/enterprise-agent-pilot.zh-CN.md) | [English](docs/experiments/enterprise-agent-pilot.md) |
| Research and product decisions | [中文](docs/research-product-mapping-iteration.zh-CN.md) | [English](docs/research-product-mapping-iteration.md) |
| Contributing | [中文](CONTRIBUTING.zh-CN.md) | [English](CONTRIBUTING.md) |
| Security policy | [中文](SECURITY.zh-CN.md) | [English](SECURITY.md) |

```bash
npm install
npm run check:web
npm run build:web
go test ./...
go test -race ./...
go vet ./...
```

The frontend source is `web/src/app.ts`; the generated `web/static/app.js` is committed too. If the environment lacks the race-detector toolchain, report that limitation exactly instead of claiming it passed.

## Security boundaries

- Aegis protects only actions that actually cross its verifier/MCP boundary; bypassed calls are not automatically discovered or blocked;
- an in-process PermitStore, local key management, and local audit are not production-grade high availability, tamper resistance, or cross-instance replay defense;
- MCP adapter identity, upstream transport, and deployment topology still need a separate threat model and security review;
- Aegis does not provide real isolation, EDR sensors, full IAM, SSO, RBAC, or multi-tenancy;
- do not use production credentials, customer data, or uncontrolled Internet targets before independent review and a formally authorized pilot.

## License

[MIT](LICENSE)
