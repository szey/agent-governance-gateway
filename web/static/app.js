const state = { scenarios: [], selected: null };

const elements = {
  scenarioList: document.querySelector('#scenario-list'),
  requestJSON: document.querySelector('#request-json'),
  routeButton: document.querySelector('#route-button'),
  formError: document.querySelector('#form-error'),
  rail: document.querySelector('#decision-rail'),
  requestID: document.querySelector('#request-id'),
  decisionTitle: document.querySelector('#decision-title'),
  verdict: document.querySelector('#verdict-stamp'),
  route: document.querySelector('#route-value'),
  risk: document.querySelector('#risk-value'),
  executor: document.querySelector('#executor-value'),
  reasons: document.querySelector('#reason-list'),
  planned: document.querySelector('#planned-actions'),
  actual: document.querySelector('#actual-actions'),
  driftAlert: document.querySelector('#drift-alert'),
  driftCopy: document.querySelector('#drift-copy'),
	securityFindings: document.querySelector('#security-findings'),
	causalSummary: document.querySelector('#causal-summary'),
	findingList: document.querySelector('#finding-list'),
  auditList: document.querySelector('#audit-list'),
  refreshAudits: document.querySelector('#refresh-audits')
};

elements.inventoryTotal = document.querySelector('#inventory-total');
elements.inventoryRegistered = document.querySelector('#inventory-registered');
elements.inventoryShadow = document.querySelector('#inventory-shadow');
elements.discoveryList = document.querySelector('#discovery-list');
elements.sessionTotal = document.querySelector('#session-total');
elements.sessionObserver = document.querySelector('#session-observer');
elements.sessionSelfReported = document.querySelector('#session-self-reported');
elements.sessionCoverage = document.querySelector('#session-coverage');
elements.sessionLimitation = document.querySelector('#session-limitation');
elements.sessionEventList = document.querySelector('#session-event-list');
elements.refreshSessionEvents = document.querySelector('#refresh-session-events');

async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}

async function loadScenarios() {
  state.scenarios = await fetchJSON('/api/scenarios');
  elements.scenarioList.replaceChildren();
  state.scenarios.forEach((scenario, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scenario-card';
    button.dataset.id = scenario.id;

    const title = document.createElement('strong');
    title.textContent = scenario.title;
    const description = document.createElement('span');
    description.textContent = scenario.description;
    const expected = document.createElement('em');
    expected.textContent = `Expected · ${scenario.expected_route}`;
    button.append(title, description, expected);
    button.addEventListener('click', () => selectScenario(scenario));
    elements.scenarioList.append(button);
    if (index === 0) selectScenario(scenario);
  });
}

function selectScenario(scenario) {
  state.selected = scenario;
  document.querySelectorAll('.scenario-card').forEach(card => card.classList.toggle('active', card.dataset.id === scenario.id));
  elements.requestJSON.value = JSON.stringify(scenario.request, null, 2);
  elements.formError.textContent = '';
}

async function routeRequest() {
  elements.formError.textContent = '';
  let request;
  try {
    request = JSON.parse(elements.requestJSON.value);
	request = freshenDemoMetadata(request);
  } catch (error) {
    elements.formError.textContent = `JSON error: ${error.message}`;
    return;
  }

  elements.routeButton.disabled = true;
  elements.routeButton.firstChild.textContent = 'Routing request… ';
  elements.rail.classList.remove('routing');
  void elements.rail.offsetWidth;
  elements.rail.classList.add('routing');
  clearCheckpoints();

  try {
    const record = await fetchJSON('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    renderDecision(record);
    await loadAudits();
  } catch (error) {
    elements.formError.textContent = error.message;
  } finally {
    elements.routeButton.disabled = false;
    elements.routeButton.firstChild.textContent = 'Route this request ';
  }
}

function freshenDemoMetadata(request) {
	if (!request.session_id?.startsWith('demo-')) return request;
	const suffix = crypto.randomUUID().slice(0, 8);
	const remap = value => value ? `${value}-${suffix}` : value;
	return {
		...request,
		request_id: remap(request.request_id),
		session_id: remap(request.session_id),
		parent_event_id: remap(request.parent_event_id),
		input_sources: (request.input_sources || []).map(source => ({...source, event_id: remap(source.event_id)}))
	};
}

function renderDecision(record) {
  const decision = record.policy_decision;
  const observation = record.runtime_observation;
  const route = decision.route;
  elements.requestID.textContent = record.request_id;
  elements.decisionTitle.textContent = record.request.requested_action;
  elements.verdict.textContent = record.final_verdict.replaceAll('_', ' ');
  elements.verdict.className = `verdict-stamp ${route}`;
  elements.route.textContent = route;
  elements.risk.textContent = `${record.risk_assessment.level} · ${record.risk_assessment.score}/100`;
  elements.executor.textContent = record.selected_executor;

  elements.reasons.replaceChildren();
  [...decision.reasons, ...record.risk_assessment.signals].forEach(reason => {
    const item = document.createElement('li');
    item.textContent = reason;
    elements.reasons.append(item);
  });
  renderActions(elements.planned, observation.planned_actions, []);
  renderActions(elements.actual, observation.actual_actions, observation.unexpected_actions);

  elements.driftAlert.hidden = !observation.drift_detected;
  elements.driftCopy.textContent = observation.drift_detected
    ? `Unexpected: ${observation.unexpected_actions.join(', ')}`
    : '';
	renderSecurityFindings(record);
  setCheckpointStates(record);
}

function renderSecurityFindings(record) {
	const findings = record.security_findings || [];
	const context = record.causal_context || {};
	elements.securityFindings.hidden = findings.length === 0;
	elements.findingList.replaceChildren();
	elements.causalSummary.textContent = context.session_id
		? `${context.session_id} · cumulative ${context.cumulative_risk}/100 · privacy ${context.privacy_budget_remaining}`
		: '';
	findings.forEach(finding => {
		const item = document.createElement('article');
		item.className = `finding ${finding.severity}`;
		const summary = document.createElement('strong');
		summary.textContent = finding.summary;
		const meta = document.createElement('small');
		meta.textContent = `${finding.severity} · ${finding.rule} · ${(finding.evidence || []).join(' · ')}`;
		item.append(summary, meta);
		elements.findingList.append(item);
	});
}

function renderActions(container, actions, unexpected) {
  container.replaceChildren();
  if (!actions.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-chip';
    empty.textContent = 'No execution';
    container.append(empty);
    return;
  }
  actions.forEach(action => {
    const chip = document.createElement('span');
    chip.className = `action-chip${unexpected.includes(action) ? ' unexpected' : ''}`;
    chip.textContent = action;
    container.append(chip);
  });
}

function clearCheckpoints() {
  document.querySelectorAll('.checkpoint').forEach(node => node.classList.remove('pass', 'warn', 'fail'));
}

function setCheckpointStates(record) {
  const route = record.policy_decision.route;
  const drift = record.runtime_observation.drift_detected;
  const level = record.risk_assessment.level;
  const states = {
    identity: route === 'deny' && record.policy_decision.matched_rules.some(rule => rule.startsWith('identity')) ? 'fail' : 'pass',
    policy: route === 'deny' ? 'fail' : route === 'escalate' ? 'warn' : 'pass',
    risk: level === 'high' ? 'fail' : level === 'medium' ? 'warn' : 'pass',
    dispatch: route === 'deny' ? 'fail' : ['sandbox', 'restrict', 'escalate'].includes(route) ? 'warn' : 'pass',
    observe: route === 'deny' || route === 'escalate' ? 'warn' : drift ? 'fail' : 'pass',
    audit: 'pass'
  };
  Object.entries(states).forEach(([stage, value]) => {
    document.querySelector(`[data-stage="${stage}"]`).classList.add(value);
  });
}

async function loadAudits() {
  const audits = await fetchJSON('/api/audits?limit=8');
  elements.auditList.replaceChildren();
  if (!audits.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No routed requests yet.';
    elements.auditList.append(empty);
    return;
  }
  audits.forEach(record => {
    const entry = document.createElement('article');
    entry.className = 'audit-entry';
    const header = document.createElement('header');
    const id = document.createElement('code');
    id.textContent = record.request_id;
    const route = document.createElement('span');
    route.className = `audit-route ${record.policy_decision.route}`;
    route.textContent = record.policy_decision.route;
    header.append(id, route);
    const action = document.createElement('p');
    action.textContent = record.request.requested_action;
    const meta = document.createElement('small');
	const findingCount = record.security_findings?.length || 0;
	const detectionMeta = findingCount ? ` · ${findingCount} detection${findingCount === 1 ? '' : 's'}` : '';
	meta.textContent = `${record.request.agent_id} · risk ${record.risk_assessment.score} · ${record.final_verdict}${detectionMeta}`;
    entry.append(header, action, meta);
    elements.auditList.append(entry);
  });
}

async function loadDiscoveries() {
  const report = await fetchJSON('/api/discoveries');
  elements.inventoryTotal.textContent = report.summary?.total ?? 0;
  elements.inventoryRegistered.textContent = report.summary?.registered ?? 0;
  elements.inventoryShadow.textContent = report.summary?.shadow ?? 0;
  elements.discoveryList.replaceChildren();

  if (!report.agents?.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No Agent evidence found in the configured demo root.';
    elements.discoveryList.append(empty);
    return;
  }

  report.agents.forEach(agent => {
    const entry = document.createElement('article');
    entry.className = `discovery-entry ${agent.status}`;

    const identity = document.createElement('div');
    const status = document.createElement('span');
    status.className = 'discovery-status';
    status.textContent = agent.status;
    const name = document.createElement('strong');
    name.textContent = agent.name;
    const fingerprint = document.createElement('code');
    fingerprint.textContent = agent.fingerprint;
    identity.append(status, name, fingerprint);

    const risk = document.createElement('div');
    risk.className = 'discovery-risk';
    const score = document.createElement('strong');
    score.textContent = `${agent.risk.level} / ${agent.risk.score}`;
    const confidence = document.createElement('span');
    confidence.textContent = `${Math.round(agent.confidence * 100)}% confidence`;
    risk.append(score, confidence);

    const evidence = document.createElement('div');
    evidence.className = 'evidence-list';
    agent.evidence.forEach(item => {
      const chip = document.createElement('span');
      chip.textContent = `${item.source} · ${item.indicator}`;
      evidence.append(chip);
    });
    entry.append(identity, risk, evidence);
    elements.discoveryList.append(entry);
  });
}

async function loadSessionEvents() {
  const report = await fetchJSON('/api/session-events?limit=12');
  const summary = report.summary || {};
  elements.sessionTotal.textContent = summary.total ?? 0;
  elements.sessionObserver.textContent = summary.observer_recorded ?? 0;
  elements.sessionSelfReported.textContent = summary.self_reported ?? 0;
  elements.sessionCoverage.textContent = (summary.coverage || 'no_session_data').replaceAll('_', ' ');
  elements.sessionLimitation.textContent = report.events?.length
    ? report.limitation
    : 'No real Agent session has been recorded. The authorized enterprise Agent pilot has not been run.';
  elements.sessionEventList.replaceChildren();

  (report.events || []).forEach(event => {
    const entry = document.createElement('article');
    entry.className = `session-event ${event.trust}`;
    const sequence = document.createElement('code');
    sequence.textContent = `#${event.sequence} · ${event.session_id}`;
    const eventType = document.createElement('strong');
    eventType.textContent = event.event_type;
    const action = document.createElement('span');
    action.textContent = event.action_class;
    const trust = document.createElement('em');
    trust.textContent = event.trust.replaceAll('_', ' ');
    const status = document.createElement('small');
    status.textContent = `${event.status || 'observed'} · ${new Date(event.observed_at).toLocaleString()}`;
    entry.append(sequence, eventType, action, trust, status);
    elements.sessionEventList.append(entry);
  });
}

elements.routeButton.addEventListener('click', routeRequest);
elements.refreshAudits.addEventListener('click', () => loadAudits().catch(error => { elements.formError.textContent = error.message; }));
elements.refreshSessionEvents.addEventListener('click', () => loadSessionEvents().catch(error => { elements.formError.textContent = error.message; }));

Promise.all([loadScenarios(), loadAudits(), loadDiscoveries(), loadSessionEvents()]).catch(error => {
  elements.formError.textContent = `Control desk unavailable: ${error.message}`;
});
