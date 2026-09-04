# Aegis Router 企业 Agent 端点试点

[English](enterprise-agent-pilot.md) | 简体中文

状态：**探索性配置发现后暂停；正式受控运行时试点未完成。**

此前一次公司端点试用证明 Server 可以启动、限定目录发现可以产生证据，也暴露了无权限目录中断、marketplace/cache 噪声、网页快照不刷新和批准清单缺少入口的问题。这些反馈已用 synthetic fixture 推动本地修复，但没有证明 Aegis Router 能独立观察或阻止公司的真实 Agent 行为，也没有达到 `V3 pilot_verified`。仓库不保存原始公司日志、用户名、主机名或绝对路径。

## 试点现在要证明什么

本试点的主目标从“找到 Agent”改为验证一条受控动作链：

```text
受控 Adapter 提交 ActionRequest
  → Aegis 验证 Principal / Agent / Delegation / Tool / Resource / Operation
  → Policy Decision 与 Risk Assessment 分离
  → Dispatch Decision
  → 可执行时签发 AuthorizationEnvelope / Permit
  → Adapter 或服务端 Demo 夹具提交带来源的 RuntimeEvent
  → 事件与 Permit 核对
  → 形成可解释 Audit / Final Verdict
```

只在控制台显示手写 JSON 不算完成真实接入。只有 Adapter 真正位于 Agent 与测试工具之间时，才能验证“动作经过控制点”。配置发现只证明痕迹；Agent 自报日志只证明它声称发生过某事；两者都不等于独立端点观察。

## 必须回答的问题

1. 每个动作能否明确关联 human/service principal、Agent/workload 和 delegated authority？
2. raw bearer token 是否始终不会进入请求、日志和界面？
3. 能力、工具、资源操作和 Scope 任一不匹配时能否执行前拒绝且不签发 Permit？
4. 已批准 Agent 的未批准行为是否仍会拒绝并进入审计？
5. 高风险但已授权动作是否只改变分流，不改变授权事实？
6. 许可内事件、密钥读取、只读许可下写入、禁网许可下外联能否稳定区分？
7. 过期 Permit 和错绑 principal/Agent/request 的事件能否拒绝？
8. 页面能否区分 `instrumented_adapter`、`agent_self_reported` 与 `simulated_demo`？
9. 未连接的 filesystem/network/OS 覆盖是否显示 `UNKNOWN / not instrumented`？
10. CPU、内存、延迟、日志增长和误拒绝是否在预先约定范围？

## 已获得的探索性反馈

| 观察 | 结论 | 已采取的产品响应 |
|---|---|---|
| 健康检查成功，限定目录扫描得到 Agent/MCP 证据 | 配置发现可运行，但不是运行行为证明 | 保留证据等级和覆盖限制 |
| 扫描系统盘在无权限目录处中断 | 全盘扫描既不合规也不可靠 | 要求限定目录；拒绝访问记为 coverage gap 并继续 |
| marketplace/cache/temp 大量命中 | 可获得不等于已安装、已部署或正在运行 | 分开 available/installed/configured/observed；可用集成折叠显示 |
| CLI 新扫描未进入已运行网页 | 启动快照不符合操作流程 | 增加限定目录 rescan 和即时核对 |
| 没有可见批准清单 | Shadow 结果缺少可操作解释 | 增加本地登记工作流 |
| “已批准”被误解为“所有行为批准” | 资产准入与行为授权必须分离 | 运行时页面和文档以逐次授权为中心 |

这些是产品反馈和限定范围的系统输出，不是企业部署证明。

## 授权与禁止范围

继续试点前必须重新取得设备负责人、IT/安全和相关数据负责人的书面批准，明确设备、操作者、Agent、Adapter、测试目录、时间窗、允许字段、保留时间、目标地址、回滚方式和负责人。

禁止：

- 扫描未获准员工目录、邮件、聊天、浏览器资料、客户数据或共享盘；
- 捕获其他员工会话或公司全网流量；
- 绕过 EDR、DLP、防病毒、代理、证书策略或应用白名单；
- 使用生产 Token、真实密钥、客户数据或真实公司系统作为越界诱饵；
- 把公司日志、路径或设备标识上传到个人 GitHub、个人云盘或外部 AI 服务；
- 把 `SANDBOX ROUTE` 当作真实隔离；
- 把本项目当作生产唯一阻断点。

如果公司不允许运行自编译程序或 Adapter，试点停在设计和 Demo Lab 阶段，由 IT 决定签名与分发方式。

## 分阶段试点

### Gate 0：本地 synthetic 回归

在开发环境先让全部授权和运行时负向测试通过。至少覆盖：unknown Agent、missing Scope、ungranted capability、disallowed tool、disallowed resource operation、安全 Permit、高风险已授权分流、许可内事件、secret/write/egress 越界、expired Permit、wrong binding 和 Demo 标签。

任何用例失败都不能进入公司端点。

### Gate 1：公司端点基线

- 只绑定 `127.0.0.1`；
- 使用公司批准的源码/二进制传输方式并校验 SHA-256；
- 不启动真实 Agent，记录 Aegis 空闲 CPU、内存、磁盘和监听端口；
- Runtime Coverage 必须显示未连接的 OS/filesystem/network 传感器；
- 可选 Discovery 只扫描一到两个明确批准的 fixture 目录。

### Gate 2：instrumented synthetic executor

在公司电脑上只运行 Demo Lab：

| 用例 | 请求 | 预期结果 |
|---|---|---|
| Safe code | 合法 delegation + code tool + workspace read | `ALLOW` + Permit；`simulated_demo` 事件在许可内 |
| Finance denial | coder 请求 finance read | `DENY`；无 Permit、无 executor |
| Boundary violation | Permit 只允许 config read，随后提交 secret read | `AUTHORIZATION_BOUNDARY_VIOLATION` |
| Read-only violation | Permit 只读，随后提交 write | 违规 |
| Egress violation | Permit 禁止外联，随后提交 external destination | 违规 |
| Expiry/binding | 过期或错绑事件 | 拒绝，不进入正常事件链 |

此阶段仍只证明 Aegis 内部协议和确定性控制路径。

### Gate 3：一个真实 Adapter 的受控接入

仅在 Agent 或其工具系统支持公司批准的 CLI、插件、MCP/HTTP proxy 或事件 API 时进行。Adapter 必须先调用授权接口，只有拿到 Permit 才执行无害 fixture 动作，再回传 `instrumented_adapter` 事件。

若 WorkBuddy 是 GUI/IDE Agent 且没有批准的 Adapter/工具代理入口，不能通过扫描目录假装完成运行时试点。可以保留 Inventory 发现，同时把 Runtime Coverage 明确写成未接入；等待合适 Adapter 或独立传感器。

### Gate 4：证据复核和退出

审计必须回答：主体、Agent/workload、delegation fingerprint/scopes、工具、资源类、操作、Policy、Risk、Dispatch、Permit、事件来源/信任、越界原因、最终结论、持续时间和覆盖缺口。

结束后停止 Aegis 和测试进程，撤销测试凭据/Permit，由公司负责人决定审计保留或删除。只有脱敏结论和 synthetic 最小复现可以返回公开仓库。

## 证据信任表

| 来源 | 当前含义 | 不能外推为 |
|---|---|---|
| `gateway_enforced` | 请求实际进入 Aegis 授权点 | Agent 的所有动作都经过它 |
| `instrumented_adapter` | 已接入 Adapter 报告某个测试动作 | OS 独立证明或全端点覆盖 |
| `agent_self_reported` | Agent/日志声称发生事件 | 完整、不可伪造的事实 |
| `simulated_demo` | 服务端 Demo 夹具生成并提交合成事件 | 真实执行器、真实 Agent 或生产遥测 |
| `os_sensor` | 仅连接并验证 OS Sensor 后使用 | 文件内容安全或业务意图正确 |
| `network_sensor` | 仅连接并验证网络 Sensor 后使用 | TLS 内完整语义或离线行为 |

## 隐私和低配置目标

默认只保留分类元数据，不保留 Prompt、命令/输出正文、文件内容、原始 Token、Secret、Cookie、完整路径或用户名。资源使用 `WORKSPACE / SOURCE`、`PROTECTED_CONFIG`、`SECRET_STORE` 等类别。

第一轮不要求 Docker、Kubernetes、数据库、服务安装或开机启动。下列是**待验证目标，不是已达成承诺**：

| 指标 | 试点目标 |
|---|---:|
| Aegis 空闲平均 CPU | < 2% |
| 测试期间平均 CPU 增量 | < 5% |
| Aegis 进程内存 | < 100 MB |
| 单次试点审计文件 | < 50 MB |
| Adapter 动作中位延迟增量 | < 10% |

## 通过门槛

正式试点只有同时满足以下条件才可标为 `V3 pilot_verified`：

- 书面范围与实际执行一致；
- 动作真正经过批准的 Adapter/控制点；
- 授权与所有负向 Permit 用例可重复通过；
- Demo、自报和独立证据在 UI/API 中没有混淆；
- 未接入覆盖保持 UNKNOWN；
- 未触及真实敏感数据或未批准目标；
- 性能/隐私指标有原始本地测量和脱敏结论；
- 审计未离开公司批准的数据边界；
- 回滚与清理完成。

在这些条件满足前，当前状态保持“本地实现 / synthetic `V2`（以测试结果为准）”，不得写成生产就绪或公司试点验证。
