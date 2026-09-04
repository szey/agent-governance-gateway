# 安全策略

[English](SECURITY.md) | 简体中文

本文适用于 **Aegis Router — A Policy-Driven Security Router for AI Agents**。仓库名称暂时仍是 `agent-governance-gateway`。

## 报告漏洞

请不要在公开 Issue 中披露疑似漏洞。如果仓库已启用 GitHub Private Vulnerability Reporting，请使用该功能，并提供：受影响版本/Commit、最小安全复现、预期与实际决定、潜在影响和可行缓解措施。

在第一个正式 Tag 发布前，只支持默认分支上的最新 Commit。

## 信任边界

Aegis Router 当前是 MVP，而不是生产安全边界。它只能控制进入其 API、Gateway 或已连接 Adapter 的动作；绕过这些控制点的 Agent 行为不会因为安装了本项目而自动被发现或阻止。

资产登记只处理工作负载准入，不能授予行为权限。逐次授权必须检查 principal、Agent/workload、委托 Scope、能力、工具、资源、操作和约束。未知上下文 fail closed；数值风险不得覆盖明确拒绝。

允许/受限/沙箱路由可产生 `AuthorizationEnvelope`（Execution Permit）。拒绝或升级不能产生可执行 Permit。运行时事件必须绑定正确且未过期的 request/permit；越权读秘密、只读许可下写入、禁网许可下外联以及主体/Agent 绑定不匹配必须被视为拒绝或授权边界违规。

## 证据可信度与覆盖

任何运行时记录都必须保留来源和信任等级：`gateway_enforced`、`instrumented_adapter`、`agent_self_reported`、`os_sensor`、`network_sensor` 或 `simulated_demo`。Demo 和 Agent 自报事件不能显示成无来源的“Observed”。

当前没有通用 OS、文件、系统调用或网络传感器。未连接的传感器必须显示 `UNKNOWN / not instrumented`，不能显示“0 个 coverage gaps”。本地 CLI wrapper 独立看到的仅是它启动的子进程生命周期；结构化 Agent 日志仍然是自报证据。

`SANDBOX` 当前是分流结果。除非已经连接并验证 Docker、gVisor、Firecracker 等隔离后端，否则 UI、API 和文档只能称为 `SANDBOX ROUTE / isolation backend not connected`，不能声称真实隔离或可靠终止。

当前公开 Runtime Event API 尚无 Adapter 身份认证或加密证明。它只校验 `source` 与 `trust_level` 的合法配对、Permit 绑定和元数据边界；因此 `instrumented_adapter` 仍是调用方声明，而不是已证明的独立事实。接入真实 Adapter 前必须增加认证、完整性和防重放机制。

Demo Lab 使用无害的服务端 synthetic event fixture，并明确标记为 `simulated_demo`；它没有启动真实执行器。演示结论证明确定性代码路径通过测试，不证明生产遥测、端点覆盖或对任意 Agent 的拦截能力。

## 敏感数据

永不保存或审计：

- raw bearer token、Cookie、私钥或秘密值；
- Prompt、检索文档、文件或工具输出正文（除非操作者明确启用本地 Demo 模式）；
- 正常运行时审计中的完整本地路径、URL 或 Windows 用户名；
- 未脱敏的员工、客户或生产数据。

委托凭据只记录稳定 fingerprint 和必要元数据。路径/URI 应转为 `USER_PROFILE / AGENT_CONFIG`、`WORKSPACE / SOURCE`、`PROTECTED_CONFIG`、`SECRET_STORE` 等类别。Inventory 所需相对证据路径必须与 Runtime Audit 分区。

本地追加式 JSONL 尚不防篡改，也不是中央审计仓。因果状态和 Permit 状态若只在单进程内存在，重启后的缺口必须被保留说明。

## 管理面与 Discovery

本地批准清单可能包含 Agent 名称、路径片段、负责人和内部批准编号，应留在获准的数据边界。专用管理 Header 只能降低浏览器误操作风险，不是身份认证、授权、CSRF 完整防护或 RBAC。Server 默认应监听 `127.0.0.1`；暴露到局域网或公网前需要单独设计认证、TLS、防重放、防火墙和访问控制。

Discovery 只能只读扫描操作者获准的明确路径。配置、依赖、marketplace/cache 或 MCP manifest 是启发式发现证据，可能误报/漏报，不证明 Agent 正在运行。Dependency presence 不能直接创建 Agent identity，discovery confidence 不能被称为 runtime risk。

## 公司端点与生产禁区

公司试点必须取得设备负责人、IT/安全和数据负责人的书面授权，并仅使用 synthetic 文件、非生产凭据和批准目标。不得扫描其他员工目录、捕获同事行为、绕过 EDR/DLP/代理/应用白名单，或将公司日志上传到个人 GitHub和外部 AI 服务。

在完成独立安全评审、真实 Adapter/执行点验证和正式试点前，不得把 Aegis Router 放在生产凭据或客户数据前充当唯一阻断控制。详见[企业 Agent 端点试点](docs/experiments/enterprise-agent-pilot.zh-CN.md)。
