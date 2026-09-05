# Security Policy

English | [简体中文](SECURITY.zh-CN.md)

This document applies to **Aegis Router — Execution Permits for AI Agent Actions**. The repository remains named `agent-governance-gateway`.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue. If GitHub Private Vulnerability Reporting is enabled, use it and include the affected version/commit, a minimal safe reproduction, expected and actual verification results, whether the upstream tool was called, potential impact, and a feasible mitigation.

Before the first formal tag, only the latest commit on the default branch is supported.

## Trust boundary

Aegis is a reference implementation, not an independently reviewed production security boundary. It protects only tool calls that actually cross its verifier/MCP adapter. Installing Aegis does not automatically discover or block behavior that bypasses that boundary.

The core control deterministically authorizes an exact `CanonicalAction`, issues a signed, short-lived, action-bound, single-use `permit_token`, and verifies and atomically consumes it before the real tool side effect. `permit_id` is correlation only and cannot authorize by itself. The upstream tool must remain uncalled after verification failure.

`AuthorizationEnvelope` continues to carry structured principal, Agent/workload, delegation, tool, capability, resource, operation, and policy context, but an execution credential must also carry a verifiable signature and the same action digest.

HTTP authorization requests must also cross `TrustedAuthorizationIntake`. With no configured intake, authorization fails closed. A trusted integration overwrites caller-asserted principal, Agent/workload, and delegated authority, then records `authorization_context_provenance` in audit. `Router` no longer offers a normal Permit-issuance entry point that accepts a naked `models.Request`; in-process callers must also establish a sealed context through `intake.NewTrustedAuthorization(...)` or an intake implementation. Sharing a process is not authentication. `--allow-development-intake` accepts loopback peers only and still labels identity `development_only`; it is not production authentication.

## Tokens, keys, and replay

The focused MVP uses a project-specific Ed25519-signed compact format shaped as `base64url(header).base64url(payload).base64url(signature)`. It does not claim general JWT/JWS interoperability. The header carries `kid` only as a KeyProvider public-key selector; after signature verification it must match the signed `signing_key_id` claim.

Permit TTL uses whole seconds, defaults to 30 seconds, and is currently capped at 15 minutes.

- the private key stays inside the permit issuer's approved boundary and never enters UI, audit, errors, or the repository;
- `KeyProvider` supplies the current signing key and resolves verification keys by `kid`; the default remains process-local and ephemeral, while an embedding process may inject a securely loaded persistent local key;
- key-file format, automatic rotation, HSM/KMS, cross-instance trust, and disaster recovery are outside this MVP;
- permits are single-use by default and use a concurrency-safe Store for atomic consumption;
- expired, revoked, consumed, or unknown permits fail closed;
- an in-process-only Store has restart and multi-replica replay-state gaps; do not claim cluster-wide replay defense before shared persistence and key-lifecycle design exist.

The Permit is consumed before the upstream side effect. Upstream failure or timeout never restores it; a retry requires a fresh authorization and a new Permit. The Store exposes no `unconsume` operation because such semantics would reopen replay and duplicate-side-effect windows.

### Exactly-once boundary

Aegis guarantees that one Execution Permit can be successfully consumed at most once. It prevents authorization-credential replay; it does not guarantee that an arbitrary business side effect executes exactly once. If a payment, order, account change, or message send completes upstream but its response is lost, the original Permit remains `CONSUMED`. A retry requires a new authorization and new Permit and must rely on the upstream system's own business idempotency key or deduplication mechanism. Aegis does not implement a business idempotency engine.

## Action binding and canonicalization

Authorizer and executor must reuse the same canonicalizer. Empty arguments become `{}`; object keys sort recursively by Unicode lexical order; duplicate keys, malformed UTF-8, and unpaired surrogates are rejected; arrays preserve order; strings use JSON escaping; and numbers normalize exactly without float conversion before a SHA-256 `sha256:<64 lowercase hex>` digest is produced.

Any change to principal, Agent/workload, delegation fingerprint, tool, capability, resource, operation, or security-relevant arguments must fail the binding check. Do not use `claimed_intent`, a natural-language plan, or a client-provided digest as a substitute for server-side normalization.

## MCP execution boundary

MCP is the only production-shaped adapter in the current milestone. The adapter verifies and consumes a permit before forwarding an upstream `tools/call`. Invalid signature, expiry, revocation, replay, wrong agent/workload/tool/resource/operation, or action mismatch must never call the upstream.

For MCP `2026-07-28`, `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` must agree with the JSON-RPC body. The Proxy rejects duplicate JSON keys and unbound tool `_meta`, strips arbitrary inbound headers/session context, and rebuilds only minimal transport and standard routing headers. The focused subset does not cache tool schemas, so it cannot safely validate `Mcp-Param-*`, and it has not bound MRTR `inputResponses`/`requestState` into the action digest; those inputs fail closed before upstream. Do not describe this subset as full MCP conformance.

Protection covers only calls routed through this adapter. Trusted Intake makes identity provenance explicit, rejectable, and auditable; it does not implement IAM/SSO/RBAC, and a real integration must still supply context from authenticated middleware. Binding headers on an MCP execution request matter only when they exactly match a signed Permit; they are not identity credentials. Upstream TLS/authentication, transport framing, tool-side effects, deployment bypass, and confused-deputy risks still need a separate threat model.

## Policy, Risk, and isolation

Policy authorization remains deterministic, and only Policy can decide `AUTHORIZED / DENIED / REQUIRES_APPROVAL`, Permit issuance, and signed obligations. Risk scores and detection findings enter only `advisory_signals`; they cannot override denial, create a grant, issue a Permit, or select an executor. Obligations such as `human_approval_required`, `isolation_required`, or `enhanced_audit_required` require an explicit deterministic Policy/configuration mapping.

Aegis does not implement a sandbox. `isolation_required: true` asks an external executor to supply isolation; the focused MCP proxy fails closed with `EXECUTION_OBLIGATION_UNSATISFIED` instead of forwarding when isolation or human approval is still required. `read_only` and `network_egress_denied` remain signed requirements that an independently trusted executor/control must actually enforce. `SANDBOX` in compatibility output is also a profile hint. Do not claim Docker, gVisor, Firecracker, filesystem, or network isolation.

## Audit and sensitive data

Normal audit is explained in trust-context, action, deterministic-Policy, obligations, Permit, verification, and execution order. It may retain request/decision/permit IDs, `signing_key_id`, normalized identity fields, `authorization_context_provenance`, tool/resource/operation, `action_digest`, policy version, authorization decision, Permit state, verification result, whether upstream was attempted, execution outcome, timestamp, and evidence source. Risk/detection are labeled separately as `advisory_signals`.

The caller must hash delegated credentials before submission. Aegis additionally rehashes the declared 64-hex fingerprint before any Permit/audit persistence, so a digest-shaped input is not retained verbatim; this defense does not turn the authorization API into a credential authenticator.

Never retain or display:

- `permit_token` or signing private keys;
- raw bearer/delegated tokens, cookies, or secret values;
- raw sensitive action arguments, prompts, retrieved documents, files, or tool-output bodies;
- full personal paths, usernames, or unredacted URLs in normal runtime audit;
- unredacted employee, customer, or production data.

A local audit file is not a tamper-resistant central audit store. Error paths also require redaction review so exceptions and request dumps cannot leak tokens.

## Runtime evidence and experimental Discovery

`gateway_enforced`, `instrumented_adapter`, `agent_self_reported`, `os_sensor`, `network_sensor`, and `simulated_demo` retain distinct source/trust meanings. The event API is a secondary evidence path, not pre-execution control. Uninstrumented coverage is `UNKNOWN / not instrumented`, not zero risk.

Discovery is frozen, disabled by default, and exposed by the Server only with `--enable-experimental-inventory`. Configuration/dependency/manifest matches are heuristic evidence and cannot prove runtime behavior. Do not expand process, OAuth, CI/CD, cloud, or central enterprise Inventory.

## Company endpoints and production exclusions

A company pilot requires renewed written authorization from the device owner, IT/security, and data owner, and may use only synthetic arguments, test credentials, and an approved MCP upstream. Never capture coworker behavior, bypass EDR/DLP/proxy/application controls, or upload company logs to a personal GitHub account or external AI service.

Until independent review, a controlled MCP pilot, persistent replay/key design, and formal operations exist, do not use Aegis as the sole blocking control in front of production credentials or customer data. See the [execution-permit pilot](docs/experiments/enterprise-agent-pilot.md).
