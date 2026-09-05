# Aegis Router

English | [简体中文](README.zh-CN.md)

**Execution Permits for AI Agent Actions**

Aegis Router implements a framework-agnostic execution-permit model with a focused MCP enforcement path. Before a privileged tool action executes, Aegis makes a deterministic decision over authenticated identity and exact semantic intent, then issues a signed, short-lived, action-bound, single-use-by-default execution permit. The executor verifies and consumes that permit immediately before the real side effect.

If the Agent changes the tool, operation, resource, or security-relevant arguments after authorization, the permit no longer matches and the tool must not execute.

> **The action that was authorized must be exactly the action that executes.**

Aegis is not a sandbox, EDR, IAM system, Agent management platform, or enterprise Inventory product. The GitHub repository remains [`szey/agent-governance-gateway`](https://github.com/szey/agent-governance-gateway) to avoid a migration; the product name is **Aegis Router**.

## Core execution path

```text
Authenticated identity + Agent proposes action
  → normalize CanonicalAction
  → deterministic Policy authorization
  → issue Execution Permit
  → verify and consume Permit at the MCP execution boundary
  → call upstream tool only after VERIFIED
  → write a redacted Audit Receipt
```

`Authenticated identity + exact semantic intent + signed single-use Permit = cryptographically bound execution.`

The security boundary is **before the real tool side effect**. `POST /api/runtime-events` may still record during- or post-execution evidence, but an after-the-fact event is not the primary blocking mechanism.

## Capability status

- **Implemented:** fail-closed, loopback-development, and trusted reverse-proxy authorization intake modes; signed `execution`/`simulation` class separation; short-lived single-use permits; replay protection; canonical action binding; one `payment.send/v1` semantic profile; and its focused MCP HTTP `POST` enforcement path.
- **Demo or experimental:** server-owned simulation scenarios and telemetry; frozen Inventory is hidden unless explicitly enabled.
- **Not implemented:** an approval completion workflow, sandbox/EDR/IAM, business exactly-once delivery, additional semantic profiles or execution adapters, and full MCP protocol conformance. `REQUIRES_APPROVAL` remains a model/config result only; no supported approval flow can turn it into an executable Permit.

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
permit_id / jti      signing_key_id / kid
permit_class         execution | simulation
request_id           principal_id
agent_id / workload_id
delegation_digest    tool / capability
resource / operation action_digest
profile_id / audience
policy_version       issued_at / expires_at
single_use=true
```

The focused MVP uses an Ed25519-signed compact token: `base64url(header).base64url(payload).base64url(signature)`. Its header carries `alg=EdDSA`, `typ=AEGIS-PERMIT`, `v=1`, and `kid=<signing_key_id>`. The unverified header `kid` only selects a public key from the KeyProvider; after signature verification it must also match the signed `signing_key_id` claim. This is a project-specific JWS-shaped format and does not claim general JWT/JWS interoperability.

TTL uses whole seconds, defaults to 30 seconds, and is currently capped at 15 minutes.

`permit_id` is a safe correlation identifier; `permit_token` is the execution credential. An ID alone cannot authorize execution. Signing keys, `permit_token`, raw delegated credentials, and secret arguments must never enter the UI or audit log. Callers submit only a 64-hex SHA-256 credential fingerprint; Aegis hashes that declared fingerprint again into an algorithm-qualified binding before it enters CanonicalAction, Permit claims, or audit. This is defense in depth, not permission to submit a bearer token.

Issuance and verification use a `KeyProvider` abstraction to obtain the current signing key and resolve verification keys by `kid`. The Server currently generates one process-local ephemeral development key; an embedding process may supply a securely loaded persistent local Ed25519 private key through the static provider. The project does not yet define a key-file format, automatic rotation, KMS/HSM integration, or cross-instance keyring operations.

### Verification and replay defense

The execution boundary validates signature, issuer, expiry, `permit_class`, principal/Agent/workload, tool, resource, operation, profile version, audience, and action digest, then atomically consumes the permit. Normal `VerifyAndConsume` and MCP accept only `execution`; the server-owned Demo verifier accepts only `simulation` and has no upstream-forwarding capability. Missing, unknown, or mismatched classes fail closed before consumption. Only an `execution` permit that returns `VERIFIED` may call the upstream tool. Failure outcomes cover invalid signature, invalid or wrong class, expiry, revocation, wrong binding, action mismatch, and replay. At most one of two concurrent consumption attempts for the same permit may succeed.

`permit_class` is selected by the server entry point and covered by the signature; request callers cannot set or override it. Tokens issued before this claim was introduced are rejected as invalid and must be re-authorized and reissued. There is no compatibility branch that treats a missing class as `execution`.

The lifecycle is `ISSUED → CONSUMED`, or `ISSUED → EXPIRED/REVOKED`.

Consumption is the commit point before the upstream side effect. An upstream failure or timeout leaves the Permit `CONSUMED`; it is never restored to `ISSUED`. Every retry requires a new authorization and a new Permit. There is no `unconsume` operation.

### A single-use Permit is not an exactly-once business side effect

Aegis guarantees that one Execution Permit can be successfully consumed **at most once**. This is execution-authorization replay protection, not a guarantee that an arbitrary upstream business operation executes exactly once. For example, an upstream payment may complete while its network response is lost, leaving the caller with a timeout. The original Permit remains `CONSUMED`; a retry requires a new authorization and new Permit and must rely on the payment, order, account-change, message-sending, or other upstream system's own idempotency key or deduplication mechanism. Aegis does not provide a business idempotency engine.

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

Every verification failure must occur before the upstream `tools/call`. A `simulation` token is rejected before consumption and before any upstream call, even when every action field otherwise matches. This milestone does not implement HTTP, A2A, database, shell, or cloud-policy adapters.

Configure an upstream on the existing Server to mount permit-gated `POST /mcp`. The `--allow-development-intake` flag below accepts body identity from loopback requests only and labels it `development_only`; it is not a production mode:

```bash
go run ./cmd/server --allow-development-intake --mcp-upstream http://127.0.0.1:3001/mcp
```

`tools/call` uses `Authorization: AegisPermit <permit_token>` plus `X-Aegis-Principal-Id`, `X-Aegis-Agent-Id`, `X-Aegis-Workload-Id`, `X-Aegis-Capability`, `X-Aegis-Resource`, and `X-Aegis-Operation`; the delegation-fingerprint header is optional. Tool name and arguments come directly from JSON-RPC `params`, so headers cannot replace them. The Proxy strips the credential, every `X-Aegis-*` header, cookies, content encodings, session context, and arbitrary extension headers. It forwards only normalized JSON content negotiation plus MCP routing headers rebuilt from the validated body. `initialize`, `notifications/initialized`, `ping`, and `tools/list` pass through as compatibility protocol methods; other unsupported methods fail closed.

For MCP `2026-07-28`, the Proxy also requires `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` to agree exactly with `params._meta` and the JSON-RPC body, then rebuilds forwarded routing headers from the validated body. Duplicate JSON keys are rejected before Permit verification. On `tools/call`, the only accepted `_meta` entry is the validated protocol version; unbound extension metadata is rejected. This is an intentionally narrow HTTP `POST` subset: `server/discover`, `tools/list`, and permit-gated `tools/call` are supported; full MCP conformance is not claimed. MRTR `inputResponses`/`requestState` and schema-aware `Mcp-Param-*` validation are not yet part of `CanonicalAction`, so they fail closed. The old `initialize` path remains compatibility-only when a modern version is not declared.

### The only semantic action: `payment.send/v1`

`configs/policy.json` is the server-owned mapping from MCP tool `payment.send` and its configured upstream URL to capability `payment_transfer`, resource `account-123`, operation `transfer`, profile `payment.send/v1`, and audience `mcp://local-payment-sandbox`. The client cannot select an upstream URL. If `--mcp-upstream` does not exactly match the configured `upstream_url`, server startup fails. Unknown MCP tools and conflicting capability/resource/operation/profile/audience assertions fail before Permit consumption and before upstream.

Payment arguments are exactly:

```json
{"amount_minor":100,"currency":"USD","recipient":"merchant-456"}
```

`amount_minor` is a positive JSON integer in the currency's smallest unit—USD cents and CNY fen in the sample configuration. No floating point, string conversion, or exchange-rate conversion occurs. Zero, negatives, `int64` overflow, missing/wrongly typed fields, duplicate keys, and unknown business fields are rejected. The configuration explicitly pairs each allowed currency with its per-transaction minor-unit maximum and separately allowlists recipients. Authorizer and MCP proxy use the same `payment.send/v1` parser; the proxy forwards its normalized three-field object, not the caller's original serialization.

Run the authorization examples from the repository root. Keep the server in terminal 1, then send both requests from terminal 2:

```bash
# Terminal 1
go run ./cmd/server --allow-development-intake

# Terminal 2
curl -sS -H "Content-Type: application/json" --data-binary @docs/examples/payment-send-valid.json http://127.0.0.1:8080/api/actions/authorize
curl -sS -H "Content-Type: application/json" --data-binary @docs/examples/payment-send-over-limit.json http://127.0.0.1:8080/api/actions/authorize
```

The first response is `AUTHORIZED` and contains an `execution` Permit bound to `payment.send/v1` and the configured audience. The second is `DENIED`, has no Permit, and includes stable reason `PAYMENT_AMOUNT_EXCEEDS_LIMIT`. These commands exercise local development intake; they do not contact a payment provider.

## Policy, Risk, and obligations

Authorization stays deterministic. The currently executable flow has two outcomes:

- `AUTHORIZED`;
- `DENIED`.

The model can represent `REQUIRES_APPROVAL`, but this release has no supported approval-completion workflow and therefore does not claim it as an implemented capability. Deterministic Policy and the `payment.send/v1` semantic profile are the only authorization authorities and the only components that decide whether a Permit exists. Risk scores and detection findings are written only under `advisory_signals`; they cannot change a deterministic result, issue a Permit, or select an executor. Isolation, read-only behavior, denied network egress, human approval, and enhanced audit become decision/Permit obligations only through deterministic Policy/configuration mappings, for example:

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

## Trusted authorization intake modes

The standalone server selects exactly one identity-provenance mode:

1. **RejectAll** — secure default. Without an explicit intake configuration, HTTP authorization fails closed.
2. **LoopbackDevelopment** — enabled only by `--allow-development-intake`. It accepts body identity only from a loopback direct peer and records assurance `development_only`.
3. **TrustedProxy** — accepts identity headers from a separately authenticated reverse proxy only when the direct TCP peer in `request.RemoteAddr` belongs to one of the explicitly configured trusted CIDRs. It records `source=trusted_integration`, the configured provider ID, `assurance=authenticated_context`, and the server establishment time.

TrustedProxy uses only this explicit header contract: `X-Aegis-Authenticated-Principal`, `X-Aegis-Agent-Id`, `X-Aegis-Workload-Id`, `X-Aegis-Delegated-Scopes`, and `X-Aegis-Delegation-Fingerprint`. The current focused contract represents the authenticated principal as type `human`. Identity labels must be exact 1–128 byte metadata identifiers. Scopes use one comma-separated header; optional SP/HTAB around commas is removed, empty or duplicate scopes are rejected, and accepted scopes are sorted. The delegation fingerprint must be exactly 64 hexadecimal SHA-256 characters—not a bearer token, API key, cookie, password, or `sha256:`-prefixed value.

Trust is based exclusively on the direct peer. `X-Forwarded-For`, `Forwarded`, and `X-Real-IP` are never used to decide whether the sender is trusted. TrustedProxy then overwrites principal, Agent, workload, and delegated authority from the JSON proposal before Policy, Permit issuance, or audit. It never falls back to body identity after a trust error.

```bash
go run ./cmd/server \
  --trusted-proxy-cidr 127.0.0.1/32 \
  --trusted-proxy-provider-id local-auth-gateway
```

Repeat `--trusted-proxy-cidr` to allow additional IPv4 or IPv6 direct peers. CIDR and provider ID must be configured together. TrustedProxy configuration cannot coexist with `--allow-development-intake`; ambiguous or partial configuration stops server startup.

**Aegis authenticates neither users nor OAuth tokens itself.** It consumes identity established by a separately trusted authentication boundary. TrustedProxy is a narrow provenance adapter, not an IAM, SSO, OAuth, or RBAC platform; transport protection and authenticated-proxy operation remain deployment responsibilities.

Legacy flat request compatibility is **not execution-Permit eligible**. `Router.AuthorizeTrustedAction` requires structured principal, Agent/workload, delegated authority, tool, and action context even when an intake successfully authenticated and sealed the request. `allow_legacy_flat_requests` only preserves deprecated Policy/compatibility interpretation outside execution-Permit issuance; it never authorizes identity degradation into `user_id`, `agent_id`, or `token_scopes`, and it cannot produce an executable Permit.

## API direction

Focused APIs:

- `POST /api/actions/authorize` — authorize a normalized action; success returns a decision and a permit object containing `permit_id`, `permit_token`, and `expires_at`;
- `POST /api/permits/verify` — verify and atomically consume a Permit at a trusted execution boundary;
- `POST /api/permits/{id}/revoke` — revoke an unconsumed permit;
- `GET /api/permits` and `GET /api/permits/{id}` — return safe metadata only;
- `GET /api/decisions` and `GET /api/audits` — read authorization decisions and audit receipts.

The MCP adapter directly reuses the same verifier. Every HTTP authorization endpoint first crosses `TrustedAuthorizationIntake` and the Router still accepts execution authorization only through sealed `intake.Authorization`; it has no normal Permit-issuance method that accepts a naked `models.Request`. Process locality alone is not identity provenance. `POST /api/permits/verify` is for trusted, controlled integrations and is not network identity authentication. `/api/authorize`, `/api/runtime-events`, and `/api/route` remain temporarily as compatibility endpoints; compatibility authorization also crosses the selected intake.

## UI

Primary navigation is limited to `Decisions / Permits / Audit / Demo`:

- the home view shows `AUTHORIZED`, `DENIED`, `PERMIT VIOLATIONS`, and `REPLAY BLOCKS`;
- permit details show `permit_id`, `signing_key_id`, state, principal, Agent/workload, tool, capability, resource, operation, `action_digest`, policy version, issued/expires/consumed time, and verification result;
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

Open [http://localhost:8080](http://localhost:8080). This runs server-owned Demos, while HTTP authorization fails closed in RejectAll mode. Add `--allow-development-intake` only for local API/MCP development, or configure both trusted-proxy flags behind a separately authenticated proxy. The two modes cannot coexist. You may also run `docker compose up --build`. For MCP enforcement, also add `--mcp-upstream <absolute-http(s)-url>` and follow the [pilot protocol](docs/experiments/enterprise-agent-pilot.md) with a harmless controlled upstream first. Do not connect production tools or credentials directly.

## Audit and evidence truth

Each action produces an explainable, redacted receipt read as `TRUST CONTEXT → ACTION → POLICY → OBLIGATIONS → PERMIT → VERIFICATION → EXECUTION`; execution states whether upstream was attempted and whether it completed, failed, or terminated. Risk/detection appear only under `ADVISORY SIGNALS`, not as authorization reasons. Audit still excludes tokens, raw arguments, and secrets.

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
docker build .
```

The frontend source is `web/src/app.ts`; the generated `web/static/app.js` is committed too. If the environment lacks the race-detector toolchain, report that limitation exactly instead of claiming it passed.

## Security boundaries

- Aegis protects only actions that actually cross its verifier/MCP boundary; bypassed calls are not automatically discovered or blocked;
- an in-process PermitStore, default ephemeral key, and local audit are not production-grade high availability, tamper resistance, persistent key lifecycle, or cross-instance replay defense;
- MCP adapter identity, upstream transport, and deployment topology still need a separate threat model and security review;
- Aegis does not provide real isolation, EDR sensors, full IAM, SSO, RBAC, or multi-tenancy;
- do not use production credentials, customer data, or uncontrolled Internet targets before independent review and a formally authorized pilot.

## License

[MIT](LICENSE)
