type Locale = "zh-CN" | "en";

interface Scenario {
  id: string;
  title: string;
  description: string;
  expected_route: string;
  request: Record<string, any>;
}

interface Evidence {
  source: string;
  indicator: string;
  confidence: number;
}

interface DiscoveredAgent {
  fingerprint: string;
  name: string;
  agent_type: string;
  deployment_state: "available" | "installed" | "configured" | "observed";
  status: "approved" | "shadow" | "unassessed";
  owner?: string;
  approval_id?: string;
  confidence: number;
  evidence: Evidence[];
  risk: { level: string; score: number; factors: string[] };
}

interface DiscoveryReport {
  scanned_at?: string;
  roots: string[];
  agents: DiscoveredAgent[];
  coverage_gaps: Array<{ source: string; reason: string }>;
  summary: {
    total: number;
    approved: number;
    shadow: number;
    available: number;
    coverage_gaps: number;
    truncated: boolean;
  };
}

interface ApprovedAgent {
  id: string;
  name: string;
  agent_type: string;
  fingerprint?: string;
  path_contains: string;
  owner: string;
  approval_ref?: string;
  expires_on?: string;
  state?: "active" | "suspended";
}

interface AuditRecord {
  request_id: string;
  request: { agent_id: string; requested_action: string };
  policy_decision: { route: string; reasons: string[]; matched_rules: string[] };
  risk_assessment: { level: string; score: number; signals: string[] };
  selected_executor: string;
  runtime_observation: {
    planned_actions: string[];
    actual_actions: string[];
    unexpected_actions: string[];
    drift_detected: boolean;
  };
  security_findings?: Array<{ severity: string; rule: string; summary: string; evidence?: string[] }>;
  causal_context?: { session_id?: string; cumulative_risk?: number; privacy_budget_remaining?: number };
  final_verdict: string;
}

interface SessionEvent {
  sequence: number;
  session_id: string;
  event_type: string;
  action_class: string;
  trust: string;
  status?: string;
  observed_at: string;
}

const copy: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    brandEyebrow: "Agent 安全控制平面", thesis: "先判断 Agent 可以做什么，再让动作真正发生。", online: "策略引擎在线",
    contractEyebrow: "治理边界", contractTitle: "批准 Agent，不等于批准它的行为", contractAsset: "资产准入", contractAssetCopy: "决定 Agent 是否可存在",
    contractAction: "逐次授权", contractActionCopy: "每次行为重新判断", contractAudit: "持续审计", contractAuditCopy: "所有可观察结果留痕",
    decisionEyebrow: "实时决策路径", decisionTitle: "行为安全检查轨", noRequest: "尚未路由请求", identity: "身份", policy: "策略", capability: "能力",
    risk: "风险", signals: "信号", dispatch: "分派", executor: "执行器", observe: "观察", drift: "偏移", audit: "审计", verdict: "结论",
    discoveryEyebrow: "发现与资产准入", discoveryTitle: "Agent 资产核对台账", discoveryNote: "批准只改变资产身份，不绕过行为策略或审计。", rescan: "重新扫描已配置目录",
    totalEvidence: "全部线索", approved: "已批准", availableOnly: "仅可用", coverageGaps: "覆盖缺口", discoveredEvidence: "发现的 Agent 线索",
    loadingRoots: "正在读取扫描范围…", loadingInventory: "正在加载发现清单…", approvalRegistryEyebrow: "本地治理数据", approvalRegistryTitle: "已批准 Agent 清单",
    approvalRegistryCopy: "没有条目时，所有已安装、已配置或已观察到但未匹配的 Agent 都属于 Shadow Agent。", agentName: "Agent 名称", agentType: "Agent 类型",
    pathEvidence: "证据路径片段", pathEvidenceHelp: "填写相对于扫描根目录的稳定片段，不要填写整块磁盘或用户名。", owner: "负责人", approvalRef: "批准单号",
    fingerprint: "发现指纹（推荐）", fingerprintHelp: "从 Shadow 线索生成批准记录时自动填写，用于避免只凭路径造成过宽匹配。",
    expiresOn: "到期日", approvalState: "清单状态", active: "生效", suspended: "暂停", saveApproval: "保存并重新核对", clearForm: "清空",
    evidenceEyebrow: "真实 Agent 证据 / 实验性", sessionTitle: "本地会话审计", events: "事件", selfReport: "Agent 自报", coverage: "覆盖范围",
    auditCoverageTitle: "所有经过网关的决策都会审计", auditCoverageCopy: "Observer 记录进程生命周期；结构化 Agent 输出明确标为自报；尚未接入的 OS 与网络行为不会被虚构为已观察。",
    noSession: "尚未记录真实 Agent 会话。", manifestEyebrow: "输入清单", scenarios: "演示场景", editJSON: "编辑请求 JSON", requestManifest: "请求清单",
    routeRequest: "路由这个请求", decisionSheet: "决策单", awaitingRequest: "等待请求", standby: "待命", route: "路由", whyRoute: "为什么这样路由",
    selectScenario: "选择一个场景，通过控制平面路由。", securityDetections: "会话安全检测", plannedActions: "计划动作", observedActions: "观察动作", noneYet: "暂无",
    behaviorDrift: "行为偏移", appendOnly: "追加写入记录", recentAudits: "最近审计", auditPrinciple: "Allow、Block 和 Escalate 都必须留痕；Agent 在批准清单中也不例外。",
    noAudits: "尚无已路由请求。", footer: "资产可见 · 逐次授权 · 持续审计", scanRoots: "扫描范围", neverScanned: "尚未扫描", noConfiguredRoot: "未配置扫描目录",
    noAgentEvidence: "配置的扫描目录中没有发现 Agent 线索。", noApprovals: "批准清单为空；实际部署的未匹配 Agent 将标记为 Shadow。", prepareApproval: "填写到批准表单",
    edit: "编辑", remove: "移除", confirmRemove: "移除这条批准记录？该 Agent 在下次核对后可能变为 Shadow。", approvalSaved: "批准记录已保存，发现结果已重新核对。",
    approvalRemoved: "批准记录已移除，发现结果已重新核对。", scanComplete: "扫描完成，清单已刷新。", routing: "正在路由…", expected: "预期", noExecution: "未执行",
    coverageWarning: "部分目录无法读取，结果不是完整磁盘视图。", availableExplanation: "仅在 marketplace、catalog、cache 或临时目录中发现；不作为已部署 Agent 判定。",
    approvalBoundary: "资产已批准；每次工具调用和资源访问仍需单独授权并审计。", shadowBoundary: "已部署或已配置，但未匹配批准清单。", expired: "已到期"
  },
  en: {
    brandEyebrow: "Agent security control plane", thesis: "Decide what an Agent may do before the action happens.", online: "Policy engine online",
    contractEyebrow: "Governance boundary", contractTitle: "An approved Agent does not have approved behavior", contractAsset: "Asset admission", contractAssetCopy: "May this Agent exist?",
    contractAction: "Per-action policy", contractActionCopy: "Re-evaluate every action", contractAudit: "Continuous audit", contractAuditCopy: "Record every observable outcome",
    decisionEyebrow: "Live decision path", decisionTitle: "Action security checkpoint rail", noRequest: "No request routed", identity: "Identity", policy: "Policy", capability: "Capability",
    risk: "Risk", signals: "Signals", dispatch: "Dispatch", executor: "Executor", observe: "Observe", drift: "Drift", audit: "Audit", verdict: "Verdict",
    discoveryEyebrow: "Discovery and asset admission", discoveryTitle: "Agent reconciliation ledger", discoveryNote: "Approval changes asset identity only; it never bypasses action policy or audit.", rescan: "Rescan configured roots",
    totalEvidence: "All evidence", approved: "Approved", availableOnly: "Available only", coverageGaps: "Coverage gaps", discoveredEvidence: "Discovered Agent evidence",
    loadingRoots: "Loading scan scope…", loadingInventory: "Loading discovery inventory…", approvalRegistryEyebrow: "Local governance data", approvalRegistryTitle: "Approved Agent registry",
    approvalRegistryCopy: "With an empty registry, every unmatched installed, configured, or observed Agent is Shadow.", agentName: "Agent name", agentType: "Agent type",
    pathEvidence: "Evidence path fragment", pathEvidenceHelp: "Use a stable fragment relative to the scan root; do not enter an entire disk or username.", owner: "Accountable owner", approvalRef: "Approval reference",
    fingerprint: "Discovery fingerprint (recommended)", fingerprintHelp: "Filled automatically when approving a Shadow finding, preventing a path-only match from becoming too broad.",
    expiresOn: "Expires on", approvalState: "Registry state", active: "Active", suspended: "Suspended", saveApproval: "Save and reconcile", clearForm: "Clear",
    evidenceEyebrow: "Real Agent evidence / experimental", sessionTitle: "Local session audit", events: "Events", selfReport: "Agent self-report", coverage: "Coverage",
    auditCoverageTitle: "Every gateway decision is audited", auditCoverageCopy: "The observer records process lifecycle; structured Agent output is labeled self-reported; disconnected OS and network behavior is never presented as observed.",
    noSession: "No real Agent session has been recorded.", manifestEyebrow: "Input manifest", scenarios: "Demo scenarios", editJSON: "Edit request JSON", requestManifest: "Request manifest",
    routeRequest: "Route this request", decisionSheet: "Decision sheet", awaitingRequest: "Awaiting request", standby: "Standby", route: "Route", whyRoute: "Why this route",
    selectScenario: "Select a scenario and route it through the control plane.", securityDetections: "Session security detections", plannedActions: "Planned actions", observedActions: "Observed actions", noneYet: "None yet",
    behaviorDrift: "Behavioral drift", appendOnly: "Append-only trail", recentAudits: "Recent audits", auditPrinciple: "Allow, block, and escalate are all recorded—even for an Agent in the approved registry.",
    noAudits: "No routed requests yet.", footer: "Asset visibility · per-action authorization · continuous audit", scanRoots: "Scan roots", neverScanned: "Never scanned", noConfiguredRoot: "No scan root configured",
    noAgentEvidence: "No Agent evidence was found in the configured scan roots.", noApprovals: "The approval registry is empty; unmatched deployed Agents will be marked Shadow.", prepareApproval: "Prepare approval",
    edit: "Edit", remove: "Remove", confirmRemove: "Remove this approval? The Agent may become Shadow after reconciliation.", approvalSaved: "Approval saved and discovery reconciled.",
    approvalRemoved: "Approval removed and discovery reconciled.", scanComplete: "Scan complete. Inventory refreshed.", routing: "Routing…", expected: "Expected", noExecution: "No execution",
    coverageWarning: "Some directories could not be read, so this is not a complete disk view.", availableExplanation: "Found only in a marketplace, catalog, cache, or temporary directory; not treated as a deployed Agent.",
    approvalBoundary: "Asset approved; every tool call and resource access still requires policy evaluation and audit.", shadowBoundary: "Deployed or configured, but not matched to the approval registry.", expired: "Expired"
  }
};

const state: {
  locale: Locale;
  scenarios: Scenario[];
  selected: Scenario | null;
  discovery: DiscoveryReport | null;
  approvals: ApprovedAgent[];
  agentTypes: string[];
} = {
  locale: localStorage.getItem("agg-locale") === "en" ? "en" : "zh-CN",
  scenarios: [], selected: null, discovery: null, approvals: [], agentTypes: []
};

function $(selector: string): HTMLElement {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Missing required element: ${selector}`);
  return node;
}

function input(selector: string): HTMLInputElement { return $(selector) as HTMLInputElement; }
function select(selector: string): HTMLSelectElement { return $(selector) as HTMLSelectElement; }
function t(key: string): string { return copy[state.locale][key] ?? key; }

const elements = {
  scenarioList: $("#scenario-list"), requestJSON: $("#request-json") as HTMLTextAreaElement, routeButton: $("#route-button") as HTMLButtonElement,
  formError: $("#form-error"), rail: $("#decision-rail"), requestID: $("#request-id"), decisionTitle: $("#decision-title"), verdict: $("#verdict-stamp"),
  route: $("#route-value"), risk: $("#risk-value"), executor: $("#executor-value"), reasons: $("#reason-list"), planned: $("#planned-actions"), actual: $("#actual-actions"),
  driftAlert: $("#drift-alert"), driftCopy: $("#drift-copy"), securityFindings: $("#security-findings"), causalSummary: $("#causal-summary"), findingList: $("#finding-list"),
  auditList: $("#audit-list"), refreshAudits: $("#refresh-audits") as HTMLButtonElement, inventoryTotal: $("#inventory-total"), inventoryApproved: $("#inventory-approved"),
  inventoryShadow: $("#inventory-shadow"), inventoryAvailable: $("#inventory-available"), inventoryGaps: $("#inventory-gaps"), discoveryList: $("#discovery-list"),
  scanRoots: $("#scan-roots"), scannedAt: $("#scanned-at"), gapList: $("#coverage-gap-list"), rescan: $("#rescan-discoveries") as HTMLButtonElement,
  approvalForm: $("#approval-form") as HTMLFormElement, approvalFeedback: $("#approval-feedback"), approvalList: $("#approval-list"), cancelApproval: $("#cancel-approval") as HTMLButtonElement,
  sessionTotal: $("#session-total"), sessionObserver: $("#session-observer"), sessionSelfReported: $("#session-self-reported"), sessionCoverage: $("#session-coverage"),
  sessionLimitation: $("#session-limitation"), sessionEventList: $("#session-event-list"), refreshSessionEvents: $("#refresh-session-events") as HTMLButtonElement,
  languageToggle: $("#language-toggle") as HTMLButtonElement
};

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body as T;
}

function applyTranslations(): void {
  document.documentElement.lang = state.locale;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(node => {
    const key = node.dataset.i18n;
    if (key) node.textContent = t(key);
  });
  elements.languageToggle.textContent = state.locale === "zh-CN" ? "EN" : "中文";
}

async function loadScenarios(): Promise<void> {
  state.scenarios = await fetchJSON<Scenario[]>("/api/scenarios");
  elements.scenarioList.replaceChildren();
  state.scenarios.forEach((scenario, index) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "scenario-card"; button.dataset.id = scenario.id;
    const title = document.createElement("strong"); title.textContent = scenario.title;
    const description = document.createElement("span"); description.textContent = scenario.description;
    const expected = document.createElement("em"); expected.textContent = `${t("expected")} · ${scenario.expected_route}`;
    button.append(title, description, expected);
    button.addEventListener("click", () => selectScenario(scenario));
    elements.scenarioList.append(button);
    if (index === 0 && !state.selected) selectScenario(scenario);
  });
}

function selectScenario(scenario: Scenario): void {
  state.selected = scenario;
  document.querySelectorAll<HTMLElement>(".scenario-card").forEach(card => card.classList.toggle("active", card.dataset.id === scenario.id));
  elements.requestJSON.value = JSON.stringify(scenario.request, null, 2);
  elements.formError.textContent = "";
}

async function routeRequest(): Promise<void> {
  elements.formError.textContent = "";
  let request: Record<string, any>;
  try {
    request = freshenDemoMetadata(JSON.parse(elements.requestJSON.value));
  } catch (error) {
    elements.formError.textContent = `JSON error: ${(error as Error).message}`;
    return;
  }
  elements.routeButton.disabled = true;
  elements.routeButton.querySelector("span")!.textContent = t("routing");
  elements.rail.classList.remove("routing"); void elements.rail.offsetWidth; elements.rail.classList.add("routing"); clearCheckpoints();
  try {
    const record = await fetchJSON<AuditRecord>("/api/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
    renderDecision(record); await loadAudits();
  } catch (error) {
    elements.formError.textContent = (error as Error).message;
  } finally {
    elements.routeButton.disabled = false; elements.routeButton.querySelector("span")!.textContent = t("routeRequest");
  }
}

function freshenDemoMetadata(request: Record<string, any>): Record<string, any> {
  if (!request.session_id?.startsWith("demo-")) return request;
  const suffix = crypto.randomUUID().slice(0, 8);
  const remap = (value?: string) => value ? `${value}-${suffix}` : value;
  return { ...request, request_id: remap(request.request_id), session_id: remap(request.session_id), parent_event_id: remap(request.parent_event_id),
    input_sources: (request.input_sources || []).map((source: Record<string, any>) => ({ ...source, event_id: remap(source.event_id) })) };
}

function renderDecision(record: AuditRecord): void {
  const decision = record.policy_decision; const observation = record.runtime_observation; const route = decision.route;
  elements.requestID.textContent = record.request_id; elements.decisionTitle.textContent = record.request.requested_action;
  elements.verdict.textContent = record.final_verdict.replaceAll("_", " "); elements.verdict.className = `verdict-stamp ${route}`;
  elements.route.textContent = route; elements.risk.textContent = `${record.risk_assessment.level} · ${record.risk_assessment.score}/100`; elements.executor.textContent = record.selected_executor;
  elements.reasons.replaceChildren(); [...decision.reasons, ...record.risk_assessment.signals].forEach(reason => { const item = document.createElement("li"); item.textContent = reason; elements.reasons.append(item); });
  renderActions(elements.planned, observation.planned_actions, []); renderActions(elements.actual, observation.actual_actions, observation.unexpected_actions);
  elements.driftAlert.hidden = !observation.drift_detected; elements.driftCopy.textContent = observation.drift_detected ? `Unexpected: ${observation.unexpected_actions.join(", ")}` : "";
  renderSecurityFindings(record); setCheckpointStates(record);
}

function renderSecurityFindings(record: AuditRecord): void {
  const findings = record.security_findings || []; const context = record.causal_context || {};
  elements.securityFindings.hidden = findings.length === 0; elements.findingList.replaceChildren();
  elements.causalSummary.textContent = context.session_id ? `${context.session_id} · cumulative ${context.cumulative_risk}/100 · privacy ${context.privacy_budget_remaining}` : "";
  findings.forEach(finding => {
    const item = document.createElement("article"); item.className = `finding ${finding.severity}`;
    const summary = document.createElement("strong"); summary.textContent = finding.summary;
    const meta = document.createElement("small"); meta.textContent = `${finding.severity} · ${finding.rule} · ${(finding.evidence || []).join(" · ")}`;
    item.append(summary, meta); elements.findingList.append(item);
  });
}

function renderActions(container: HTMLElement, actions: string[], unexpected: string[]): void {
  container.replaceChildren();
  if (!actions.length) { const empty = document.createElement("span"); empty.className = "empty-chip"; empty.textContent = t("noExecution"); container.append(empty); return; }
  actions.forEach(action => { const chip = document.createElement("span"); chip.className = `action-chip${unexpected.includes(action) ? " unexpected" : ""}`; chip.textContent = action; container.append(chip); });
}

function clearCheckpoints(): void { document.querySelectorAll(".checkpoint").forEach(node => node.classList.remove("pass", "warn", "fail")); }

function setCheckpointStates(record: AuditRecord): void {
  const route = record.policy_decision.route; const drift = record.runtime_observation.drift_detected; const level = record.risk_assessment.level;
  const states: Record<string, string> = {
    identity: route === "deny" && record.policy_decision.matched_rules.some(rule => rule.startsWith("identity")) ? "fail" : "pass",
    policy: route === "deny" ? "fail" : route === "escalate" ? "warn" : "pass", risk: level === "high" ? "fail" : level === "medium" ? "warn" : "pass",
    dispatch: route === "deny" ? "fail" : ["sandbox", "restrict", "escalate"].includes(route) ? "warn" : "pass",
    observe: route === "deny" || route === "escalate" ? "warn" : drift ? "fail" : "pass", audit: "pass"
  };
  Object.entries(states).forEach(([stage, value]) => document.querySelector(`[data-stage="${stage}"]`)?.classList.add(value));
}

async function loadAudits(): Promise<void> {
  const audits = await fetchJSON<AuditRecord[]>("/api/audits?limit=8"); elements.auditList.replaceChildren();
  if (!audits.length) { const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = t("noAudits"); elements.auditList.append(empty); return; }
  audits.forEach(record => {
    const entry = document.createElement("article"); entry.className = "audit-entry";
    const header = document.createElement("header"); const id = document.createElement("code"); id.textContent = record.request_id;
    const route = document.createElement("span"); route.className = `audit-route ${record.policy_decision.route}`; route.textContent = record.policy_decision.route; header.append(id, route);
    const action = document.createElement("p"); action.textContent = record.request.requested_action;
    const meta = document.createElement("small"); const count = record.security_findings?.length || 0;
    meta.textContent = `${record.request.agent_id} · risk ${record.risk_assessment.score} · ${record.final_verdict}${count ? ` · ${count} detection${count === 1 ? "" : "s"}` : ""}`;
    entry.append(header, action, meta); elements.auditList.append(entry);
  });
}

async function loadDiscoveries(): Promise<void> {
  const report = await fetchJSON<DiscoveryReport>("/api/discoveries"); state.discovery = report; renderDiscoveries(report);
}

function renderDiscoveries(report: DiscoveryReport): void {
  const summary = report.summary || {} as DiscoveryReport["summary"];
  elements.inventoryTotal.textContent = String(summary.total ?? 0); elements.inventoryApproved.textContent = String(summary.approved ?? 0);
  elements.inventoryShadow.textContent = String(summary.shadow ?? 0); elements.inventoryAvailable.textContent = String(summary.available ?? 0); elements.inventoryGaps.textContent = String(summary.coverage_gaps ?? 0);
  elements.scanRoots.textContent = report.roots?.length ? `${t("scanRoots")}: ${report.roots.join(" · ")}` : t("noConfiguredRoot");
  elements.scannedAt.textContent = report.scanned_at ? new Date(report.scanned_at).toLocaleString(state.locale) : t("neverScanned");
  elements.gapList.replaceChildren(); const gaps = report.coverage_gaps || []; elements.gapList.hidden = gaps.length === 0;
  if (gaps.length) {
    const warning = document.createElement("strong"); warning.textContent = t("coverageWarning"); elements.gapList.append(warning);
    gaps.forEach(gap => { const item = document.createElement("code"); item.textContent = `${gap.source} · ${gap.reason}`; elements.gapList.append(item); });
  }
  elements.discoveryList.replaceChildren();
  if (!report.agents?.length) { const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = t("noAgentEvidence"); elements.discoveryList.append(empty); return; }
  report.agents.forEach(agent => elements.discoveryList.append(discoveryCard(agent)));
}

function discoveryCard(agent: DiscoveredAgent): HTMLElement {
  const entry = document.createElement("article"); entry.className = `discovery-entry ${agent.status} deployment-${agent.deployment_state}`;
  const identity = document.createElement("div"); identity.className = "discovery-identity";
  const badges = document.createElement("div"); badges.className = "discovery-badges";
  const status = document.createElement("span"); status.className = "discovery-status"; status.textContent = statusLabel(agent.status);
  const deployment = document.createElement("span"); deployment.className = "deployment-status"; deployment.textContent = deploymentLabel(agent.deployment_state); badges.append(status, deployment);
  const name = document.createElement("strong"); name.textContent = agent.name;
  const boundary = document.createElement("p"); boundary.textContent = agent.status === "approved" ? t("approvalBoundary") : agent.status === "shadow" ? t("shadowBoundary") : t("availableExplanation");
  const fingerprint = document.createElement("code"); fingerprint.textContent = agent.fingerprint; identity.append(badges, name, boundary, fingerprint);
  const risk = document.createElement("div"); risk.className = "discovery-risk"; const score = document.createElement("strong"); score.textContent = `${agent.risk.level} / ${agent.risk.score}`;
  const confidence = document.createElement("span"); confidence.textContent = `${Math.round(agent.confidence * 100)}% confidence`; risk.append(score, confidence);
  const evidence = document.createElement("div"); evidence.className = "evidence-list"; agent.evidence.forEach(item => { const chip = document.createElement("span"); chip.textContent = `${item.source} · ${item.indicator}`; evidence.append(chip); });
  const actions = document.createElement("div"); actions.className = "discovery-actions";
  if (agent.status === "shadow") { const prepare = document.createElement("button"); prepare.type = "button"; prepare.className = "text-button"; prepare.textContent = t("prepareApproval"); prepare.addEventListener("click", () => prepareApproval(agent)); actions.append(prepare); }
  entry.append(identity, risk, evidence, actions); return entry;
}

function statusLabel(status: DiscoveredAgent["status"]): string { return status === "approved" ? t("approved") : status === "shadow" ? "Shadow" : state.locale === "zh-CN" ? "待评估" : "Unassessed"; }
function deploymentLabel(value: DiscoveredAgent["deployment_state"]): string {
  const labels = state.locale === "zh-CN" ? { available: "仅可用", installed: "已安装", configured: "已配置", observed: "已观察" } : { available: "Available", installed: "Installed", configured: "Configured", observed: "Observed" };
  return labels[value];
}

async function loadApprovals(): Promise<void> {
  const response = await fetchJSON<{ approved_agents: ApprovedAgent[]; agent_types: string[] }>("/api/approved-agents");
  state.approvals = response.approved_agents || []; state.agentTypes = response.agent_types || []; renderAgentTypes(); renderApprovals();
}

function renderAgentTypes(): void {
  const field = select("#approval-type"); const selected = field.value; field.replaceChildren();
  state.agentTypes.forEach(type => { const option = document.createElement("option"); option.value = type; option.textContent = type; field.append(option); });
  if (state.agentTypes.includes(selected)) field.value = selected;
}

function renderApprovals(): void {
  elements.approvalList.replaceChildren();
  if (!state.approvals.length) { const empty = document.createElement("p"); empty.className = "empty-state registry-empty"; empty.textContent = t("noApprovals"); elements.approvalList.append(empty); return; }
  state.approvals.forEach(approval => {
    const card = document.createElement("article"); card.className = `approval-entry ${approval.state || "active"}`;
    const header = document.createElement("header"); const name = document.createElement("strong"); name.textContent = approval.name;
    const stateBadge = document.createElement("span"); stateBadge.textContent = approval.state === "suspended" ? t("suspended") : isExpired(approval) ? t("expired") : t("active"); header.append(name, stateBadge);
    const path = document.createElement("code"); path.textContent = `${approval.agent_type} · ${approval.path_contains}${approval.fingerprint ? ` · ${approval.fingerprint}` : ""}`;
    const meta = document.createElement("small"); meta.textContent = `${approval.owner}${approval.approval_ref ? ` · ${approval.approval_ref}` : ""}${approval.expires_on ? ` · ${approval.expires_on}` : ""}`;
    const actions = document.createElement("div"); actions.className = "approval-actions";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "text-button"; edit.textContent = t("edit"); edit.addEventListener("click", () => editApproval(approval));
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "danger-button"; remove.textContent = t("remove"); remove.addEventListener("click", () => void deleteApproval(approval));
    actions.append(edit, remove); card.append(header, path, meta, actions); elements.approvalList.append(card);
  });
}

function isExpired(approval: ApprovedAgent): boolean { return Boolean(approval.expires_on && approval.expires_on < new Date().toISOString().slice(0, 10)); }

function prepareApproval(agent: DiscoveredAgent): void {
  resetApprovalForm(); input("#approval-name").value = agent.name; select("#approval-type").value = agent.agent_type;
  input("#approval-path").value = agent.evidence[0]?.source || ""; input("#approval-fingerprint").value = agent.fingerprint; input("#approval-owner").focus(); elements.approvalForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function editApproval(approval: ApprovedAgent): void {
  input("#approval-id").value = approval.id; input("#approval-name").value = approval.name; select("#approval-type").value = approval.agent_type;
  input("#approval-path").value = approval.path_contains; input("#approval-owner").value = approval.owner; input("#approval-ref").value = approval.approval_ref || "";
  input("#approval-fingerprint").value = approval.fingerprint || "";
  input("#approval-expiry").value = approval.expires_on || ""; select("#approval-state").value = approval.state || "active"; input("#approval-name").focus();
}

function resetApprovalForm(): void { elements.approvalForm.reset(); input("#approval-id").value = ""; select("#approval-state").value = "active"; elements.approvalFeedback.textContent = ""; elements.approvalFeedback.classList.remove("error"); }

async function saveApproval(event: SubmitEvent): Promise<void> {
  event.preventDefault(); elements.approvalFeedback.textContent = ""; elements.approvalFeedback.classList.remove("error");
  const data = new FormData(elements.approvalForm); const payload = Object.fromEntries(data.entries());
  try {
    const response = await fetchJSON<{ approved_agent: ApprovedAgent; discovery: DiscoveryReport }>("/api/approved-agents", {
      method: "POST", headers: { "Content-Type": "application/json", "X-Agent-Governance-Admin": "local-ui" }, body: JSON.stringify(payload)
    });
    state.discovery = response.discovery; renderDiscoveries(response.discovery); resetApprovalForm(); await loadApprovals(); elements.approvalFeedback.textContent = t("approvalSaved");
  } catch (error) { elements.approvalFeedback.textContent = (error as Error).message; elements.approvalFeedback.classList.add("error"); }
}

async function deleteApproval(approval: ApprovedAgent): Promise<void> {
  if (!window.confirm(t("confirmRemove"))) return;
  try {
    const response = await fetchJSON<{ discovery: DiscoveryReport }>(`/api/approved-agents/${encodeURIComponent(approval.id)}`, { method: "DELETE", headers: { "X-Agent-Governance-Admin": "local-ui" } });
    state.discovery = response.discovery; renderDiscoveries(response.discovery); await loadApprovals(); elements.approvalFeedback.textContent = t("approvalRemoved");
  } catch (error) { elements.approvalFeedback.textContent = (error as Error).message; }
}

async function rescanDiscoveries(): Promise<void> {
  elements.rescan.disabled = true;
  try {
    const report = await fetchJSON<DiscoveryReport>("/api/discoveries/rescan", { method: "POST", headers: { "X-Agent-Governance-Admin": "local-ui" } });
    state.discovery = report; renderDiscoveries(report); elements.approvalFeedback.textContent = t("scanComplete");
  } catch (error) { elements.approvalFeedback.textContent = (error as Error).message; }
  finally { elements.rescan.disabled = false; }
}

async function loadSessionEvents(): Promise<void> {
  const report = await fetchJSON<{ events: SessionEvent[]; summary: Record<string, any>; limitation: string }>("/api/session-events?limit=12"); const summary = report.summary || {};
  elements.sessionTotal.textContent = String(summary.total ?? 0); elements.sessionObserver.textContent = String(summary.observer_recorded ?? 0); elements.sessionSelfReported.textContent = String(summary.self_reported ?? 0);
  elements.sessionCoverage.textContent = String(summary.coverage || "no_session_data").replaceAll("_", " ");
  elements.sessionLimitation.textContent = report.events?.length ? report.limitation : t("noSession"); elements.sessionEventList.replaceChildren();
  (report.events || []).forEach(event => {
    const entry = document.createElement("article"); entry.className = `session-event ${event.trust}`;
    const sequence = document.createElement("code"); sequence.textContent = `#${event.sequence} · ${event.session_id}`;
    const eventType = document.createElement("strong"); eventType.textContent = event.event_type; const action = document.createElement("span"); action.textContent = event.action_class;
    const trust = document.createElement("em"); trust.textContent = event.trust.replaceAll("_", " "); const status = document.createElement("small"); status.textContent = `${event.status || "observed"} · ${new Date(event.observed_at).toLocaleString(state.locale)}`;
    entry.append(sequence, eventType, action, trust, status); elements.sessionEventList.append(entry);
  });
}

elements.routeButton.addEventListener("click", () => void routeRequest());
elements.refreshAudits.addEventListener("click", () => void loadAudits().catch(error => { elements.formError.textContent = error.message; }));
elements.refreshSessionEvents.addEventListener("click", () => void loadSessionEvents().catch(error => { elements.formError.textContent = error.message; }));
elements.rescan.addEventListener("click", () => void rescanDiscoveries());
elements.approvalForm.addEventListener("submit", event => void saveApproval(event));
elements.cancelApproval.addEventListener("click", resetApprovalForm);
elements.languageToggle.addEventListener("click", () => {
  state.locale = state.locale === "zh-CN" ? "en" : "zh-CN"; localStorage.setItem("agg-locale", state.locale); applyTranslations();
  void Promise.all([loadScenarios(), loadAudits(), loadDiscoveries(), loadApprovals(), loadSessionEvents()]);
});

applyTranslations();
Promise.all([loadScenarios(), loadAudits(), loadDiscoveries(), loadApprovals(), loadSessionEvents()]).catch(error => {
  elements.formError.textContent = `Control desk unavailable: ${error.message}`;
});
