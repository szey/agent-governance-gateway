# 企业 Agent 端点试点

[English](enterprise-agent-pilot.md) | 简体中文

状态：**已设计，尚未执行**。目标环境是一台性能一般的公司电脑，以及公司已经允许使用的真实 Agent。执行前必须获得设备负责人、IT/安全团队和相关数据负责人的明确授权。

## 试点目标

这次试点不是监控同事，也不是扫描整个公司网络。它只验证：在一台获准的公司端点上，Agent Governance Gateway 能否以较低资源占用发现 Agent 证据、记录一次受控 Agent 会话，并形成可解释的审计链。

需要回答：

1. Agent Governance Gateway 能否在批准目录中发现该 Agent 的配置、依赖或工具痕迹；
2. Agent Governance Gateway 能否观察 Agent 进程或受控会话的开始和结束；
3. 如果 Agent 提供结构化事件，能否关联命令、工具和生命周期；
4. 如果 Agent 不提供结构化事件，Agent Governance Gateway 能看见什么、缺失什么；
5. 能否识别计划外读写、执行、联网或越界尝试；
6. 审计是否在不收集业务正文、Prompt、Token 和真实秘密的情况下仍然有用；
7. 观察器对低配置电脑的 CPU、内存和磁盘影响是否可接受。

只在控制台显示手写 JSON 不算通过。只有配置证据也只能证明“可能安装或配置过”，不能证明 Agent 已经运行。

## 授权与禁止范围

试点开始前应留下书面批准或变更单，明确：设备、操作者、Agent、测试目录、测试时段、允许收集的字段、审计保留时间和负责人。

禁止：

- 扫描未获准的员工目录、浏览器资料、邮件、聊天、客户数据或共享盘；
- 捕获其他员工的 Agent 会话或公司全网流量；
- 绕过 EDR、防病毒、代理、DLP、应用白名单或管理员策略；
- 将公司审计记录上传到个人 GitHub、个人云盘或外部 AI 服务；
- 使用生产 Token、真实密钥或客户数据制作测试样本；
- 在没有独立安全审查时把 Agent Governance Gateway 当作生产阻断设备。

如果公司政策不允许安装自编译程序，试点应停止在设计阶段，由 IT 决定批准的分发和签名方式。

## 兼容不同 Agent 的接入方式

```mermaid
flowchart TD
    A[已批准的企业 Agent] --> Q{能否由命令行启动?}
    Q -- 是 --> W[Agent Governance Gateway observe wrapper]
    Q -- 否 --> C[配置扫描 + 规划中的 OS 传感器]
    W --> S{是否输出结构化 JSONL?}
    S -- 是 --> J[规范化 Agent 自报事件]
    S -- 否 --> L[只记录 wrapper 生命周期和输出指纹]
    C --> R[发现证据]
    J --> R
    L --> R
    R --> P[会话关联、策略与审计]
```

| Agent 类型 | 当前可用方式 | 当前能证明什么 | 当前盲点 |
|---|---|---|---|
| 支持 JSONL 的 CLI Agent | `cmd/observe -- <agent> ...` | wrapper 生命周期和 Agent 自报事件 | 自报事件不等于独立系统证据 |
| 普通 CLI Agent | `cmd/observe -- <agent> ...` | 进程由 wrapper 启动、退出结果、输出行指纹 | 不知道每行语义，也看不到漏报动作 |
| GUI/IDE Agent | 限定目录的 `cmd/discover` | 配置、依赖和 MCP 痕迹 | 不能证明正在运行，当前不能捕获会话 |
| 后台服务/托管 Agent | 配置扫描；等待进程/网络/IdP 连接器 | 已部署痕迹 | 当前 MVP 无法完整观测或阻断 |

因此第一次试点要先确认公司 Agent 的启动方式和日志能力，再选择适配器。不能把 Codex 的事件字段硬套到所有 Agent。

## 证据等级

| 证据 | 信任标签 | 说明 |
|---|---|---|
| Agent Governance Gateway wrapper 记录的进程生命周期 | `observer_recorded` | Agent Governance Gateway 看到自己启动的子进程、PID 和退出结果 |
| Agent 输出或结构化日志 | `self_reported` | Agent 声称发生的事件，可能不完整 |
| OS 进程/文件传感器 | `independently_observed`（规划中） | 独立佐证进程树、文件访问和变更 |
| DNS/企业代理/网关 | `independently_observed`（规划中） | 独立佐证目标和连接元数据，受 TLS 与权限限制 |

控制台必须保留信任标签。没有独立佐证时只能显示“wrapper + Agent 自报”，不能显示“已完整验证”。

## 低配置电脑部署方式

第一轮不要求 Docker、Kubernetes、数据库或常驻服务：

1. 在开发电脑或公司批准的构建环境生成目标操作系统的三个小型二进制文件；
2. 只复制二进制、`configs/`、必要 fixture 和说明文档；
3. Server 仅监听 `127.0.0.1`，不开放局域网端口；
4. 不注册 Windows Service，不开机自启；
5. Discovery 只扫描一到两个明确批准的目录，不进行全盘扫描；
6. 审计使用 metadata-only 模式并留在公司电脑；
7. 单次试验控制在约 15 分钟，完成后停止进程。

公司电脑不需要安装 Go。可以在获准的 Windows 构建环境提前生成无 CGO 的单文件程序：

```powershell
$env:CGO_ENABLED = "0"
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-gateway.exe ./cmd/server
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-discover.exe ./cmd/discover
go build -trimpath -ldflags="-s -w" -o dist/agent-governance-observe.exe ./cmd/observe
```

传输前记录 SHA-256 并让公司验证文件来源；不要为了运行试点关闭应用白名单或 EDR。

第一轮性能验收目标，而不是已经验证的承诺：

| 指标 | 目标 |
|---|---:|
| Agent Governance Gateway 空闲平均 CPU | 小于 2% |
| 试验期间平均 CPU 增量 | 小于 5% |
| Agent Governance Gateway 进程内存 | 小于 100 MB |
| 单次试点审计文件 | 小于 50 MB |
| Agent 任务增加的中位延迟 | 小于 10% |

试点时记录实际数据。如果超出目标，先降低扫描范围、事件量和保留时间，不在公司端点上直接增加更重的传感器。

## Private Pilot 流程

### 0. GitHub 与传输边界

- GitHub 仓库保持 Private；
- 首次传入公司前运行 secret scan，并让公司确认是否允许从个人 GitHub 拉取；
- 更推荐由公司批准的内部镜像、压缩包或代码托管渠道分发；
- 公司产生的 `data/`、日志、主机名、用户名和路径不得推回个人 GitHub；
- 如需把缺陷带回开发环境，只使用脱敏后的最小复现或 synthetic fixture。

### 1. 兼容性清单

记录但不要上传敏感信息：

- 操作系统与 CPU 架构；
- 可用内存和剩余磁盘；
- Agent 名称、版本和启动方式；
- CLI、GUI、IDE 插件或后台服务；
- 是否有 JSON/JSONL 日志或插件 API；
- 是否允许普通用户运行，是否需要管理员权限；
- EDR、代理和应用白名单是否会拦截测试程序。

### 2. 无 Agent 基线

在批准目录运行只读扫描并记录 Agent Governance Gateway 的 CPU、内存、磁盘增长和扫描耗时。此时不要启动 Agent。

```powershell
agent-governance-discover.exe --path C:\Approved\AgentPilot --format json
```

路径只是示例，必须替换成公司批准的测试目录。

### 3. 受控 Agent 会话

如果 Agent 是 CLI：

```powershell
agent-governance-observe.exe `
  --audit C:\Approved\AgentPilot\data\session.jsonl `
  --session company-pilot-001 `
  -- <approved-agent-command> <approved-arguments>
```

如果 Agent 是 GUI 或 IDE 插件，不应强行套用 wrapper。第一轮只做配置发现；等进程/文件传感器实现并获得更高权限批准后，再测试运行时行为。

### 4. 安全确定性任务

| 用例 | 任务 | 预期证据 | 预期结论 |
|---|---|---|---|
| A | 读取批准 fixture 内的公开文本 | 会话或进程、只读证据 | `allowed` |
| B | 在 fixture 内创建指定文件 | 文件/工具自报事件、退出结果 | `allowed_with_audit` |
| C | 尝试访问 fixture 外的无敏感诱饵路径 | 越界尝试或系统拒绝 | `blocked`、`policy_violation` 或明确的 coverage gap |
| D | 读取含有恶意指令的 synthetic 文档 | 输入来源与后续工具/联网因果 | `blocked`、`escalate` 或明确的 coverage gap |

诱饵路径不能指向真实公司文件；联网用例只能访问公司批准的测试目标。

### 5. 审计审查

审计应回答：操作者、Agent 实例、会话、时间、证据来源、信任等级、动作类别、目标类别、结果、策略原因和 coverage gap。

默认不得保存：Prompt 正文、命令正文、文件正文、命令输出、Token、Cookie、密钥、客户数据和完整个人路径。

### 6. 回滚与清理

- 停止 Agent Governance Gateway 和 Agent 测试进程；
- 由公司负责人决定审计保留或安全删除；
- 撤销测试 Token 和临时授权；
- 移除仅为试点建立的防火墙或代理例外；
- 记录未清理项目及负责人；
- 只有脱敏结论和 synthetic 复现可以返回开发仓库。

## 通过标准

- 已取得授权且实际范围与批准范围一致；
- 目标 Agent 的接入类型和盲点已记录；
- 测试可重复，事件顺序和结论稳定；
- 不把配置发现误称为运行证据；
- 不把 Agent 自报事件误称为独立证据；
- 越界任务不接触真实敏感数据；
- 未知事件保留哈希并显示 `unparsed` 或 coverage gap；
- 页面可以回溯证据来源和策略原因；
- 性能数据达到目标，或有明确的降载改进项；
- 审计没有离开公司批准的存储边界。

## 当前实现边界

`cmd/observe` 已具备 wrapper 生命周期和 JSONL 规范化能力，但跨平台 OS 文件/进程传感器还没有实现。因此，公司真实环境会提高样本真实性，却不会自动消除产品盲点。第一次试点的价值既包括“检测到什么”，也包括精确记录“为什么没有检测到”。
