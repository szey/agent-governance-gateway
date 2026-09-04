type Locale = "zh-CN" | "en";
type ViewName = "overview" | "decisions" | "investigations" | "policies" | "inventory" | "demo";
type JsonObject = Record<string, unknown>;

interface Scenario {
  id: string;
  title: string;
  description: string;
  expectedRoute: string;
  request: JsonObject;
}

interface RuntimeEvidence {
  id: string;
  source: string;
  trust: string;
  capability: string;
  tool: string;
  operation: string;
  resource: string;
  timestamp: string;
  violation: boolean;
}

interface Envelope {
  permitId: string;
  principal: string;
  agent: string;
  capability: string;
  tool: string;
  resource: string;
  operations: string[];
  constraints: Record<string, string>;
  issuedAt: string;
  expiresAt: string;
}

interface Decision {
  raw: JsonObject;
  requestId: string;
  createdAt: string;
  principal: string;
  principalType: string;
  agent: string;
  workload: string;
  delegatedIssuer: string;
  delegatedSubject: string;
  scopes: string[];
  credentialFingerprint: string;
  capability: string;
  action: string;
  operation: string;
  tool: string;
  resource: string;
  sideEffect: string;
  policyRoute: string;
  route: string;
  policyReasons: string[];
  matchedRules: string[];
  riskLevel: string;
  riskScore: number | null;
  riskSignals: string[];
  executor: string;
  isolationStatus: string;
  envelope: Envelope | null;
  events: RuntimeEvidence[];
  violations: string[];
  finalVerdict: string;
  durationMs: number | null;
}

interface CoverageSource {
  key: string;
  name: string;
  status: string;
  evidence: string;
}

interface DiscoveryEvidence {
  source: string;
  indicator: string;
  confidence: number | null;
}

interface InventoryAgent {
  fingerprint: string;
  name: string;
  agentType: string;
  deploymentState: string;
  status: string;
  owner: string;
  approvalId: string;
  confidence: number | null;
  evidence: DiscoveryEvidence[];
  exposure: string;
  potentialCapabilities: string[];
  exposureFactors: string[];
}

interface ApprovedAgent {
  id: string;
  agent_id?: string;
  workload_identity?: string;
  name: string;
  display_name?: string;
  agent_type: string;
  fingerprint?: string;
  path_contains: string;
  owner: string;
  environment?: string;
  framework?: string;
  approval_ref?: string;
  expires_on?: string;
  state?: string;
  status?: string;
  policy_profile?: string;
}

interface InventoryState {
  agents: InventoryAgent[];
  approvals: ApprovedAgent[];
  governedCount: number;
  agentTypes: string[];
  scannedAt: string;
  rootCount: number;
  gaps: Array<{ source: string; reason: string }>;
  truncated: boolean;
}

const copy: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    skipContent: "跳到主要内容", brandSubtitle: "AI Agent 策略驱动安全路由器", navOverview: "总览", navDecisions: "裁决",
    navInvestigations: "审计 / 调查", navPolicies: "策略", navInventory: "Agent 清单", navDemo: "演示实验室", doctrineLabel: "零信任原则",
    doctrine: "批准 Agent 存在，不代表批准它的行为。", controlPlane: "安全控制平面", checking: "检查中", online: "策略引擎在线", offline: "控制平面不可达", refresh: "刷新",
    overviewTitle: "运行时态势", decisionsTitle: "逐动作裁决", investigationsTitle: "审计与调查", policiesTitle: "授权策略", inventoryTitle: "Agent 清单", demoTitle: "演示实验室",
    runtimeFirst: "运行时强制优先", overviewHero: "每个动作先获准，再越过安全边界。", overviewCopy: "Aegis 在 Agent 与工具、资源之间核验身份、委托权限和动作约束，并用授权信封约束后续执行。",
    identity: "身份", policy: "策略", risk: "风险", dispatch: "分派", observation: "观察", audit: "审计", securityBoundary: "安全边界", envelopeIsBoundary: "授权信封，而非 Agent 自述计划", governedIdentities: "受治理身份",
    allowedActions: "已允许动作", restrictedActions: "受限执行", sandboxRoutes: "沙箱路由", blockedActions: "执行前阻断", needsReview: "等待复核",
    decisionStream: "裁决流", recentDecisions: "最近裁决", viewAll: "查看全部", attentionQueue: "关注队列", blockedAndViolations: "阻断与越界",
    evidencePlane: "证据平面", runtimeCoverage: "运行时覆盖", unknownNotZero: "UNKNOWN ≠ 0", coverageCopy: "仅显示已接入且有来源标识的证据；未接入的传感器保持未知。",
    identityPlane: "身份平面", workloadIdentities: "Agent 工作负载", openInventory: "打开清单", registered: "已登记", evidenceOnly: "仅证据",
    identityBoundary: "登记回答“工作负载能否进入治理环境”；策略回答“此刻能否执行这个动作”。", runtimeGateway: "运行时网关", decisionsCopy: "授权与风险分开计算；明确的策略拒绝不会被风险分数覆盖。",
    tryDemo: "运行安全场景", all: "全部", blocked: "阻断", permitted: "已放行", evidenceChain: "证据链", investigationsCopy: "从请求上下文到最终结论，保留可解释的裁决与证据链。",
    boundaryEvents: "边界事件", violationsAndBlocks: "越界与阻断", runtimeEvidence: "运行时证据", sourceAndTrust: "来源与可信度", evidenceRule: "自报、适配器、OS 与网络传感器不可混为同一种“已观察”。",
    policyPlane: "策略平面", policiesCopy: "围绕身份、委托权限、能力、工具、资源、操作与约束做显式授权。", assetRegistration: "资产登记", mayParticipate: "这个工作负载可以参与治理环境吗？",
    actionAuthorization: "逐动作授权", mayActNow: "它在当前委托权限下可以执行这个动作吗？", evaluationOrder: "评估输入", authorizationAnatomy: "授权构成", principalAndAgent: "主体 + Agent 身份",
    principalAndAgentCopy: "人类或服务主体，以及实际工作负载", delegatedAuthority: "委托权限", delegatedAuthorityCopy: "凭据指纹、颁发者、主体、范围与有效期", capabilityAndTool: "能力 + 工具",
    capabilityAndToolCopy: "允许的能力、工具身份和 Schema", resourceAndOperation: "资源 + 操作", resourceAndOperationCopy: "资源类别、read/write/admin 与副作用", constraints: "执行约束", constraintsCopy: "网络、秘密、写入、时长与执行环境",
    observedRules: "已观察规则", rulesSeenInAudits: "审计中出现的规则", notPolicyEditor: "只读证据", policyApiNote: "当前 UI 不假装提供尚未暴露的策略编辑 API；这里仅汇总真实审计记录中命中的规则。",
    securityObject: "安全对象", envelopeTitle: "授权信封", envelopeCopy: "只有 ALLOW、RESTRICT 或 SANDBOX 才能产生信封；运行时事件必须绑定信封并接受越界检查。",
    visibilityModule: "可选可见性模块", inventoryCopy: "发现证据帮助识别工作负载，但依赖、插件或缓存文件本身不是 Agent 身份。", rescan: "重新扫描", scanCoverage: "扫描覆盖",
    workloadEvidence: "工作负载证据", deployedCandidates: "已部署 / 已配置候选", availableIntegrations: "发现证据 / 可用集成", availableDisclosure: "这些 marketplace、catalog、cache 或依赖线索默认折叠，不计作运行中的 Agent。",
    admissionRegistry: "准入登记", approvedWorkloads: "已登记工作负载", registryBoundary: "登记只控制工作负载准入；它的每次行为仍须经过策略与审计。", addOrEditRegistration: "添加或编辑登记",
    agentName: "Agent 名称", agentType: "Agent 类型", pathEvidence: "证据路径片段", relativeEvidenceOnly: "仅使用相对扫描根目录的稳定片段。", fingerprint: "发现指纹", owner: "负责人", environment: "环境",
    approvalRef: "批准单号", expiresOn: "到期日", registryState: "登记状态", active: "生效", suspended: "暂停", policyProfile: "策略档案", saveRegistration: "保存登记", clearForm: "清空",
    safeFixtures: "安全测试夹具", demoCopy: "六个场景用于回归授权与检测流程，不代表真实生产遥测。", truthfulDemo: "这里产生的行为证据会明确标记为 simulated_demo。", sandboxTruth: "SANDBOX 仅表示路由；隔离后端：NOT CONNECTED / DEMO。",
    scenarioLibrary: "场景库", securityScenarios: "安全场景", actionRequest: "动作请求", chooseScenario: "选择场景", requestPayload: "服务端测试夹具（只读）", privacyNote: "该请求由服务端场景固定提供；不得放入真实令牌、秘密、提示词内容或个人路径。", authorizeAction: "运行场景",
    footerTruth: "默认拒绝 · 逐动作授权 · 来源可辨的审计", noDecisions: "还没有网关裁决。请在演示实验室运行一个安全场景。", noAlerts: "暂无阻断或授权边界越界记录。", noRuntimeEvidence: "没有带来源标识的运行时证据。未知不代表没有行为。",
    noInventory: "未发现已部署或已配置的 Agent 候选。", noAvailableEvidence: "没有仅可用的集成或依赖证据。", noRegistrations: "登记清单为空。未匹配的已部署工作负载会标为 Shadow。", noRules: "尚无审计记录可用于汇总命中规则。",
    principal: "主体", principalType: "主体类型", agentIdentity: "Agent 身份", workload: "工作负载", issuer: "颁发者", delegatedSubject: "委托主体", scopes: "委托范围", credential: "凭据指纹",
    requestedAction: "请求动作", capability: "能力", tool: "工具", resource: "资源", operation: "操作", sideEffect: "副作用", policyDecision: "策略裁决", riskAssessment: "风险评估", dispatchDecision: "分派结果",
    matchedRules: "命中规则", riskSignals: "风险信号", selectedExecutor: "执行器", finalVerdict: "最终结论", duration: "耗时", permitId: "许可 ID", issuedAt: "签发时间", expiresAt: "失效时间", allowedOperations: "允许操作",
    permitNotIssued: "未签发执行许可", deniedBeforeExecution: "请求在执行前被策略阻断，因此没有授权信封。", legacyEnvelopeMissing: "旧版响应没有授权信封；界面不会从 ALLOW 结果推测许可范围。",
    runtimeEvents: "运行时事件", source: "来源", trust: "可信度", violation: "授权边界越界", withinEnvelope: "信封范围内", isolationBackend: "隔离后端", notConnectedDemo: "NOT CONNECTED / DEMO",
    unknown: "UNKNOWN", notInstrumented: "NOT INSTRUMENTED", instrumented: "INSTRUMENTED", adapterReported: "ADAPTER REPORTED", simulatedDemo: "SIMULATED DEMO", selfReported: "AGENT SELF-REPORTED", connected: "CONNECTED",
    gatewayRequests: "网关请求", toolEvents: "工具事件", filesystem: "文件系统", network: "网络", osSyscalls: "OS 系统调用", isolation: "隔离执行", derivedFromAudit: "来自网关审计记录", noSensor: "未连接独立传感器", noAdapterEvidence: "没有适配器证据", demoOnly: "仅演示后端",
    approved: "已登记", unassessed: "待评估", available: "仅可用", installed: "已安装", configured: "已配置", observed: "已观察", discoveryConfidence: "发现置信度", potentialExposure: "潜在暴露", unclassified: "未分类", prepareRegistration: "填写登记",
    edit: "编辑", remove: "移除", confirmRemove: "移除这条登记记录？下次核对后该工作负载可能变为 Shadow。", registrationSaved: "登记已保存并重新核对。", registrationRemoved: "登记已移除并重新核对。", scanComplete: "扫描完成，清单已刷新。", scanIncomplete: "部分扫描源不可读取；覆盖保持 UNKNOWN。",
    expected: "预期", authorizing: "正在授权…", inspectDecision: "查看完整裁决", demoEvidence: "演示证据", noExecutionEvidence: "没有运行时事件；系统不会把“未收到证据”写成“行为为零”。", requestFailed: "请求失败", refreshed: "数据已刷新。"
  },
  en: {
    skipContent: "Skip to main content", brandSubtitle: "A Policy-Driven Security Router for AI Agents", navOverview: "Overview", navDecisions: "Decisions",
    navInvestigations: "Audit / Investigations", navPolicies: "Policies", navInventory: "Agent Inventory", navDemo: "Demo Lab", doctrineLabel: "Zero-trust principle",
    doctrine: "Approving an Agent to exist does not approve its behavior.", controlPlane: "Security control plane", checking: "Checking", online: "Policy engine online", offline: "Control plane unavailable", refresh: "Refresh",
    overviewTitle: "Runtime posture", decisionsTitle: "Per-action decisions", investigationsTitle: "Audit & investigations", policiesTitle: "Authorization policies", inventoryTitle: "Agent inventory", demoTitle: "Demo lab",
    runtimeFirst: "RUNTIME ENFORCEMENT FIRST", overviewHero: "Clear every action before it crosses the boundary.", overviewCopy: "Aegis verifies identity, delegated authority, and action constraints between Agents and tools or resources, then bounds execution with an Authorization Envelope.",
    identity: "Identity", policy: "Policy", risk: "Risk", dispatch: "Dispatch", observation: "Observation", audit: "Audit", securityBoundary: "Security boundary", envelopeIsBoundary: "Authorization Envelope, not the Agent's declared plan", governedIdentities: "Governed identities",
    allowedActions: "Permitted actions", restrictedActions: "Restricted execution", sandboxRoutes: "Sandbox routes", blockedActions: "Blocked pre-execution", needsReview: "Awaiting review",
    decisionStream: "DECISION STREAM", recentDecisions: "Recent decisions", viewAll: "View all", attentionQueue: "ATTENTION QUEUE", blockedAndViolations: "Blocks & violations",
    evidencePlane: "EVIDENCE PLANE", runtimeCoverage: "Runtime coverage", unknownNotZero: "UNKNOWN ≠ 0", coverageCopy: "Only connected, source-labeled evidence is shown. Disconnected sensors remain unknown.",
    identityPlane: "IDENTITY PLANE", workloadIdentities: "Agent workloads", openInventory: "Open inventory", registered: "Registered", evidenceOnly: "Evidence only",
    identityBoundary: "Registration asks whether a workload may participate; policy asks whether it may perform this action now.", runtimeGateway: "RUNTIME GATEWAY", decisionsCopy: "Authorization and risk are evaluated separately. A numerical risk score never overrides an explicit policy denial.",
    tryDemo: "Run a security scenario", all: "All", blocked: "Blocked", permitted: "Permitted", evidenceChain: "EVIDENCE CHAIN", investigationsCopy: "Preserve an explainable decision and evidence chain from request context to final verdict.",
    boundaryEvents: "BOUNDARY EVENTS", violationsAndBlocks: "Violations & blocks", runtimeEvidence: "RUNTIME EVIDENCE", sourceAndTrust: "Source & trust", evidenceRule: "Self-report, adapters, OS sensors, and network sensors must never collapse into one generic “Observed” state.",
    policyPlane: "POLICY PLANE", policiesCopy: "Authorize explicitly across identity, delegation, capability, tool, resource, operation, and constraints.", assetRegistration: "Asset registration", mayParticipate: "May this workload participate in the governed environment?",
    actionAuthorization: "Per-action authorization", mayActNow: "May it perform this action now under this delegated authority?", evaluationOrder: "EVALUATION INPUTS", authorizationAnatomy: "Authorization anatomy", principalAndAgent: "Principal + Agent identity",
    principalAndAgentCopy: "Human or service principal and the actual workload", delegatedAuthority: "Delegated authority", delegatedAuthorityCopy: "Credential fingerprint, issuer, subject, scopes, and expiry", capabilityAndTool: "Capability + tool",
    capabilityAndToolCopy: "Granted capability, tool identity, and schema", resourceAndOperation: "Resource + operation", resourceAndOperationCopy: "Resource class, read/write/admin, and side effects", constraints: "Execution constraints", constraintsCopy: "Network, secrets, writes, duration, and executor profile",
    observedRules: "OBSERVED RULES", rulesSeenInAudits: "Rules seen in audits", notPolicyEditor: "READ-ONLY EVIDENCE", policyApiNote: "The UI does not pretend an unexposed policy editing API exists. This list only summarizes rules present in real audit records.",
    securityObject: "SECURITY OBJECT", envelopeTitle: "Authorization Envelope", envelopeCopy: "Only ALLOW, RESTRICT, or SANDBOX can produce an envelope. Runtime events must bind to it and undergo boundary checks.",
    visibilityModule: "OPTIONAL VISIBILITY MODULE", inventoryCopy: "Discovery evidence can identify workload candidates, but a dependency, plugin, or cache file is not an Agent identity.", rescan: "Rescan", scanCoverage: "Scan coverage",
    workloadEvidence: "WORKLOAD EVIDENCE", deployedCandidates: "Deployed / configured candidates", availableIntegrations: "Discovery evidence / available integrations", availableDisclosure: "Marketplace, catalog, cache, and dependency clues stay collapsed and do not count as running Agents.",
    admissionRegistry: "ADMISSION REGISTRY", approvedWorkloads: "Registered workloads", registryBoundary: "Registration controls workload admission only. Every action still passes through policy and audit.", addOrEditRegistration: "Add or edit registration",
    agentName: "Agent name", agentType: "Agent type", pathEvidence: "Evidence path fragment", relativeEvidenceOnly: "Use a stable fragment relative to the scan root only.", fingerprint: "Discovery fingerprint", owner: "Owner", environment: "Environment",
    approvalRef: "Approval reference", expiresOn: "Expires on", registryState: "Registry state", active: "Active", suspended: "Suspended", policyProfile: "Policy profile", saveRegistration: "Save registration", clearForm: "Clear",
    safeFixtures: "SAFE FIXTURES", demoCopy: "Six scenarios exercise authorization and detection as regression fixtures—not production telemetry.", truthfulDemo: "Behavior evidence generated here is explicitly labeled simulated_demo.", sandboxTruth: "SANDBOX is a route only. Isolation backend: NOT CONNECTED / DEMO.",
    scenarioLibrary: "SCENARIO LIBRARY", securityScenarios: "Security scenarios", actionRequest: "ACTION REQUEST", chooseScenario: "Choose a scenario", requestPayload: "Server-owned fixture (read-only)", privacyNote: "The request is fixed by the server-owned scenario; never place real tokens, secrets, prompt contents, or personal paths here.", authorizeAction: "Run scenario",
    footerTruth: "Default deny · per-action authorization · source-labeled audit", noDecisions: "No gateway decisions yet. Run a safe fixture in Demo Lab.", noAlerts: "No blocked requests or authorization-boundary violations.", noRuntimeEvidence: "No source-labeled runtime evidence. Unknown does not mean no behavior.",
    noInventory: "No deployed or configured Agent candidates were found.", noAvailableEvidence: "No available integration or dependency evidence.", noRegistrations: "The registry is empty. Unmatched deployed workloads are Shadow.", noRules: "No audit records exist from which to summarize matched rules.",
    principal: "Principal", principalType: "Principal type", agentIdentity: "Agent identity", workload: "Workload", issuer: "Issuer", delegatedSubject: "Delegated subject", scopes: "Delegated scopes", credential: "Credential fingerprint",
    requestedAction: "Requested action", capability: "Capability", tool: "Tool", resource: "Resource", operation: "Operation", sideEffect: "Side effect", policyDecision: "Policy decision", riskAssessment: "Risk assessment", dispatchDecision: "Dispatch decision",
    matchedRules: "Matched rules", riskSignals: "Risk signals", selectedExecutor: "Executor", finalVerdict: "Final verdict", duration: "Duration", permitId: "Permit ID", issuedAt: "Issued at", expiresAt: "Expires at", allowedOperations: "Allowed operations",
    permitNotIssued: "No execution permit issued", deniedBeforeExecution: "Policy blocked the request before execution, so no Authorization Envelope exists.", legacyEnvelopeMissing: "The legacy response has no Authorization Envelope. The UI will not infer a permit from an ALLOW result.",
    runtimeEvents: "Runtime events", source: "Source", trust: "Trust", violation: "Authorization boundary violation", withinEnvelope: "Inside envelope", isolationBackend: "Isolation backend", notConnectedDemo: "NOT CONNECTED / DEMO",
    unknown: "UNKNOWN", notInstrumented: "NOT INSTRUMENTED", instrumented: "INSTRUMENTED", adapterReported: "ADAPTER REPORTED", simulatedDemo: "SIMULATED DEMO", selfReported: "AGENT SELF-REPORTED", connected: "CONNECTED",
    gatewayRequests: "Gateway requests", toolEvents: "Tool events", filesystem: "Filesystem", network: "Network", osSyscalls: "OS syscalls", isolation: "Isolation execution", derivedFromAudit: "Derived from gateway audit records", noSensor: "No independent sensor connected", noAdapterEvidence: "No adapter evidence", demoOnly: "Demo backend only",
    approved: "Registered", unassessed: "Unassessed", available: "Available only", installed: "Installed", configured: "Configured", observed: "Observed", discoveryConfidence: "Discovery confidence", potentialExposure: "Potential exposure", unclassified: "Unclassified", prepareRegistration: "Prepare registration",
    edit: "Edit", remove: "Remove", confirmRemove: "Remove this registration? The workload may become Shadow after reconciliation.", registrationSaved: "Registration saved and discovery reconciled.", registrationRemoved: "Registration removed and discovery reconciled.", scanComplete: "Scan complete. Inventory refreshed.", scanIncomplete: "Some scan sources are unreadable; coverage remains UNKNOWN.",
    expected: "Expected", authorizing: "Authorizing…", inspectDecision: "Inspect full decision", demoEvidence: "Demo evidence", noExecutionEvidence: "No runtime events exist. The system does not rewrite “no evidence received” as “zero behavior.”", requestFailed: "Request failed", refreshed: "Data refreshed."
  }
};

const viewTitles: Record<ViewName, { key: string; kicker: string }> = {
  overview: { key: "overviewTitle", kicker: "OVERVIEW" }, decisions: { key: "decisionsTitle", kicker: "DECISIONS" },
  investigations: { key: "investigationsTitle", kicker: "AUDIT / INVESTIGATIONS" }, policies: { key: "policiesTitle", kicker: "POLICIES" },
  inventory: { key: "inventoryTitle", kicker: "AGENT INVENTORY" }, demo: { key: "demoTitle", kicker: "DEMO LAB" }
};

const state: {
  locale: Locale;
  view: ViewName;
  decisions: Decision[];
  selectedDecision: string;
  decisionFilter: string;
  scenarios: Scenario[];
  selectedScenario: string;
  coverage: CoverageSource[];
  sessionEvents: RuntimeEvidence[];
  inventory: InventoryState;
  modernAgentsAPI: boolean;
} = {
  locale: localStorage.getItem("aegis-locale") === "en" ? "en" : "zh-CN",
  view: "overview", decisions: [], selectedDecision: "", decisionFilter: "all", scenarios: [], selectedScenario: "", coverage: [], sessionEvents: [],
  inventory: { agents: [], approvals: [], governedCount: 0, agentTypes: [], scannedAt: "", rootCount: 0, gaps: [], truncated: false }, modernAgentsAPI: false
};

class HTTPError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

function qs<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing UI element: ${selector}`);
  return node;
}

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function tr(key: string): string { return copy[state.locale][key] ?? key; }
function record(value: unknown): JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function list(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function get(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => record(current)[key], value);
}
function first(value: unknown, paths: string[]): unknown {
  for (const path of paths) { const candidate = get(value, path); if (candidate !== undefined && candidate !== null && candidate !== "") return candidate; }
  return undefined;
}
function textValue(value: unknown, paths: string[], fallback = "—"): string {
  const candidate = first(value, paths);
  return typeof candidate === "string" || typeof candidate === "number" || typeof candidate === "boolean" ? String(candidate) : fallback;
}
function strings(value: unknown, paths: string[]): string[] {
  const candidate = first(value, paths);
  if (Array.isArray(candidate)) return candidate.map(item => typeof item === "string" ? item : textValue(item, ["name", "id", "rule"], "")).filter(Boolean);
  if (typeof candidate === "string" && candidate) return [candidate];
  return [];
}
function numberValue(value: unknown, paths: string[]): number | null {
  const candidate = first(value, paths);
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}
function slug(value: string): string { return value.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]/g, "-"); }
function titleToken(value: string): string { return value ? value.replaceAll("_", " ").toUpperCase() : tr("unknown"); }
function shortID(value: string): string { return value.length > 22 ? `${value.slice(0, 10)}…${value.slice(-7)}` : value; }
function formatTime(value: string, compact = false): string {
  if (!value) return tr("unknown");
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return compact ? new Intl.DateTimeFormat(state.locale, { hour: "2-digit", minute: "2-digit" }).format(date) : new Intl.DateTimeFormat(state.locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function privacySafe(value: string): string {
  if (!value) return "—";
  const normalized = value.replaceAll("\\", "/");
  if (!/^(?:[a-z]:\/|\/Users\/|\/home\/)/i.test(normalized) && !/[a-z]:\/Users\/[^/]+/i.test(normalized)) return value;
  const lower = normalized.toLowerCase();
  const filename = normalized.split("/").filter(Boolean).at(-1) || "item";
  if (/secret|\.env|\.ssh|credential|token|vault/.test(lower)) return `SECRET_STORE / ${filename}`;
  if (/workbuddy|agent|mcp/.test(lower)) return `USER_PROFILE / AGENT_CONFIG / ${filename}`;
  if (/repo|workspace|source|\/src\//.test(lower)) return `WORKSPACE / SOURCE / ${filename}`;
  if (/config|setting/.test(lower)) return `PROTECTED_CONFIG / ${filename}`;
  return `LOCAL_PATH / ${filename}`;
}

function fingerprintSafe(value: string): string {
  if (!value || value === "—") return value;
  return value.length > 20 ? `${value.slice(0, 11)}…${value.slice(-6)}` : value;
}

async function requestJSON(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
  if (!response.ok) throw new HTTPError(response.status, textValue(payload, ["message", "error"], `HTTP ${response.status}`));
  return payload;
}

async function optionalJSON(url: string): Promise<unknown | null> {
  try { return await requestJSON(url); } catch { return null; }
}

function extractArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) { const value = get(payload, key); if (Array.isArray(value)) return value; }
  return [];
}

function normalizeEnvelope(rawDecision: JsonObject): Envelope | null {
  const source = first(rawDecision, ["authorization_envelope", "execution_permit", "permit", "authorization.envelope"]);
  if (!source || typeof source !== "object") return null;
  const constraintsSource = record(first(source, ["constraints"]));
  const constraints: Record<string, string> = {};
  Object.entries(constraintsSource).forEach(([key, value]) => {
    if (Array.isArray(value)) constraints[key] = value.map(String).join(", ");
    else if (["string", "number", "boolean"].includes(typeof value)) constraints[key] = String(value);
  });
  return {
    permitId: textValue(source, ["permit_id", "id"], "—"), principal: textValue(source, ["principal_id", "principal"], "—"),
    agent: textValue(source, ["agent_id", "agent"], "—"), capability: textValue(source, ["allowed_capability", "capability"], "—"),
    tool: textValue(source, ["allowed_tool", "tool", "tool_id"], "—"), resource: privacySafe(textValue(source, ["allowed_resource", "resource", "resource_class"], "—")),
    operations: strings(source, ["allowed_operations", "operations"]), constraints,
    issuedAt: textValue(source, ["issued_at"], "—"), expiresAt: textValue(source, ["expires_at", "expiry"], "—")
  };
}

function normalizeRuntimeEvent(rawEvent: unknown, index: number, violations: string[], violatingEventIDs: Set<string> = new Set()): RuntimeEvidence {
  const capability = textValue(rawEvent, ["capability", "action_class"], "—");
  const operation = textValue(rawEvent, ["operation", "event_type", "action"], capability);
  const resource = privacySafe(textValue(rawEvent, ["resource_class", "resource", "target_resource"], "—"));
  const eventID = textValue(rawEvent, ["event_id", "id", "sequence"], `event-${index + 1}`);
  const violationFlag = first(rawEvent, ["violation", "envelope_violation"]) === true || first(rawEvent, ["allowed", "within_authorization_envelope"]) === false;
  const combined = `${capability} ${operation} ${resource}`.toLowerCase();
  return {
    id: eventID,
    source: textValue(rawEvent, ["source"], "unknown"), trust: textValue(rawEvent, ["trust_level", "trust"], "unknown"),
    capability, tool: textValue(rawEvent, ["tool", "tool_id", "tool_name"], "—"), operation, resource,
    timestamp: textValue(rawEvent, ["timestamp", "observed_at", "created_at"], ""),
    violation: violationFlag || violatingEventIDs.has(eventID) || violations.some(item => combined.includes(item.toLowerCase()) || item.toLowerCase().includes(operation.toLowerCase()))
  };
}

function normalizeDecision(input: unknown): Decision {
  const wrapped = record(input);
  const raw = Object.keys(record(wrapped.audit)).length ? record(wrapped.audit) : Object.keys(record(wrapped.record)).length ? record(wrapped.record) : wrapped;
  const policyRoute = textValue(raw, ["policy_decision.route", "decision.route", "authorization.route"], "unknown").toLowerCase();
  const route = textValue(raw, ["dispatch_decision.route", "dispatch.route", "route"], policyRoute).toLowerCase();
  const violations = strings(raw, ["runtime_observation.authorization_violations", "envelope_violations", "runtime_observation.envelope_violations", "runtime_observation.violations", "violations"]);
  let eventInputs = extractArray(first(raw, ["runtime_events", "runtime_observation.events", "events"]), []);
  const violatingEventIDs = new Set(
    extractArray(first(raw, ["runtime_observation.event_evaluations", "event_evaluations"]), [])
      .filter(evaluation => first(evaluation, ["within_authorization_envelope", "accepted"]) === false || first(evaluation, ["execution_terminated"]) === true)
      .map(evaluation => textValue(evaluation, ["event_id"], ""))
      .filter(Boolean)
  );
  if (!eventInputs.length) {
    eventInputs = strings(raw, ["runtime_observation.actual_actions"]).map((action, index) => ({
      event_id: `legacy-demo-${index + 1}`, source: "simulated_demo", trust_level: "simulated_demo", capability: action, operation: action,
      envelope_violation: strings(raw, ["runtime_observation.unexpected_actions"]).includes(action)
    }));
  }
  const policyReasons = strings(raw, ["policy_decision.reasons", "decision.reasons", "authorization.reasons"]);
  const riskScore = numberValue(raw, ["risk_assessment.score", "risk.score"]);
  const requestedCapability = textValue(raw, ["request.action_request.capability", "request.action.capability", "request.requested_capability", "action_request.capability"], "—");
  const action = textValue(raw, ["request.action_request.operation", "request.action.operation", "request.requested_action", "action_request.operation"], requestedCapability);
  const isolation = textValue(raw, ["dispatch_decision.isolation_backend", "dispatch.isolation_backend.status", "execution.isolation_backend.status", "isolation_backend.status"], "");
  return {
    raw, requestId: textValue(raw, ["request_id", "request.request_id"], "unassigned"), createdAt: textValue(raw, ["created_at", "timestamp"], ""),
    principal: textValue(raw, ["request.principal_context.principal_id", "request.principal.principal_id", "request.user_id"], "—"),
    principalType: textValue(raw, ["request.principal_context.principal_type", "request.principal.principal_type"], "—"),
    agent: textValue(raw, ["request.agent_identity.agent_id", "request.agent.agent_id", "request.agent_id"], "—"),
    workload: textValue(raw, ["request.agent_identity.workload_id", "request.agent.workload_id"], "—"),
    delegatedIssuer: textValue(raw, ["request.delegated_authority.issuer", "request.authority.issuer"], "—"),
    delegatedSubject: textValue(raw, ["request.delegated_authority.subject", "request.authority.subject"], "—"),
    scopes: strings(raw, ["request.delegated_authority.scopes", "request.authority.scopes", "request.token_scopes"]),
    credentialFingerprint: fingerprintSafe(textValue(raw, ["request.delegated_authority.credential_fingerprint", "request.delegated_authority.credential_id", "request.authority.credential_fingerprint"], "—")),
    capability: requestedCapability, action, operation: textValue(raw, ["request.action_request.operation", "request.action.operation", "request.operation"], action),
    tool: textValue(raw, ["request.tool_context.tool_id", "request.tool_context.name", "request.tool_identity.name", "request.tool.name"], "—"),
    resource: privacySafe(textValue(raw, ["request.action_request.target_resource", "request.action.target_resource", "request.target_resource"], "—")),
    sideEffect: textValue(raw, ["request.action_request.side_effect", "request.action.side_effect", "request.side_effect"], "—"),
    policyRoute, route, policyReasons, matchedRules: strings(raw, ["policy_decision.matched_rules", "policy_decision.rules", "decision.matched_rules"]),
    riskLevel: textValue(raw, ["risk_assessment.level", "risk.level"], "unknown").toLowerCase(), riskScore,
    riskSignals: strings(raw, ["risk_assessment.signals", "risk.signals"]), executor: textValue(raw, ["selected_executor", "dispatch.executor", "executor"], route === "deny" ? "not invoked" : "—"),
    isolationStatus: isolation || (["sandbox", "restrict"].includes(route) ? "not_connected_demo" : "not_applicable"), envelope: normalizeEnvelope(raw),
    events: eventInputs.map((event, index) => normalizeRuntimeEvent(event, index, violations, violatingEventIDs)), violations,
    finalVerdict: textValue(raw, ["final_verdict", "verdict"], route), durationMs: numberValue(raw, ["duration_ms", "duration"])
  };
}

function normalizeScenario(input: unknown): Scenario {
  return {
    id: textValue(input, ["id"], crypto.randomUUID()), title: textValue(input, ["title"], "Scenario"), description: textValue(input, ["description"], ""),
    expectedRoute: textValue(input, ["expected_route", "expected"], "—"), request: record(get(input, "request"))
  };
}

function normalizeDiscoveryAgent(input: unknown): InventoryAgent {
  const evidence = extractArray(get(input, "evidence"), []).map(item => ({
    source: textValue(item, ["source"], "evidence"), indicator: privacySafe(textValue(item, ["indicator"], "—")), confidence: numberValue(item, ["confidence"])
  }));
  return {
    fingerprint: textValue(input, ["fingerprint"], "—"), name: textValue(input, ["display_name", "name"], "Unnamed workload"), agentType: textValue(input, ["agent_type", "type"], "unknown"),
    deploymentState: textValue(input, ["deployment_state", "deployment.state"], "available").toLowerCase(), status: textValue(input, ["status", "registration_status"], "unassessed").toLowerCase(),
    owner: textValue(input, ["owner"], ""), approvalId: textValue(input, ["approval_id", "registration_id"], ""), confidence: numberValue(input, ["confidence", "discovery_confidence"]), evidence,
    exposure: textValue(input, ["potential_exposure.classification", "potential_exposure.level", "exposure.classification"], "unclassified"),
    potentialCapabilities: strings(input, ["potential_exposure.potential_capabilities", "potential_exposure.capabilities", "exposure.capabilities"]),
    exposureFactors: strings(input, ["potential_exposure.factors", "exposure.factors"])
  };
}

function normalizeApproval(input: unknown): ApprovedAgent {
  return {
    id: textValue(input, ["id", "registration_id"], ""), agent_id: textValue(input, ["agent_id"], "") || undefined,
    workload_identity: textValue(input, ["workload_identity", "workload_id"], "") || undefined, name: textValue(input, ["name", "display_name"], "Unnamed workload"),
    display_name: textValue(input, ["display_name"], "") || undefined, agent_type: textValue(input, ["agent_type", "framework"], "unknown"), fingerprint: textValue(input, ["fingerprint"], "") || undefined,
    path_contains: textValue(input, ["path_contains", "evidence_path"], ""), owner: textValue(input, ["owner"], "unassigned"), environment: textValue(input, ["environment"], "") || undefined,
    framework: textValue(input, ["framework"], "") || undefined, approval_ref: textValue(input, ["approval_ref", "approval_reference"], "") || undefined,
    expires_on: textValue(input, ["expires_on", "expiry"], "") || undefined, state: textValue(input, ["state"], "") || undefined, status: textValue(input, ["status"], "") || undefined,
    policy_profile: textValue(input, ["policy_profile"], "") || undefined
  };
}

function applyTranslations(): void {
  document.documentElement.lang = state.locale;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (key) element.textContent = tr(key);
  });
  qs<HTMLButtonElement>("#language-toggle").textContent = state.locale === "zh-CN" ? "EN" : "中文";
  updateViewHeading();
}

function updateViewHeading(): void {
  const heading = viewTitles[state.view];
  qs("#view-kicker").textContent = heading.kicker;
  qs("#view-title").textContent = tr(heading.key);
}

function validView(value: string): value is ViewName {
  return ["overview", "decisions", "investigations", "policies", "inventory", "demo"].includes(value);
}

function navigate(view: ViewName, updateHash = true): void {
  state.view = view;
  document.querySelectorAll<HTMLElement>("[data-view]").forEach(element => {
    const active = element.dataset.view === view;
    element.hidden = !active;
    element.classList.toggle("active", active);
  });
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach(button => {
    const active = button.dataset.nav === view;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
  });
  updateViewHeading();
  if (updateHash && location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  document.documentElement.scrollTop = 0;
}

function showToast(message: string, error = false): void {
  const toast = node("div", `toast${error ? " error" : ""}`, message);
  qs("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

async function checkHealth(): Promise<void> {
  const indicator = qs("#system-state");
  indicator.className = "system-state checking";
  indicator.querySelector("b")!.textContent = tr("checking");
  try {
    await requestJSON("/api/health");
    indicator.className = "system-state";
    indicator.querySelector("b")!.textContent = tr("online");
  } catch {
    indicator.className = "system-state offline";
    indicator.querySelector("b")!.textContent = tr("offline");
  }
}

async function loadDecisions(): Promise<void> {
  let payload: unknown;
  try { payload = await requestJSON("/api/decisions?limit=50"); }
  catch (error) {
    if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
    payload = await requestJSON("/api/audits?limit=50");
  }
  state.decisions = extractArray(payload, ["decisions", "audits", "records", "items"]).map(normalizeDecision);
  if (!state.selectedDecision && state.decisions.length) state.selectedDecision = state.decisions[0].requestId;
}

function normalizeCoverage(payload: unknown): CoverageSource[] {
  let sources = extractArray(payload, ["sources", "coverage", "runtime_coverage"]);
  if (!sources.length) {
    const sourceObject = record(first(payload, ["sources", "coverage", "runtime_coverage"]));
    sources = Object.entries(sourceObject).map(([key, value]) => {
      if (typeof value === "string") return { key, name: key, status: value };
      return { key, ...record(value) };
    });
  }
  return sources.map((source, index) => {
    const key = textValue(source, ["key", "source", "name"], `source-${index + 1}`);
    return { key, name: textValue(source, ["display_name", "name", "source"], key), status: textValue(source, ["status", "state"], "unknown").toLowerCase(), evidence: textValue(source, ["evidence", "detail", "reason"], "") };
  });
}

async function loadSessionEvents(): Promise<void> {
  const payload = await optionalJSON("/api/session-events?limit=40");
  const inputs = extractArray(payload, ["events", "items"]);
  state.sessionEvents = inputs.map((event, index) => normalizeRuntimeEvent(event, index, []));
}

function fallbackCoverage(): CoverageSource[] {
  const adapterEvents = state.sessionEvents.filter(event => ["instrumented_adapter", "observer_recorded"].includes(event.trust) || event.source === "instrumented_adapter");
  const selfReported = state.sessionEvents.filter(event => event.trust === "agent_self_reported" || event.trust === "self_reported");
  const toolStatus = adapterEvents.length ? "adapter_reported" : selfReported.length ? "agent_self_reported" : "unknown";
  return [
    { key: "gateway_requests", name: tr("gatewayRequests"), status: "instrumented", evidence: state.decisions.length ? `${state.decisions.length} ${tr("derivedFromAudit").toLowerCase()}` : tr("derivedFromAudit") },
    { key: "tool_events", name: tr("toolEvents"), status: toolStatus, evidence: adapterEvents.length ? `${adapterEvents.length} ${tr("adapterReported").toLowerCase()}` : selfReported.length ? `${selfReported.length} ${tr("selfReported").toLowerCase()}` : tr("noAdapterEvidence") },
    { key: "filesystem", name: tr("filesystem"), status: "not_instrumented", evidence: tr("noSensor") },
    { key: "network", name: tr("network"), status: "not_instrumented", evidence: tr("noSensor") },
    { key: "os_syscalls", name: tr("osSyscalls"), status: "not_instrumented", evidence: tr("noSensor") },
    { key: "isolation", name: tr("isolation"), status: "not_connected", evidence: tr("demoOnly") }
  ];
}

async function loadCoverage(): Promise<void> {
  const payload = await optionalJSON("/api/runtime-coverage");
  state.coverage = payload ? normalizeCoverage(payload) : [];
  if (!state.coverage.length) state.coverage = fallbackCoverage();
}

function legacyDiscoveryPayload(discoveryPayload: unknown, approvalsPayload: unknown): InventoryState {
  const report = record(discoveryPayload);
  const approvalResponse = record(approvalsPayload);
  return {
    agents: extractArray(report, ["agents", "discoveries"]).map(normalizeDiscoveryAgent),
    approvals: extractArray(approvalResponse, ["approved_agents", "agents", "registrations"]).map(normalizeApproval),
    governedCount: 0,
    agentTypes: strings(approvalResponse, ["agent_types"]), scannedAt: textValue(report, ["scanned_at"], ""),
    rootCount: extractArray(report, ["roots", "scan_roots"]).length,
    gaps: extractArray(report, ["coverage_gaps", "gaps"]).map(gap => ({ source: privacySafe(textValue(gap, ["source"], "scan")), reason: textValue(gap, ["reason"], tr("unknown")) })),
    truncated: first(report, ["summary.truncated", "truncated"]) === true
  };
}

function normalizeAgentsPayload(payload: unknown): InventoryState {
  const container = record(payload);
  const discovery = Object.keys(record(container.discovery)).length ? record(container.discovery) : container;
  return {
    agents: extractArray(discovery, ["agents", "discoveries", "items"]).map(normalizeDiscoveryAgent),
    approvals: extractArray(container, ["asset_registry", "registered_agents", "approved_agents", "registrations", "registry"]).map(normalizeApproval),
    governedCount: extractArray(container, ["governed_identities"]).length,
    agentTypes: strings(container, ["agent_types"]), scannedAt: textValue(discovery, ["scanned_at"], ""),
    rootCount: extractArray(discovery, ["roots", "scan_roots"]).length,
    gaps: extractArray(discovery, ["coverage_gaps", "gaps"]).map(gap => ({ source: privacySafe(textValue(gap, ["source"], "scan")), reason: textValue(gap, ["reason"], tr("unknown")) })),
    truncated: first(discovery, ["summary.truncated", "truncated"]) === true
  };
}

async function loadInventory(): Promise<void> {
  try {
    const payload = await requestJSON("/api/agents");
    state.inventory = normalizeAgentsPayload(payload);
    state.modernAgentsAPI = true;
  } catch (error) {
    if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
    const [discovery, approvals] = await Promise.all([optionalJSON("/api/discoveries"), optionalJSON("/api/approved-agents")]);
    state.inventory = legacyDiscoveryPayload(discovery, approvals);
    state.modernAgentsAPI = false;
  }
}

async function loadScenarios(): Promise<void> {
  const payload = await requestJSON("/api/scenarios");
  state.scenarios = extractArray(payload, ["scenarios", "items"]).map(normalizeScenario);
  if (!state.selectedScenario && state.scenarios.length) state.selectedScenario = state.scenarios[0].id;
}

async function refreshAll(notify = false): Promise<void> {
  const button = qs<HTMLButtonElement>("#refresh-all");
  button.disabled = true;
  button.classList.add("loading");
  await checkHealth();
  const results = await Promise.allSettled([loadDecisions(), loadSessionEvents(), loadInventory(), loadScenarios()]);
  await loadCoverage();
  renderAll();
  const failures = results.filter(result => result.status === "rejected");
  if (failures.length) showToast(`${tr("requestFailed")}: ${failures.length}`, true);
  else if (notify) showToast(tr("refreshed"));
  button.disabled = false;
  button.classList.remove("loading");
}

function empty(message: string): HTMLElement { return node("p", "empty-state", message); }

function decisionButton(decision: Decision, index: number, compact = false): HTMLButtonElement {
  const button = node("button", compact ? "stream-row" : `decision-index-row${state.selectedDecision === decision.requestId ? " active" : ""}`) as HTMLButtonElement;
  button.type = "button";
  const badge = node("span", `route-badge ${slug(decision.route)}`, titleToken(decision.route));
  const action = node("span", "stream-action");
  action.append(node("strong", "", privacySafe(decision.action)), node("code", "", `${privacySafe(decision.agent)} · ${privacySafe(decision.capability)}`));
  if (compact) {
    button.append(badge, action, node("span", "stream-meta", `${privacySafe(decision.tool)} → ${privacySafe(decision.resource)}`), node("time", "stream-time", formatTime(decision.createdAt, true)));
  } else {
    const header = node("header"); header.append(badge, node("time", "stream-time", formatTime(decision.createdAt, true)));
    button.append(header, node("strong", "", privacySafe(decision.action)), node("code", "", `${shortID(decision.requestId)} · ${privacySafe(decision.agent)} · ${privacySafe(decision.resource)}`));
  }
  button.addEventListener("click", () => {
    state.selectedDecision = decision.requestId;
    navigate("decisions");
    renderDecisionViews();
    if (compact) window.requestAnimationFrame(() => qs("#decision-detail").scrollIntoView({ block: "start", behavior: "smooth" }));
  });
  button.dataset.index = String(index);
  return button;
}

function renderOverview(): void {
  const counts: Record<string, number> = { allow: 0, restrict: 0, sandbox: 0, deny: 0, escalate: 0 };
  state.decisions.forEach(decision => { if (decision.route in counts) counts[decision.route] += 1; });
  Object.entries(counts).forEach(([route, count]) => { qs(`#count-${route}`).textContent = String(count); });
  qs("#nav-decision-count").textContent = String(state.decisions.length);

  const stream = qs("#overview-decisions"); stream.replaceChildren();
  if (!state.decisions.length) stream.append(empty(tr("noDecisions")));
  else state.decisions.slice(0, 5).forEach((decision, index) => stream.append(decisionButton(decision, index, true)));

  const alerts = state.decisions.filter(decision => ["deny", "escalate"].includes(decision.route) || decision.violations.length || decision.events.some(event => event.violation));
  qs("#alert-count").textContent = String(alerts.length);
  qs("#nav-violation-count").textContent = String(alerts.length);
  const alertList = qs("#overview-alerts"); alertList.replaceChildren();
  if (!alerts.length) alertList.append(empty(tr("noAlerts")));
  else alerts.slice(0, 4).forEach(decision => {
    const row = node("article", "alert-row");
    const label = decision.violations[0] || (decision.events.some(event => event.violation) ? tr("violation") : titleToken(decision.route));
    row.append(node("strong", "", privacySafe(decision.action)), node("span", "", `${label} · ${privacySafe(decision.agent)} · ${shortID(decision.requestId)}`));
    alertList.append(row);
  });
  renderCoverage();

  const inventory = state.inventory;
  const shadow = inventory.agents.filter(agent => agent.status === "shadow" && agent.deploymentState !== "available").length;
  const available = inventory.agents.filter(agent => agent.deploymentState === "available").length;
  qs("#summary-registered").textContent = String(inventory.governedCount || inventory.approvals.length);
  qs("#summary-shadow").textContent = String(shadow);
  qs("#summary-evidence").textContent = String(available);
  qs("#nav-shadow-count").textContent = String(shadow);
}

function coverageName(source: CoverageSource): string {
  const normalized = slug(source.key);
  if (normalized.includes("gateway")) return tr("gatewayRequests");
  if (normalized.includes("tool") || normalized.includes("adapter")) return tr("toolEvents");
  if (normalized.includes("file")) return tr("filesystem");
  if (normalized.includes("network")) return tr("network");
  if (normalized.includes("syscall") || normalized === "os") return tr("osSyscalls");
  if (normalized.includes("sandbox") || normalized.includes("isolation")) return tr("isolation");
  return source.name;
}

function coverageStatus(value: string): string {
  const normalized = slug(value);
  if (["instrumented", "gateway-enforced", "enforced"].includes(normalized)) return tr("instrumented");
  if (["adapter-reported", "instrumented-adapter", "wrapper-and-self-reported-only"].includes(normalized)) return tr("adapterReported");
  if (["simulated-demo", "demo"].includes(normalized)) return tr("simulatedDemo");
  if (["agent-self-reported", "self-reported"].includes(normalized)) return tr("selfReported");
  if (["not-instrumented", "disconnected"].includes(normalized)) return tr("notInstrumented");
  if (["not-connected", "not-connected-demo"].includes(normalized)) return tr("notConnectedDemo");
  if (normalized === "connected") return tr("connected");
  return tr("unknown");
}

function coverageEvidence(source: CoverageSource): string {
  if (source.evidence) return privacySafe(source.evidence);
  const key = slug(source.key);
  const status = slug(source.status);
  if (key.includes("gateway") && status === "instrumented") return tr("derivedFromAudit");
  if (key.includes("tool")) return tr("noAdapterEvidence");
  if (key.includes("isolation") || key.includes("sandbox")) return tr("demoOnly");
  if (["not-instrumented", "not-connected", "not-reported", "unknown"].includes(status)) return tr("noSensor");
  return tr("unknown");
}

function renderCoverage(): void {
  const grid = qs("#coverage-grid"); grid.replaceChildren();
  const sources = state.coverage.length ? state.coverage : fallbackCoverage();
  sources.forEach(source => {
    const status = slug(source.status);
    const card = node("article", `coverage-source ${status}`);
    card.append(node("span", "", coverageName(source)), node("strong", "", coverageStatus(source.status)), node("small", "", coverageEvidence(source)));
    grid.append(card);
  });
}

function fact(label: string, value: string): HTMLElement {
  const row = node("div"); row.append(node("dt", "", label), node("dd", "", privacySafe(value || "—"))); return row;
}

function detailCard(title: string, facts: Array<[string, string]>): HTMLElement {
  const card = node("section", "detail-card"); card.append(node("h4", "", title));
  const dl = node("dl", "fact-list"); facts.forEach(([label, value]) => dl.append(fact(label, value))); card.append(dl); return card;
}

function railNode(code: string, label: string, detail: string, status: string): HTMLElement {
  const item = node("div", `investigation-node ${status}`); item.append(node("b", "", code), node("span", "", label), node("small", "", detail)); return item;
}

function renderInvestigationRail(decision: Decision): HTMLElement {
  const rail = node("div", "investigation-rail");
  const identityFailed = decision.matchedRules.some(rule => /identity|unknown.agent/i.test(rule)) && decision.route === "deny";
  const policyState = decision.policyRoute === "deny" ? "fail" : decision.policyRoute === "escalate" ? "warn" : "";
  const riskState = decision.riskLevel === "high" || decision.riskLevel === "critical" ? "warn" : "";
  const dispatchState = ["sandbox", "restrict", "escalate"].includes(decision.route) ? "warn" : decision.route === "deny" ? "fail" : "";
  const observationState = decision.violations.length || decision.events.some(event => event.violation) ? "fail" : !decision.events.length ? "warn" : "";
  rail.append(
    railNode("I", tr("identity"), decision.agent, identityFailed ? "fail" : ""), railNode("P", tr("policy"), titleToken(decision.policyRoute), policyState),
    railNode("R", tr("risk"), decision.riskScore === null ? tr("unknown") : String(decision.riskScore), riskState), railNode("D", tr("dispatch"), decision.executor, dispatchState),
    railNode("O", tr("observation"), decision.events.length ? String(decision.events.length) : tr("unknown"), observationState), railNode("A", tr("audit"), titleToken(decision.finalVerdict), "")
  );
  return rail;
}

function renderPolicyRisk(decision: Decision): HTMLElement {
  const grid = node("div", "policy-risk-grid");
  const policy = node("section", `policy-result${decision.policyRoute === "deny" ? " denied" : ""}`);
  const policyHead = node("div", "result-heading"); policyHead.append(node("span", "", tr("policyDecision")), node("strong", "", titleToken(decision.policyRoute)));
  const policyReasons = node("ul", "reason-list");
  const reasons = [...decision.policyReasons, ...decision.matchedRules.map(rule => `${tr("matchedRules")}: ${rule}`)];
  (reasons.length ? reasons : [tr("unknown")]).forEach(reason => policyReasons.append(node("li", "", privacySafe(reason))));
  policy.append(policyHead, policyReasons);
  const risk = node("section", `risk-result ${slug(decision.riskLevel)}`);
  const riskHead = node("div", "result-heading");
  riskHead.append(node("span", "", tr("riskAssessment")), node("strong", "", `${titleToken(decision.riskLevel)}${decision.riskScore === null ? "" : ` · ${decision.riskScore}/100`}`));
  const signals = node("ul", "reason-list"); (decision.riskSignals.length ? decision.riskSignals : [tr("unknown")]).forEach(signal => signals.append(node("li", "", privacySafe(signal))));
  risk.append(riskHead, signals); grid.append(policy, risk); return grid;
}

function renderEnvelope(decision: Decision): HTMLElement {
  if (!decision.envelope) {
    const unavailable = node("div", "envelope-unavailable");
    unavailable.append(node("strong", "", tr("permitNotIssued")), node("span", "", decision.route === "deny" ? tr("deniedBeforeExecution") : tr("legacyEnvelopeMissing")));
    return unavailable;
  }
  const envelope = decision.envelope;
  const wrapper = node("section", "authorization-envelope");
  const head = node("div", "envelope-head");
  const title = node("div"); title.append(node("p", "eyebrow", "SIGNED ROUTE CLEARANCE"), node("h4", "", tr("envelopeTitle")));
  head.append(title, node("code", "", shortID(envelope.permitId)));
  const grid = node("div", "envelope-grid");
  const fields: Array<[string, string]> = [
    [tr("principal"), envelope.principal], [tr("agentIdentity"), envelope.agent], [tr("capability"), envelope.capability], [tr("tool"), envelope.tool],
    [tr("resource"), envelope.resource], [tr("allowedOperations"), envelope.operations.join(", ") || "—"], [tr("issuedAt"), formatTime(envelope.issuedAt)], [tr("expiresAt"), formatTime(envelope.expiresAt)]
  ];
  fields.forEach(([label, value]) => { const item = node("div", "envelope-field"); item.append(node("span", "", label), node("strong", "", privacySafe(value))); grid.append(item); });
  wrapper.append(head, grid);
  const constraints = node("div", "constraint-strip");
  const entries = Object.entries(envelope.constraints);
  if (!entries.length) constraints.append(node("span", "", `${tr("constraints")}: ${tr("unknown")}`));
  else entries.forEach(([key, value]) => constraints.append(node("span", "", `${key}: ${privacySafe(value)}`)));
  wrapper.append(constraints); return wrapper;
}

function eventTrustLabel(event: RuntimeEvidence): string {
  const combined = `${event.source}_${event.trust}`.toLowerCase();
  if (combined.includes("simulated") || combined.includes("demo")) return tr("simulatedDemo");
  if (combined.includes("self_report")) return tr("selfReported");
  if (combined.includes("adapter") || combined.includes("observer_recorded")) return tr("adapterReported");
  if (combined.includes("gateway")) return "GATEWAY ENFORCED";
  if (combined.includes("os_sensor")) return "OS SENSOR";
  if (combined.includes("network_sensor")) return "NETWORK SENSOR";
  return tr("unknown");
}

function renderRuntimeEvents(decision: Decision): HTMLElement {
  const section = node("section", "runtime-section"); section.append(node("h4", "", tr("runtimeEvents")));
  if (!decision.events.length) { section.append(empty(tr("noExecutionEvidence"))); return section; }
  decision.events.forEach(event => {
    const row = node("article", `runtime-event${event.violation ? " violation" : ""}`);
    row.append(node("code", "", shortID(event.id)), node("strong", "", `${privacySafe(event.operation)} · ${privacySafe(event.tool)} → ${privacySafe(event.resource)}`), node("span", `trust-badge ${slug(`${event.source}-${event.trust}`)}`, `${event.violation ? `${tr("violation")} · ` : ""}${eventTrustLabel(event)}`));
    section.append(row);
  });
  return section;
}

function renderDecisionDetail(decision: Decision | undefined): void {
  const container = qs("#decision-detail"); container.replaceChildren();
  if (!decision) {
    const placeholder = node("div", "detail-empty"); placeholder.append(node("b", "", "I→A"), node("p", "", tr("noDecisions"))); container.append(placeholder); return;
  }
  const hero = node("header", "detail-hero"); const heroCopy = node("div");
  heroCopy.append(node("p", "eyebrow", `${tr("requestedAction")} · ${formatTime(decision.createdAt)}`), node("h3", "", privacySafe(decision.action)), node("code", "", shortID(decision.requestId)));
  const hasViolation = decision.violations.length > 0 || decision.events.some(event => event.violation);
  hero.append(heroCopy, node("div", `verdict-stamp ${hasViolation ? "violation" : slug(decision.route)}`, titleToken(decision.finalVerdict)));
  const details = node("div", "detail-grid");
  details.append(
    detailCard(tr("identity"), [[tr("principal"), decision.principal], [tr("principalType"), decision.principalType], [tr("agentIdentity"), decision.agent], [tr("workload"), decision.workload]]),
    detailCard(tr("delegatedAuthority"), [[tr("issuer"), decision.delegatedIssuer], [tr("delegatedSubject"), decision.delegatedSubject], [tr("scopes"), decision.scopes.join(", ") || "—"], [tr("credential"), decision.credentialFingerprint]]),
    detailCard(tr("actionRequest"), [[tr("capability"), decision.capability], [tr("tool"), decision.tool], [tr("resource"), decision.resource], [tr("operation"), decision.operation], [tr("sideEffect"), decision.sideEffect]]),
    detailCard(tr("dispatchDecision"), [[tr("selectedExecutor"), decision.executor], [tr("finalVerdict"), titleToken(decision.finalVerdict)], [tr("duration"), decision.durationMs === null ? "—" : `${decision.durationMs} ms`], [tr("isolationBackend"), titleToken(decision.isolationStatus)]])
  );
  container.append(hero, renderInvestigationRail(decision), details, renderPolicyRisk(decision), renderEnvelope(decision));
  if (["sandbox", "restrict"].includes(decision.route) && slug(decision.isolationStatus) !== "connected") {
    container.append(node("p", "isolation-warning", `${tr("isolationBackend")}: ${tr("notConnectedDemo")}`));
  }
  container.append(renderRuntimeEvents(decision));
}

function visibleDecisions(): Decision[] {
  if (state.decisionFilter === "blocked") return state.decisions.filter(decision => ["deny", "escalate"].includes(decision.route) || decision.events.some(event => event.violation));
  if (state.decisionFilter === "permitted") return state.decisions.filter(decision => ["allow", "restrict", "sandbox"].includes(decision.route));
  return state.decisions;
}

function renderDecisionViews(): void {
  const container = qs("#decision-list"); container.replaceChildren();
  const decisions = visibleDecisions();
  if (!decisions.length) container.append(empty(tr("noDecisions")));
  else decisions.forEach((decision, index) => container.append(decisionButton(decision, index)));
  renderDecisionDetail(state.decisions.find(decision => decision.requestId === state.selectedDecision) || decisions[0]);
}

function renderInvestigations(): void {
  const listContainer = qs("#investigation-list"); listContainer.replaceChildren();
  const relevant = state.decisions.filter(decision => ["deny", "escalate"].includes(decision.route) || decision.violations.length || decision.events.some(event => event.violation));
  if (!relevant.length) listContainer.append(empty(tr("noAlerts")));
  relevant.forEach(decision => {
    const row = node("article", "investigation-row");
    const route = node("span", `route-badge ${slug(decision.route)}`, decision.events.some(event => event.violation) ? "VIOLATION" : titleToken(decision.route));
    const description = node("div");
    description.append(node("strong", "", privacySafe(decision.action)), node("code", "", `${privacySafe(decision.agent)} · ${shortID(decision.requestId)} · ${formatTime(decision.createdAt)}`));
    const inspect = node("button", "", tr("inspectDecision")) as HTMLButtonElement; inspect.type = "button";
    inspect.addEventListener("click", () => { state.selectedDecision = decision.requestId; navigate("decisions"); renderDecisionViews(); });
    row.append(route, description, inspect); listContainer.append(row);
  });

  const evidenceContainer = qs("#runtime-event-list"); evidenceContainer.replaceChildren();
  const decisionEvents = state.decisions.flatMap(decision => decision.events.map(event => ({ event, requestId: decision.requestId })));
  const looseEvents = state.sessionEvents.map(event => ({ event, requestId: "session evidence" }));
  const combined = [...decisionEvents, ...looseEvents].slice(0, 50);
  if (!combined.length) evidenceContainer.append(empty(tr("noRuntimeEvidence")));
  combined.forEach(({ event, requestId }) => {
    const item = node("article", "evidence-item"); const header = node("header");
    header.append(node("strong", "", privacySafe(event.operation)), node("span", `trust-badge ${slug(`${event.source}-${event.trust}`)}`, eventTrustLabel(event)));
    item.append(header, node("code", "", `${shortID(requestId)} · ${privacySafe(event.tool)} → ${privacySafe(event.resource)} · ${formatTime(event.timestamp)}`)); evidenceContainer.append(item);
  });
}

function renderPolicies(): void {
  const container = qs("#policy-rule-list"); container.replaceChildren();
  const counts = new Map<string, number>();
  state.decisions.forEach(decision => decision.matchedRules.forEach(rule => counts.set(rule, (counts.get(rule) || 0) + 1)));
  if (!counts.size) { container.append(empty(tr("noRules"))); return; }
  [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
    const item = node("div", "policy-rule"); item.append(node("code", "", privacySafe(rule)), node("span", "", String(count))); container.append(item);
  });
}

function statusLabel(value: string): string {
  const normalized = slug(value);
  if (["approved", "registered", "active"].includes(normalized)) return tr("approved");
  if (normalized === "shadow") return "SHADOW";
  if (normalized === "unassessed") return tr("unassessed");
  return titleToken(value);
}

function deploymentLabel(value: string): string {
  const normalized = slug(value);
  return tr(({ available: "available", installed: "installed", configured: "configured", observed: "observed" } as Record<string, string>)[normalized] || "unknown");
}

function registrationPath(agent: InventoryAgent): string {
  const raw = agent.evidence[0]?.source || agent.evidence[0]?.indicator || "";
  const normalized = raw.replaceAll("\\", "/");
  return normalized.replace(/^.*?\/Users\/[^/]+\//i, "").replace(/^[A-Za-z]:\//, "").slice(0, 160);
}

function prepareRegistration(agent: InventoryAgent): void {
  resetApprovalForm();
  const details = qs<HTMLDetailsElement>(".registry-editor"); details.open = true;
  qs<HTMLInputElement>("#approval-name").value = agent.name;
  const type = qs<HTMLSelectElement>("#approval-type"); if ([...type.options].some(option => option.value === agent.agentType)) type.value = agent.agentType;
  qs<HTMLInputElement>("#approval-path").value = registrationPath(agent);
  qs<HTMLInputElement>("#approval-fingerprint").value = agent.fingerprint === "—" ? "" : agent.fingerprint;
  qs<HTMLInputElement>("#approval-owner").focus();
  details.scrollIntoView({ behavior: "smooth", block: "center" });
}

function inventoryCard(agent: InventoryAgent, compact = false): HTMLElement {
  const entry = node("article", `inventory-entry ${slug(agent.status)}`);
  const identity = node("div"); const badges = node("div", "inventory-badges");
  badges.append(node("span", "", statusLabel(agent.status)), node("span", "", deploymentLabel(agent.deploymentState)));
  identity.append(badges, node("h4", "", agent.name), node("code", "", `${agent.agentType} · ${fingerprintSafe(agent.fingerprint)}`));
  const confidence = node("div", "discovery-confidence");
  confidence.append(node("span", "", tr("discoveryConfidence")), node("strong", "", agent.confidence === null ? tr("unknown") : `${Math.round(agent.confidence * (agent.confidence <= 1 ? 100 : 1))}%`));
  const exposure = node("div", "exposure-copy");
  const capabilities = agent.potentialCapabilities.length ? ` · ${agent.potentialCapabilities.join(", ")}` : "";
  exposure.textContent = `${tr("potentialExposure")}: ${titleToken(agent.exposure)}${capabilities}`;
  entry.append(identity, confidence, exposure);
  if (!compact && agent.status === "shadow") {
    const button = node("button", "text-button", tr("prepareRegistration")) as HTMLButtonElement; button.type = "button"; button.addEventListener("click", () => prepareRegistration(agent)); entry.append(button);
  }
  return entry;
}

function renderApprovals(): void {
  const container = qs("#approval-list"); container.replaceChildren();
  if (!state.inventory.approvals.length) { container.append(empty(tr("noRegistrations"))); return; }
  state.inventory.approvals.forEach(approval => {
    const currentState = approval.status || approval.state || "active";
    const card = node("article", `approval-entry ${slug(currentState)}`); const header = node("header");
    header.append(node("strong", "", approval.display_name || approval.name), node("span", "", titleToken(currentState)));
    const identity = approval.agent_id || approval.workload_identity || approval.agent_type;
    card.append(header, node("code", "", `${privacySafe(identity)} · ${privacySafe(approval.path_contains || "evidence reference unavailable")}`),
      node("small", "", `${approval.owner}${approval.environment ? ` · ${approval.environment}` : ""}${approval.policy_profile ? ` · policy: ${approval.policy_profile}` : ""}`));
    const actions = node("div", "approval-actions");
    const edit = node("button", "text-button", tr("edit")) as HTMLButtonElement; edit.type = "button"; edit.addEventListener("click", () => editApproval(approval));
    const remove = node("button", "danger-button", tr("remove")) as HTMLButtonElement; remove.type = "button"; remove.addEventListener("click", () => void deleteApproval(approval));
    actions.append(edit, remove); card.append(actions); container.append(card);
  });
}

function renderAgentTypes(): void {
  const select = qs<HTMLSelectElement>("#approval-type"); const current = select.value; select.replaceChildren();
  const types = state.inventory.agentTypes.length ? state.inventory.agentTypes : [...new Set(state.inventory.agents.map(agent => agent.agentType).filter(type => type !== "unknown"))];
  (types.length ? types : ["agent"]).forEach(type => { const option = node("option", "", type) as HTMLOptionElement; option.value = type; select.append(option); });
  if (types.includes(current)) select.value = current;
}

function renderInventory(): void {
  const { agents, approvals, gaps, scannedAt, truncated } = state.inventory;
  const primary = agents.filter(agent => agent.deploymentState !== "available");
  const available = agents.filter(agent => agent.deploymentState === "available");
  const shadow = primary.filter(agent => agent.status === "shadow").length;
  qs("#inventory-approved").textContent = String(approvals.length);
  qs("#inventory-shadow").textContent = String(shadow);
  qs("#inventory-available").textContent = String(available.length);
  qs("#inventory-coverage").textContent = gaps.length || truncated ? tr("unknown") : state.inventory.rootCount ? tr("instrumented") : tr("unknown");
  qs("#available-count").textContent = String(available.length);
  qs("#scanned-at").textContent = scannedAt ? formatTime(scannedAt) : tr("unknown");
  const warning = qs("#inventory-warning"); warning.hidden = !gaps.length && !truncated;
  warning.textContent = gaps.length || truncated ? `${tr("scanIncomplete")}${gaps.length ? ` (${gaps.length})` : ""}` : "";
  const primaryList = qs("#inventory-primary-list"); primaryList.replaceChildren();
  if (!primary.length) primaryList.append(empty(tr("noInventory"))); else primary.forEach(agent => primaryList.append(inventoryCard(agent)));
  const evidenceList = qs("#inventory-evidence-list"); evidenceList.replaceChildren();
  if (!available.length) evidenceList.append(empty(tr("noAvailableEvidence"))); else available.forEach(agent => evidenceList.append(inventoryCard(agent, true)));
  renderAgentTypes(); renderApprovals();
}

function editApproval(approval: ApprovedAgent): void {
  const details = qs<HTMLDetailsElement>(".registry-editor"); details.open = true;
  qs<HTMLInputElement>("#approval-id").value = approval.id;
  qs<HTMLInputElement>("#approval-name").value = approval.display_name || approval.name;
  const type = qs<HTMLSelectElement>("#approval-type"); if ([...type.options].some(option => option.value === approval.agent_type)) type.value = approval.agent_type;
  qs<HTMLInputElement>("#approval-path").value = approval.path_contains;
  qs<HTMLInputElement>("#approval-fingerprint").value = approval.fingerprint || "";
  qs<HTMLInputElement>("#approval-owner").value = approval.owner;
  qs<HTMLInputElement>("#approval-environment").value = approval.environment || "";
  qs<HTMLInputElement>("#approval-ref").value = approval.approval_ref || "";
  qs<HTMLInputElement>("#approval-expiry").value = approval.expires_on || "";
  qs<HTMLSelectElement>("#approval-state").value = approval.state || approval.status || "active";
  qs<HTMLInputElement>("#approval-policy-profile").value = approval.policy_profile || "";
  qs<HTMLInputElement>("#approval-name").focus();
}

function resetApprovalForm(): void {
  qs<HTMLFormElement>("#approval-form").reset(); qs<HTMLInputElement>("#approval-id").value = ""; qs<HTMLSelectElement>("#approval-state").value = "active";
  const feedback = qs("#approval-feedback"); feedback.textContent = ""; feedback.classList.remove("error");
}

async function saveApproval(event: SubmitEvent): Promise<void> {
  event.preventDefault(); const form = qs<HTMLFormElement>("#approval-form"); const feedback = qs("#approval-feedback");
  const payload = Object.fromEntries(new FormData(form).entries()) as Record<string, FormDataEntryValue>;
  if (!state.modernAgentsAPI) { delete payload.environment; delete payload.policy_profile; }
  try {
    const response = await requestJSON("/api/approved-agents", { method: "POST", headers: { "Content-Type": "application/json", "X-Agent-Governance-Admin": "local-ui" }, body: JSON.stringify(payload) });
    const discovery = first(response, ["discovery"]); if (discovery) state.inventory = legacyDiscoveryPayload(discovery, { approved_agents: [...state.inventory.approvals] });
    await loadInventory(); renderInventory(); renderOverview(); resetApprovalForm(); feedback.textContent = tr("registrationSaved"); showToast(tr("registrationSaved"));
  } catch (error) { feedback.textContent = error instanceof Error ? error.message : tr("requestFailed"); feedback.classList.add("error"); }
}

async function deleteApproval(approval: ApprovedAgent): Promise<void> {
  if (!window.confirm(tr("confirmRemove"))) return;
  const feedback = qs("#approval-feedback");
  try {
    await requestJSON(`/api/approved-agents/${encodeURIComponent(approval.id)}`, { method: "DELETE", headers: { "X-Agent-Governance-Admin": "local-ui" } });
    await loadInventory(); renderInventory(); renderOverview(); feedback.textContent = tr("registrationRemoved"); showToast(tr("registrationRemoved"));
  } catch (error) { feedback.textContent = error instanceof Error ? error.message : tr("requestFailed"); feedback.classList.add("error"); }
}

async function rescanDiscoveries(): Promise<void> {
  const button = qs<HTMLButtonElement>("#rescan-discoveries"); button.disabled = true;
  try {
    await requestJSON("/api/discoveries/rescan", { method: "POST", headers: { "X-Agent-Governance-Admin": "local-ui" } });
    await loadInventory(); renderInventory(); renderOverview(); showToast(tr("scanComplete"));
  } catch (error) { showToast(error instanceof Error ? error.message : tr("requestFailed"), true); }
  finally { button.disabled = false; }
}

const localizedScenarios: Record<string, { zh: [string, string]; en: [string, string] }> = {
  "safe-code": { zh: ["安全代码请求", "合法身份、委托范围、工具与资源；签发许可并保持在信封内。"], en: ["Safe code request", "Valid identity, delegation, tool, and resource; issue a permit and stay inside it."] },
  "scope-violation": { zh: ["未授权财务访问", "代码 Agent 使用 code 范围请求 finance.read；执行前拒绝。"], en: ["Unauthorized finance access", "A coder Agent uses code scope for finance.read and is denied before execution."] },
  "authorization-boundary-violation": { zh: ["授权边界越界", "仅获准 config.read，随后演示 secret.read；触发越界结论。"], en: ["Authorization-boundary violation", "Only config.read is permitted, then demo secret.read triggers a boundary violation."] },
  "indirect-prompt-injection": { zh: ["间接提示注入", "来自检索内容的风险信号影响风险与分派。"], en: ["Indirect prompt injection", "Risk signals from retrieved content affect risk and dispatch."] },
  "sensitive-file-read": { zh: ["受保护文件读取", "只使用资源类别与访问元数据，不展示路径或内容。"], en: ["Protected file read", "Use resource class and access metadata without revealing paths or contents."] },
  "cross-tool-egress": { zh: ["敏感读取后外传", "因果链关联敏感读取与后续外部出口。"], en: ["Sensitive read followed by egress", "A causal chain links a sensitive read to subsequent external egress."] }
};

function scenarioCopy(scenario: Scenario): [string, string] {
  const direct = localizedScenarios[scenario.id];
  if (direct) return state.locale === "zh-CN" ? direct.zh : direct.en;
  const normalized = scenario.id.toLowerCase();
  const match = Object.entries(localizedScenarios).find(([key]) => normalized.includes(key) || key.includes(normalized));
  if (match) return state.locale === "zh-CN" ? match[1].zh : match[1].en;
  return [scenario.title, scenario.description];
}

function selectScenario(scenario: Scenario): void {
  state.selectedScenario = scenario.id;
  document.querySelectorAll<HTMLElement>(".scenario-card").forEach(card => card.classList.toggle("active", card.dataset.scenario === scenario.id));
  const [title] = scenarioCopy(scenario); qs("#scenario-selection").textContent = title;
  qs("#scenario-expected").textContent = `${tr("expected")}: ${titleToken(scenario.expectedRoute)}`;
  qs<HTMLTextAreaElement>("#request-json").value = JSON.stringify(scenario.request, null, 2);
  qs("#demo-error").textContent = "";
}

function renderScenarios(): void {
  const container = qs("#scenario-list"); container.replaceChildren();
  if (!state.scenarios.length) { container.append(empty(tr("noDecisions"))); return; }
  state.scenarios.forEach(scenario => {
    const [title, description] = scenarioCopy(scenario);
    const button = node("button", `scenario-card${state.selectedScenario === scenario.id ? " active" : ""}`) as HTMLButtonElement;
    button.type = "button"; button.dataset.scenario = scenario.id;
    button.append(node("strong", "", title), node("span", "", description), node("em", "", `${tr("expected")} · ${titleToken(scenario.expectedRoute)}`));
    button.addEventListener("click", () => selectScenario(scenario)); container.append(button);
  });
  const selected = state.scenarios.find(scenario => scenario.id === state.selectedScenario) || state.scenarios[0];
  if (selected) {
    const [title] = scenarioCopy(selected); qs("#scenario-selection").textContent = title; qs("#scenario-expected").textContent = `${tr("expected")}: ${titleToken(selected.expectedRoute)}`;
    if (!qs<HTMLTextAreaElement>("#request-json").value) qs<HTMLTextAreaElement>("#request-json").value = JSON.stringify(selected.request, null, 2);
  }
}

function freshenRequest(input: JsonObject): JsonObject {
  const request = structuredClone(input);
  delete request.simulated_actions;
  const suffix = crypto.randomUUID().slice(0, 8);
  for (const key of ["request_id", "session_id", "parent_event_id"]) {
    const value = request[key]; if (typeof value === "string" && value.startsWith("demo-")) request[key] = `${value}-${suffix}`;
  }
  const sources = list(request.input_sources);
  if (sources.length) request.input_sources = sources.map(source => {
    const copySource = { ...record(source) }; const eventID = copySource.event_id;
    if (typeof eventID === "string" && eventID.startsWith("demo-")) copySource.event_id = `${eventID}-${suffix}`;
    return copySource;
  });
  return request;
}

async function postAuthorization(request: JsonObject): Promise<unknown> {
  const options: RequestInit = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) };
  try { return await requestJSON("/api/authorize", options); }
  catch (error) {
    if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
    return requestJSON("/api/route", options);
  }
}

async function runDemo(): Promise<void> {
  const button = qs<HTMLButtonElement>("#authorize-button"); const errorBox = qs("#demo-error");
  const selected = state.scenarios.find(scenario => scenario.id === state.selectedScenario);
  if (!selected) { errorBox.textContent = tr("chooseScenario"); return; }
  let request: JsonObject;
  try { request = freshenRequest(record(JSON.parse(qs<HTMLTextAreaElement>("#request-json").value))); }
  catch (error) { errorBox.textContent = error instanceof Error ? `JSON: ${error.message}` : "Invalid JSON"; return; }
  button.disabled = true; button.querySelector("span")!.textContent = tr("authorizing"); errorBox.textContent = "";
  let serverDemo = true;
  try {
    let payload: unknown;
    try {
      payload = await requestJSON(`/api/demo-lab/${encodeURIComponent(selected.id)}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    } catch (error) {
      if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
      serverDemo = false; payload = await postAuthorization(request);
    }
    const decision = normalizeDecision(payload);
    if (!serverDemo) decision.events = decision.events.filter(event => event.source !== "simulated_demo");
    state.decisions = [decision, ...state.decisions.filter(existing => existing.requestId !== decision.requestId)];
    state.selectedDecision = decision.requestId; renderAll(); renderDemoResult(decision, serverDemo);
  } catch (error) { errorBox.textContent = error instanceof Error ? error.message : tr("requestFailed"); }
  finally { button.disabled = false; button.querySelector("span")!.textContent = tr("authorizeAction"); }
}

function renderDemoResult(decision?: Decision, serverDemo = false): void {
  const container = qs("#demo-result"); container.replaceChildren();
  if (!decision) {
    const placeholder = node("div", "demo-placeholder"); placeholder.append(node("b", "", "D→A"), node("p", "", tr("chooseScenario"))); container.append(placeholder); return;
  }
  const head = node("header", "demo-result-head"); head.append(node("span", "", serverDemo ? tr("demoEvidence") : tr("policyDecision")), node("strong", "", titleToken(decision.finalVerdict)));
  const body = node("div", "demo-result-body");
  const facts: Array<[string, string]> = [[tr("policyDecision"), titleToken(decision.policyRoute)], [tr("dispatchDecision"), titleToken(decision.route)], [tr("riskAssessment"), `${titleToken(decision.riskLevel)}${decision.riskScore === null ? "" : ` · ${decision.riskScore}/100`}`], [tr("permitId"), decision.envelope ? shortID(decision.envelope.permitId) : tr("permitNotIssued")], [tr("runtimeEvents"), serverDemo ? String(decision.events.length) : tr("unknown")]];
  facts.forEach(([label, value]) => { const row = node("div", "demo-result-fact"); row.append(node("span", "", label), node("strong", "", value)); body.append(row); });
  const truth = node("p", "demo-truth-note", serverDemo ? tr("truthfulDemo") : tr("noExecutionEvidence"));
  const inspect = node("button", "primary-button", tr("inspectDecision")) as HTMLButtonElement; inspect.type = "button";
  inspect.addEventListener("click", () => { navigate("decisions"); renderDecisionViews(); });
  container.append(head, body, truth, inspect);
}

function renderAll(): void {
  renderOverview(); renderDecisionViews(); renderInvestigations(); renderPolicies(); renderInventory(); renderScenarios();
  if (!qs("#demo-result").hasChildNodes()) renderDemoResult();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.nav || "overview"; if (validView(target)) navigate(target);
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-go]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.go || "overview"; if (validView(target)) navigate(target);
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(button => button.addEventListener("click", () => {
    state.decisionFilter = button.dataset.filter || "all";
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button)); renderDecisionViews();
  }));
  qs<HTMLButtonElement>("#language-toggle").addEventListener("click", () => {
    state.locale = state.locale === "zh-CN" ? "en" : "zh-CN"; localStorage.setItem("aegis-locale", state.locale); applyTranslations(); renderAll();
  });
  qs<HTMLButtonElement>("#refresh-all").addEventListener("click", () => void refreshAll(true));
  qs<HTMLButtonElement>("#rescan-discoveries").addEventListener("click", () => void rescanDiscoveries());
  qs<HTMLButtonElement>("#authorize-button").addEventListener("click", () => void runDemo());
  qs<HTMLFormElement>("#approval-form").addEventListener("submit", event => void saveApproval(event as SubmitEvent));
  qs<HTMLButtonElement>("#cancel-approval").addEventListener("click", resetApprovalForm);
  window.addEventListener("hashchange", () => { const target = location.hash.slice(1); if (validView(target)) navigate(target, false); });
}

bindEvents();
applyTranslations();
const initialView = location.hash.slice(1);
navigate(validView(initialView) ? initialView : "overview", false);
renderDemoResult();
void refreshAll();
