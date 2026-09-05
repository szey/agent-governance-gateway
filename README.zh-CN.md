# Aegis Router

[English](README.md) | 简体中文

**AI Agent 动作的执行许可**

Aegis Router 实现一套不绑定 Agent 框架的执行许可模型，并提供一个聚焦的 MCP 执行路径。特权工具动作执行前，Aegis 根据已认证身份和精确业务语义作出确定性授权，再签发短时、动作绑定、默认单次使用的签名执行许可。执行器在真实副作用发生前验证并消费该许可。

如果 Agent 在授权后改变工具、操作、资源或安全相关参数，许可不再匹配，工具不得执行。

> **获得授权的动作，必须与实际执行的动作完全一致。**

Aegis 不是沙箱、EDR、IAM、Agent 管理平台或企业 Inventory 产品。GitHub 仓库继续使用 [`szey/agent-governance-gateway`](https://github.com/szey/agent-governance-gateway) 名称，以避免迁移；产品名称为 **Aegis Router**。

## 核心执行链

```text
已认证身份 + Agent 提议动作
  → 规范化 CanonicalAction
  → 确定性 Policy 授权
  → 签发 Execution Permit
  → MCP 执行边界验证并消费 Permit
  → 仅在 VERIFIED 后调用上游工具
  → 写入脱敏 Audit Receipt
```

`已认证身份 + 精确语义意图 + 签名单次 Permit = 密码学绑定的执行。`

安全边界位于**真实工具副作用之前**。`POST /api/runtime-events` 仍可记录执行中或执行后的证据，但事后事件不是主要阻断机制。

## 能力状态

- **已实现：**默认拒绝、本地 loopback 开发和可信反向代理三种授权入口模式；签名绑定的 `execution`/`simulation` 用途隔离；短时单次 Permit；replay protection；CanonicalAction 绑定；唯一的 `payment.send/v1` 语义配置；以及对应的聚焦 MCP HTTP `POST` 执行路径。
- **演示或实验能力：**Server-owned simulation 场景与 telemetry；冻结的 Inventory 只有显式开启才显示。
- **未实现：**审批完成流程、sandbox/EDR/IAM、业务副作用 exactly-once、更多语义配置或执行 Adapter，以及完整 MCP 协议兼容。`REQUIRES_APPROVAL` 目前只是模型/配置结果，没有受支持的审批流程可以把它转换成可执行 Permit。

## 核心对象

### CanonicalAction

授权器和执行器必须从相同字段生成相同的规范动作：

- principal identity；
- Agent 与 workload identity；
- delegated authority fingerprint；
- tool、capability、resource 与 operation；
- 安全相关 arguments。

Arguments 使用确定性 canonical JSON 表示并以 SHA-256 摘要。空参数归一化为 `{}`；对象键递归按 Unicode 字典序排列，重复键、畸形 UTF-8 和未配对 surrogate 拒绝；数组保持原顺序；数字在不转为浮点数的情况下精确归一化（例如 `100.0` 与 `1e2` 等价）。对象键顺序不影响摘要；改变金额、资源、工具、操作或其他受绑定字段会改变摘要。摘要格式为 `sha256:<64 位小写十六进制>`。正常审计只保存 `action_digest`，不保存原始敏感参数。

### Execution Permit

`AuthorizationEnvelope` 概念被保留并强化为签名执行凭据。Permit 至少绑定：

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

聚焦版 MVP 使用 Ed25519 签名的紧凑 token：`base64url(header).base64url(payload).base64url(signature)`；Header 使用 `alg=EdDSA`、`typ=AEGIS-PERMIT`、`v=1` 与 `kid=<signing_key_id>`。Header 的未验证 `kid` 只用于向 KeyProvider 选择公钥，签名验证后还必须与 claims 内的 `signing_key_id` 一致。这是项目自有的 JWS 形态，不声称具备通用 JWT/JWS 互操作性。

TTL 必须是整秒，默认 30 秒，当前最大 15 分钟。

`permit_id` 是可安全展示的关联标识；`permit_token` 才是执行凭据。ID 本身不能授权执行。签名密钥、`permit_token`、原始委托凭据和秘密参数不得进入 UI 或审计。调用方只能提交 64 位十六进制 SHA-256 凭据 fingerprint；Aegis 会把这一个已声明 fingerprint 再哈希为带算法标识的绑定值，然后才进入 CanonicalAction、Permit claims 与审计。这是纵深防御，不代表可以提交 bearer token。

签发和验签通过 `KeyProvider` 抽象获取当前签名密钥并按 `kid` 查找验证公钥。Server 当前默认生成进程级临时开发密钥；嵌入方可把已安全加载的持久本地 Ed25519 私钥交给 static provider。项目尚不提供密钥文件格式、自动轮换、KMS/HSM 或跨实例 keyring 运维。

### Verification 与 replay defense

执行边界验证签名、签发方、有效期、`permit_class`、主体/Agent/workload、工具、资源、操作、profile 版本、audience 和动作摘要，并原子消费许可。正常 `VerifyAndConsume` 与 MCP 只接受 `execution`；Server-owned Demo verifier 只接受 `simulation`，而且没有转发上游的能力。缺失、未知或不匹配的用途都会在消费前 fail closed。只有返回 `VERIFIED` 的 `execution` Permit 可以继续调用上游工具。失败结果包括无效签名、无效或错误用途、过期、撤销、错绑、动作不匹配和重放；同一许可的两个并发消费尝试最多只能有一个成功。

`permit_class` 由服务端入口决定并受签名保护，请求调用方不能指定或覆盖。引入该 claim 之前签发的旧 Token 会被视为无效，必须重新授权、重新签发；系统不会通过兼容分支把缺失用途默认解释为 `execution`。

Permit 生命周期为 `ISSUED → CONSUMED`，也可从 `ISSUED` 进入 `EXPIRED` 或 `REVOKED`。

消费点位于上游副作用之前。上游返回失败或发生 timeout 时，Permit 仍保持 `CONSUMED`，绝不恢复为 `ISSUED`；任何重试都必须重新授权并取得新的 Permit。项目不提供也不计划实现 `unconsume`。

### 单次 Permit 不等于业务副作用恰好执行一次

Aegis 保证同一个 Execution Permit **至多成功消费一次**，提供的是执行授权的 replay protection；它不保证任意上游业务操作恰好执行一次。例如，上游可能已经完成付款，但网络响应丢失，调用方只能看到 timeout。此时原 Permit 仍为 `CONSUMED`，重试必须重新授权并取得新 Permit，同时依赖付款、订单、账户变更、消息发送等上游系统自身的业务幂等键或去重机制。Aegis 不提供业务幂等引擎。

## 唯一的 MVP Adapter：MCP

聚焦版 MVP 只提供一个生产形态的执行边界：MCP 工具调用。

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

任何验证失败都必须发生在上游 `tools/call` 之前。即使动作字段完全匹配，`simulation` Token 也会在消费和上游调用之前被拒绝。此里程碑不实现 HTTP、A2A、数据库、Shell 或云策略 Adapter。

在现有 Server 上配置上游即可挂载 permit-gated `POST /mcp`。下面的 `--allow-development-intake` 只允许 loopback 请求将 body 身份作为 `development_only` 上下文，不能用于生产：

```bash
go run ./cmd/server --allow-development-intake --mcp-upstream http://127.0.0.1:3001/mcp
```

`tools/call` 使用 `Authorization: AegisPermit <permit_token>`，并传入 `X-Aegis-Principal-Id`、`X-Aegis-Agent-Id`、`X-Aegis-Workload-Id`、`X-Aegis-Capability`、`X-Aegis-Resource`、`X-Aegis-Operation`；delegation fingerprint Header 可选。Tool 名称和 arguments 直接来自 JSON-RPC `params`，避免客户端用 Header 替换它们。Proxy 会剥离执行凭据、全部 `X-Aegis-*` Header、Cookie、内容编码、Session 上下文和任意扩展 Header；只转发规范 JSON 内容协商信息，以及从已验证正文重建的 MCP 路由 Header。`initialize`、`notifications/initialized`、`ping` 和 `tools/list` 只作为兼容协议方法透传；其他未支持方法 fail closed。

对 MCP `2026-07-28` 请求，Proxy 还要求 `MCP-Protocol-Version`、`Mcp-Method`、`Mcp-Name` 与 `params._meta`/JSON-RPC 正文精确一致，并根据已验证正文重建转发 Header；重复 JSON key 会在 Permit 验证前拒绝。`tools/call` 的 `_meta` 只接受已校验的协议版本，未绑定的扩展元数据会被拒绝。当前是刻意收窄的 HTTP `POST` 子集：支持 `server/discover`、`tools/list` 和 permit-gated `tools/call`，不声称完整 MCP conformance。MRTR 的 `inputResponses`/`requestState` 与需要 Schema 感知验证的 `Mcp-Param-*` 暂未纳入 CanonicalAction，因此会 fail closed；未声明现代版本的旧 `initialize` 路径只作为兼容能力保留。

### 唯一的语义动作：`payment.send/v1`

`configs/policy.json` 是服务端拥有的映射：把 MCP Tool `payment.send` 和已配置上游 URL 绑定到 capability `payment_transfer`、resource `account-123`、operation `transfer`、profile `payment.send/v1` 与 audience `mcp://local-payment-sandbox`。客户端不能选择上游 URL；如果 `--mcp-upstream` 与配置中的 `upstream_url` 不完全一致，Server 会拒绝启动。未知 MCP Tool，以及冲突的 capability/resource/operation/profile/audience 声明，都会在消费 Permit 和调用上游之前拒绝。

支付参数只能是：

```json
{"amount_minor":100,"currency":"USD","recipient":"merchant-456"}
```

`amount_minor` 是正 JSON 整数，表示该币种的最小货币单位；示例配置中 USD 使用美分、CNY 使用分。系统不使用浮点、不做字符串转数字，也不做隐式汇率换算。零、负数、`int64` 溢出、字段缺失/类型错误、重复 key 和未知业务字段都会拒绝。配置把每个允许币种与该币种的单笔最小单位上限明确关联，并另行维护收款人 allowlist。Authorizer 与 MCP Proxy 共同使用同一个 `payment.send/v1` 解析器；Proxy 转发规范化后的三个字段，而不是调用方原始 JSON 序列化。

在仓库根目录运行授权示例：在终端 1 保持服务运行，再从终端 2 发送两个请求。

```bash
# 终端 1
go run ./cmd/server --allow-development-intake

# 终端 2
curl -sS -H "Content-Type: application/json" --data-binary @docs/examples/payment-send-valid.json http://127.0.0.1:8080/api/actions/authorize
curl -sS -H "Content-Type: application/json" --data-binary @docs/examples/payment-send-over-limit.json http://127.0.0.1:8080/api/actions/authorize
```

第一个响应是 `AUTHORIZED`，并包含绑定 `payment.send/v1` 和配置 audience 的 `execution` Permit；第二个响应是 `DENIED`，没有 Permit，并包含稳定原因 `PAYMENT_AMOUNT_EXCEEDS_LIMIT`。这些命令只使用本地开发 intake，不会连接真实支付服务商。

## Policy、Risk 与 obligations

授权保持确定性。当前可执行流程只有两个结果：

- `AUTHORIZED`；
- `DENIED`。

模型可以表达 `REQUIRES_APPROVAL`，但当前版本没有受支持的审批完成流程，因此不把它宣称为已实现能力。确定性 Policy 与 `payment.send/v1` 语义配置是仅有的授权权威，也是 Permit 是否存在的唯一决定者。Risk score 和 detection findings 只写入 `advisory_signals`，不能改变确定性结果、不能签发 Permit，也不能选择 executor。隔离、只读、禁止网络出口、人工批准和增强审计只能由确定性 Policy/配置映射为 decision/permit obligations，例如：

```json
{
  "isolation_required": true,
  "network_egress_denied": true,
  "read_only": true,
  "human_approval_required": false,
  "enhanced_audit_required": true
}
```

`isolation_required: true` 只要求外部执行环境提供隔离；Aegis 本身不实现或声称提供沙箱。因此，当 `isolation_required` 或 `human_approval_required` 仍未满足时，focused MCP Proxy 会消费并拒绝这个有效 Permit，记录 `EXECUTION_OBLIGATION_UNSATISFIED`，而且绝不调用上游。`read_only` 与 `network_egress_denied` 仍是已签名要求：参考 Proxy 会绑定被请求的 operation，但无法证明任意上游 Tool 的内部行为，部署方仍需另行提供可信 executor/control 来落实这些语义。兼容响应中的 `ALLOW / RESTRICT / SANDBOX / DENY / ESCALATE` 只代表旧版分流或 obligation/profile hint。

## 可信授权入口模式

独立 Server 只能选择一种身份来源模式：

1. **RejectAll** — 安全默认值。没有显式配置 intake 时，HTTP 授权 fail closed。
2. **LoopbackDevelopment** — 只能通过 `--allow-development-intake` 开启。它只接受 direct peer 为 loopback 的 body 身份，并记录 assurance `development_only`。
3. **TrustedProxy** — 假定 Aegis 位于另一个已完成身份认证的反向代理之后；只有 `request.RemoteAddr` 中的直接 TCP 对端属于显式配置的信任 CIDR，才接受该代理注入的身份 Header。Provenance 记录 `source=trusted_integration`、配置的 provider ID、`assurance=authenticated_context` 和服务端建立时间。

TrustedProxy 只使用以下明确 Header：`X-Aegis-Authenticated-Principal`、`X-Aegis-Agent-Id`、`X-Aegis-Workload-Id`、`X-Aegis-Delegated-Scopes`、`X-Aegis-Delegation-Fingerprint`。当前聚焦契约把认证主体表示为 `human` 类型。身份标识必须是精确的 1–128 字节 metadata identifier。Scopes 只接受一个逗号分隔 Header：逗号两侧可选 SP/HTAB 会被移除，空 scope 和重复 scope 会拒绝，接受后排序存储。Delegation fingerprint 必须恰好是 64 个十六进制 SHA-256 字符，不能是 bearer token、API key、Cookie、密码或带 `sha256:` 前缀的值。

是否信任发送方只取决于 direct peer。`X-Forwarded-For`、`Forwarded` 和 `X-Real-IP` 永远不参与信任判断。建立信任后，TrustedProxy 在 Policy、Permit 签发和审计之前，用可信 Header 身份覆盖 JSON proposal 中的 principal、Agent、workload 与 delegated authority；任何信任错误都不会降级使用 body 身份。

```bash
go run ./cmd/server \
  --trusted-proxy-cidr 127.0.0.1/32 \
  --trusted-proxy-provider-id local-auth-gateway
```

可重复传入 `--trusted-proxy-cidr`，同时允许更多 IPv4/IPv6 direct peer。CIDR 与 provider ID 必须成对配置；TrustedProxy 不能与 `--allow-development-intake` 同时启用，歧义或不完整配置会阻止 Server 启动。

**Aegis 自身不认证用户，也不验证 OAuth Token。** 它消费由另一个可信认证边界已经建立的身份。TrustedProxy 只是窄范围 provenance Adapter，不是 IAM、SSO、OAuth 或 RBAC 平台；传输保护和认证代理的安全运行仍由部署方负责。

Legacy flat request 兼容格式**没有 Execution Permit 资格**。即使 intake 已成功认证并封装请求，`Router.AuthorizeTrustedAction` 仍要求结构化 principal、Agent/workload、delegated authority、tool 与 action context。`allow_legacy_flat_requests` 只保留 Execution Permit 签发之外的废弃 Policy/兼容解释能力；它绝不允许可信身份降级成 `user_id`、`agent_id` 或 `token_scopes` 后签发可执行 Permit。

## API 方向

聚焦 API：

- `POST /api/actions/authorize` — 授权规范动作；成功时返回 decision 和含 `permit_id`、`permit_token`、`expires_at` 的 permit 对象；
- `POST /api/permits/verify` — 在可信执行边界验证并原子消费 Permit；
- `POST /api/permits/{id}/revoke` — 撤销未消费 Permit；
- `GET /api/permits`、`GET /api/permits/{id}` — 只返回安全元数据；
- `GET /api/decisions`、`GET /api/audits` — 查看授权决定和审计回执。

MCP Adapter 直接复用同一 verifier。所有 HTTP 授权入口先经过 `TrustedAuthorizationIntake`；Router 仍然只接受 sealed `intake.Authorization`，没有接受裸 `models.Request` 的普通 Permit 签发方法。同进程本身不构成身份来源。`POST /api/permits/verify` 适合可信的受控集成，不等同于跨网络身份认证。`/api/authorize`、`/api/runtime-events` 和 `/api/route` 作为兼容入口暂时保留；授权兼容入口同样经过所选 intake。

## UI

主导航只围绕 `Decisions / Permits / Audit / Demo`：

- 首页显示 `AUTHORIZED`、`DENIED`、`PERMIT VIOLATIONS` 和 `REPLAY BLOCKS`；
- Permit 详情显示 `permit_id`、`signing_key_id`、state、principal、Agent/workload、tool、capability、resource、operation、`action_digest`、policy version、issued/expires/consumed time 与 verification result；
- 页面永不显示 `permit_token`、原始 delegated credential、秘密值或原始敏感参数；
- Inventory 默认不出现在主导航。

## Demo Lab

四个主场景直接验证执行许可：

| 场景 | 预期结果 |
|---|---|
| Valid Permit | 精确动作 `VERIFIED`，上游被调用，Permit 变为 `CONSUMED` |
| Action Mutation / TOCTOU | 授权后改变参数，得到 `PERMIT_ACTION_MISMATCH`，上游不调用 |
| Permit Replay | 第一次成功，第二次得到 `PERMIT_REPLAY` |
| Expired Permit | TTL 后执行得到 `PERMIT_EXPIRED` |

历史安全场景可以作为 `Advanced regression fixtures` 保留。所有 Demo 遥测继续标为 `simulated_demo`，不能写成真实 Agent 或生产环境观察。

## 实验性 Inventory

Discovery 代码保留且可构建，但功能冻结、默认关闭，也不属于产品主叙事。只有显式启用后才暴露相关 Server API/UI：

```bash
go run ./cmd/server --enable-experimental-inventory
```

独立只读工具继续位于 `cmd/discover`。不规划进程、OAuth、CI/CD、云端或企业中央 Agent Inventory 扩展。发现证据不能证明运行时行为。

## 快速开始

需要 Go 1.26；只有修改 TypeScript 前端时才需要 Node.js。

```bash
go run ./cmd/server
```

打开 [http://localhost:8080](http://localhost:8080)。这会运行 Server-owned Demo，但 HTTP 授权入口默认处于 RejectAll、会 fail closed。仅做本地 API/MCP 开发时增加 `--allow-development-intake`；生产形态集成则放在已认证代理之后，同时配置两个 trusted-proxy 参数，两种模式不能共存。也可使用 `docker compose up --build`。需要 MCP enforcement 时，再增加 `--mcp-upstream <absolute-http(s)-url>`，并按[试点协议](docs/experiments/enterprise-agent-pilot.zh-CN.md)先连接无害的受控上游；不要直接连接生产工具或凭据。

## 审计与证据真相

每次动作形成可解释、脱敏的 receipt，按 `TRUST CONTEXT → ACTION → POLICY → OBLIGATIONS → PERMIT → VERIFICATION → EXECUTION` 理解；其中 execution 明确记录 upstream 是否尝试以及 completed/failed/terminated。Risk/detection 只位于 `ADVISORY SIGNALS`，不作为授权理由。审计仍不保存 token、原始参数或秘密。

运行时来源继续区分 `gateway_enforced`、`instrumented_adapter`、`agent_self_reported`、`os_sensor`、`network_sensor` 和 `simulated_demo`。运行时证据是辅助证据；未接入覆盖保持 `UNKNOWN / not instrumented`，且 `UNKNOWN != SAFE`、`UNKNOWN != ZERO`。

## 文档与验证

中文是语义工作源，英文在同一次变更中同步：

| 主题 | 简体中文 | English |
|---|---|---|
| 产品说明 | [中文](docs/project-brief.zh-CN.md) | [English](docs/project-brief.md) |
| MCP 执行许可试点 | [中文](docs/experiments/enterprise-agent-pilot.zh-CN.md) | [English](docs/experiments/enterprise-agent-pilot.md) |
| 调研与产品决定 | [中文](docs/research-product-mapping-iteration.zh-CN.md) | [English](docs/research-product-mapping-iteration.md) |
| 参与贡献 | [中文](CONTRIBUTING.zh-CN.md) | [English](CONTRIBUTING.md) |
| 安全策略 | [中文](SECURITY.zh-CN.md) | [English](SECURITY.md) |

```bash
npm install
npm run check:web
npm run build:web
go test ./...
go test -race ./...
go vet ./...
docker build .
```

前端源文件位于 `web/src/app.ts`，构建产物 `web/static/app.js` 一并提交。若当前环境缺少 race detector 所需工具链，必须原样报告，不能写成通过。

## 安全边界

- Aegis 只能保护实际经过其验证器/MCP 边界的动作；绕过边界的调用不会被自动发现或阻止；
- 单进程内 PermitStore、默认临时密钥和本地审计不等于生产级高可用、防篡改、持久密钥生命周期或跨实例 replay defense；
- MCP Adapter 的身份、上游传输和部署拓扑仍需要独立威胁模型与安全评审；
- Aegis 不提供实际隔离、EDR 传感器、完整 IAM、SSO、RBAC 或多租户；
- 在独立评审和正式获准试点前，不要使用生产凭据、客户数据或不受控外网目标。

## 许可证

[MIT](LICENSE)
