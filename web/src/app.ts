type Locale = "zh-CN" | "en";
type ViewName = "decisions" | "permits" | "audit" | "demo" | "inventory";
type JsonObject = Record<string, unknown>;
type ScenarioKind = "valid" | "mutation" | "replay" | "expired" | "advanced";

interface Permit {
  id: string;
  permitClass: string;
  profileId: string;
  audience: string;
  signingKeyId: string;
  state: string;
  requestId: string;
  principal: string;
  agent: string;
  workload: string;
  delegationFingerprint: string;
  tool: string;
  capability: string;
  resource: string;
  operation: string;
  actionDigest: string;
  policyVersion: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  consumedAt: string;
  verification: string;
  obligations: string[];
  format: string;
  singleUse: boolean | null;
}

interface Decision {
  id: string;
  requestId: string;
  createdAt: string;
  principal: string;
  agent: string;
  workload: string;
  tool: string;
  capability: string;
  resource: string;
  operation: string;
  actionDigest: string;
  authorization: string;
  policyVersion: string;
  policyReasons: string[];
  obligations: string[];
  verification: string;
  verdict: string;
  evidenceSources: string[];
  permit: Permit | null;
}

interface Scenario {
  id: string;
  kind: ScenarioKind;
  title: string;
  description: string;
  expected: string;
  principal: string;
  agent: string;
  tool: string;
  capability: string;
  resource: string;
  operation: string;
  actionDigest: string;
  available: boolean;
}

interface DemoOutcome {
  result: string;
  permitId: string;
  state: string;
  actionDigest: string;
  upstreamInvoked: boolean | null;
  evidenceSource: string;
  attempts: string[];
}

const copy: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    skipContent: "跳到主要内容", brandSubtitle: "AI Agent 动作执行许可证", navDecisions: "裁决", navPermits: "许可证", navAudit: "审计", navDemo: "演示", navInventory: "实验性清单",
    invariantLabel: "执行不变量", invariant: "被授权的动作，必须正是被执行的动作。", checking: "检查中", online: "执行许可服务在线", offline: "执行许可服务不可达", productClass: "执行许可证层", refresh: "刷新",
    decisionsTitle: "动作裁决", permitsTitle: "执行许可证", auditTitle: "执行授权审计", demoTitle: "许可证验证实验", inventoryTitle: "实验性 Agent 清单",
    referenceMonitor: "REFERENCE MONITOR / PRE-EXECUTION", heroTitle: "AI Agent 动作执行许可证", heroLine: "一次授权。只执行获准的那一个动作。", heroDescription: "在真实工具副作用发生前，执行边界验证并消费一张短时、动作绑定、单次使用的签名许可证。", runDemo: "验证四种安全结果",
    normalize: "规范化", authorize: "授权", issue: "签发", verify: "验证", consume: "消费", authorizedCopy: "策略明确授权", deniedCopy: "执行前拒绝", violationsCopy: "验证未通过", replayCopy: "重复消费已阻断",
    executionActivity: "EXECUTION ACTIVITY", recentActivity: "最近活动", unknownRule: "未上报 ≠ 已验证", agent: "Agent", action: "动作", permit: "许可证", verificationResult: "验证结果", inspect: "查看", noActivity: "还没有动作裁决。前往演示运行一个服务器安全夹具。",
    decisionDetail: "裁决详情", selectActivity: "选择一条活动，查看其动作绑定与验证结果。", authorization: "授权结论", requestId: "请求 ID", principal: "主体", workload: "工作负载", tool: "工具", capability: "能力", resource: "资源", operation: "操作", actionDigest: "动作摘要", policyVersion: "策略版本", obligations: "执行义务", evidenceSource: "证据来源", noObligations: "无已报告义务", noEvidence: "NOT REPORTED — 没有来源明确的执行证据", compatibilityHint: "兼容响应：没有执行边界验证结果，界面不会推断已执行或安全。",
    credentialLedger: "EXECUTION CREDENTIAL LEDGER", permitsCopy: "只展示安全的相关标识与绑定字段。许可证令牌和原始敏感参数永不显示。", tokenHidden: "permit_token：永不渲染", all: "全部", failed: "异常", noPermits: "还没有可展示的许可证。拒绝裁决不会签发许可证。",
    permitDetail: "许可证详情", selectPermit: "选择一张许可证查看安全声明。", state: "状态", permitId: "许可证 ID / jti", permitClass: "许可证用途", profileId: "动作配置 ID / 版本", audience: "执行目标 / audience", signingKeyId: "签名密钥 ID / kid", issuer: "签发者", issuedAt: "签发时间", expiresAt: "失效时间", consumedAt: "消费时间", singleUse: "单次使用", credentialFingerprint: "委托凭据指纹", permitFormat: "签名格式", neverStored: "令牌与原始敏感参数不在此视图中保存或显示。", lifecycle: "许可证生命周期", issued: "已签发", verified: "已验证", consumed: "已消费", terminal: "终止状态", notReported: "NOT REPORTED", legacyEnvelope: "兼容授权信封；不是可独立验证的凭据",
    receiptLedger: "EXPLAINABLE RECEIPTS", auditCopy: "每张回执连接策略裁决、许可证状态、执行边界验证结果与来源明确的证据。", criticalControl: "关键控制", preExecution: "执行前许可证验证", preExecutionCopy: "只有 VERIFIED 才能调用上游工具。", additionalEvidence: "附加证据", postExecution: "执行中 / 执行后遥测", postExecutionCopy: "来源与可信度保持可区分；UNKNOWN 不会被写成 SAFE。", auditReceipts: "AUDIT RECEIPTS", latestReceipts: "最近回执", noAudits: "还没有审计回执。", finalVerdict: "最终结论", timestamp: "时间", receiptSafe: "安全回执：不含许可证令牌、委托令牌或原始动作参数。",
    safeFixtures: "SAFE / SERVER-OWNED FIXTURES", demoCopy: "四个场景直接证明动作绑定、短时效与单次消费。所有行为证据均明确标记为 simulated_demo。", primaryProofs: "PRIMARY PROOFS", fourScenarios: "四个核心场景", advancedFixtures: "高级回归夹具", advancedCopy: "保留旧安全场景用于回归，但它们不定义产品主线。", runScenario: "运行服务器夹具", serverFixture: "服务端固定夹具", argumentsHidden: "原始动作参数不在界面或普通审计中显示；这里只展示安全绑定字段。", expected: "预期", demoResult: "验证结果", chooseScenario: "选择一个场景查看执行许可路径。", notAvailable: "当前服务端尚未提供这个核心夹具。", requestFailed: "夹具运行失败", upstreamTool: "上游工具", invoked: "已调用", notInvoked: "未调用", unknownInvocation: "NOT REPORTED", attempts: "验证尝试", truthfulDemo: "证据标签：simulated_demo。它是回归夹具，不是生产遥测。",
    scenarioValidTitle: "A · 有效许可证", scenarioValidDescription: "精确动作通过验证，执行边界消费许可证后才调用上游工具。", scenarioValidExpected: "VERIFIED → CONSUMED",
    scenarioMutationTitle: "B · 动作变更 / TOCTOU", scenarioMutationDescription: "授权后更改安全相关参数，动作摘要不再匹配，上游工具不会被调用。", scenarioMutationExpected: "ACTION_MISMATCH → BLOCK",
    scenarioReplayTitle: "C · 许可证重放", scenarioReplayDescription: "第一次消费成功；同一许可证的第二次使用被 ReplayGuard 阻断。", scenarioReplayExpected: "VERIFIED → REPLAYED",
    scenarioExpiredTitle: "D · 许可证过期", scenarioExpiredDescription: "短时许可证超过有效期后，在执行边界被拒绝。", scenarioExpiredExpected: "EXPIRED → BLOCK",
    inventoryCopy: "该功能不属于执行许可证主线，仅在服务端明确启用实验性清单时显示。", noInventory: "没有实验性清单数据。发现能力保持冻结且默认关闭。", experimentalOnly: "实验性 / 非产品主线",
    footerTruth: "签名 · 动作绑定 · 短时 · 单次使用 · 不记录秘密", refreshed: "数据已刷新。", loading: "加载中…", unknown: "UNKNOWN"
  },
  en: {
    skipContent: "Skip to main content", brandSubtitle: "Execution permits for AI Agent actions", navDecisions: "Decisions", navPermits: "Permits", navAudit: "Audit", navDemo: "Demo", navInventory: "Experimental inventory",
    invariantLabel: "Execution invariant", invariant: "The action authorized must be exactly the action executed.", checking: "Checking", online: "Execution permit service online", offline: "Execution permit service unavailable", productClass: "Execution permit layer", refresh: "Refresh",
    decisionsTitle: "Action decisions", permitsTitle: "Execution permits", auditTitle: "Execution authorization audit", demoTitle: "Permit verification lab", inventoryTitle: "Experimental Agent inventory",
    referenceMonitor: "REFERENCE MONITOR / PRE-EXECUTION", heroTitle: "Execution Permits for AI Agent Actions", heroLine: "Authorize once. Execute exactly what was authorized.", heroDescription: "Before a real tool side effect, the execution boundary verifies and consumes a signed, short-lived, action-bound, single-use permit.", runDemo: "Prove four security outcomes",
    normalize: "Normalize", authorize: "Authorize", issue: "Issue", verify: "Verify", consume: "Consume", authorizedCopy: "Explicitly authorized", deniedCopy: "Denied before execution", violationsCopy: "Verification failures", replayCopy: "Repeated use blocked",
    executionActivity: "EXECUTION ACTIVITY", recentActivity: "Recent activity", unknownRule: "NOT REPORTED ≠ VERIFIED", agent: "Agent", action: "Action", permit: "Permit", verificationResult: "Verification result", inspect: "Inspect", noActivity: "No action decisions yet. Run a server-owned safety fixture in Demo.",
    decisionDetail: "Decision detail", selectActivity: "Select an activity to inspect its action binding and verification result.", authorization: "Authorization", requestId: "Request ID", principal: "Principal", workload: "Workload", tool: "Tool", capability: "Capability", resource: "Resource", operation: "Operation", actionDigest: "Action digest", policyVersion: "Policy version", obligations: "Execution obligations", evidenceSource: "Evidence source", noObligations: "No reported obligations", noEvidence: "NOT REPORTED — no source-labeled execution evidence", compatibilityHint: "Compatibility response: no execution-boundary verification result exists, so the UI does not infer execution or safety.",
    credentialLedger: "EXECUTION CREDENTIAL LEDGER", permitsCopy: "Only safe correlation and binding fields are shown. Permit tokens and raw sensitive arguments are never rendered.", tokenHidden: "permit_token: NEVER RENDERED", all: "All", failed: "Failed", noPermits: "No permits to display. Denied decisions do not issue permits.",
    permitDetail: "Permit detail", selectPermit: "Select a permit to inspect its safe claims.", state: "State", permitId: "Permit ID / jti", permitClass: "Permit class", profileId: "Action profile ID / version", audience: "Execution target / audience", signingKeyId: "Signing key ID / kid", issuer: "Issuer", issuedAt: "Issued at", expiresAt: "Expires at", consumedAt: "Consumed at", singleUse: "Single use", credentialFingerprint: "Delegated credential fingerprint", permitFormat: "Signing format", neverStored: "The token and raw sensitive arguments are neither retained nor shown in this view.", lifecycle: "Permit lifecycle", issued: "Issued", verified: "Verified", consumed: "Consumed", terminal: "Terminal state", notReported: "NOT REPORTED", legacyEnvelope: "Compatibility authorization envelope; not a self-verifying credential",
    receiptLedger: "EXPLAINABLE RECEIPTS", auditCopy: "Each receipt connects the policy decision, permit state, execution-boundary verification, and source-labeled evidence.", criticalControl: "Critical control", preExecution: "Pre-execution permit verification", preExecutionCopy: "Only VERIFIED may invoke the upstream tool.", additionalEvidence: "Additional evidence", postExecution: "During / post-execution telemetry", postExecutionCopy: "Sources and trust stay distinct; UNKNOWN is never rewritten as SAFE.", auditReceipts: "AUDIT RECEIPTS", latestReceipts: "Recent receipts", noAudits: "No audit receipts yet.", finalVerdict: "Final verdict", timestamp: "Timestamp", receiptSafe: "Safe receipt: no permit token, delegated token, or raw action arguments.",
    safeFixtures: "SAFE / SERVER-OWNED FIXTURES", demoCopy: "Four scenarios directly prove action binding, short lifetime, and single-use consumption. All behavior evidence is labeled simulated_demo.", primaryProofs: "PRIMARY PROOFS", fourScenarios: "Four core scenarios", advancedFixtures: "Advanced regression fixtures", advancedCopy: "Existing security fixtures remain for regression, but do not define the primary product story.", runScenario: "Run server fixture", serverFixture: "Server-owned fixture", argumentsHidden: "Raw action arguments are not shown or placed in normal audit. Only safe binding fields appear here.", expected: "Expected", demoResult: "Verification result", chooseScenario: "Choose a scenario to inspect the execution-permit path.", notAvailable: "The current server does not expose this core fixture yet.", requestFailed: "Fixture run failed", upstreamTool: "Upstream tool", invoked: "Invoked", notInvoked: "Not invoked", unknownInvocation: "NOT REPORTED", attempts: "Verification attempts", truthfulDemo: "Evidence label: simulated_demo. This is a regression fixture, not production telemetry.",
    scenarioValidTitle: "A · Valid permit", scenarioValidDescription: "The exact action verifies; the boundary consumes the permit before invoking the upstream tool.", scenarioValidExpected: "VERIFIED → CONSUMED",
    scenarioMutationTitle: "B · Action mutation / TOCTOU", scenarioMutationDescription: "A security-relevant argument changes after authorization, the digest mismatches, and the upstream tool is not invoked.", scenarioMutationExpected: "ACTION_MISMATCH → BLOCK",
    scenarioReplayTitle: "C · Permit replay", scenarioReplayDescription: "The first consumption succeeds; ReplayGuard blocks a second use of the same permit.", scenarioReplayExpected: "VERIFIED → REPLAYED",
    scenarioExpiredTitle: "D · Expired permit", scenarioExpiredDescription: "A short-lived permit is rejected at the execution boundary after its expiry.", scenarioExpiredExpected: "EXPIRED → BLOCK",
    inventoryCopy: "This is outside the execution-permit core and appears only when the server explicitly enables experimental inventory.", noInventory: "No experimental inventory data. Discovery remains frozen and disabled by default.", experimentalOnly: "Experimental / not product core",
    footerTruth: "Signed · action-bound · short-lived · single-use · secret-free audit", refreshed: "Data refreshed.", loading: "Loading…", unknown: "UNKNOWN"
  }
};

const viewTitles: Record<ViewName, { key: string; kicker: string }> = {
  decisions: { key: "decisionsTitle", kicker: "DECISIONS" },
  permits: { key: "permitsTitle", kicker: "PERMITS" },
  audit: { key: "auditTitle", kicker: "AUDIT" },
  demo: { key: "demoTitle", kicker: "DEMO" },
  inventory: { key: "inventoryTitle", kicker: "EXPERIMENTAL" }
};

const state: {
  locale: Locale;
  view: ViewName;
  decisions: Decision[];
  permits: Permit[];
  audits: Decision[];
  scenarios: Scenario[];
  selectedDecisionId: string;
  selectedPermitId: string;
  selectedScenarioId: string;
  permitFilter: string;
  demoOutcome: DemoOutcome | null;
  inventoryEnabled: boolean;
  inventory: JsonObject[];
} = {
  locale: (localStorage.getItem("aegis-locale") === "en" ? "en" : "zh-CN"),
  view: "decisions", decisions: [], permits: [], audits: [], scenarios: [], selectedDecisionId: "", selectedPermitId: "", selectedScenarioId: "", permitFilter: "all", demoOutcome: null, inventoryEnabled: false, inventory: []
};

function qs<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing UI element: ${selector}`);
  return element;
}

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function tr(key: string): string { return copy[state.locale][key] ?? key; }
function object(value: unknown): JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function get(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => object(current)[segment], value);
}
function first(value: unknown, paths: string[]): unknown {
  for (const path of paths) { const candidate = get(value, path); if (candidate !== undefined && candidate !== null && candidate !== "") return candidate; }
  return undefined;
}
function boolValue(value: unknown, paths: string[]): boolean | null {
  const candidate = first(value, paths);
  return typeof candidate === "boolean" ? candidate : null;
}
function rawText(value: unknown, paths: string[], fallback = ""): string {
  const candidate = first(value, paths);
  if (typeof candidate === "string" || typeof candidate === "number") return String(candidate).trim();
  return fallback;
}
function safeText(value: unknown, paths: string[], fallback = ""): string { return privacySafe(rawText(value, paths, fallback)); }
function stringList(value: unknown, paths: string[]): string[] {
  const candidate = first(value, paths);
  if (Array.isArray(candidate)) return candidate.filter(item => typeof item === "string").map(item => privacySafe(item as string));
  return [];
}
function upper(value: string, fallback = "UNKNOWN"): string { return value ? value.replaceAll("-", "_").replaceAll(" ", "_").toUpperCase() : fallback; }
function slug(value: string): string { return value.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]/g, "-"); }
function shortID(value: string): string { return value.length > 24 ? `${value.slice(0, 11)}…${value.slice(-8)}` : (value || "—"); }
function privacySafe(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/\b(?:bearer|token|secret|password)\s*[:=]\s*\S+/i.test(trimmed) || /^(?:ghp_|github_pat_|sk-)[A-Za-z0-9_-]{12,}/.test(trimmed)) return "[REDACTED]";
  if (/^[A-Za-z]:\\/.test(trimmed) || /^\/(?:Users|home)\//i.test(trimmed)) return "[LOCAL_RESOURCE_REDACTED]";
  return trimmed;
}
function formatTime(value: string): string {
  if (!value) return tr("notReported");
  const numeric = /^\d{10}(?:\.\d+)?$/.test(value) ? Number(value) * 1000 : Number.NaN;
  const parsed = new Date(Number.isNaN(numeric) ? value : numeric);
  return Number.isNaN(parsed.getTime()) ? privacySafe(value) : new Intl.DateTimeFormat(state.locale, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(parsed);
}
function extractArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) { const candidate = get(payload, key); if (Array.isArray(candidate)) return candidate; }
  return [];
}

async function requestJSON(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: "application/json", ...(options?.body ? { "Content-Type": "application/json" } : {}) }, ...options });
  if (!response.ok) {
    let code = `HTTP_${response.status}`;
    try { code = rawText(await response.json(), ["error"], code); } catch { /* status is sufficient */ }
    throw new Error(code);
  }
  return response.json();
}
async function optionalJSON(url: string): Promise<unknown | null> {
  try { return await requestJSON(url); } catch { return null; }
}

function normalizeObligations(value: unknown): string[] {
  const explicit = stringList(value, ["obligations", "execution_obligations"]);
  if (explicit.length) return explicit.map(item => upper(item));
  const claimsExplicit = stringList(value, ["claims.obligations"]);
  if (claimsExplicit.length) return claimsExplicit.map(item => upper(item));
  const source = object(first(value, ["obligations", "execution_obligations", "constraints", "claims.obligations"]));
  return Object.entries(source).flatMap(([key, item]) => {
    if (item === true) return [upper(key)];
    if (typeof item === "string" && item && !["allow", "allowed", "none", "false"].includes(item.toLowerCase())) return [`${upper(key)}: ${upper(item)}`];
    return [];
  });
}

function normalizeVerification(value: unknown): string {
  const direct = upper(rawText(value, ["verification_result", "verification_outcome", "verification.result", "verification.outcome", "permit.verification_result", "execution_permit.verification_result", "receipt.verification_outcome", "verdict", "final_verdict"], ""), "");
  const aliases: Record<string, string> = {
    PERMIT_ACTION_MISMATCH: "ACTION_MISMATCH", PERMIT_EXPIRED: "EXPIRED", PERMIT_REPLAY: "REPLAYED", PERMIT_INVALID_SIGNATURE: "INVALID_SIGNATURE", PERMIT_REVOKED: "REVOKED",
    EXECUTED_WITH_VALID_PERMIT: "VERIFIED", EXECUTION_COMPLETED: "VERIFIED", COMPLETED: "VERIFIED"
  };
  if (aliases[direct]) return aliases[direct];
  const recognized = ["VERIFIED", "EXPIRED", "INVALID_SIGNATURE", "ACTION_MISMATCH", "WRONG_PRINCIPAL", "WRONG_AGENT", "WRONG_WORKLOAD", "WRONG_DELEGATION", "WRONG_TOOL", "WRONG_CAPABILITY", "WRONG_RESOURCE", "WRONG_OPERATION", "WRONG_PROFILE", "WRONG_AUDIENCE", "WRONG_PERMIT_CLASS", "REPLAYED", "REVOKED", "INVALID_ISSUER", "UNKNOWN_PERMIT", "INVALID_PERMIT", "INVALID_ACTION", "NOT_YET_VALID"];
  if (recognized.includes(direct)) return direct;
  return "NOT_REPORTED";
}

function normalizePermit(value: unknown): Permit | null {
  const id = safeText(value, ["permit_id", "jti", "claims.jti", "claims.permit_id", "permit.permit_id", "permit.jti", "execution_permit.permit_id", "authorization_envelope.permit_id"]);
  if (!id) return null;
  const consumedAt = safeText(value, ["consumed_at", "permit.consumed_at", "execution_permit.consumed_at", "receipt.consumed_at"]);
  let permitState = upper(rawText(value, ["state", "permit_state", "permit.state", "execution_permit.state", "receipt.permit_state"], ""), "");
  if (!permitState && consumedAt) permitState = "CONSUMED";
  if (!permitState) permitState = "UNKNOWN";
  const format = safeText(value, ["signature_algorithm", "algorithm", "alg", "permit.signature_algorithm", "execution_permit.signature_algorithm", "format"]);
  const operationList = stringList(value, ["allowed_operations", "authorization_envelope.allowed_operations"]);
  return {
    id,
    permitClass: safeText(value, ["permit_class", "claims.permit_class", "permit.permit_class", "execution_permit.permit_class", "authorization_envelope.permit_class"]),
    profileId: safeText(value, ["profile_id", "claims.profile_id", "permit.profile_id", "execution_permit.profile_id", "authorization_envelope.profile_id"]),
    audience: safeText(value, ["audience", "claims.audience", "permit.audience", "execution_permit.audience", "authorization_envelope.audience"]),
    signingKeyId: safeText(value, ["signing_key_id", "claims.signing_key_id", "permit.signing_key_id", "authorization_envelope.signing_key_id"]),
    state: permitState,
    requestId: safeText(value, ["request_id", "claims.request_id", "permit.request_id", "execution_permit.request_id", "authorization_envelope.request_id"]),
    principal: safeText(value, ["principal", "principal_id", "claims.principal", "claims.principal_id", "permit.principal", "authorization_envelope.principal_id"]),
    agent: safeText(value, ["agent", "agent_id", "claims.agent", "claims.agent_id", "permit.agent", "authorization_envelope.agent_id"]),
    workload: safeText(value, ["workload", "workload_id", "claims.workload", "claims.workload_id", "permit.workload", "authorization_envelope.workload_id"]),
    delegationFingerprint: safeText(value, ["delegated_authority_fingerprint", "delegated_credential_fingerprint", "claims.delegated_authority_fingerprint", "permit.delegated_authority_fingerprint", "authorization_envelope.delegated_credential_fingerprint"]),
    tool: safeText(value, ["tool", "allowed_tool", "claims.tool", "permit.tool", "authorization_envelope.allowed_tool"]),
    capability: safeText(value, ["capability", "allowed_capability", "claims.capability", "permit.capability", "authorization_envelope.allowed_capability"]),
    resource: safeText(value, ["resource", "allowed_resource", "claims.resource", "permit.resource", "authorization_envelope.allowed_resource"]),
    operation: safeText(value, ["operation", "claims.operation", "permit.operation", "authorization_envelope.operation"], operationList[0] ?? ""),
    actionDigest: safeText(value, ["action_digest", "canonical_action_digest", "claims.action_digest", "permit.action_digest", "execution_permit.action_digest", "authorization_envelope.action_digest"]),
    policyVersion: safeText(value, ["policy_version", "claims.policy_version", "permit.policy_version", "execution_permit.policy_version"]),
    issuer: safeText(value, ["issuer", "iss", "claims.iss", "permit.issuer", "execution_permit.issuer"]),
    issuedAt: safeText(value, ["issued_at", "iat", "claims.iat", "permit.issued_at", "authorization_envelope.issued_at"]),
    expiresAt: safeText(value, ["expires_at", "exp", "claims.exp", "permit.expires_at", "authorization_envelope.expires_at"]),
    consumedAt,
    verification: normalizeVerification(value),
    obligations: normalizeObligations(first(value, ["permit", "execution_permit", "authorization_envelope", "receipt", "obligations"]) ?? value),
    format: format || (get(value, "authorization_envelope") ? "LEGACY_ENVELOPE" : "NOT_REPORTED"),
    singleUse: boolValue(value, ["single_use", "claims.single_use", "permit.single_use", "execution_permit.single_use"])
  };
}

function normalizeAuthorization(value: unknown): string {
  const direct = upper(rawText(value, ["authorization_decision", "authorization", "decision", "receipt.authorization_decision"], ""), "");
  if (["AUTHORIZED", "DENIED", "REQUIRES_APPROVAL"].includes(direct)) return direct;
  const authorized = boolValue(value, ["policy_decision.authorized", "authorized"]);
  if (authorized === true) return "AUTHORIZED";
  if (authorized === false) return "DENIED";
  const route = upper(rawText(value, ["policy_decision.route", "dispatch_decision.route", "route"], ""), "");
  if (route === "DENY") return "DENIED";
  if (route === "ESCALATE") return "REQUIRES_APPROVAL";
  if (["ALLOW", "RESTRICT", "SANDBOX"].includes(route)) return "AUTHORIZED";
  return "UNKNOWN";
}

function normalizeDecision(value: unknown): Decision {
  const permitSource = first(value, ["permit", "execution_permit", "authorization_envelope", "receipt.permit"]);
  const permit = normalizePermit(permitSource ?? value);
  const eventSources = extractArray(first(value, ["runtime_observation.events", "runtime_events", "events"]), []).map(item => safeText(item, ["source"])).filter(Boolean);
  const directSources = stringList(value, ["evidence_sources"]);
  const actionDigest = safeText(value, ["action_digest", "canonical_action_digest", "request.action_digest", "receipt.action_digest"], permit?.actionDigest ?? "");
  const operation = safeText(value, ["operation", "request.action.operation", "request.data_access.operation", "receipt.operation"], permit?.operation ?? "");
  return {
    id: safeText(value, ["decision_id", "id", "request_id", "receipt.decision_id", "receipt.request_id"], permit?.requestId || permit?.id || crypto.randomUUID()),
    requestId: safeText(value, ["request_id", "receipt.request_id"], permit?.requestId ?? ""),
    createdAt: safeText(value, ["timestamp", "created_at", "issued_at", "receipt.timestamp"], permit?.issuedAt ?? ""),
    principal: safeText(value, ["principal", "principal_id", "request.principal.principal_id", "request.user_id", "receipt.principal"], permit?.principal ?? ""),
    agent: safeText(value, ["agent", "agent_id", "request.agent.agent_id", "request.agent_id", "receipt.agent"], permit?.agent ?? ""),
    workload: safeText(value, ["workload", "workload_id", "request.agent.workload_id", "receipt.workload"], permit?.workload ?? ""),
    tool: safeText(value, ["tool", "request.tool.name", "request.tool.tool_id", "request.tool_identity.name", "receipt.tool"], permit?.tool ?? ""),
    capability: safeText(value, ["capability", "request.action.capability", "request.requested_capability", "receipt.capability"], permit?.capability ?? ""),
    resource: safeText(value, ["resource", "request.action.target_resource", "request.target_resource", "receipt.resource"], permit?.resource ?? ""),
    operation,
    actionDigest,
    authorization: normalizeAuthorization(value),
    policyVersion: safeText(value, ["policy_version", "receipt.policy_version"], permit?.policyVersion ?? ""),
    policyReasons: stringList(value, ["policy_reasons", "policy_decision.reasons", "receipt.reasons"]),
    obligations: normalizeObligations(value).length ? normalizeObligations(value) : (permit?.obligations ?? []),
    verification: normalizeVerification(value) !== "NOT_REPORTED" ? normalizeVerification(value) : (permit?.verification ?? "NOT_REPORTED"),
    verdict: upper(rawText(value, ["final_verdict", "verdict", "receipt.final_verdict"], "UNKNOWN")),
    evidenceSources: [...new Set([...directSources, ...eventSources])],
    permit
  };
}

function scenarioKind(value: unknown): ScenarioKind {
  const haystack = `${rawText(value, ["id"])} ${rawText(value, ["title"])} ${rawText(value, ["description"])}`.toLowerCase();
  if (/replay|single.?use|重放/.test(haystack)) return "replay";
  if (/expir|ttl|过期/.test(haystack)) return "expired";
  if (/mutation|mismatch|toctou|变更|篡改/.test(haystack)) return "mutation";
  if (/valid.?permit|exact.?action|happy.?path|有效许可证/.test(haystack)) return "valid";
  return "advanced";
}

function normalizeScenario(value: unknown): Scenario {
  const kind = scenarioKind(value);
  return {
    id: rawText(value, ["id"]), kind,
    title: safeText(value, ["title"], rawText(value, ["id"], "Fixture")),
    description: safeText(value, ["description"]),
    expected: upper(rawText(value, ["expected_verification", "expected_result", "expected_route"], "NOT_REPORTED")),
    principal: safeText(value, ["request.principal.principal_id", "request.user_id"]),
    agent: safeText(value, ["request.agent.agent_id", "request.agent_id"]),
    tool: safeText(value, ["request.tool.name", "request.tool.tool_id", "request.tool_identity.name"]),
    capability: safeText(value, ["request.action.capability", "request.requested_capability"]),
    resource: safeText(value, ["request.action.target_resource", "request.target_resource"]),
    operation: safeText(value, ["request.action.operation", "request.data_access.operation"]),
    actionDigest: safeText(value, ["action_digest", "request.action_digest"]), available: true
  };
}

const fallbackScenarios: Array<Omit<Scenario, "title" | "description" | "expected"> & { titleKey: string; descriptionKey: string; expectedKey: string }> = [
  { id: "valid-permit", kind: "valid", titleKey: "scenarioValidTitle", descriptionKey: "scenarioValidDescription", expectedKey: "scenarioValidExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
  { id: "action-mutation", kind: "mutation", titleKey: "scenarioMutationTitle", descriptionKey: "scenarioMutationDescription", expectedKey: "scenarioMutationExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
  { id: "permit-replay", kind: "replay", titleKey: "scenarioReplayTitle", descriptionKey: "scenarioReplayDescription", expectedKey: "scenarioReplayExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
  { id: "expired-permit", kind: "expired", titleKey: "scenarioExpiredTitle", descriptionKey: "scenarioExpiredDescription", expectedKey: "scenarioExpiredExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false }
];

function localizedScenario(scenario: Scenario): Scenario {
  if (scenario.kind === "advanced") return scenario;
  const prefix = `scenario${scenario.kind[0].toUpperCase()}${scenario.kind.slice(1)}`;
  return { ...scenario, title: tr(`${prefix}Title`), description: tr(`${prefix}Description`), expected: tr(`${prefix}Expected`) };
}

function mergeScenarios(serverScenarios: Scenario[]): Scenario[] {
  const primary = fallbackScenarios.map(fallback => {
    const server = serverScenarios.find(item => item.kind === fallback.kind);
    const base = server ?? { ...fallback, title: "", description: "", expected: "" };
    return localizedScenario(base);
  });
  return [...primary, ...serverScenarios.filter(item => item.kind === "advanced")];
}

function explicitInventoryFlag(payload: unknown): boolean {
  return first(payload, ["experimental_inventory_enabled", "features.experimental_inventory", "features.experimental_inventory.enabled", "experimental_inventory"]) === true;
}

function applyTranslations(): void {
  document.documentElement.lang = state.locale;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(element => { const key = element.dataset.i18n; if (key) element.textContent = tr(key); });
  qs<HTMLButtonElement>("#language-toggle").textContent = state.locale === "zh-CN" ? "EN" : "中文";
  state.scenarios = state.scenarios.map(localizedScenario);
  updateViewHeading();
}

function updateViewHeading(): void {
  const heading = viewTitles[state.view];
  qs("#view-kicker").textContent = heading.kicker;
  qs("#view-title").textContent = tr(heading.key);
}

function validView(value: string): value is ViewName { return ["decisions", "permits", "audit", "demo", "inventory"].includes(value); }
function compatibilityView(value: string): ViewName {
  if (value === "overview" || value === "policies") return "decisions";
  if (value === "investigations") return "audit";
  return validView(value) ? value : "decisions";
}

function navigate(view: ViewName, updateHash = true): void {
  if (view === "inventory" && !state.inventoryEnabled) view = "decisions";
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
  if (updateHash) history.replaceState(null, "", `#${view}`);
  qs("#main-content").focus({ preventScroll: true });
}

function badge(value: string): HTMLElement {
  const normalized = upper(value);
  const failure = !["VERIFIED", "AUTHORIZED", "CONSUMED", "ISSUED", "AVAILABLE", "UNKNOWN", "NOT_REPORTED", "REQUIRES_APPROVAL"].includes(normalized);
  return node("span", `status-badge ${slug(value)}${failure ? " failed" : ""}`, value || tr("unknown"));
}
function fact(label: string, value: string, mono = false): HTMLElement {
  const item = node("div", "fact");
  item.append(node("span", "", label), node(mono ? "code" : "strong", "", value || tr("notReported")));
  return item;
}
function empty(message: string): HTMLElement { return node("p", "empty-state", message); }
function showToast(message: string, error = false): void {
  const toast = node("div", `toast${error ? " error" : ""}`, message);
  qs("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

async function loadHealth(): Promise<void> {
  const indicator = qs("#system-state");
  const label = indicator.querySelector("b");
  try {
    const health = await requestJSON("/api/health");
    state.inventoryEnabled = explicitInventoryFlag(health);
    indicator.className = "system-state online";
    if (label) { label.dataset.i18n = "online"; label.textContent = tr("online"); }
  } catch {
    state.inventoryEnabled = false;
    indicator.className = "system-state offline";
    if (label) { label.dataset.i18n = "offline"; label.textContent = tr("offline"); }
  }
  qs<HTMLButtonElement>("#inventory-nav").hidden = !state.inventoryEnabled;
  if (!state.inventoryEnabled && state.view === "inventory") navigate("decisions");
}

async function loadDecisions(): Promise<void> {
  const payload = await optionalJSON("/api/decisions?limit=100") ?? await optionalJSON("/api/audits?limit=100");
  state.decisions = extractArray(payload, ["decisions", "records", "audits", "items"]).map(normalizeDecision);
  if (!state.selectedDecisionId || !state.decisions.some(item => item.id === state.selectedDecisionId)) state.selectedDecisionId = state.decisions[0]?.id ?? "";
}

function derivedPermits(): Permit[] {
  const unique = new Map<string, Permit>();
  [...state.decisions, ...state.audits].forEach(item => { if (item.permit) unique.set(item.permit.id, item.permit); });
  return [...unique.values()];
}

async function loadPermits(): Promise<void> {
  const payload = await optionalJSON("/api/permits?limit=100");
  const explicit = extractArray(payload, ["permits", "records", "items"]).map(normalizePermit).filter((item): item is Permit => item !== null);
  state.permits = explicit.length ? explicit : derivedPermits();
  if (!state.selectedPermitId || !state.permits.some(item => item.id === state.selectedPermitId)) state.selectedPermitId = state.permits[0]?.id ?? "";
}

async function loadAudits(): Promise<void> {
  const payload = await optionalJSON("/api/audits?limit=100");
  state.audits = extractArray(payload, ["audits", "receipts", "records", "items"]).map(normalizeDecision);
}

async function loadScenarios(): Promise<void> {
  const payload = await optionalJSON("/api/demo-lab") ?? await optionalJSON("/api/scenarios");
  const primary = extractArray(payload, ["scenarios", "items"]);
  const advanced = extractArray(payload, ["advanced_regression_fixtures"]);
  state.scenarios = mergeScenarios([...primary, ...advanced].map(normalizeScenario));
  if (!state.selectedScenarioId || !state.scenarios.some(item => item.id === state.selectedScenarioId)) state.selectedScenarioId = state.scenarios[0]?.id ?? "";
}

async function loadInventory(): Promise<void> {
  if (!state.inventoryEnabled) { state.inventory = []; return; }
  const payload = await optionalJSON("/api/agents");
  state.inventory = extractArray(payload, ["governed_identities", "agents", "items"]).map(object);
}

async function refreshAll(notify = false): Promise<void> {
  const refresh = qs<HTMLButtonElement>("#refresh-all");
  refresh.disabled = true;
  refresh.classList.add("loading");
  await loadHealth();
  await Promise.all([loadDecisions(), loadAudits(), loadScenarios(), loadInventory()]);
  await loadPermits();
  renderAll();
  refresh.disabled = false;
  refresh.classList.remove("loading");
  if (notify) showToast(tr("refreshed"));
}

function verificationClass(value: string): string {
  if (value === "VERIFIED") return "verified";
  if (value === "NOT_REPORTED" || value === "UNKNOWN") return "not-reported";
  return "failed";
}
function actionLabel(value: Pick<Decision, "tool" | "operation" | "capability">): string {
  const target = value.tool || value.capability || tr("unknown");
  return value.operation ? `${target} · ${value.operation}` : target;
}

function renderMetrics(): void {
  const authorized = state.decisions.filter(item => item.authorization === "AUTHORIZED").length;
  const denied = state.decisions.filter(item => item.authorization === "DENIED").length;
  const permitEvidence = state.permits.length ? state.permits : state.decisions.map(item => item.permit).filter((item): item is Permit => item !== null);
  const violations = permitEvidence.filter(item => !["VERIFIED", "NOT_REPORTED", "UNKNOWN"].includes(item.verification)).length;
  const replays = permitEvidence.filter(item => item.verification === "REPLAYED").length;
  qs("#count-authorized").textContent = String(authorized);
  qs("#count-denied").textContent = String(denied);
  qs("#count-violations").textContent = String(violations);
  qs("#count-replays").textContent = String(replays);
  qs("#nav-decision-count").textContent = String(state.decisions.length);
  qs("#nav-permit-count").textContent = String(state.permits.length);
  qs("#nav-violation-count").textContent = String(violations);
}

function renderActivity(): void {
  const body = qs<HTMLTableSectionElement>("#activity-body");
  const emptyState = qs("#activity-empty");
  body.replaceChildren();
  emptyState.hidden = state.decisions.length > 0;
  emptyState.textContent = tr("noActivity");
  state.decisions.slice(0, 20).forEach(decision => {
    const row = node("tr", decision.id === state.selectedDecisionId ? "selected" : "");
    const agent = node("td"); agent.append(node("strong", "", decision.agent || tr("unknown")), node("small", "", decision.workload || tr("notReported")));
    const action = node("td"); action.append(node("strong", "", actionLabel(decision)), node("small", "", decision.resource || tr("notReported")));
    const permit = node("td"); permit.append(node("code", "", decision.permit ? shortID(decision.permit.id) : "—"));
    const verification = node("td"); verification.append(badge(decision.verification));
    const inspect = node("td");
    const button = node("button", "inspect-button", "→"); button.type = "button"; button.setAttribute("aria-label", `${tr("inspect")} ${decision.requestId || decision.id}`);
    button.addEventListener("click", () => { state.selectedDecisionId = decision.id; renderActivity(); renderDecisionDetail(); });
    inspect.append(button); row.append(agent, action, permit, verification, inspect); body.append(row);
  });
  renderDecisionDetail();
}

function renderDecisionDetail(): void {
  const container = qs("#decision-detail"); container.replaceChildren();
  const decision = state.decisions.find(item => item.id === state.selectedDecisionId);
  if (!decision) { container.append(empty(tr("selectActivity"))); return; }
  const head = node("header", "detail-head");
  const headCopy = node("div"); headCopy.append(node("p", "eyebrow", tr("decisionDetail")), node("h3", "", shortID(decision.requestId || decision.id)));
  head.append(headCopy, badge(decision.authorization));
  const facts = node("div", "detail-facts");
  facts.append(
    fact(tr("principal"), decision.principal), fact(tr("agent"), decision.agent), fact(tr("workload"), decision.workload),
    fact(tr("tool"), decision.tool), fact(tr("capability"), decision.capability), fact(tr("resource"), decision.resource), fact(tr("operation"), decision.operation),
    fact(tr("actionDigest"), decision.actionDigest ? shortID(decision.actionDigest) : "NOT REPORTED", true), fact(tr("permitId"), decision.permit ? shortID(decision.permit.id) : "—", true), fact(tr("verificationResult"), decision.verification)
  );
  const obligationBlock = node("div", "detail-block"); obligationBlock.append(node("span", "block-label", tr("obligations")));
  const chips = node("div", "chip-list");
  (decision.obligations.length ? decision.obligations : [tr("noObligations")]).forEach(item => chips.append(node("span", "", item)));
  obligationBlock.append(chips);
  const evidence = node("div", "detail-block"); evidence.append(node("span", "block-label", tr("evidenceSource")));
  if (decision.evidenceSources.length) decision.evidenceSources.forEach(source => evidence.append(badge(upper(source)))); else evidence.append(node("p", "truth-copy", tr("noEvidence")));
  container.append(head, facts, obligationBlock, evidence);
  if (decision.verification === "NOT_REPORTED") container.append(node("p", "compatibility-note", tr("compatibilityHint")));
}

function filteredPermits(): Permit[] {
  if (state.permitFilter === "all") return state.permits;
  if (state.permitFilter === "failed") return state.permits.filter(item => !["VERIFIED", "NOT_REPORTED"].includes(item.verification) || ["EXPIRED", "REVOKED"].includes(item.state));
  return state.permits.filter(item => item.state === upper(state.permitFilter));
}

function renderPermits(): void {
  const list = qs("#permit-list"); list.replaceChildren();
  const permits = filteredPermits();
  if (!permits.length) list.append(empty(tr("noPermits")));
  permits.forEach(permit => {
    const button = node("button", `permit-row${permit.id === state.selectedPermitId ? " selected" : ""}`); button.type = "button";
    const top = node("span", "permit-row-top"); top.append(node("code", "", shortID(permit.id)), badge(permit.state));
    button.append(top, node("strong", "", `${permit.tool || tr("unknown")} · ${permit.operation || tr("unknown")}`), node("small", "", permit.agent || tr("unknown")), node("time", "", formatTime(permit.issuedAt)));
    button.addEventListener("click", async () => {
      state.selectedPermitId = permit.id;
      const detailPayload = await optionalJSON(`/api/permits/${encodeURIComponent(permit.id)}`);
      const detailed = normalizePermit(detailPayload);
      if (detailed) state.permits = state.permits.map(item => item.id === detailed.id ? detailed : item);
      renderPermits();
    });
    list.append(button);
  });
  renderPermitDetail();
}

function lifecycleStep(code: string, label: string, status: string): HTMLElement {
  const item = node("div", `lifecycle-step ${status}`); item.append(node("b", "", code), node("span", "", label)); return item;
}

function renderPermitDetail(): void {
  const container = qs("#permit-detail"); container.replaceChildren();
  const permit = state.permits.find(item => item.id === state.selectedPermitId);
  if (!permit) { container.append(empty(tr("selectPermit"))); return; }
  const ticket = node("section", "permit-ticket");
  const head = node("header", "ticket-head");
  const title = node("div"); title.append(node("p", "eyebrow", tr("permitDetail")), node("h3", "", shortID(permit.id)));
  head.append(title, badge(permit.state));
  const seal = node("div", "signature-seal");
  const sealLabel = permit.format === "LEGACY_ENVELOPE" ? "LEGACY" : permit.format === "NOT_REPORTED" ? "CLAIMS" : "SIGNED";
  seal.append(node("span", "", sealLabel), node("small", "", permit.format));
  const claims = node("div", "claim-grid");
  claims.append(
    fact(tr("permitClass"), permit.permitClass), fact(tr("profileId"), permit.profileId), fact(tr("audience"), permit.audience),
    fact(tr("principal"), permit.principal), fact(tr("agent"), permit.agent), fact(tr("workload"), permit.workload), fact(tr("credentialFingerprint"), permit.delegationFingerprint ? shortID(permit.delegationFingerprint) : "NOT REPORTED", true),
    fact(tr("tool"), permit.tool), fact(tr("capability"), permit.capability), fact(tr("resource"), permit.resource), fact(tr("operation"), permit.operation),
    fact(tr("actionDigest"), permit.actionDigest ? shortID(permit.actionDigest) : "NOT REPORTED", true), fact(tr("policyVersion"), permit.policyVersion), fact(tr("signingKeyId"), permit.signingKeyId), fact(tr("issuer"), permit.issuer), fact(tr("singleUse"), permit.singleUse === null ? "NOT REPORTED" : String(permit.singleUse))
  );
  const times = node("div", "ticket-times"); times.append(fact(tr("issuedAt"), formatTime(permit.issuedAt)), fact(tr("expiresAt"), formatTime(permit.expiresAt)), fact(tr("consumedAt"), formatTime(permit.consumedAt)));
  ticket.append(head, seal, claims, times, node("p", "secret-note", tr("neverStored")));
  if (permit.format === "LEGACY_ENVELOPE") ticket.append(node("p", "compatibility-note", tr("legacyEnvelope")));
  const lifecycle = node("section", "lifecycle-panel"); lifecycle.append(node("p", "eyebrow", tr("lifecycle")));
  const steps = node("div", "lifecycle-track");
  const issuedDone = permit.state !== "UNKNOWN";
  const verifiedDone = permit.verification === "VERIFIED" || permit.state === "CONSUMED";
  const consumedDone = permit.state === "CONSUMED";
  steps.append(lifecycleStep("01", tr("issued"), issuedDone ? "done" : "unknown"), lifecycleStep("02", tr("verified"), verifiedDone ? "done" : (permit.verification === "NOT_REPORTED" ? "unknown" : "failed")), lifecycleStep("03", tr("consumed"), consumedDone ? "done" : "unknown"));
  if (["EXPIRED", "REVOKED"].includes(permit.state) || !["VERIFIED", "NOT_REPORTED"].includes(permit.verification)) steps.append(lifecycleStep("!", permit.verification !== "NOT_REPORTED" ? permit.verification : permit.state, "failed"));
  lifecycle.append(steps);
  container.append(ticket, lifecycle);
}

function renderAudit(): void {
  const list = qs("#audit-list"); list.replaceChildren();
  qs("#audit-count").textContent = String(state.audits.length);
  if (!state.audits.length) { list.append(empty(tr("noAudits"))); return; }
  state.audits.forEach(receipt => {
    const item = node("details", "receipt");
    const summary = node("summary");
    const identity = node("span", "receipt-identity"); identity.append(node("strong", "", receipt.agent || tr("unknown")), node("small", "", actionLabel(receipt)));
    summary.append(node("time", "", formatTime(receipt.createdAt)), identity, node("code", "", receipt.permit ? shortID(receipt.permit.id) : "—"), badge(receipt.verification !== "NOT_REPORTED" ? receipt.verification : receipt.authorization));
    const body = node("div", "receipt-body");
    body.append(
      fact(tr("requestId"), shortID(receipt.requestId), true), fact(tr("finalVerdict"), receipt.verdict), fact(tr("authorization"), receipt.authorization), fact(tr("verificationResult"), receipt.verification),
      fact(tr("resource"), receipt.resource), fact(tr("operation"), receipt.operation), fact(tr("actionDigest"), receipt.actionDigest ? shortID(receipt.actionDigest) : "NOT REPORTED", true), fact(tr("policyVersion"), receipt.policyVersion),
      fact(tr("evidenceSource"), receipt.evidenceSources.length ? receipt.evidenceSources.map(item => upper(item)).join(" · ") : "NOT REPORTED")
    );
    body.append(node("p", "receipt-safe", tr("receiptSafe"))); item.append(summary, body); list.append(item);
  });
}

function scenarioIcon(kind: ScenarioKind): string { return ({ valid: "✓", mutation: "≠", replay: "↺", expired: "⌛", advanced: "·" })[kind]; }
function renderScenarioButton(scenario: Scenario): HTMLButtonElement {
  const button = node("button", `scenario-card ${scenario.kind}${scenario.id === state.selectedScenarioId ? " selected" : ""}${scenario.available ? "" : " unavailable"}`); button.type = "button";
  const top = node("span", "scenario-top"); top.append(node("b", "", scenarioIcon(scenario.kind)), node("em", "", scenario.expected));
  button.append(top, node("strong", "", scenario.title), node("small", "", scenario.description));
  button.addEventListener("click", () => { state.selectedScenarioId = scenario.id; state.demoOutcome = null; renderDemo(); });
  return button;
}

function renderDemo(): void {
  const primary = qs("#primary-scenario-list"); const advanced = qs("#advanced-scenario-list");
  primary.replaceChildren(); advanced.replaceChildren();
  state.scenarios.filter(item => item.kind !== "advanced").forEach(item => primary.append(renderScenarioButton(item)));
  const advancedItems = state.scenarios.filter(item => item.kind === "advanced");
  advancedItems.forEach(item => advanced.append(renderScenarioButton(item)));
  qs("#advanced-count").textContent = String(advancedItems.length);
  qs<HTMLDetailsElement>("#advanced-fixtures").hidden = advancedItems.length === 0;
  renderDemoScenarioDetail(); renderDemoResult();
}

function renderDemoScenarioDetail(): void {
  const container = qs("#demo-scenario-detail"); container.replaceChildren();
  const scenario = state.scenarios.find(item => item.id === state.selectedScenarioId);
  const runButton = qs<HTMLButtonElement>("#run-scenario");
  if (!scenario) { container.append(empty(tr("chooseScenario"))); runButton.disabled = true; return; }
  const head = node("header", "demo-detail-head");
  const heading = node("div"); heading.append(node("p", "eyebrow", tr("serverFixture")), node("h3", "", scenario.title));
  head.append(heading, badge(scenario.available ? "AVAILABLE" : "NOT_AVAILABLE"));
  const summary = node("p", "scenario-description", scenario.description);
  const fields = node("div", "fixture-fields");
  fields.append(fact(tr("principal"), scenario.principal), fact(tr("agent"), scenario.agent), fact(tr("tool"), scenario.tool), fact(tr("capability"), scenario.capability), fact(tr("resource"), scenario.resource), fact(tr("operation"), scenario.operation), fact(tr("actionDigest"), scenario.actionDigest ? shortID(scenario.actionDigest) : "COMPUTED SERVER-SIDE", true));
  const expected = node("div", "expected-result"); expected.append(node("span", "", tr("expected")), node("strong", "", scenario.expected));
  container.append(head, summary, fields, expected, node("p", "secret-note", tr("argumentsHidden")));
  if (!scenario.available) container.append(node("p", "compatibility-note", tr("notAvailable")));
  runButton.disabled = !scenario.available;
}

function normalizeDemoOutcome(payload: unknown): DemoOutcome {
  const permit = normalizePermit(first(payload, ["permit", "execution_permit", "authorization_envelope", "receipt.permit"]) ?? payload);
  const attemptsPayload = extractArray(payload, ["attempts", "verification_attempts", "results", "verifications"]);
  const attempts = attemptsPayload.map(item => normalizeVerification(item)).filter(item => item !== "NOT_REPORTED");
  const result = normalizeVerification(payload) !== "NOT_REPORTED" ? normalizeVerification(payload) : (attempts.at(-1) ?? permit?.verification ?? "NOT_REPORTED");
  return {
    result, permitId: permit?.id ?? safeText(payload, ["permit_id", "receipt.permit_id"]), state: permit?.state ?? upper(rawText(payload, ["permit_state", "state"], "UNKNOWN")),
    actionDigest: permit?.actionDigest ?? safeText(payload, ["action_digest", "receipt.action_digest"]),
    upstreamInvoked: boolValue(payload, ["upstream_invoked", "upstream_tool_invoked", "executor_invoked", "dispatch_decision.executor_invoked", "receipt.upstream_invoked"]),
    evidenceSource: safeText(payload, ["evidence_source", "source", "receipt.evidence_source"], "simulated_demo"), attempts
  };
}

async function runScenario(): Promise<void> {
  const scenario = state.scenarios.find(item => item.id === state.selectedScenarioId);
  if (!scenario?.available) return;
  const button = qs<HTMLButtonElement>("#run-scenario"); const error = qs("#demo-error");
  button.disabled = true; button.classList.add("loading"); error.textContent = "";
  try {
    const payload = await requestJSON(`/api/demo-lab/${encodeURIComponent(scenario.id)}/run`, { method: "POST", body: "{}" });
    state.demoOutcome = normalizeDemoOutcome(payload);
    await Promise.all([loadDecisions(), loadAudits()]); await loadPermits();
    renderAll(); navigate("demo", false);
  } catch (cause) {
    error.textContent = `${tr("requestFailed")}: ${cause instanceof Error ? cause.message : "UNKNOWN"}`;
  } finally { button.disabled = !scenario.available; button.classList.remove("loading"); }
}

function renderDemoResult(): void {
  const container = qs("#demo-result"); container.replaceChildren();
  const scenario = state.scenarios.find(item => item.id === state.selectedScenarioId);
  if (!state.demoOutcome || !scenario) {
    const placeholder = node("div", "demo-placeholder"); placeholder.append(node("b", "", "A≡A"), node("p", "", tr("chooseScenario"))); container.append(placeholder); return;
  }
  const outcome = state.demoOutcome;
  const head = node("header", `result-head ${verificationClass(outcome.result)}`); head.append(node("p", "eyebrow", tr("demoResult")), node("h3", "", outcome.result));
  const facts = node("div", "result-facts");
  const upstream = outcome.upstreamInvoked === true ? tr("invoked") : outcome.upstreamInvoked === false ? tr("notInvoked") : tr("unknownInvocation");
  facts.append(fact(tr("permitId"), shortID(outcome.permitId), true), fact(tr("state"), outcome.state), fact(tr("actionDigest"), outcome.actionDigest ? shortID(outcome.actionDigest) : "NOT REPORTED", true), fact(tr("upstreamTool"), upstream), fact(tr("evidenceSource"), upper(outcome.evidenceSource)));
  if (outcome.attempts.length) {
    const attempts = node("div", "attempt-list"); attempts.append(node("span", "block-label", tr("attempts")));
    outcome.attempts.forEach((attempt, index) => { const row = node("div"); row.append(node("b", "", String(index + 1).padStart(2, "0")), badge(attempt)); attempts.append(row); });
    facts.append(attempts);
  }
  container.append(head, facts, node("p", "demo-truth", tr("truthfulDemo")));
}

function renderInventory(): void {
  const container = qs("#inventory-list"); container.replaceChildren();
  if (!state.inventoryEnabled || !state.inventory.length) { container.append(empty(tr("noInventory"))); return; }
  container.append(node("p", "experimental-banner", tr("experimentalOnly")));
  state.inventory.forEach(item => {
    const row = node("article", "inventory-row");
    row.append(node("strong", "", safeText(item, ["agent_id", "name"], tr("unknown"))), node("code", "", safeText(item, ["workload_id", "workload_ids.0"], "NOT REPORTED")));
    container.append(row);
  });
}

function renderAll(): void {
  applyTranslations(); renderMetrics(); renderActivity(); renderPermits(); renderAudit(); renderDemo(); renderInventory();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach(button => button.addEventListener("click", () => navigate(compatibilityView(button.dataset.nav ?? ""))));
  document.querySelectorAll<HTMLButtonElement>("[data-go]").forEach(button => button.addEventListener("click", () => navigate(compatibilityView(button.dataset.go ?? ""))));
  document.querySelectorAll<HTMLButtonElement>("[data-permit-filter]").forEach(button => button.addEventListener("click", () => {
    state.permitFilter = button.dataset.permitFilter ?? "all";
    document.querySelectorAll<HTMLButtonElement>("[data-permit-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderPermits();
  }));
  qs<HTMLButtonElement>("#language-toggle").addEventListener("click", () => {
    state.locale = state.locale === "zh-CN" ? "en" : "zh-CN"; localStorage.setItem("aegis-locale", state.locale); qs("#demo-error").textContent = ""; renderAll();
  });
  qs<HTMLButtonElement>("#refresh-all").addEventListener("click", () => { void refreshAll(true); });
  qs<HTMLButtonElement>("#run-scenario").addEventListener("click", () => { void runScenario(); });
  window.addEventListener("hashchange", () => navigate(compatibilityView(location.hash.slice(1)), false));
}

bindEvents();
navigate(compatibilityView(location.hash.slice(1)), false);
void refreshAll();
