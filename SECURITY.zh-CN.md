# 安全策略

[English](SECURITY.md) | 简体中文

本文适用于 **Aegis Router — AI Agent 动作的执行许可**。仓库名称暂时仍是 `agent-governance-gateway`。

## 报告漏洞

请不要在公开 Issue 中披露疑似漏洞。如果仓库已启用 GitHub Private Vulnerability Reporting，请使用该功能，并提供：受影响版本/Commit、最小安全复现、预期与实际验证结果、上游工具是否被调用、潜在影响和可行缓解措施。

在第一个正式 Tag 发布前，只支持默认分支上的最新 Commit。

## 信任边界

Aegis 是参考实现，不是经独立评审的生产安全边界。它只保护实际经过其 verifier/MCP Adapter 的工具调用；绕过该边界的行为不会因为安装 Aegis 而自动被发现或阻止。

核心控制是：确定性授权精确的 `CanonicalAction`，签发短时、动作绑定、单次使用的签名 `permit_token`，并在真实工具副作用前验证和原子消费。`permit_id` 只是关联标识，不能独立授权。验证失败后上游工具必须保持未调用。

`AuthorizationEnvelope` 继续承载结构化 principal、Agent/workload、delegation、tool、capability、resource、operation 和 policy context，但执行凭据还必须包含可验证签名与相同动作摘要。

HTTP 授权请求还必须经过 `TrustedAuthorizationIntake`。未配置 intake 时默认拒绝；可信集成负责覆盖调用方声明的 principal、Agent/workload 与 delegated authority，并在审计中记录 `authorization_context_provenance`。`Router` 不再提供接受裸 `models.Request` 的普通 Permit 签发入口；进程内调用方也必须通过 `intake.NewTrustedAuthorization(...)` 或 intake 实现建立 sealed context。同一进程并不自动等于已认证身份。`--allow-development-intake` 仅接受 loopback peer、仍将身份标记为 `development_only`，不构成生产身份认证。

## Token、密钥与 replay

聚焦 MVP 使用项目自有的 Ed25519 签名紧凑格式，形态为 `base64url(header).base64url(payload).base64url(signature)`，不声明通用 JWT/JWS 互操作性。Header 含 `kid`，只用作 KeyProvider 公钥选择器；签名验证后还必须与 claims 的 `signing_key_id` 一致。

Permit TTL 必须是整秒，默认 30 秒，当前最大 15 分钟。

- 私钥只能存在于许可签发方的获准边界，不得进入 UI、审计、错误消息或仓库；
- `KeyProvider` 提供当前签名密钥与按 `kid` 查询验证公钥的边界；默认仍是进程级临时密钥，嵌入方可注入已安全加载的持久本地密钥；
- key 文件格式、自动 rotation、HSM/KMS、跨实例信任和灾难恢复尚不属于 MVP；
- Permit 默认单次使用，并通过并发安全的 Store 原子消费；
- 过期、撤销、已消费或未知 Permit 必须 fail closed；
- 若 Store 仅在单进程内，重启/多副本会形成 replay 状态缺口；在引入共享持久化与密钥生命周期设计前不能声称提供集群级 replay defense。

Permit 在上游副作用前消费。上游失败或 timeout 不会恢复 Permit；重试必须重新授权并获取新 Permit。任何 `unconsume` 语义都会重新打开 replay/双重副作用窗口，因此 Store 接口不提供该操作。

### Exactly-once 边界

Aegis 的保证是：同一个 Execution Permit 至多成功消费一次。它防止授权凭据 replay，但不保证任意业务副作用恰好执行一次。如果付款、订单、账户变更或消息发送已经在上游完成、但响应丢失，原 Permit 仍为 `CONSUMED`。重试必须使用新授权和新 Permit，并依赖上游系统自己的业务幂等键或去重机制。Aegis 不实现业务幂等引擎。

## 动作绑定与 canonicalization

授权方和执行方必须复用同一 canonicalizer。空参数转为 `{}`；对象键递归按 Unicode 字典序排列；重复键、畸形 UTF-8 和未配对 surrogate 拒绝；数组保持原顺序；字符串采用 JSON 转义；数字不经浮点转换而精确归一化，再以 SHA-256 生成 `sha256:<64 位小写十六进制>` 摘要。

Principal、Agent/workload、delegation fingerprint、tool、capability、resource、operation 或安全相关 arguments 任一改变，都必须导致绑定校验失败。不要依赖 `claimed_intent`、自然语言计划或客户端提供的摘要来替代服务器端规范化。

## MCP 执行边界

MCP 是当前唯一的生产形态 Adapter。Adapter 只接受签名绑定 `permit_class=execution` 的 Permit，并且必须在转发上游 `tools/call` 之前验证和消费。Server-owned Demo 只能签发 `permit_class=simulation`，且只有不具备上游转发能力的独立模拟 verifier 可以接受。用途缺失、未知、不匹配或被篡改时，必须在消费前拒绝且不得调用上游；错误签名、过期、撤销、replay、wrong agent/workload/tool/resource/operation 或 action mismatch 同样不得调用上游。

在 `permit_class` 引入之前签发的 Token 会被刻意视为无效，必须重新授权和签发；不得从缺失 claim 推断为 `execution`。

MCP `2026-07-28` 的 `MCP-Protocol-Version`、`Mcp-Method`、`Mcp-Name` 与 JSON-RPC 正文必须一致；Proxy 拒绝重复 JSON key 和未绑定的 Tool `_meta`，剥离任意入站 Header/Session 上下文，并只重建最小传输信息与标准路由 Header。当前 focused subset 不缓存 Tool Schema，因此无法可靠校验 `Mcp-Param-*`，也没有把 MRTR `inputResponses`/`requestState` 纳入动作摘要；这些输入一律在上游前 fail closed。不要把这一子集描述为完整 MCP conformance。

保护只覆盖经过该 Adapter 的调用。Trusted Intake 只让身份来源显式、可拒绝和可审计，并不实现 IAM/SSO/RBAC；真实集成仍必须由已认证的中间件提供上下文。MCP 执行请求里的绑定 Header 只有在与已签名 Permit 完全匹配时才有效，本身不是身份凭据。上游 TLS/认证、transport framing、工具自身副作用、部署绕过和 confused-deputy 风险仍需要独立威胁建模。

## Policy、Risk 与隔离

Policy 授权保持确定性，并且只有 Policy 可以决定 `AUTHORIZED / DENIED / REQUIRES_APPROVAL`、Permit 是否签发以及签名 obligations。Risk score 与 detection findings 只进入 `advisory_signals`，不能覆盖拒绝、创建授权、签发 Permit 或选择 executor。只有显式的确定性 Policy/配置映射才能生成 `human_approval_required`、`isolation_required`、`enhanced_audit_required` 等义务。

Aegis 不实现沙箱。`isolation_required: true` 只要求外部 executor 提供隔离；当仍需要隔离或人工批准时，focused MCP Proxy 会以 `EXECUTION_OBLIGATION_UNSATISFIED` fail closed，而不是转发。`read_only` 与 `network_egress_denied` 仍是已签名要求，必须由另一个独立可信的 executor/control 真正落实。兼容输出中的 `SANDBOX` 也是 profile hint。不要声称 Aegis 提供 Docker、gVisor、Firecracker、文件系统或网络隔离。

## 审计与敏感数据

正常审计按信任上下文、动作、确定性 Policy、obligations、Permit、verification、execution 的顺序解释，并可保存 request/decision/permit ID、`signing_key_id`、`permit_class`、规范化身份字段、`authorization_context_provenance`、tool/resource/operation、`action_digest`、policy version、授权决定、Permit 状态、验证结果/拒绝原因、upstream 是否尝试、execution outcome、时间和 evidence source。Risk/detection 单独标为 `advisory_signals`。

调用方必须先对委托凭据做哈希再提交。Aegis 会在 Permit/审计持久化前再次哈希所声明的 64 位十六进制 fingerprint，因此即便输入形状像摘要也不会被原样保存；这层防御不会把授权 API 变成凭据认证器。

永不保存或显示：

- `permit_token` 或签名私钥；
- raw bearer/delegated token、Cookie 或秘密值；
- 原始敏感 action arguments、Prompt、检索文档、文件或工具输出正文；
- 正常运行时审计中的完整个人路径、用户名或未脱敏 URL；
- 未脱敏员工、客户或生产数据。

本地审计文件尚不等于防篡改中央审计仓。错误路径也必须经过脱敏检查，避免 Token 被异常消息或请求 dump 泄漏。

## 运行时证据与实验性 Discovery

`gateway_enforced`、`instrumented_adapter`、`agent_self_reported`、`os_sensor`、`network_sensor` 和 `simulated_demo` 必须保留各自来源/信任等级。事件 API 是辅助证据路径，不是执行前控制。未接入覆盖是 `UNKNOWN / not instrumented`，不是零风险。

Discovery 已冻结、默认关闭，并只在 `--enable-experimental-inventory` 后暴露 Server 能力。配置/依赖/manifest 只能形成启发式发现证据，不能证明运行时行为。不要扩展进程、OAuth、CI/CD、云端或中央企业 Inventory。

## 公司端点与生产禁区

公司试点必须重新获得设备负责人、IT/安全和数据负责人的书面授权，并只使用 synthetic 参数、测试凭据和批准的 MCP 上游。不得捕获其他员工行为、绕过 EDR/DLP/代理/应用白名单，或将公司日志上传到个人 GitHub 或外部 AI 服务。

在完成独立安全评审、受控 MCP 试点、持久化 replay/key 设计和正式运维方案前，不得把 Aegis 作为生产凭据或客户数据前的唯一阻断控制。详见[执行许可试点](docs/experiments/enterprise-agent-pilot.zh-CN.md)。
