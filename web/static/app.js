"use strict";
(() => {
  // web/src/app.ts
  var copy = {
    "zh-CN": {
      skipContent: "\u8DF3\u5230\u4E3B\u8981\u5185\u5BB9",
      brandSubtitle: "AI Agent \u52A8\u4F5C\u6267\u884C\u8BB8\u53EF\u8BC1",
      navDecisions: "\u88C1\u51B3",
      navPermits: "\u8BB8\u53EF\u8BC1",
      navAudit: "\u5BA1\u8BA1",
      navDemo: "\u6F14\u793A",
      navInventory: "\u5B9E\u9A8C\u6027\u6E05\u5355",
      invariantLabel: "\u6267\u884C\u4E0D\u53D8\u91CF",
      invariant: "\u88AB\u6388\u6743\u7684\u52A8\u4F5C\uFF0C\u5FC5\u987B\u6B63\u662F\u88AB\u6267\u884C\u7684\u52A8\u4F5C\u3002",
      checking: "\u68C0\u67E5\u4E2D",
      online: "\u6267\u884C\u8BB8\u53EF\u670D\u52A1\u5728\u7EBF",
      offline: "\u6267\u884C\u8BB8\u53EF\u670D\u52A1\u4E0D\u53EF\u8FBE",
      productClass: "\u6267\u884C\u8BB8\u53EF\u8BC1\u5C42",
      refresh: "\u5237\u65B0",
      decisionsTitle: "\u52A8\u4F5C\u88C1\u51B3",
      permitsTitle: "\u6267\u884C\u8BB8\u53EF\u8BC1",
      auditTitle: "\u6267\u884C\u6388\u6743\u5BA1\u8BA1",
      demoTitle: "\u8BB8\u53EF\u8BC1\u9A8C\u8BC1\u5B9E\u9A8C",
      inventoryTitle: "\u5B9E\u9A8C\u6027 Agent \u6E05\u5355",
      referenceMonitor: "REFERENCE MONITOR / PRE-EXECUTION",
      heroTitle: "AI Agent \u52A8\u4F5C\u6267\u884C\u8BB8\u53EF\u8BC1",
      heroLine: "\u4E00\u6B21\u6388\u6743\u3002\u53EA\u6267\u884C\u83B7\u51C6\u7684\u90A3\u4E00\u4E2A\u52A8\u4F5C\u3002",
      heroDescription: "\u5728\u771F\u5B9E\u5DE5\u5177\u526F\u4F5C\u7528\u53D1\u751F\u524D\uFF0C\u6267\u884C\u8FB9\u754C\u9A8C\u8BC1\u5E76\u6D88\u8D39\u4E00\u5F20\u77ED\u65F6\u3001\u52A8\u4F5C\u7ED1\u5B9A\u3001\u5355\u6B21\u4F7F\u7528\u7684\u7B7E\u540D\u8BB8\u53EF\u8BC1\u3002",
      runDemo: "\u9A8C\u8BC1\u56DB\u79CD\u5B89\u5168\u7ED3\u679C",
      normalize: "\u89C4\u8303\u5316",
      authorize: "\u6388\u6743",
      issue: "\u7B7E\u53D1",
      verify: "\u9A8C\u8BC1",
      consume: "\u6D88\u8D39",
      authorizedCopy: "\u7B56\u7565\u660E\u786E\u6388\u6743",
      deniedCopy: "\u6267\u884C\u524D\u62D2\u7EDD",
      violationsCopy: "\u9A8C\u8BC1\u672A\u901A\u8FC7",
      replayCopy: "\u91CD\u590D\u6D88\u8D39\u5DF2\u963B\u65AD",
      executionActivity: "EXECUTION ACTIVITY",
      recentActivity: "\u6700\u8FD1\u6D3B\u52A8",
      unknownRule: "\u672A\u4E0A\u62A5 \u2260 \u5DF2\u9A8C\u8BC1",
      agent: "Agent",
      action: "\u52A8\u4F5C",
      permit: "\u8BB8\u53EF\u8BC1",
      verificationResult: "\u9A8C\u8BC1\u7ED3\u679C",
      inspect: "\u67E5\u770B",
      noActivity: "\u8FD8\u6CA1\u6709\u52A8\u4F5C\u88C1\u51B3\u3002\u524D\u5F80\u6F14\u793A\u8FD0\u884C\u4E00\u4E2A\u670D\u52A1\u5668\u5B89\u5168\u5939\u5177\u3002",
      decisionDetail: "\u88C1\u51B3\u8BE6\u60C5",
      selectActivity: "\u9009\u62E9\u4E00\u6761\u6D3B\u52A8\uFF0C\u67E5\u770B\u5176\u52A8\u4F5C\u7ED1\u5B9A\u4E0E\u9A8C\u8BC1\u7ED3\u679C\u3002",
      authorization: "\u6388\u6743\u7ED3\u8BBA",
      requestId: "\u8BF7\u6C42 ID",
      principal: "\u4E3B\u4F53",
      workload: "\u5DE5\u4F5C\u8D1F\u8F7D",
      tool: "\u5DE5\u5177",
      capability: "\u80FD\u529B",
      resource: "\u8D44\u6E90",
      operation: "\u64CD\u4F5C",
      actionDigest: "\u52A8\u4F5C\u6458\u8981",
      policyVersion: "\u7B56\u7565\u7248\u672C",
      obligations: "\u6267\u884C\u4E49\u52A1",
      evidenceSource: "\u8BC1\u636E\u6765\u6E90",
      noObligations: "\u65E0\u5DF2\u62A5\u544A\u4E49\u52A1",
      noEvidence: "NOT REPORTED \u2014 \u6CA1\u6709\u6765\u6E90\u660E\u786E\u7684\u6267\u884C\u8BC1\u636E",
      compatibilityHint: "\u517C\u5BB9\u54CD\u5E94\uFF1A\u6CA1\u6709\u6267\u884C\u8FB9\u754C\u9A8C\u8BC1\u7ED3\u679C\uFF0C\u754C\u9762\u4E0D\u4F1A\u63A8\u65AD\u5DF2\u6267\u884C\u6216\u5B89\u5168\u3002",
      credentialLedger: "EXECUTION CREDENTIAL LEDGER",
      permitsCopy: "\u53EA\u5C55\u793A\u5B89\u5168\u7684\u76F8\u5173\u6807\u8BC6\u4E0E\u7ED1\u5B9A\u5B57\u6BB5\u3002\u8BB8\u53EF\u8BC1\u4EE4\u724C\u548C\u539F\u59CB\u654F\u611F\u53C2\u6570\u6C38\u4E0D\u663E\u793A\u3002",
      tokenHidden: "permit_token\uFF1A\u6C38\u4E0D\u6E32\u67D3",
      all: "\u5168\u90E8",
      failed: "\u5F02\u5E38",
      noPermits: "\u8FD8\u6CA1\u6709\u53EF\u5C55\u793A\u7684\u8BB8\u53EF\u8BC1\u3002\u62D2\u7EDD\u88C1\u51B3\u4E0D\u4F1A\u7B7E\u53D1\u8BB8\u53EF\u8BC1\u3002",
      permitDetail: "\u8BB8\u53EF\u8BC1\u8BE6\u60C5",
      selectPermit: "\u9009\u62E9\u4E00\u5F20\u8BB8\u53EF\u8BC1\u67E5\u770B\u5B89\u5168\u58F0\u660E\u3002",
      state: "\u72B6\u6001",
      permitId: "\u8BB8\u53EF\u8BC1 ID / jti",
      signingKeyId: "\u7B7E\u540D\u5BC6\u94A5 ID / kid",
      issuer: "\u7B7E\u53D1\u8005",
      issuedAt: "\u7B7E\u53D1\u65F6\u95F4",
      expiresAt: "\u5931\u6548\u65F6\u95F4",
      consumedAt: "\u6D88\u8D39\u65F6\u95F4",
      singleUse: "\u5355\u6B21\u4F7F\u7528",
      credentialFingerprint: "\u59D4\u6258\u51ED\u636E\u6307\u7EB9",
      permitFormat: "\u7B7E\u540D\u683C\u5F0F",
      neverStored: "\u4EE4\u724C\u4E0E\u539F\u59CB\u654F\u611F\u53C2\u6570\u4E0D\u5728\u6B64\u89C6\u56FE\u4E2D\u4FDD\u5B58\u6216\u663E\u793A\u3002",
      lifecycle: "\u8BB8\u53EF\u8BC1\u751F\u547D\u5468\u671F",
      issued: "\u5DF2\u7B7E\u53D1",
      verified: "\u5DF2\u9A8C\u8BC1",
      consumed: "\u5DF2\u6D88\u8D39",
      terminal: "\u7EC8\u6B62\u72B6\u6001",
      notReported: "NOT REPORTED",
      legacyEnvelope: "\u517C\u5BB9\u6388\u6743\u4FE1\u5C01\uFF1B\u4E0D\u662F\u53EF\u72EC\u7ACB\u9A8C\u8BC1\u7684\u51ED\u636E",
      receiptLedger: "EXPLAINABLE RECEIPTS",
      auditCopy: "\u6BCF\u5F20\u56DE\u6267\u8FDE\u63A5\u7B56\u7565\u88C1\u51B3\u3001\u8BB8\u53EF\u8BC1\u72B6\u6001\u3001\u6267\u884C\u8FB9\u754C\u9A8C\u8BC1\u7ED3\u679C\u4E0E\u6765\u6E90\u660E\u786E\u7684\u8BC1\u636E\u3002",
      criticalControl: "\u5173\u952E\u63A7\u5236",
      preExecution: "\u6267\u884C\u524D\u8BB8\u53EF\u8BC1\u9A8C\u8BC1",
      preExecutionCopy: "\u53EA\u6709 VERIFIED \u624D\u80FD\u8C03\u7528\u4E0A\u6E38\u5DE5\u5177\u3002",
      additionalEvidence: "\u9644\u52A0\u8BC1\u636E",
      postExecution: "\u6267\u884C\u4E2D / \u6267\u884C\u540E\u9065\u6D4B",
      postExecutionCopy: "\u6765\u6E90\u4E0E\u53EF\u4FE1\u5EA6\u4FDD\u6301\u53EF\u533A\u5206\uFF1BUNKNOWN \u4E0D\u4F1A\u88AB\u5199\u6210 SAFE\u3002",
      auditReceipts: "AUDIT RECEIPTS",
      latestReceipts: "\u6700\u8FD1\u56DE\u6267",
      noAudits: "\u8FD8\u6CA1\u6709\u5BA1\u8BA1\u56DE\u6267\u3002",
      finalVerdict: "\u6700\u7EC8\u7ED3\u8BBA",
      timestamp: "\u65F6\u95F4",
      receiptSafe: "\u5B89\u5168\u56DE\u6267\uFF1A\u4E0D\u542B\u8BB8\u53EF\u8BC1\u4EE4\u724C\u3001\u59D4\u6258\u4EE4\u724C\u6216\u539F\u59CB\u52A8\u4F5C\u53C2\u6570\u3002",
      safeFixtures: "SAFE / SERVER-OWNED FIXTURES",
      demoCopy: "\u56DB\u4E2A\u573A\u666F\u76F4\u63A5\u8BC1\u660E\u52A8\u4F5C\u7ED1\u5B9A\u3001\u77ED\u65F6\u6548\u4E0E\u5355\u6B21\u6D88\u8D39\u3002\u6240\u6709\u884C\u4E3A\u8BC1\u636E\u5747\u660E\u786E\u6807\u8BB0\u4E3A simulated_demo\u3002",
      primaryProofs: "PRIMARY PROOFS",
      fourScenarios: "\u56DB\u4E2A\u6838\u5FC3\u573A\u666F",
      advancedFixtures: "\u9AD8\u7EA7\u56DE\u5F52\u5939\u5177",
      advancedCopy: "\u4FDD\u7559\u65E7\u5B89\u5168\u573A\u666F\u7528\u4E8E\u56DE\u5F52\uFF0C\u4F46\u5B83\u4EEC\u4E0D\u5B9A\u4E49\u4EA7\u54C1\u4E3B\u7EBF\u3002",
      runScenario: "\u8FD0\u884C\u670D\u52A1\u5668\u5939\u5177",
      serverFixture: "\u670D\u52A1\u7AEF\u56FA\u5B9A\u5939\u5177",
      argumentsHidden: "\u539F\u59CB\u52A8\u4F5C\u53C2\u6570\u4E0D\u5728\u754C\u9762\u6216\u666E\u901A\u5BA1\u8BA1\u4E2D\u663E\u793A\uFF1B\u8FD9\u91CC\u53EA\u5C55\u793A\u5B89\u5168\u7ED1\u5B9A\u5B57\u6BB5\u3002",
      expected: "\u9884\u671F",
      demoResult: "\u9A8C\u8BC1\u7ED3\u679C",
      chooseScenario: "\u9009\u62E9\u4E00\u4E2A\u573A\u666F\u67E5\u770B\u6267\u884C\u8BB8\u53EF\u8DEF\u5F84\u3002",
      notAvailable: "\u5F53\u524D\u670D\u52A1\u7AEF\u5C1A\u672A\u63D0\u4F9B\u8FD9\u4E2A\u6838\u5FC3\u5939\u5177\u3002",
      requestFailed: "\u5939\u5177\u8FD0\u884C\u5931\u8D25",
      upstreamTool: "\u4E0A\u6E38\u5DE5\u5177",
      invoked: "\u5DF2\u8C03\u7528",
      notInvoked: "\u672A\u8C03\u7528",
      unknownInvocation: "NOT REPORTED",
      attempts: "\u9A8C\u8BC1\u5C1D\u8BD5",
      truthfulDemo: "\u8BC1\u636E\u6807\u7B7E\uFF1Asimulated_demo\u3002\u5B83\u662F\u56DE\u5F52\u5939\u5177\uFF0C\u4E0D\u662F\u751F\u4EA7\u9065\u6D4B\u3002",
      scenarioValidTitle: "A \xB7 \u6709\u6548\u8BB8\u53EF\u8BC1",
      scenarioValidDescription: "\u7CBE\u786E\u52A8\u4F5C\u901A\u8FC7\u9A8C\u8BC1\uFF0C\u6267\u884C\u8FB9\u754C\u6D88\u8D39\u8BB8\u53EF\u8BC1\u540E\u624D\u8C03\u7528\u4E0A\u6E38\u5DE5\u5177\u3002",
      scenarioValidExpected: "VERIFIED \u2192 CONSUMED",
      scenarioMutationTitle: "B \xB7 \u52A8\u4F5C\u53D8\u66F4 / TOCTOU",
      scenarioMutationDescription: "\u6388\u6743\u540E\u66F4\u6539\u5B89\u5168\u76F8\u5173\u53C2\u6570\uFF0C\u52A8\u4F5C\u6458\u8981\u4E0D\u518D\u5339\u914D\uFF0C\u4E0A\u6E38\u5DE5\u5177\u4E0D\u4F1A\u88AB\u8C03\u7528\u3002",
      scenarioMutationExpected: "ACTION_MISMATCH \u2192 BLOCK",
      scenarioReplayTitle: "C \xB7 \u8BB8\u53EF\u8BC1\u91CD\u653E",
      scenarioReplayDescription: "\u7B2C\u4E00\u6B21\u6D88\u8D39\u6210\u529F\uFF1B\u540C\u4E00\u8BB8\u53EF\u8BC1\u7684\u7B2C\u4E8C\u6B21\u4F7F\u7528\u88AB ReplayGuard \u963B\u65AD\u3002",
      scenarioReplayExpected: "VERIFIED \u2192 REPLAYED",
      scenarioExpiredTitle: "D \xB7 \u8BB8\u53EF\u8BC1\u8FC7\u671F",
      scenarioExpiredDescription: "\u77ED\u65F6\u8BB8\u53EF\u8BC1\u8D85\u8FC7\u6709\u6548\u671F\u540E\uFF0C\u5728\u6267\u884C\u8FB9\u754C\u88AB\u62D2\u7EDD\u3002",
      scenarioExpiredExpected: "EXPIRED \u2192 BLOCK",
      inventoryCopy: "\u8BE5\u529F\u80FD\u4E0D\u5C5E\u4E8E\u6267\u884C\u8BB8\u53EF\u8BC1\u4E3B\u7EBF\uFF0C\u4EC5\u5728\u670D\u52A1\u7AEF\u660E\u786E\u542F\u7528\u5B9E\u9A8C\u6027\u6E05\u5355\u65F6\u663E\u793A\u3002",
      noInventory: "\u6CA1\u6709\u5B9E\u9A8C\u6027\u6E05\u5355\u6570\u636E\u3002\u53D1\u73B0\u80FD\u529B\u4FDD\u6301\u51BB\u7ED3\u4E14\u9ED8\u8BA4\u5173\u95ED\u3002",
      experimentalOnly: "\u5B9E\u9A8C\u6027 / \u975E\u4EA7\u54C1\u4E3B\u7EBF",
      footerTruth: "\u7B7E\u540D \xB7 \u52A8\u4F5C\u7ED1\u5B9A \xB7 \u77ED\u65F6 \xB7 \u5355\u6B21\u4F7F\u7528 \xB7 \u4E0D\u8BB0\u5F55\u79D8\u5BC6",
      refreshed: "\u6570\u636E\u5DF2\u5237\u65B0\u3002",
      loading: "\u52A0\u8F7D\u4E2D\u2026",
      unknown: "UNKNOWN"
    },
    en: {
      skipContent: "Skip to main content",
      brandSubtitle: "Execution permits for AI Agent actions",
      navDecisions: "Decisions",
      navPermits: "Permits",
      navAudit: "Audit",
      navDemo: "Demo",
      navInventory: "Experimental inventory",
      invariantLabel: "Execution invariant",
      invariant: "The action authorized must be exactly the action executed.",
      checking: "Checking",
      online: "Execution permit service online",
      offline: "Execution permit service unavailable",
      productClass: "Execution permit layer",
      refresh: "Refresh",
      decisionsTitle: "Action decisions",
      permitsTitle: "Execution permits",
      auditTitle: "Execution authorization audit",
      demoTitle: "Permit verification lab",
      inventoryTitle: "Experimental Agent inventory",
      referenceMonitor: "REFERENCE MONITOR / PRE-EXECUTION",
      heroTitle: "Execution Permits for AI Agent Actions",
      heroLine: "Authorize once. Execute exactly what was authorized.",
      heroDescription: "Before a real tool side effect, the execution boundary verifies and consumes a signed, short-lived, action-bound, single-use permit.",
      runDemo: "Prove four security outcomes",
      normalize: "Normalize",
      authorize: "Authorize",
      issue: "Issue",
      verify: "Verify",
      consume: "Consume",
      authorizedCopy: "Explicitly authorized",
      deniedCopy: "Denied before execution",
      violationsCopy: "Verification failures",
      replayCopy: "Repeated use blocked",
      executionActivity: "EXECUTION ACTIVITY",
      recentActivity: "Recent activity",
      unknownRule: "NOT REPORTED \u2260 VERIFIED",
      agent: "Agent",
      action: "Action",
      permit: "Permit",
      verificationResult: "Verification result",
      inspect: "Inspect",
      noActivity: "No action decisions yet. Run a server-owned safety fixture in Demo.",
      decisionDetail: "Decision detail",
      selectActivity: "Select an activity to inspect its action binding and verification result.",
      authorization: "Authorization",
      requestId: "Request ID",
      principal: "Principal",
      workload: "Workload",
      tool: "Tool",
      capability: "Capability",
      resource: "Resource",
      operation: "Operation",
      actionDigest: "Action digest",
      policyVersion: "Policy version",
      obligations: "Execution obligations",
      evidenceSource: "Evidence source",
      noObligations: "No reported obligations",
      noEvidence: "NOT REPORTED \u2014 no source-labeled execution evidence",
      compatibilityHint: "Compatibility response: no execution-boundary verification result exists, so the UI does not infer execution or safety.",
      credentialLedger: "EXECUTION CREDENTIAL LEDGER",
      permitsCopy: "Only safe correlation and binding fields are shown. Permit tokens and raw sensitive arguments are never rendered.",
      tokenHidden: "permit_token: NEVER RENDERED",
      all: "All",
      failed: "Failed",
      noPermits: "No permits to display. Denied decisions do not issue permits.",
      permitDetail: "Permit detail",
      selectPermit: "Select a permit to inspect its safe claims.",
      state: "State",
      permitId: "Permit ID / jti",
      signingKeyId: "Signing key ID / kid",
      issuer: "Issuer",
      issuedAt: "Issued at",
      expiresAt: "Expires at",
      consumedAt: "Consumed at",
      singleUse: "Single use",
      credentialFingerprint: "Delegated credential fingerprint",
      permitFormat: "Signing format",
      neverStored: "The token and raw sensitive arguments are neither retained nor shown in this view.",
      lifecycle: "Permit lifecycle",
      issued: "Issued",
      verified: "Verified",
      consumed: "Consumed",
      terminal: "Terminal state",
      notReported: "NOT REPORTED",
      legacyEnvelope: "Compatibility authorization envelope; not a self-verifying credential",
      receiptLedger: "EXPLAINABLE RECEIPTS",
      auditCopy: "Each receipt connects the policy decision, permit state, execution-boundary verification, and source-labeled evidence.",
      criticalControl: "Critical control",
      preExecution: "Pre-execution permit verification",
      preExecutionCopy: "Only VERIFIED may invoke the upstream tool.",
      additionalEvidence: "Additional evidence",
      postExecution: "During / post-execution telemetry",
      postExecutionCopy: "Sources and trust stay distinct; UNKNOWN is never rewritten as SAFE.",
      auditReceipts: "AUDIT RECEIPTS",
      latestReceipts: "Recent receipts",
      noAudits: "No audit receipts yet.",
      finalVerdict: "Final verdict",
      timestamp: "Timestamp",
      receiptSafe: "Safe receipt: no permit token, delegated token, or raw action arguments.",
      safeFixtures: "SAFE / SERVER-OWNED FIXTURES",
      demoCopy: "Four scenarios directly prove action binding, short lifetime, and single-use consumption. All behavior evidence is labeled simulated_demo.",
      primaryProofs: "PRIMARY PROOFS",
      fourScenarios: "Four core scenarios",
      advancedFixtures: "Advanced regression fixtures",
      advancedCopy: "Existing security fixtures remain for regression, but do not define the primary product story.",
      runScenario: "Run server fixture",
      serverFixture: "Server-owned fixture",
      argumentsHidden: "Raw action arguments are not shown or placed in normal audit. Only safe binding fields appear here.",
      expected: "Expected",
      demoResult: "Verification result",
      chooseScenario: "Choose a scenario to inspect the execution-permit path.",
      notAvailable: "The current server does not expose this core fixture yet.",
      requestFailed: "Fixture run failed",
      upstreamTool: "Upstream tool",
      invoked: "Invoked",
      notInvoked: "Not invoked",
      unknownInvocation: "NOT REPORTED",
      attempts: "Verification attempts",
      truthfulDemo: "Evidence label: simulated_demo. This is a regression fixture, not production telemetry.",
      scenarioValidTitle: "A \xB7 Valid permit",
      scenarioValidDescription: "The exact action verifies; the boundary consumes the permit before invoking the upstream tool.",
      scenarioValidExpected: "VERIFIED \u2192 CONSUMED",
      scenarioMutationTitle: "B \xB7 Action mutation / TOCTOU",
      scenarioMutationDescription: "A security-relevant argument changes after authorization, the digest mismatches, and the upstream tool is not invoked.",
      scenarioMutationExpected: "ACTION_MISMATCH \u2192 BLOCK",
      scenarioReplayTitle: "C \xB7 Permit replay",
      scenarioReplayDescription: "The first consumption succeeds; ReplayGuard blocks a second use of the same permit.",
      scenarioReplayExpected: "VERIFIED \u2192 REPLAYED",
      scenarioExpiredTitle: "D \xB7 Expired permit",
      scenarioExpiredDescription: "A short-lived permit is rejected at the execution boundary after its expiry.",
      scenarioExpiredExpected: "EXPIRED \u2192 BLOCK",
      inventoryCopy: "This is outside the execution-permit core and appears only when the server explicitly enables experimental inventory.",
      noInventory: "No experimental inventory data. Discovery remains frozen and disabled by default.",
      experimentalOnly: "Experimental / not product core",
      footerTruth: "Signed \xB7 action-bound \xB7 short-lived \xB7 single-use \xB7 secret-free audit",
      refreshed: "Data refreshed.",
      loading: "Loading\u2026",
      unknown: "UNKNOWN"
    }
  };
  var viewTitles = {
    decisions: { key: "decisionsTitle", kicker: "DECISIONS" },
    permits: { key: "permitsTitle", kicker: "PERMITS" },
    audit: { key: "auditTitle", kicker: "AUDIT" },
    demo: { key: "demoTitle", kicker: "DEMO" },
    inventory: { key: "inventoryTitle", kicker: "EXPERIMENTAL" }
  };
  var state = {
    locale: localStorage.getItem("aegis-locale") === "en" ? "en" : "zh-CN",
    view: "decisions",
    decisions: [],
    permits: [],
    audits: [],
    scenarios: [],
    selectedDecisionId: "",
    selectedPermitId: "",
    selectedScenarioId: "",
    permitFilter: "all",
    demoOutcome: null,
    inventoryEnabled: false,
    inventory: []
  };
  function qs(selector) {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Missing UI element: ${selector}`);
    return element;
  }
  function node(tag, className = "", text = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function tr(key) {
    return copy[state.locale][key] ?? key;
  }
  function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function get(value, path) {
    return path.split(".").reduce((current, segment) => object(current)[segment], value);
  }
  function first(value, paths) {
    for (const path of paths) {
      const candidate = get(value, path);
      if (candidate !== void 0 && candidate !== null && candidate !== "") return candidate;
    }
    return void 0;
  }
  function boolValue(value, paths) {
    const candidate = first(value, paths);
    return typeof candidate === "boolean" ? candidate : null;
  }
  function rawText(value, paths, fallback = "") {
    const candidate = first(value, paths);
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate).trim();
    return fallback;
  }
  function safeText(value, paths, fallback = "") {
    return privacySafe(rawText(value, paths, fallback));
  }
  function stringList(value, paths) {
    const candidate = first(value, paths);
    if (Array.isArray(candidate)) return candidate.filter((item) => typeof item === "string").map((item) => privacySafe(item));
    return [];
  }
  function upper(value, fallback = "UNKNOWN") {
    return value ? value.replaceAll("-", "_").replaceAll(" ", "_").toUpperCase() : fallback;
  }
  function slug(value) {
    return value.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]/g, "-");
  }
  function shortID(value) {
    return value.length > 24 ? `${value.slice(0, 11)}\u2026${value.slice(-8)}` : value || "\u2014";
  }
  function privacySafe(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/\b(?:bearer|token|secret|password)\s*[:=]\s*\S+/i.test(trimmed) || /^(?:ghp_|github_pat_|sk-)[A-Za-z0-9_-]{12,}/.test(trimmed)) return "[REDACTED]";
    if (/^[A-Za-z]:\\/.test(trimmed) || /^\/(?:Users|home)\//i.test(trimmed)) return "[LOCAL_RESOURCE_REDACTED]";
    return trimmed;
  }
  function formatTime(value) {
    if (!value) return tr("notReported");
    const numeric = /^\d{10}(?:\.\d+)?$/.test(value) ? Number(value) * 1e3 : Number.NaN;
    const parsed = new Date(Number.isNaN(numeric) ? value : numeric);
    return Number.isNaN(parsed.getTime()) ? privacySafe(value) : new Intl.DateTimeFormat(state.locale, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(parsed);
  }
  function extractArray(payload, keys) {
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
      const candidate = get(payload, key);
      if (Array.isArray(candidate)) return candidate;
    }
    return [];
  }
  async function requestJSON(url, options) {
    const response = await fetch(url, { headers: { Accept: "application/json", ...options?.body ? { "Content-Type": "application/json" } : {} }, ...options });
    if (!response.ok) {
      let code = `HTTP_${response.status}`;
      try {
        code = rawText(await response.json(), ["error"], code);
      } catch {
      }
      throw new Error(code);
    }
    return response.json();
  }
  async function optionalJSON(url) {
    try {
      return await requestJSON(url);
    } catch {
      return null;
    }
  }
  function normalizeObligations(value) {
    const explicit = stringList(value, ["obligations", "execution_obligations"]);
    if (explicit.length) return explicit.map((item) => upper(item));
    const claimsExplicit = stringList(value, ["claims.obligations"]);
    if (claimsExplicit.length) return claimsExplicit.map((item) => upper(item));
    const source = object(first(value, ["obligations", "execution_obligations", "constraints", "claims.obligations"]));
    return Object.entries(source).flatMap(([key, item]) => {
      if (item === true) return [upper(key)];
      if (typeof item === "string" && item && !["allow", "allowed", "none", "false"].includes(item.toLowerCase())) return [`${upper(key)}: ${upper(item)}`];
      return [];
    });
  }
  function normalizeVerification(value) {
    const direct = upper(rawText(value, ["verification_result", "verification_outcome", "verification.result", "verification.outcome", "permit.verification_result", "execution_permit.verification_result", "receipt.verification_outcome", "verdict", "final_verdict"], ""), "");
    const aliases = {
      PERMIT_ACTION_MISMATCH: "ACTION_MISMATCH",
      PERMIT_EXPIRED: "EXPIRED",
      PERMIT_REPLAY: "REPLAYED",
      PERMIT_INVALID_SIGNATURE: "INVALID_SIGNATURE",
      PERMIT_REVOKED: "REVOKED",
      EXECUTED_WITH_VALID_PERMIT: "VERIFIED",
      EXECUTION_COMPLETED: "VERIFIED",
      COMPLETED: "VERIFIED"
    };
    if (aliases[direct]) return aliases[direct];
    const recognized = ["VERIFIED", "EXPIRED", "INVALID_SIGNATURE", "ACTION_MISMATCH", "WRONG_PRINCIPAL", "WRONG_AGENT", "WRONG_WORKLOAD", "WRONG_DELEGATION", "WRONG_TOOL", "WRONG_CAPABILITY", "WRONG_RESOURCE", "WRONG_OPERATION", "REPLAYED", "REVOKED", "INVALID_ISSUER", "UNKNOWN_PERMIT", "INVALID_PERMIT", "INVALID_ACTION", "NOT_YET_VALID"];
    if (recognized.includes(direct)) return direct;
    return "NOT_REPORTED";
  }
  function normalizePermit(value) {
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
  function normalizeAuthorization(value) {
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
  function normalizeDecision(value) {
    const permitSource = first(value, ["permit", "execution_permit", "authorization_envelope", "receipt.permit"]);
    const permit = normalizePermit(permitSource ?? value);
    const eventSources = extractArray(first(value, ["runtime_observation.events", "runtime_events", "events"]), []).map((item) => safeText(item, ["source"])).filter(Boolean);
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
      obligations: normalizeObligations(value).length ? normalizeObligations(value) : permit?.obligations ?? [],
      verification: normalizeVerification(value) !== "NOT_REPORTED" ? normalizeVerification(value) : permit?.verification ?? "NOT_REPORTED",
      verdict: upper(rawText(value, ["final_verdict", "verdict", "receipt.final_verdict"], "UNKNOWN")),
      evidenceSources: [.../* @__PURE__ */ new Set([...directSources, ...eventSources])],
      permit
    };
  }
  function scenarioKind(value) {
    const haystack = `${rawText(value, ["id"])} ${rawText(value, ["title"])} ${rawText(value, ["description"])}`.toLowerCase();
    if (/replay|single.?use|重放/.test(haystack)) return "replay";
    if (/expir|ttl|过期/.test(haystack)) return "expired";
    if (/mutation|mismatch|toctou|变更|篡改/.test(haystack)) return "mutation";
    if (/valid.?permit|exact.?action|happy.?path|有效许可证/.test(haystack)) return "valid";
    return "advanced";
  }
  function normalizeScenario(value) {
    const kind = scenarioKind(value);
    return {
      id: rawText(value, ["id"]),
      kind,
      title: safeText(value, ["title"], rawText(value, ["id"], "Fixture")),
      description: safeText(value, ["description"]),
      expected: upper(rawText(value, ["expected_verification", "expected_result", "expected_route"], "NOT_REPORTED")),
      principal: safeText(value, ["request.principal.principal_id", "request.user_id"]),
      agent: safeText(value, ["request.agent.agent_id", "request.agent_id"]),
      tool: safeText(value, ["request.tool.name", "request.tool.tool_id", "request.tool_identity.name"]),
      capability: safeText(value, ["request.action.capability", "request.requested_capability"]),
      resource: safeText(value, ["request.action.target_resource", "request.target_resource"]),
      operation: safeText(value, ["request.action.operation", "request.data_access.operation"]),
      actionDigest: safeText(value, ["action_digest", "request.action_digest"]),
      available: true
    };
  }
  var fallbackScenarios = [
    { id: "valid-permit", kind: "valid", titleKey: "scenarioValidTitle", descriptionKey: "scenarioValidDescription", expectedKey: "scenarioValidExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
    { id: "action-mutation", kind: "mutation", titleKey: "scenarioMutationTitle", descriptionKey: "scenarioMutationDescription", expectedKey: "scenarioMutationExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
    { id: "permit-replay", kind: "replay", titleKey: "scenarioReplayTitle", descriptionKey: "scenarioReplayDescription", expectedKey: "scenarioReplayExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false },
    { id: "expired-permit", kind: "expired", titleKey: "scenarioExpiredTitle", descriptionKey: "scenarioExpiredDescription", expectedKey: "scenarioExpiredExpected", principal: "", agent: "", tool: "", capability: "", resource: "", operation: "", actionDigest: "", available: false }
  ];
  function localizedScenario(scenario) {
    if (scenario.kind === "advanced") return scenario;
    const prefix = `scenario${scenario.kind[0].toUpperCase()}${scenario.kind.slice(1)}`;
    return { ...scenario, title: tr(`${prefix}Title`), description: tr(`${prefix}Description`), expected: tr(`${prefix}Expected`) };
  }
  function mergeScenarios(serverScenarios) {
    const primary = fallbackScenarios.map((fallback) => {
      const server = serverScenarios.find((item) => item.kind === fallback.kind);
      const base = server ?? { ...fallback, title: "", description: "", expected: "" };
      return localizedScenario(base);
    });
    return [...primary, ...serverScenarios.filter((item) => item.kind === "advanced")];
  }
  function explicitInventoryFlag(payload) {
    return first(payload, ["experimental_inventory_enabled", "features.experimental_inventory", "features.experimental_inventory.enabled", "experimental_inventory"]) === true;
  }
  function applyTranslations() {
    document.documentElement.lang = state.locale;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (key) element.textContent = tr(key);
    });
    qs("#language-toggle").textContent = state.locale === "zh-CN" ? "EN" : "\u4E2D\u6587";
    state.scenarios = state.scenarios.map(localizedScenario);
    updateViewHeading();
  }
  function updateViewHeading() {
    const heading = viewTitles[state.view];
    qs("#view-kicker").textContent = heading.kicker;
    qs("#view-title").textContent = tr(heading.key);
  }
  function validView(value) {
    return ["decisions", "permits", "audit", "demo", "inventory"].includes(value);
  }
  function compatibilityView(value) {
    if (value === "overview" || value === "policies") return "decisions";
    if (value === "investigations") return "audit";
    return validView(value) ? value : "decisions";
  }
  function navigate(view, updateHash = true) {
    if (view === "inventory" && !state.inventoryEnabled) view = "decisions";
    state.view = view;
    document.querySelectorAll("[data-view]").forEach((element) => {
      const active = element.dataset.view === view;
      element.hidden = !active;
      element.classList.toggle("active", active);
    });
    document.querySelectorAll("[data-nav]").forEach((button) => {
      const active = button.dataset.nav === view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    updateViewHeading();
    if (updateHash) history.replaceState(null, "", `#${view}`);
    qs("#main-content").focus({ preventScroll: true });
  }
  function badge(value) {
    const normalized = upper(value);
    const failure = !["VERIFIED", "AUTHORIZED", "CONSUMED", "ISSUED", "AVAILABLE", "UNKNOWN", "NOT_REPORTED", "REQUIRES_APPROVAL"].includes(normalized);
    return node("span", `status-badge ${slug(value)}${failure ? " failed" : ""}`, value || tr("unknown"));
  }
  function fact(label, value, mono = false) {
    const item = node("div", "fact");
    item.append(node("span", "", label), node(mono ? "code" : "strong", "", value || tr("notReported")));
    return item;
  }
  function empty(message) {
    return node("p", "empty-state", message);
  }
  function showToast(message, error = false) {
    const toast = node("div", `toast${error ? " error" : ""}`, message);
    qs("#toast-region").append(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }
  async function loadHealth() {
    const indicator = qs("#system-state");
    const label = indicator.querySelector("b");
    try {
      const health = await requestJSON("/api/health");
      state.inventoryEnabled = explicitInventoryFlag(health);
      indicator.className = "system-state online";
      if (label) {
        label.dataset.i18n = "online";
        label.textContent = tr("online");
      }
    } catch {
      state.inventoryEnabled = false;
      indicator.className = "system-state offline";
      if (label) {
        label.dataset.i18n = "offline";
        label.textContent = tr("offline");
      }
    }
    qs("#inventory-nav").hidden = !state.inventoryEnabled;
    if (!state.inventoryEnabled && state.view === "inventory") navigate("decisions");
  }
  async function loadDecisions() {
    const payload = await optionalJSON("/api/decisions?limit=100") ?? await optionalJSON("/api/audits?limit=100");
    state.decisions = extractArray(payload, ["decisions", "records", "audits", "items"]).map(normalizeDecision);
    if (!state.selectedDecisionId || !state.decisions.some((item) => item.id === state.selectedDecisionId)) state.selectedDecisionId = state.decisions[0]?.id ?? "";
  }
  function derivedPermits() {
    const unique = /* @__PURE__ */ new Map();
    [...state.decisions, ...state.audits].forEach((item) => {
      if (item.permit) unique.set(item.permit.id, item.permit);
    });
    return [...unique.values()];
  }
  async function loadPermits() {
    const payload = await optionalJSON("/api/permits?limit=100");
    const explicit = extractArray(payload, ["permits", "records", "items"]).map(normalizePermit).filter((item) => item !== null);
    state.permits = explicit.length ? explicit : derivedPermits();
    if (!state.selectedPermitId || !state.permits.some((item) => item.id === state.selectedPermitId)) state.selectedPermitId = state.permits[0]?.id ?? "";
  }
  async function loadAudits() {
    const payload = await optionalJSON("/api/audits?limit=100");
    state.audits = extractArray(payload, ["audits", "receipts", "records", "items"]).map(normalizeDecision);
  }
  async function loadScenarios() {
    const payload = await optionalJSON("/api/demo-lab") ?? await optionalJSON("/api/scenarios");
    const primary = extractArray(payload, ["scenarios", "items"]);
    const advanced = extractArray(payload, ["advanced_regression_fixtures"]);
    state.scenarios = mergeScenarios([...primary, ...advanced].map(normalizeScenario));
    if (!state.selectedScenarioId || !state.scenarios.some((item) => item.id === state.selectedScenarioId)) state.selectedScenarioId = state.scenarios[0]?.id ?? "";
  }
  async function loadInventory() {
    if (!state.inventoryEnabled) {
      state.inventory = [];
      return;
    }
    const payload = await optionalJSON("/api/agents");
    state.inventory = extractArray(payload, ["governed_identities", "agents", "items"]).map(object);
  }
  async function refreshAll(notify = false) {
    const refresh = qs("#refresh-all");
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
  function verificationClass(value) {
    if (value === "VERIFIED") return "verified";
    if (value === "NOT_REPORTED" || value === "UNKNOWN") return "not-reported";
    return "failed";
  }
  function actionLabel(value) {
    const target = value.tool || value.capability || tr("unknown");
    return value.operation ? `${target} \xB7 ${value.operation}` : target;
  }
  function renderMetrics() {
    const authorized = state.decisions.filter((item) => item.authorization === "AUTHORIZED").length;
    const denied = state.decisions.filter((item) => item.authorization === "DENIED").length;
    const permitEvidence = state.permits.length ? state.permits : state.decisions.map((item) => item.permit).filter((item) => item !== null);
    const violations = permitEvidence.filter((item) => !["VERIFIED", "NOT_REPORTED", "UNKNOWN"].includes(item.verification)).length;
    const replays = permitEvidence.filter((item) => item.verification === "REPLAYED").length;
    qs("#count-authorized").textContent = String(authorized);
    qs("#count-denied").textContent = String(denied);
    qs("#count-violations").textContent = String(violations);
    qs("#count-replays").textContent = String(replays);
    qs("#nav-decision-count").textContent = String(state.decisions.length);
    qs("#nav-permit-count").textContent = String(state.permits.length);
    qs("#nav-violation-count").textContent = String(violations);
  }
  function renderActivity() {
    const body = qs("#activity-body");
    const emptyState = qs("#activity-empty");
    body.replaceChildren();
    emptyState.hidden = state.decisions.length > 0;
    emptyState.textContent = tr("noActivity");
    state.decisions.slice(0, 20).forEach((decision) => {
      const row = node("tr", decision.id === state.selectedDecisionId ? "selected" : "");
      const agent = node("td");
      agent.append(node("strong", "", decision.agent || tr("unknown")), node("small", "", decision.workload || tr("notReported")));
      const action = node("td");
      action.append(node("strong", "", actionLabel(decision)), node("small", "", decision.resource || tr("notReported")));
      const permit = node("td");
      permit.append(node("code", "", decision.permit ? shortID(decision.permit.id) : "\u2014"));
      const verification = node("td");
      verification.append(badge(decision.verification));
      const inspect = node("td");
      const button = node("button", "inspect-button", "\u2192");
      button.type = "button";
      button.setAttribute("aria-label", `${tr("inspect")} ${decision.requestId || decision.id}`);
      button.addEventListener("click", () => {
        state.selectedDecisionId = decision.id;
        renderActivity();
        renderDecisionDetail();
      });
      inspect.append(button);
      row.append(agent, action, permit, verification, inspect);
      body.append(row);
    });
    renderDecisionDetail();
  }
  function renderDecisionDetail() {
    const container = qs("#decision-detail");
    container.replaceChildren();
    const decision = state.decisions.find((item) => item.id === state.selectedDecisionId);
    if (!decision) {
      container.append(empty(tr("selectActivity")));
      return;
    }
    const head = node("header", "detail-head");
    const headCopy = node("div");
    headCopy.append(node("p", "eyebrow", tr("decisionDetail")), node("h3", "", shortID(decision.requestId || decision.id)));
    head.append(headCopy, badge(decision.authorization));
    const facts = node("div", "detail-facts");
    facts.append(
      fact(tr("principal"), decision.principal),
      fact(tr("agent"), decision.agent),
      fact(tr("workload"), decision.workload),
      fact(tr("tool"), decision.tool),
      fact(tr("capability"), decision.capability),
      fact(tr("resource"), decision.resource),
      fact(tr("operation"), decision.operation),
      fact(tr("actionDigest"), decision.actionDigest ? shortID(decision.actionDigest) : "NOT REPORTED", true),
      fact(tr("permitId"), decision.permit ? shortID(decision.permit.id) : "\u2014", true),
      fact(tr("verificationResult"), decision.verification)
    );
    const obligationBlock = node("div", "detail-block");
    obligationBlock.append(node("span", "block-label", tr("obligations")));
    const chips = node("div", "chip-list");
    (decision.obligations.length ? decision.obligations : [tr("noObligations")]).forEach((item) => chips.append(node("span", "", item)));
    obligationBlock.append(chips);
    const evidence = node("div", "detail-block");
    evidence.append(node("span", "block-label", tr("evidenceSource")));
    if (decision.evidenceSources.length) decision.evidenceSources.forEach((source) => evidence.append(badge(upper(source))));
    else evidence.append(node("p", "truth-copy", tr("noEvidence")));
    container.append(head, facts, obligationBlock, evidence);
    if (decision.verification === "NOT_REPORTED") container.append(node("p", "compatibility-note", tr("compatibilityHint")));
  }
  function filteredPermits() {
    if (state.permitFilter === "all") return state.permits;
    if (state.permitFilter === "failed") return state.permits.filter((item) => !["VERIFIED", "NOT_REPORTED"].includes(item.verification) || ["EXPIRED", "REVOKED"].includes(item.state));
    return state.permits.filter((item) => item.state === upper(state.permitFilter));
  }
  function renderPermits() {
    const list = qs("#permit-list");
    list.replaceChildren();
    const permits = filteredPermits();
    if (!permits.length) list.append(empty(tr("noPermits")));
    permits.forEach((permit) => {
      const button = node("button", `permit-row${permit.id === state.selectedPermitId ? " selected" : ""}`);
      button.type = "button";
      const top = node("span", "permit-row-top");
      top.append(node("code", "", shortID(permit.id)), badge(permit.state));
      button.append(top, node("strong", "", `${permit.tool || tr("unknown")} \xB7 ${permit.operation || tr("unknown")}`), node("small", "", permit.agent || tr("unknown")), node("time", "", formatTime(permit.issuedAt)));
      button.addEventListener("click", async () => {
        state.selectedPermitId = permit.id;
        const detailPayload = await optionalJSON(`/api/permits/${encodeURIComponent(permit.id)}`);
        const detailed = normalizePermit(detailPayload);
        if (detailed) state.permits = state.permits.map((item) => item.id === detailed.id ? detailed : item);
        renderPermits();
      });
      list.append(button);
    });
    renderPermitDetail();
  }
  function lifecycleStep(code, label, status) {
    const item = node("div", `lifecycle-step ${status}`);
    item.append(node("b", "", code), node("span", "", label));
    return item;
  }
  function renderPermitDetail() {
    const container = qs("#permit-detail");
    container.replaceChildren();
    const permit = state.permits.find((item) => item.id === state.selectedPermitId);
    if (!permit) {
      container.append(empty(tr("selectPermit")));
      return;
    }
    const ticket = node("section", "permit-ticket");
    const head = node("header", "ticket-head");
    const title = node("div");
    title.append(node("p", "eyebrow", tr("permitDetail")), node("h3", "", shortID(permit.id)));
    head.append(title, badge(permit.state));
    const seal = node("div", "signature-seal");
    const sealLabel = permit.format === "LEGACY_ENVELOPE" ? "LEGACY" : permit.format === "NOT_REPORTED" ? "CLAIMS" : "SIGNED";
    seal.append(node("span", "", sealLabel), node("small", "", permit.format));
    const claims = node("div", "claim-grid");
    claims.append(
      fact(tr("principal"), permit.principal),
      fact(tr("agent"), permit.agent),
      fact(tr("workload"), permit.workload),
      fact(tr("credentialFingerprint"), permit.delegationFingerprint ? shortID(permit.delegationFingerprint) : "NOT REPORTED", true),
      fact(tr("tool"), permit.tool),
      fact(tr("capability"), permit.capability),
      fact(tr("resource"), permit.resource),
      fact(tr("operation"), permit.operation),
      fact(tr("actionDigest"), permit.actionDigest ? shortID(permit.actionDigest) : "NOT REPORTED", true),
      fact(tr("policyVersion"), permit.policyVersion),
      fact(tr("signingKeyId"), permit.signingKeyId),
      fact(tr("issuer"), permit.issuer),
      fact(tr("singleUse"), permit.singleUse === null ? "NOT REPORTED" : String(permit.singleUse))
    );
    const times = node("div", "ticket-times");
    times.append(fact(tr("issuedAt"), formatTime(permit.issuedAt)), fact(tr("expiresAt"), formatTime(permit.expiresAt)), fact(tr("consumedAt"), formatTime(permit.consumedAt)));
    ticket.append(head, seal, claims, times, node("p", "secret-note", tr("neverStored")));
    if (permit.format === "LEGACY_ENVELOPE") ticket.append(node("p", "compatibility-note", tr("legacyEnvelope")));
    const lifecycle = node("section", "lifecycle-panel");
    lifecycle.append(node("p", "eyebrow", tr("lifecycle")));
    const steps = node("div", "lifecycle-track");
    const issuedDone = permit.state !== "UNKNOWN";
    const verifiedDone = permit.verification === "VERIFIED" || permit.state === "CONSUMED";
    const consumedDone = permit.state === "CONSUMED";
    steps.append(lifecycleStep("01", tr("issued"), issuedDone ? "done" : "unknown"), lifecycleStep("02", tr("verified"), verifiedDone ? "done" : permit.verification === "NOT_REPORTED" ? "unknown" : "failed"), lifecycleStep("03", tr("consumed"), consumedDone ? "done" : "unknown"));
    if (["EXPIRED", "REVOKED"].includes(permit.state) || !["VERIFIED", "NOT_REPORTED"].includes(permit.verification)) steps.append(lifecycleStep("!", permit.verification !== "NOT_REPORTED" ? permit.verification : permit.state, "failed"));
    lifecycle.append(steps);
    container.append(ticket, lifecycle);
  }
  function renderAudit() {
    const list = qs("#audit-list");
    list.replaceChildren();
    qs("#audit-count").textContent = String(state.audits.length);
    if (!state.audits.length) {
      list.append(empty(tr("noAudits")));
      return;
    }
    state.audits.forEach((receipt) => {
      const item = node("details", "receipt");
      const summary = node("summary");
      const identity = node("span", "receipt-identity");
      identity.append(node("strong", "", receipt.agent || tr("unknown")), node("small", "", actionLabel(receipt)));
      summary.append(node("time", "", formatTime(receipt.createdAt)), identity, node("code", "", receipt.permit ? shortID(receipt.permit.id) : "\u2014"), badge(receipt.verification !== "NOT_REPORTED" ? receipt.verification : receipt.authorization));
      const body = node("div", "receipt-body");
      body.append(
        fact(tr("requestId"), shortID(receipt.requestId), true),
        fact(tr("finalVerdict"), receipt.verdict),
        fact(tr("authorization"), receipt.authorization),
        fact(tr("verificationResult"), receipt.verification),
        fact(tr("resource"), receipt.resource),
        fact(tr("operation"), receipt.operation),
        fact(tr("actionDigest"), receipt.actionDigest ? shortID(receipt.actionDigest) : "NOT REPORTED", true),
        fact(tr("policyVersion"), receipt.policyVersion),
        fact(tr("evidenceSource"), receipt.evidenceSources.length ? receipt.evidenceSources.map((item2) => upper(item2)).join(" \xB7 ") : "NOT REPORTED")
      );
      body.append(node("p", "receipt-safe", tr("receiptSafe")));
      item.append(summary, body);
      list.append(item);
    });
  }
  function scenarioIcon(kind) {
    return { valid: "\u2713", mutation: "\u2260", replay: "\u21BA", expired: "\u231B", advanced: "\xB7" }[kind];
  }
  function renderScenarioButton(scenario) {
    const button = node("button", `scenario-card ${scenario.kind}${scenario.id === state.selectedScenarioId ? " selected" : ""}${scenario.available ? "" : " unavailable"}`);
    button.type = "button";
    const top = node("span", "scenario-top");
    top.append(node("b", "", scenarioIcon(scenario.kind)), node("em", "", scenario.expected));
    button.append(top, node("strong", "", scenario.title), node("small", "", scenario.description));
    button.addEventListener("click", () => {
      state.selectedScenarioId = scenario.id;
      state.demoOutcome = null;
      renderDemo();
    });
    return button;
  }
  function renderDemo() {
    const primary = qs("#primary-scenario-list");
    const advanced = qs("#advanced-scenario-list");
    primary.replaceChildren();
    advanced.replaceChildren();
    state.scenarios.filter((item) => item.kind !== "advanced").forEach((item) => primary.append(renderScenarioButton(item)));
    const advancedItems = state.scenarios.filter((item) => item.kind === "advanced");
    advancedItems.forEach((item) => advanced.append(renderScenarioButton(item)));
    qs("#advanced-count").textContent = String(advancedItems.length);
    qs("#advanced-fixtures").hidden = advancedItems.length === 0;
    renderDemoScenarioDetail();
    renderDemoResult();
  }
  function renderDemoScenarioDetail() {
    const container = qs("#demo-scenario-detail");
    container.replaceChildren();
    const scenario = state.scenarios.find((item) => item.id === state.selectedScenarioId);
    const runButton = qs("#run-scenario");
    if (!scenario) {
      container.append(empty(tr("chooseScenario")));
      runButton.disabled = true;
      return;
    }
    const head = node("header", "demo-detail-head");
    const heading = node("div");
    heading.append(node("p", "eyebrow", tr("serverFixture")), node("h3", "", scenario.title));
    head.append(heading, badge(scenario.available ? "AVAILABLE" : "NOT_AVAILABLE"));
    const summary = node("p", "scenario-description", scenario.description);
    const fields = node("div", "fixture-fields");
    fields.append(fact(tr("principal"), scenario.principal), fact(tr("agent"), scenario.agent), fact(tr("tool"), scenario.tool), fact(tr("capability"), scenario.capability), fact(tr("resource"), scenario.resource), fact(tr("operation"), scenario.operation), fact(tr("actionDigest"), scenario.actionDigest ? shortID(scenario.actionDigest) : "COMPUTED SERVER-SIDE", true));
    const expected = node("div", "expected-result");
    expected.append(node("span", "", tr("expected")), node("strong", "", scenario.expected));
    container.append(head, summary, fields, expected, node("p", "secret-note", tr("argumentsHidden")));
    if (!scenario.available) container.append(node("p", "compatibility-note", tr("notAvailable")));
    runButton.disabled = !scenario.available;
  }
  function normalizeDemoOutcome(payload) {
    const permit = normalizePermit(first(payload, ["permit", "execution_permit", "authorization_envelope", "receipt.permit"]) ?? payload);
    const attemptsPayload = extractArray(payload, ["attempts", "verification_attempts", "results", "verifications"]);
    const attempts = attemptsPayload.map((item) => normalizeVerification(item)).filter((item) => item !== "NOT_REPORTED");
    const result = normalizeVerification(payload) !== "NOT_REPORTED" ? normalizeVerification(payload) : attempts.at(-1) ?? permit?.verification ?? "NOT_REPORTED";
    return {
      result,
      permitId: permit?.id ?? safeText(payload, ["permit_id", "receipt.permit_id"]),
      state: permit?.state ?? upper(rawText(payload, ["permit_state", "state"], "UNKNOWN")),
      actionDigest: permit?.actionDigest ?? safeText(payload, ["action_digest", "receipt.action_digest"]),
      upstreamInvoked: boolValue(payload, ["upstream_invoked", "upstream_tool_invoked", "executor_invoked", "dispatch_decision.executor_invoked", "receipt.upstream_invoked"]),
      evidenceSource: safeText(payload, ["evidence_source", "source", "receipt.evidence_source"], "simulated_demo"),
      attempts
    };
  }
  async function runScenario() {
    const scenario = state.scenarios.find((item) => item.id === state.selectedScenarioId);
    if (!scenario?.available) return;
    const button = qs("#run-scenario");
    const error = qs("#demo-error");
    button.disabled = true;
    button.classList.add("loading");
    error.textContent = "";
    try {
      const payload = await requestJSON(`/api/demo-lab/${encodeURIComponent(scenario.id)}/run`, { method: "POST", body: "{}" });
      state.demoOutcome = normalizeDemoOutcome(payload);
      await Promise.all([loadDecisions(), loadAudits()]);
      await loadPermits();
      renderAll();
      navigate("demo", false);
    } catch (cause) {
      error.textContent = `${tr("requestFailed")}: ${cause instanceof Error ? cause.message : "UNKNOWN"}`;
    } finally {
      button.disabled = !scenario.available;
      button.classList.remove("loading");
    }
  }
  function renderDemoResult() {
    const container = qs("#demo-result");
    container.replaceChildren();
    const scenario = state.scenarios.find((item) => item.id === state.selectedScenarioId);
    if (!state.demoOutcome || !scenario) {
      const placeholder = node("div", "demo-placeholder");
      placeholder.append(node("b", "", "A\u2261A"), node("p", "", tr("chooseScenario")));
      container.append(placeholder);
      return;
    }
    const outcome = state.demoOutcome;
    const head = node("header", `result-head ${verificationClass(outcome.result)}`);
    head.append(node("p", "eyebrow", tr("demoResult")), node("h3", "", outcome.result));
    const facts = node("div", "result-facts");
    const upstream = outcome.upstreamInvoked === true ? tr("invoked") : outcome.upstreamInvoked === false ? tr("notInvoked") : tr("unknownInvocation");
    facts.append(fact(tr("permitId"), shortID(outcome.permitId), true), fact(tr("state"), outcome.state), fact(tr("actionDigest"), outcome.actionDigest ? shortID(outcome.actionDigest) : "NOT REPORTED", true), fact(tr("upstreamTool"), upstream), fact(tr("evidenceSource"), upper(outcome.evidenceSource)));
    if (outcome.attempts.length) {
      const attempts = node("div", "attempt-list");
      attempts.append(node("span", "block-label", tr("attempts")));
      outcome.attempts.forEach((attempt, index) => {
        const row = node("div");
        row.append(node("b", "", String(index + 1).padStart(2, "0")), badge(attempt));
        attempts.append(row);
      });
      facts.append(attempts);
    }
    container.append(head, facts, node("p", "demo-truth", tr("truthfulDemo")));
  }
  function renderInventory() {
    const container = qs("#inventory-list");
    container.replaceChildren();
    if (!state.inventoryEnabled || !state.inventory.length) {
      container.append(empty(tr("noInventory")));
      return;
    }
    container.append(node("p", "experimental-banner", tr("experimentalOnly")));
    state.inventory.forEach((item) => {
      const row = node("article", "inventory-row");
      row.append(node("strong", "", safeText(item, ["agent_id", "name"], tr("unknown"))), node("code", "", safeText(item, ["workload_id", "workload_ids.0"], "NOT REPORTED")));
      container.append(row);
    });
  }
  function renderAll() {
    applyTranslations();
    renderMetrics();
    renderActivity();
    renderPermits();
    renderAudit();
    renderDemo();
    renderInventory();
  }
  function bindEvents() {
    document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => navigate(compatibilityView(button.dataset.nav ?? ""))));
    document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => navigate(compatibilityView(button.dataset.go ?? ""))));
    document.querySelectorAll("[data-permit-filter]").forEach((button) => button.addEventListener("click", () => {
      state.permitFilter = button.dataset.permitFilter ?? "all";
      document.querySelectorAll("[data-permit-filter]").forEach((item) => item.classList.toggle("active", item === button));
      renderPermits();
    }));
    qs("#language-toggle").addEventListener("click", () => {
      state.locale = state.locale === "zh-CN" ? "en" : "zh-CN";
      localStorage.setItem("aegis-locale", state.locale);
      qs("#demo-error").textContent = "";
      renderAll();
    });
    qs("#refresh-all").addEventListener("click", () => {
      void refreshAll(true);
    });
    qs("#run-scenario").addEventListener("click", () => {
      void runScenario();
    });
    window.addEventListener("hashchange", () => navigate(compatibilityView(location.hash.slice(1)), false));
  }
  bindEvents();
  navigate(compatibilityView(location.hash.slice(1)), false);
  void refreshAll();
})();
