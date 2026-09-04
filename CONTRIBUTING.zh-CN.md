# 参与贡献

[English](CONTRIBUTING.md) | 简体中文

感谢你帮助改进 **Aegis Router — A Policy-Driven Security Router for AI Agents**。仓库名称暂时仍是 `agent-governance-gateway`。

## 先守住产品中心

新功能应优先强化一次动作的完整链路：

```text
Identity → Policy → Risk → Dispatch → Authorization Envelope / Permit → Runtime Events → Audit
```

Discovery 是辅助 Inventory 能力。除非改动确实针对资产可见性，否则不要让文件扫描、marketplace/cache 命中或 Shadow 数量占据首页和核心叙事。

## 安全不变量

每个 Pull Request 都必须保持：

- 资产登记不授予行为权限；所有进入控制点的动作逐次授权并审计；
- Policy 先判断授权，Risk 只影响已授权动作的分流；
- 未知身份、Agent、委托、能力、工具、资源或操作 fail closed；
- `claimed_intent` 和 Agent 自报计划不是授权边界；
- 只有 `ALLOW / RESTRICT / SANDBOX` 可以签发有时效且正确绑定的 Permit；
- `DENY / ESCALATE` 不得产生可执行 Permit；
- 运行时事件必须绑定 request/permit 并保留 source/trust；
- 过期、错绑或超出 Permit 的事件必须拒绝或产生明确违规；
- 不记录 raw bearer token、秘密值、Prompt/文档正文或完整个人路径；
- `simulated_demo`、`agent_self_reported` 和独立传感器证据不得混称为“Observed”；
- 未连接的覆盖是 `UNKNOWN / not instrumented`；
- 未连接真实隔离后端时，`SANDBOX` 只能叫 `SANDBOX ROUTE`。

概率模型可以作为咨询信号，但不能覆盖确定性的拒绝规则。

## 开发流程

1. 在 Issue/PR 中写出可证伪的安全属性和失败方式；
2. 优先为 baseline failure 增加安全 synthetic fixture；
3. 实现最小确定性控制，并同时增加正向和负向测试；
4. 检查误拒绝、延迟、隐私、存储和 operator burden；
5. 同步 Capability/Limitations、调研登记和中英文文档；
6. 报告真实结果，不把本地通过写成生产保证。

授权模型改动至少覆盖：unknown Agent、缺失 Scope、未授权能力、未允许工具、资源操作不匹配、安全请求签发 Permit、高风险已授权分流、许可内事件、密钥/写入/外联越界、过期 Permit、错绑事件和 Demo 来源标签。

## 前端与 API

前端源文件位于 `web/src/app.ts`，使用 TypeScript 与 esbuild 生成 `web/static/app.js`。修改前端后同时提交源文件与构建产物，以便低配置目标电脑不安装 Node.js 也能使用内嵌界面。

API 改动应保持“执行前授权、运行时证据、最终完成”分离。兼容入口不得把客户端提供的动作数组伪装成独立观察。任何新事件来源都要定义信任含义和不可见范围。

Discovery 修改必须只读、明确限定扫描根目录、保留可解释证据，并包含正向、负向、跳过目录和误报回归。依赖或 manifest 只能作为证据，不能直接创建 Agent 身份；发现风险/置信度不得冒充运行时动作风险。

## 验证

提交前运行：

```bash
gofmt -w <changed-go-files>
go test ./...
go test -race ./...
go vet ./...
npm run check:web
npm run build:web
```

如果环境缺少 race detector 所需工具链，应原样报告限制；不能把未运行写成通过。

## 文档与调研规则

中文是语义工作源，英文必须在同一 PR 中同步。代码标识、端点、状态、日期、来源链接和能力边界必须一致，翻译不得强化或弱化声明。

调研驱动的变更使用 `$research-to-product` 和 [`.codex/research-to-product.json`](.codex/research-to-product.json)。产品负责人建议属于 `S4` 产品证据：可以形成方向和实验，但只有本项目 synthetic fixture/测试达到 `V2` 后，才可把控制写成已实现。项目契约中的安全标志不能为方便开发而修改。

## Commit 范围

优先提交小而独立的 Commit。不要提交凭据、生产审计、真实公司路径、员工活动、客户数据或从公司设备导出的原始日志。公司试点发现只能以脱敏结论或 synthetic fixture 回到公开仓库。
