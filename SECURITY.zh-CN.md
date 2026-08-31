# 安全策略

[English](SECURITY.md) | 简体中文

## 报告安全漏洞

请不要在公开 Issue 中披露疑似漏洞。如果仓库已经开启 GitHub Private Vulnerability Reporting，请使用该功能。报告应包含：

- 受影响的版本或 Commit；
- 最小复现；
- 预期与实际安全决定；
- 潜在影响；
- 建议的缓解措施（如有）。

## 支持版本

在第一个带 Tag 的版本发布前，只支持默认分支上的最新 Commit。

## 范围说明

Agent Governance Gateway 当前是 MVP。策略和审计流程已经实现，但 Executor 动作仍为模拟。当前的 `sandbox` 路由不能解释为宿主机级隔离。

会话因果、间接 Prompt Injection、受保护读取和跨工具序列规则只覆盖经过 Router 或 Adapter 上报的元数据。因果状态当前仅保存在本地进程内，重启后不会恢复；Agent 自报的来源、读取或工具哈希不是独立证据。`path_class` 和 `uri_class` 必须是分类标签，不能填入完整路径、URL、Prompt 或文件内容。

Discovery 扫描器是只读的，只能针对操作者有权检查的路径运行。发现结果是启发式证据，不能作为 Agent 已经执行的最终证明。报告中可能包含仓库路径和依赖元数据；在组织外分享前必须复核。

公司端点试点需要书面授权和获准的数据边界。不能收集其他员工的活动、绕过端点安全控制，也不能把公司生成的日志传输到个人仓库或外部服务。参见[企业 Agent 端点试点](docs/experiments/enterprise-agent-pilot.zh-CN.md)。

本地 Server 默认只监听 `127.0.0.1`。如果要对局域网或公网开放，必须另行评审身份认证、TLS、防火墙和访问控制设计；当前 MVP 不提供这些保护。
