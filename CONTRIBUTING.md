# Contributing

English | [简体中文](CONTRIBUTING.zh-CN.md)

Thanks for helping make Agent Governance Gateway more useful and easier to verify.

## Development workflow

1. Open an issue describing the security property, bug, or feature before a large change.
2. Keep policy decisions deterministic and explainable.
3. Add or update tests for every new route, rule, or runtime signal.
4. Run `gofmt`, `go vet ./...`, `go test -race ./...`, `npm run check:web`, and `npm run build:web`.
5. In the pull request, describe the threat or failure mode the change addresses.

Avoid adding model-based classification to the trusted policy path unless it is optional and cannot override deterministic denials. Unknown identities, capabilities, resources, and scopes must continue to fail closed.

Discovery scanners must be read-only, explicitly scoped, evidence-producing, and conservative about sensitive data. Every new signature needs positive, negative, skip-directory, and false-positive tests. Never store source-file contents or unredacted secrets in inventory records.

Frontend source lives in `web/src/app.ts`; TypeScript and esbuild produce `web/static/app.js`. Commit both source and generated output after UI changes so a low-footprint target with only Go can still build or run the embedded interface from the repository.

## Documentation languages

Every explanatory Markdown document must have an English and Simplified Chinese pair. The Chinese document is the working source for product edits: when its meaning changes, update the English pair in the same pull request. Keep code identifiers, status labels, security boundaries, dates, source links, and capability claims equivalent across both versions; translation must not make a planned feature appear implemented.

Research-driven changes should use `$research-to-product` and follow [`.codex/research-to-product.json`](.codex/research-to-product.json). Keep source authority separate from project validation; a `V0/V1` recommendation cannot skip the synthetic fixture/experiment gate and become an implemented claim.

## Commit scope

Prefer small commits that each preserve a runnable server and passing tests. Never include credentials, production audit records, or sensitive request data in examples or fixtures.
