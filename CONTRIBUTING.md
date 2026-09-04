# Contributing

English | [简体中文](CONTRIBUTING.zh-CN.md)

Thank you for improving **Aegis Router — A Policy-Driven Security Router for AI Agents**. The repository remains named `agent-governance-gateway` for now.

## Preserve the product center

New work should primarily strengthen the per-action chain:

```text
Identity → Policy → Risk → Dispatch → Authorization Envelope / Permit → Runtime Events → Audit
```

Discovery supports Inventory. Unless a change specifically targets asset visibility, filesystem scans, marketplace/cache matches, and Shadow counts should not dominate the home page or core narrative.

## Security invariants

Every pull request must preserve these rules:

- Asset registration grants no behavioral permission; every action entering the control point is authorized and audited.
- Policy decides authorization first; Risk only affects dispatch for authorized actions.
- Unknown identities, Agents, delegations, capabilities, tools, resources, or operations fail closed.
- `claimed_intent` and an Agent's self-declared plan are not the authorization boundary.
- Only `ALLOW / RESTRICT / SANDBOX` can issue a correctly bound, time-limited permit.
- `DENY / ESCALATE` never produce an executable permit.
- Runtime events bind to a request/permit and retain source/trust.
- Expired, mismatched, or out-of-permit events are rejected or produce an explicit violation.
- Never retain raw bearer tokens, secret values, prompt/document contents, or full personal paths.
- Never collapse `simulated_demo`, `agent_self_reported`, and independent sensor evidence into an unlabeled “Observed” state.
- Unconnected coverage remains `UNKNOWN / not instrumented`.
- Without a connected isolation backend, `SANDBOX` is only a `SANDBOX ROUTE`.

A probabilistic model may be advisory, but must not override deterministic denial rules.

## Development workflow

1. State a falsifiable security property and failure mode in the issue/PR.
2. Prefer a safe synthetic fixture that reproduces the baseline failure.
3. Implement the smallest deterministic control with positive and negative tests.
4. Check false denial, latency, privacy, storage, and operator burden.
5. Synchronize capability/limitation tables, the research register, and both languages.
6. Report actual results; never turn local success into a production guarantee.

Authorization changes should cover unknown Agent, missing scope, ungranted capability, disallowed tool, disallowed resource operation, safe permit issuance, authorized high-risk dispatch, in-permit event, secret/write/egress violation, expired permit, wrong binding, and Demo source labeling.

## Frontend and API

Frontend source lives in `web/src/app.ts`; TypeScript and esbuild generate `web/static/app.js`. Commit source and built output together so low-spec runtime hosts do not need Node.js for the embedded UI.

API changes should preserve the separation between pre-execution authorization, runtime evidence, and completion. A compatibility endpoint must not present client-provided action arrays as independently observed behavior. Every new event source needs a documented trust meaning and blind spot.

Discovery changes must remain read-only, explicitly scoped, and explainable, with positive, negative, skipped-directory, and false-positive regressions. A dependency or manifest is evidence, not an Agent identity. Discovery confidence/risk must not be presented as runtime action risk.

## Verification

Run before submitting:

```bash
gofmt -w <changed-go-files>
go test ./...
go test -race ./...
go vet ./...
npm run check:web
npm run build:web
```

If the environment lacks the toolchain required by the race detector, report that limitation exactly; an unrun check is not a pass.

## Documentation and research rules

Chinese is the semantic working source; synchronize English in the same PR. Code identifiers, endpoints, statuses, dates, source links, and capability boundaries must match. Translation may neither strengthen nor weaken a claim.

Research-driven changes use `$research-to-product` and [`.codex/research-to-product.json`](.codex/research-to-product.json). Product-owner guidance is `S4` product evidence: it may define direction and an experiment, but a control becomes implemented only after a project-specific synthetic fixture/test reaches `V2`. Never change the contract's safety flags for development convenience.

## Commit scope

Prefer small, independent commits. Do not commit credentials, production audit, real company paths, employee activity, customer data, or raw logs exported from a company device. Company-pilot findings may return to the public repository only as sanitized conclusions or synthetic fixtures.
