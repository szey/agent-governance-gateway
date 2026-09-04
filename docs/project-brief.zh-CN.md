# Aegis Router 项目说明

[English](project-brief.md) | 简体中文

> **A Policy-Driven Security Router for AI Agents**

## 一句话定位

Aegis Router 是位于 AI Agent 与工具/资源之间的零信任安全控制面：执行前逐次验证身份、委托、能力、工具、资源、操作与约束，签发明确的执行许可，并在执行中将有来源标记的事件与许可边界核对。

仓库暂时保留 `agent-governance-gateway` 名称；产品品牌使用 **Aegis Router**。

## 核心安全原则

> **批准一个 Agent 存在，不等于批准它的行为。**

资产登记与行为授权是两个不同控制：

- 资产登记回答：“这个工作负载能否参与受治理环境，负责人是谁？”
- 逐次授权回答：“这个工作负载此刻能否代表这个主体，凭这份委托，用这个工具，对这个资源执行这个操作？”

即使 WorkBuddy、Codex 或其他 Agent 已登记，每一次进入 Aegis Router 的工具调用和资源访问仍要独立授权并审计。登记状态不能绕过策略。

## 产品边界

本项目的中心是 Runtime Gateway / Enforcement，第二层是 Runtime Observation + Audit，Agent Inventory / Discovery 仅为可选的辅助可见性模块。目标权重约为 60% / 25% / 15%。

Aegis Router 不定位为：

- EDR 或通用终端监控产品；
- 主要依赖文件扫描的 Shadow Agent 清单；
- Prompt 意图分类器；
- 只靠数值风险分数授权的网关；
- 已具备真实隔离的沙箱；
- MCP-only 防火墙或完整企业 RBAC 平台。

## 请求和授权模型

一个请求代表一次动作，而不是一个 Agent 的永久权限：

| 上下文 | 关键字段 | 安全含义 |
|---|---|---|
| `PrincipalContext` | principal ID/type、tenant/environment | 谁承担这次动作的主体责任 |
| `AgentIdentity` | agent/workload ID、owner、environment、framework/version | 哪个工作负载实际行动 |
| `DelegatedAuthority` | credential fingerprint、issuer、subject、scopes、expiry | 主体委托了什么；绝不存 raw bearer token |
| `ToolContext` | tool ID/name、provider、schema hash | 通过哪个工具能力发起 |
| `ActionRequest` | capability、operation、resource、side effect、destination | 这一次具体想做什么 |

`claimed_intent` 可以作为调查上下文或风险信号，但不是主要授权输入。策略使用可验证字段：身份 + 委托 + 能力 + 工具 + 资源 + 操作 + 约束。

策略至少需要表达：工作负载身份、能力、允许工具、资源授权、资源上的允许操作、所需委托 Scope、网络出口、秘密访问和副作用约束。未知身份、能力、工具、资源或操作必须 fail closed。

## Policy、Risk 与 Dispatch

三者必须分离：

1. **Policy Decision** 先回答动作是否获得授权；明确未授权一律 `DENY`。
2. **Risk Assessment** 再评估已经获得授权的动作有多危险或不确定。
3. **Dispatch Decision** 根据策略和风险选择 `ALLOW / RESTRICT / SANDBOX / DENY / ESCALATE`。

例如：未授权财务读取无论风险分数多少都必须拒绝；已获准的高敏感配置读取可以因风险被送入 `RESTRICT` 或 `SANDBOX ROUTE`。

## AuthorizationEnvelope（Execution Permit）：真正的运行时边界

可执行结果会签发绑定 request、principal 和 Agent 且有时效的 `AuthorizationEnvelope`；API 字段为 `authorization_envelope`，标识为 `permit_id`。其中记录：

- 本次允许的 capability、tool、resource 和 operations；
- `network_egress`、`secret_access`、`write_access`；
- 可选的 `max_bytes`、`max_duration` 和 `executor_profile`；
- `permit_id`、`issued_at`、`expires_at`。

Agent 的声明计划不等于安全边界。运行时事件应与执行许可比较：许可内事件通过；越权读密钥、只读许可下写入、禁网许可下外发、过期许可或身份绑定不匹配都应产生明确的违规/拒绝结论。

## 运行时证据与审计

正常请求 API 不接受“模拟动作”并把它们包装成真实观察。运行时事件必须来自明确入口，并携带 `request_id / permit_id`、session、capability、tool、operation、resource/destination class、source、trust level 和 timestamp。

信任来源至少区分：

- `gateway_enforced`；
- `instrumented_adapter`；
- `agent_self_reported`；
- `os_sensor` / `network_sensor`（仅实际连接后）；
- `simulated_demo`。

审计链应保存请求安全上下文、策略结果、风险评估、分流、执行许可、运行时证据来源、事件、越界项、最终结论、耗时和因果/会话关系，但不保存 raw Token、秘密值、检索正文或完整本地路径。

## Demo Lab

六个 synthetic 场景被保留为明确标识的 Demo Lab 和安全回归。核心三项是：

1. **Safe code request**：合法身份、委托、能力、工具、资源与操作 → `ALLOW` + Permit → Demo 事件保持在许可内。
2. **Unauthorized finance access**：coder Agent 只有 code Scope，却请求 `finance.read` → 执行前 `DENY` → 无 Permit、无 executor。
3. **Authorization-boundary violation**：只签发 `config.read` 许可，服务端 Demo 夹具随后提交 `config.read` 和 `secret.read` → 后者超出许可 → `AUTHORIZATION_BOUNDARY_VIOLATION`。

间接 Prompt Injection、受保护文件读取、敏感读取后外发继续作为回归，但所有合成事件必须标记为 `simulated_demo`，不能展示成生产环境的“Observed”。

## Agent Inventory / Discovery

发现代码保留，但降级为辅助模块：

- Registered Agent：登记的工作负载资产；
- Shadow workload：有部署证据但未匹配登记的工作负载；
- Discovery evidence：配置、依赖、进程或其他信号；
- Available integration：marketplace/catalog/cache 中可获得但未证明部署的组件。

依赖中出现 `autogen`、`@openai/agents` 或 MCP manifest 只是证据，不是 Agent 身份。发现置信度和部署状态属于 Inventory；运行时风险只属于具体动作或会话。

## 真实能力与限制

当前 MVP 能对进入控制点的结构化动作执行确定性授权、签发 Permit、接收带来源标签的事件、核对边界并写入本地审计。Demo Lab 使用服务端拥有的无害事件夹具，并经过相同的许可核对流程；它不是真实执行器。

当前 MVP 不能：

- 自动观察或阻止绕过 Router/Adapter 的 Agent；
- 独立看到所有 OS 文件、进程、系统调用或网络活动；
- 将 `SANDBOX` 分流变成真实 Docker/gVisor/Firecracker 隔离；
- 保证 Agent 自报事件完整可信；
- 提供生产级身份认证、RBAC、多租户、中央持久化或防篡改审计。

Coverage 未接入就是 `UNKNOWN / not instrumented`，不能写成“0 个缺口”。公司环境更真实，但不会自动消除这些盲点。

## 下一阶段顺序

1. 用自动化测试固定身份、委托、工具、资源操作和 Permit 语义；
2. 完成 Runtime Event API、过期/错绑/越界负向测试和最终结论；
3. 将第一个真实 MCP/HTTP/工具 Adapter 接入控制点；
4. 在重新授权的 synthetic 企业试点中验证证据、性能和隐私；
5. 接入独立 OS/网络传感器并清楚标记覆盖；
6. 再评估真实隔离后端、Permit 撤销、企业认证和防篡改审计。

这条路线优先证明一件事：一个 Agent 动作在执行前获得精确授权，执行中不能越过该授权，并能留下不夸大的可审计证据。
