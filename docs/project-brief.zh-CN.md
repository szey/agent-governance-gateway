# Aegis Router 项目说明

[English](project-brief.md) | 简体中文

> **AI Agent 动作的执行许可**

## 一句话定位

Aegis Router 是不绑定 Agent 框架的 execution-permit 层：它授权精确的规范动作，签发短时、签名、动作绑定、单次使用的许可，并要求 MCP 执行边界在真实副作用前验证和消费许可。

> **获得授权的动作，必须与实际执行的动作完全一致。**

## 产品边界

Aegis 只聚焦一个 reference-monitor primitive，而不是广义 AI Agent 安全平台。

核心模块只有：

1. Action normalization；
2. Deterministic authorization；
3. Execution Permit issuance；
4. Permit verification；
5. Permit consumption / replay prevention；
6. Audit receipt；
7. 一个真实执行边界：MCP。

Aegis 不做通用权限管理、endpoint sandbox、workspace isolation、企业 Agent Inventory、Shadow Agent 治理、完整 IAM、EDR 式观察或泛风险仪表板。它也不实现 HTTP、A2A、数据库、Shell 或云端 Adapter。

## 安全属性与执行顺序

```text
Agent proposes action
    ↓
Normalize CanonicalAction
    ↓
Deterministic policy authorization
    ↓
Issue signed Execution Permit
    ↓
Executor/MCP boundary verifies and atomically consumes Permit
    ↓
Execute exactly the authorized action
    ↓
Write redacted Audit Receipt
```

授权和验证必须使用相同的 canonicalizer。事后收到 RuntimeEvent 不能替代执行前检查；如果 Permit 验证失败，上游工具调用次数必须为零。

## CanonicalAction

规范动作绑定：principal ID、Agent ID、workload ID、delegated-authority fingerprint、tool、capability、resource、operation 与安全相关 arguments。

Arguments 使用确定性 canonical JSON：空参数变为 `{}`；对象键递归按 Unicode 字典序排列；重复键、畸形 UTF-8 和未配对 surrogate 拒绝；数组保持顺序；字符串按 JSON 规则转义；数字不经浮点转换而精确归一化。完整规范动作以 SHA-256 得到 `sha256:<64 位小写十六进制>` 摘要。

这保证等价 JSON 对象不受键顺序影响，但金额、收款人、资源、工具、操作、身份或其他受绑定字段的改变都会产生不同摘要。审计保留摘要，不保留原始敏感参数。

## AuthorizationEnvelope 与签名 Permit

原有结构化 `AuthorizationEnvelope` 被保留。它继续表达 request、principal、Agent/workload、delegation、tool、resource、operation、policy 和 obligations；同时签发方生成可验证的 `permit_token`。

Permit claims 至少包含：

- `jti/permit_id` 与 `request_id`；
- `issuer`、`principal_id`、`agent_id`、`workload_id`；
- delegated authority digest/fingerprint；
- `tool`、`capability`、`resource`、`operation`；
- `action_digest` 与 `policy_version`；
- `issued_at`、`expires_at`、`single_use=true`。

MVP token 是项目自有的 Ed25519 签名紧凑格式：`base64url(header).base64url(payload).base64url(signature)`，Header 为 `alg=EdDSA`、`typ=AEGIS-PERMIT`、`v=1`。它借用 JWS 形态，但不声称通用 JWT/JWS 互操作。

TTL 以整秒表示，默认 30 秒，当前最大 15 分钟。

`permit_id` 是审计关联 ID；`permit_token` 是秘密执行凭据。列表、详情、日志和 UI 只能展示前者。

## Verifier 与 PermitStore

Verifier 在副作用前检查签名、issuer、时间、Permit ID、主体、Agent/workload、工具、资源、操作和动作摘要。只接受 `VERIFIED`。

并发安全的 PermitStore 维护 `ISSUED / CONSUMED / EXPIRED / REVOKED`。验证成功与消费是一个原子动作；两个并发请求复用同一 Permit 时，只能一个成功，另一个明确返回 replay。状态仅在单进程内时，不提供跨重启/跨副本 replay 保证。

## MCP Adapter

MCP 是 focused MVP 唯一的生产形态 Adapter。它把 `tools/call` 与受信任的主体/工作负载/资源元数据规范化，获取或接收 Permit，在转发上游前调用同一 verifier，并只记录响应状态、耗时等必要结果元数据。

Adapter 不能在验证失败时“先调用、后告警”，也不能仅凭 `permit_id` 转发。上游 MCP 的 TLS、认证、工具副作用和部署绕过仍由部署方独立处理。

当前 Adapter 对 MCP `2026-07-28` 校验 `MCP-Protocol-Version`、`Mcp-Method`、`Mcp-Name` 与 JSON-RPC 正文的一致性；拒绝重复 JSON key 与未绑定的 Tool `_meta`；剥离任意 Header/Session 上下文后再重建最小传输/路由 Header。它只实现 HTTP `POST` 的 `server/discover`、`tools/list` 与 permit-gated `tools/call` focused subset；MRTR 字段和 Schema 驱动的 `Mcp-Param-*` 暂时 fail closed，不声明完整协议 conformance。

## Policy、Risk 与 obligations

Policy 仍使用结构化 Request context 进行确定性授权。概念结果为 `AUTHORIZED / DENIED / REQUIRES_APPROVAL`。

Risk 保留为可选咨询元数据，只能辅助产生 `human_approval_required`、`isolation_required`、`enhanced_audit_required` 等 obligations。它不能将未授权动作变成授权动作，也不需要扩展成大型评分系统。

`isolation_required: true` 由外部 executor 履行。Aegis 不实现 sandbox backend，focused MCP Proxy 在仍需要隔离或人工批准时不会转发。Read-only 与 network-egress obligations 仍需要可信外部 executor/control 落实上游 Tool 的真实行为；兼容字段中的 `RESTRICT/SANDBOX` 只是 execution profile hint。

## Audit Receipt 与 Runtime Evidence

每次动作生成可解释 receipt：request/decision/permit ID、principal、Agent、tool、resource、operation、action digest、policy version、authorization decision、Permit state、verification outcome、timestamp 和 evidence source。

Authorization status 使用 `AUTHORIZED / DENIED / REQUIRES_APPROVAL`；当前执行 final verdict 包括 `EXECUTED_WITH_VALID_PERMIT`、`PERMIT_ACTION_MISMATCH`、`PERMIT_EXPIRED`、`PERMIT_REPLAY`、`PERMIT_INVALID_SIGNATURE`、`PERMIT_REVOKED` 与 `EXECUTION_OBLIGATION_UNSATISFIED`，receipt 内同时保留 verifier 的精确 outcome 和 execution outcome。

RuntimeEvent 与来源/信任模型继续保留，但属于执行中/执行后的辅助证据。`agent_self_reported`、`instrumented_adapter` 与 `simulated_demo` 不能冒充独立 Sensor；未接入覆盖保持 `UNKNOWN`。

## API 与 UI

主 API 是 `POST /api/actions/authorize`、`POST /api/permits/verify`、Permit revoke/list/detail、`GET /api/decisions` 与 `GET /api/audits`。Verifier 作为可信执行边界库被 MCP Adapter 复用。授权入口目前信任调用方提供的结构化身份/委托元数据，公开 verify 入口只适合受控集成；两者都不提供网络身份认证。旧 `/api/authorize`、`/api/route`、`/api/runtime-events` 暂时兼容并清楚标注。

UI 只保留 `Decisions / Permits / Audit / Demo` 主导航。Permit 详情显示 `permit_id`、state、principal、Agent/workload、tool、capability、resource、operation、action digest、policy version、issued/expires/consumed time 与最近验证结果，永不显示 token、签名密钥、raw delegated credential 或原始敏感参数。

四个主 Demo 是 valid、action mutation/TOCTOU、replay 与 expired Permit；历史场景降为 advanced regression fixtures，并继续标记 `simulated_demo`。

## 实验性 Discovery

现有 Discovery/Registry 代码保持可构建，但冻结开发、默认关闭，并在普通 UI 中隐藏。只有 `--enable-experimental-inventory` 才暴露相关 Server 能力；`cmd/discover` 保持独立实验工具。

不增加进程、OAuth、CI/CD、云端或中央企业 Inventory。发现痕迹不能证明 Agent 正在运行，也不影响某次执行许可。

## 完成定义与限制

Focused MVP 完成时必须能重复证明：精确动作被授权并获签名 Permit；MCP 边界在上游调用前验证和消费；任何受绑定字段变化都阻断；消费后不能 replay；全链路审计不泄漏 token 或敏感 payload。

即使全部本地测试通过，这仍是参考实现。单进程 Store、开发密钥、本地审计、未认证的部署边界与未完成的独立评审，均不构成生产保证。
