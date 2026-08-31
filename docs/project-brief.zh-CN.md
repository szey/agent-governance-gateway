# Agent Governance Gateway 项目说明

[English](project-brief.md) | 简体中文

## 一句话定位

**Agent Governance Gateway 是一个面向 AI Agent 的零信任安全控制面：在 Agent 的高风险动作执行前进行策略判断和分级路由，在执行中观察行为偏移，并生成可审计的决策链路。**

英文副标题固定为：

> 发现 Shadow Agent，治理工具动作，审计因果行为

## 它解决什么问题

Agent 获得文件、Shell、数据库、网络和业务 API 等工具后，真正的风险不只来自 Prompt 内容，而来自它最终执行了什么动作：

- Agent 是否在代表正确的用户行动；
- 委托给 Agent 的 token scope 是否覆盖当前能力；
- Agent 是否越权触碰敏感资源；
- 只读计划是否在执行时变成写入或提权动作；
- 实际工具调用链是否偏离声明的计划；
- 安全决策和执行过程是否能被审计与复盘。

Agent Governance Gateway 位于 Agent 与执行目标之间，将这些问题收敛成一个可执行的控制点。

## 企业版必须增加发现平面

原来的 MVP 只解决“经过 Agent Governance Gateway 的 Agent 请求如何治理”。它无法看到绕过 Router 的 Agent，因此不能直接发现企业内部未报备的 Shadow Agent。

企业目标架构拆成两个平面：

1. **Discovery / Visibility Plane**：从配置、进程、代码仓库、网络出口、API 网关、OAuth/IdP 和 CI/CD 日志收集证据，建立 Agent 资产清单并与批准清单核对；
2. **Enforcement / Execution Plane**：对已经进入控制点的请求执行身份校验、权限判断、风险分流、行为观察和审计。

“发现”与“阻止”不能混为一谈。被动网络或日志传感器可以发现可疑行为，但只有当请求经过出口代理、API 网关、服务网格、端点控制或 Agent Governance Gateway 时，系统才可能在执行前阻止它。

## 两个关键设计取舍

### 1. 不使用“MoE 推理网关”作为定位

MoE 通常指模型内部的专家网络和 token-level routing。本项目做的是模型外部的 request-level 安全控制、权限治理和执行分流。如果继续使用 MoE，容易让工程师误以为这是模型推理架构。

因此项目统一使用以下术语：

- policy-driven；
- zero-trust；
- capability-based；
- secure dispatch；
- sandbox isolation；
- runtime observation；
- audit trail。

### 2. 意图识别只是辅助信号

危险请求常常会伪装成“调试配置”“验证连接”或“整理文件”等正常任务。系统不能只判断 Prompt 看起来想做什么，而应该以更硬的事实作为主判断：

1. 谁在行动：human user、agent identity、delegated authority；
2. 申请什么能力：read、write、exec、network、database；
3. 访问什么资源：普通文件、受保护配置、财务数据、密钥；
4. token scope 是否足够；
5. 实际动作是否偏离计划。

## 当前 MVP

仓库已经实现一个可运行的最小闭环：

```text
Request
  → Identity / scope check
  → Capability and resource policy
  → Explainable risk scoring
  → Session causality / provenance / sequence detection
  → Allow / Restrict / Sandbox / Deny / Escalate
  → Planned vs observed behavior comparison
  → JSONL audit record
```

当前策略判断、风险评分、路由结果、行为对比和审计落盘都是真实执行的。为了不让演示程序直接获得宿主机高权限，executor 的具体动作由 `simulated_actions` 安全模拟；当前的 `sandbox` 表示路由决策，还不是已经接入 Docker、gVisor 或 Firecracker 的强隔离环境。

Router 还实现了会话内的确定性安全检测：输入来源与风险信号、工具身份与 Schema 哈希、父事件链、受保护 open/read 元数据、隐私预算、累计风险，以及“敏感读取 → 外部发送”和“污染输入 → 副作用工具”两类序列阻断。状态目前保存在单个 Router 进程内；它只能判断经过 Router 或 Adapter 上报的事件，不能替代 OS/EDR/网络传感器。

当前还实现了第一阶段 Shadow Agent Discovery：

- 对明确指定目录做只读配置与依赖扫描；
- 为发现结果记录证据来源、判断依据和置信度；
- 按项目和 Agent 类型生成指纹并合并证据；
- 与批准清单核对，标记 `registered` 或 `shadow`；
- 对未知负责人、MCP 能力和高置信证据进行可解释风险评分。

实时进程、网络、OAuth 和云审计传感器尚未实现。

仓库还加入了实验性 `cmd/observe` 会话观察器，用于包裹公司批准的 CLI Agent：Agent Governance Gateway 独立记录子进程生命周期，将 Agent 输出的 JSONL 标为自报证据，只保存事件分类与载荷哈希，不默认保存命令、Prompt 和输出正文。普通 CLI Agent 即使没有 JSONL 也能记录 wrapper 生命周期，但无法识别输出语义；GUI、IDE 插件和后台 Agent 仍需要后续 OS/网络传感器。完整协议见 [`experiments/enterprise-agent-pilot.zh-CN.md`](experiments/enterprise-agent-pilot.zh-CN.md)。

## 六个演示场景

### 正常代码请求

- `coder-agent` 持有 `code.read`；
- 申请 `generate_code`；
- 目标是低敏感度 `public_workspace`；
- 结果：`allow → normal-executor`。

### 越权财务访问

- `coder-agent` 尝试访问 `finance_data`；
- 资源被该 Agent 的策略明确拒绝；
- 委托 token 也没有 `finance.read`；
- 结果：`deny → no execution`。

### 调试过程发生行为偏移

- 请求表面是读取受保护配置；
- 高敏感度资源使请求进入 `sandbox`；
- 声明计划只有 `read_config`；
- 执行中出现 `read_secret` 和 `invoke_admin_tool`；
- 结果：`sandbox → suspicious_behavior`，计划外动作写入审计记录。

### 间接 Prompt Injection

- 不可信检索输入带有 `instruction_like_content` 和 `tool_directive` 风险信号；
- 工具身份与 Schema 哈希进入审计；
- 在执行有副作用的命令前命中确定性规则；
- 结果：`deny → blocked`。

### 受保护文件读取

- 只记录 `operation`、`path_class`、敏感度和字节数；
- 不记录完整路径或文件内容；
- 会话隐私预算扣减；
- 结果：`sandbox`，并生成 `data.sensitive_read_observed` 发现。

### 敏感读取后外发

- 外部请求引用受保护读取父事件；
- 单次读取和单次网络请求可能各自合理；
- 会话序列命中 `sequence.sensitive_read_then_egress`；
- 结果：`deny → blocked`。

## GitHub 展示重点

项目首页应该优先展示以下内容：

1. “不是 Prompt 过滤器，而是动作控制面”的定位；
2. 一张从身份、策略、风险到观察与审计的决策流程图；
3. 六个可重复的演示场景，包括间接注入和跨工具外泄；
4. 行为偏移场景的控制台截图或短 GIF；
5. 对当前安全边界的诚实说明；
6. 从模拟 executor 到真实 Docker sandbox 的路线图。

## 下一阶段建议

优先级从高到低：

1. 先在获得公司批准的低配置端点和隔离 fixture 中，使用公司真实 Agent 完成受控审计试点；
2. 增加跨平台进程/文件扫描器和企业遥测接入契约，用独立证据佐证 Agent 自报事件；
3. 持久化已经实现的会话因果状态，并把 Agent 实例与完整委托链接入企业身份；
4. 定义 executor adapter 接口，接入第一个真实 Docker sandbox；
5. 为 `escalate` 增加人工批准与一次性授权；
6. 为审计记录增加哈希链，把现有 Schema 哈希比较接入签名工具注册表；
7. 再考虑网络策略、OpenTelemetry、gVisor、Firecracker 或 eBPF 观测。

这个顺序能让项目从“完整、安全的演示闭环”逐步成长为真正的 Agent 安全基础设施，而不会在第一版就被复杂隔离技术拖垮。
