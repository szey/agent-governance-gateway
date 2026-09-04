"use strict";
(() => {
  // web/src/app.ts
  var copy = {
    "zh-CN": {
      skipContent: "\u8DF3\u5230\u4E3B\u8981\u5185\u5BB9",
      brandSubtitle: "AI Agent \u7B56\u7565\u9A71\u52A8\u5B89\u5168\u8DEF\u7531\u5668",
      navOverview: "\u603B\u89C8",
      navDecisions: "\u88C1\u51B3",
      navInvestigations: "\u5BA1\u8BA1 / \u8C03\u67E5",
      navPolicies: "\u7B56\u7565",
      navInventory: "Agent \u6E05\u5355",
      navDemo: "\u6F14\u793A\u5B9E\u9A8C\u5BA4",
      doctrineLabel: "\u96F6\u4FE1\u4EFB\u539F\u5219",
      doctrine: "\u6279\u51C6 Agent \u5B58\u5728\uFF0C\u4E0D\u4EE3\u8868\u6279\u51C6\u5B83\u7684\u884C\u4E3A\u3002",
      controlPlane: "\u5B89\u5168\u63A7\u5236\u5E73\u9762",
      checking: "\u68C0\u67E5\u4E2D",
      online: "\u7B56\u7565\u5F15\u64CE\u5728\u7EBF",
      offline: "\u63A7\u5236\u5E73\u9762\u4E0D\u53EF\u8FBE",
      refresh: "\u5237\u65B0",
      overviewTitle: "\u8FD0\u884C\u65F6\u6001\u52BF",
      decisionsTitle: "\u9010\u52A8\u4F5C\u88C1\u51B3",
      investigationsTitle: "\u5BA1\u8BA1\u4E0E\u8C03\u67E5",
      policiesTitle: "\u6388\u6743\u7B56\u7565",
      inventoryTitle: "Agent \u6E05\u5355",
      demoTitle: "\u6F14\u793A\u5B9E\u9A8C\u5BA4",
      runtimeFirst: "\u8FD0\u884C\u65F6\u5F3A\u5236\u4F18\u5148",
      overviewHero: "\u6BCF\u4E2A\u52A8\u4F5C\u5148\u83B7\u51C6\uFF0C\u518D\u8D8A\u8FC7\u5B89\u5168\u8FB9\u754C\u3002",
      overviewCopy: "Aegis \u5728 Agent \u4E0E\u5DE5\u5177\u3001\u8D44\u6E90\u4E4B\u95F4\u6838\u9A8C\u8EAB\u4EFD\u3001\u59D4\u6258\u6743\u9650\u548C\u52A8\u4F5C\u7EA6\u675F\uFF0C\u5E76\u7528\u6388\u6743\u4FE1\u5C01\u7EA6\u675F\u540E\u7EED\u6267\u884C\u3002",
      identity: "\u8EAB\u4EFD",
      policy: "\u7B56\u7565",
      risk: "\u98CE\u9669",
      dispatch: "\u5206\u6D3E",
      observation: "\u89C2\u5BDF",
      audit: "\u5BA1\u8BA1",
      securityBoundary: "\u5B89\u5168\u8FB9\u754C",
      envelopeIsBoundary: "\u6388\u6743\u4FE1\u5C01\uFF0C\u800C\u975E Agent \u81EA\u8FF0\u8BA1\u5212",
      governedIdentities: "\u53D7\u6CBB\u7406\u8EAB\u4EFD",
      allowedActions: "\u5DF2\u5141\u8BB8\u52A8\u4F5C",
      restrictedActions: "\u53D7\u9650\u6267\u884C",
      sandboxRoutes: "\u6C99\u7BB1\u8DEF\u7531",
      blockedActions: "\u6267\u884C\u524D\u963B\u65AD",
      needsReview: "\u7B49\u5F85\u590D\u6838",
      decisionStream: "\u88C1\u51B3\u6D41",
      recentDecisions: "\u6700\u8FD1\u88C1\u51B3",
      viewAll: "\u67E5\u770B\u5168\u90E8",
      attentionQueue: "\u5173\u6CE8\u961F\u5217",
      blockedAndViolations: "\u963B\u65AD\u4E0E\u8D8A\u754C",
      evidencePlane: "\u8BC1\u636E\u5E73\u9762",
      runtimeCoverage: "\u8FD0\u884C\u65F6\u8986\u76D6",
      unknownNotZero: "UNKNOWN \u2260 0",
      coverageCopy: "\u4EC5\u663E\u793A\u5DF2\u63A5\u5165\u4E14\u6709\u6765\u6E90\u6807\u8BC6\u7684\u8BC1\u636E\uFF1B\u672A\u63A5\u5165\u7684\u4F20\u611F\u5668\u4FDD\u6301\u672A\u77E5\u3002",
      identityPlane: "\u8EAB\u4EFD\u5E73\u9762",
      workloadIdentities: "Agent \u5DE5\u4F5C\u8D1F\u8F7D",
      openInventory: "\u6253\u5F00\u6E05\u5355",
      registered: "\u5DF2\u767B\u8BB0",
      evidenceOnly: "\u4EC5\u8BC1\u636E",
      identityBoundary: "\u767B\u8BB0\u56DE\u7B54\u201C\u5DE5\u4F5C\u8D1F\u8F7D\u80FD\u5426\u8FDB\u5165\u6CBB\u7406\u73AF\u5883\u201D\uFF1B\u7B56\u7565\u56DE\u7B54\u201C\u6B64\u523B\u80FD\u5426\u6267\u884C\u8FD9\u4E2A\u52A8\u4F5C\u201D\u3002",
      runtimeGateway: "\u8FD0\u884C\u65F6\u7F51\u5173",
      decisionsCopy: "\u6388\u6743\u4E0E\u98CE\u9669\u5206\u5F00\u8BA1\u7B97\uFF1B\u660E\u786E\u7684\u7B56\u7565\u62D2\u7EDD\u4E0D\u4F1A\u88AB\u98CE\u9669\u5206\u6570\u8986\u76D6\u3002",
      tryDemo: "\u8FD0\u884C\u5B89\u5168\u573A\u666F",
      all: "\u5168\u90E8",
      blocked: "\u963B\u65AD",
      permitted: "\u5DF2\u653E\u884C",
      evidenceChain: "\u8BC1\u636E\u94FE",
      investigationsCopy: "\u4ECE\u8BF7\u6C42\u4E0A\u4E0B\u6587\u5230\u6700\u7EC8\u7ED3\u8BBA\uFF0C\u4FDD\u7559\u53EF\u89E3\u91CA\u7684\u88C1\u51B3\u4E0E\u8BC1\u636E\u94FE\u3002",
      boundaryEvents: "\u8FB9\u754C\u4E8B\u4EF6",
      violationsAndBlocks: "\u8D8A\u754C\u4E0E\u963B\u65AD",
      runtimeEvidence: "\u8FD0\u884C\u65F6\u8BC1\u636E",
      sourceAndTrust: "\u6765\u6E90\u4E0E\u53EF\u4FE1\u5EA6",
      evidenceRule: "\u81EA\u62A5\u3001\u9002\u914D\u5668\u3001OS \u4E0E\u7F51\u7EDC\u4F20\u611F\u5668\u4E0D\u53EF\u6DF7\u4E3A\u540C\u4E00\u79CD\u201C\u5DF2\u89C2\u5BDF\u201D\u3002",
      policyPlane: "\u7B56\u7565\u5E73\u9762",
      policiesCopy: "\u56F4\u7ED5\u8EAB\u4EFD\u3001\u59D4\u6258\u6743\u9650\u3001\u80FD\u529B\u3001\u5DE5\u5177\u3001\u8D44\u6E90\u3001\u64CD\u4F5C\u4E0E\u7EA6\u675F\u505A\u663E\u5F0F\u6388\u6743\u3002",
      assetRegistration: "\u8D44\u4EA7\u767B\u8BB0",
      mayParticipate: "\u8FD9\u4E2A\u5DE5\u4F5C\u8D1F\u8F7D\u53EF\u4EE5\u53C2\u4E0E\u6CBB\u7406\u73AF\u5883\u5417\uFF1F",
      actionAuthorization: "\u9010\u52A8\u4F5C\u6388\u6743",
      mayActNow: "\u5B83\u5728\u5F53\u524D\u59D4\u6258\u6743\u9650\u4E0B\u53EF\u4EE5\u6267\u884C\u8FD9\u4E2A\u52A8\u4F5C\u5417\uFF1F",
      evaluationOrder: "\u8BC4\u4F30\u8F93\u5165",
      authorizationAnatomy: "\u6388\u6743\u6784\u6210",
      principalAndAgent: "\u4E3B\u4F53 + Agent \u8EAB\u4EFD",
      principalAndAgentCopy: "\u4EBA\u7C7B\u6216\u670D\u52A1\u4E3B\u4F53\uFF0C\u4EE5\u53CA\u5B9E\u9645\u5DE5\u4F5C\u8D1F\u8F7D",
      delegatedAuthority: "\u59D4\u6258\u6743\u9650",
      delegatedAuthorityCopy: "\u51ED\u636E\u6307\u7EB9\u3001\u9881\u53D1\u8005\u3001\u4E3B\u4F53\u3001\u8303\u56F4\u4E0E\u6709\u6548\u671F",
      capabilityAndTool: "\u80FD\u529B + \u5DE5\u5177",
      capabilityAndToolCopy: "\u5141\u8BB8\u7684\u80FD\u529B\u3001\u5DE5\u5177\u8EAB\u4EFD\u548C Schema",
      resourceAndOperation: "\u8D44\u6E90 + \u64CD\u4F5C",
      resourceAndOperationCopy: "\u8D44\u6E90\u7C7B\u522B\u3001read/write/admin \u4E0E\u526F\u4F5C\u7528",
      constraints: "\u6267\u884C\u7EA6\u675F",
      constraintsCopy: "\u7F51\u7EDC\u3001\u79D8\u5BC6\u3001\u5199\u5165\u3001\u65F6\u957F\u4E0E\u6267\u884C\u73AF\u5883",
      observedRules: "\u5DF2\u89C2\u5BDF\u89C4\u5219",
      rulesSeenInAudits: "\u5BA1\u8BA1\u4E2D\u51FA\u73B0\u7684\u89C4\u5219",
      notPolicyEditor: "\u53EA\u8BFB\u8BC1\u636E",
      policyApiNote: "\u5F53\u524D UI \u4E0D\u5047\u88C5\u63D0\u4F9B\u5C1A\u672A\u66B4\u9732\u7684\u7B56\u7565\u7F16\u8F91 API\uFF1B\u8FD9\u91CC\u4EC5\u6C47\u603B\u771F\u5B9E\u5BA1\u8BA1\u8BB0\u5F55\u4E2D\u547D\u4E2D\u7684\u89C4\u5219\u3002",
      securityObject: "\u5B89\u5168\u5BF9\u8C61",
      envelopeTitle: "\u6388\u6743\u4FE1\u5C01",
      envelopeCopy: "\u53EA\u6709 ALLOW\u3001RESTRICT \u6216 SANDBOX \u624D\u80FD\u4EA7\u751F\u4FE1\u5C01\uFF1B\u8FD0\u884C\u65F6\u4E8B\u4EF6\u5FC5\u987B\u7ED1\u5B9A\u4FE1\u5C01\u5E76\u63A5\u53D7\u8D8A\u754C\u68C0\u67E5\u3002",
      visibilityModule: "\u53EF\u9009\u53EF\u89C1\u6027\u6A21\u5757",
      inventoryCopy: "\u53D1\u73B0\u8BC1\u636E\u5E2E\u52A9\u8BC6\u522B\u5DE5\u4F5C\u8D1F\u8F7D\uFF0C\u4F46\u4F9D\u8D56\u3001\u63D2\u4EF6\u6216\u7F13\u5B58\u6587\u4EF6\u672C\u8EAB\u4E0D\u662F Agent \u8EAB\u4EFD\u3002",
      rescan: "\u91CD\u65B0\u626B\u63CF",
      scanCoverage: "\u626B\u63CF\u8986\u76D6",
      workloadEvidence: "\u5DE5\u4F5C\u8D1F\u8F7D\u8BC1\u636E",
      deployedCandidates: "\u5DF2\u90E8\u7F72 / \u5DF2\u914D\u7F6E\u5019\u9009",
      availableIntegrations: "\u53D1\u73B0\u8BC1\u636E / \u53EF\u7528\u96C6\u6210",
      availableDisclosure: "\u8FD9\u4E9B marketplace\u3001catalog\u3001cache \u6216\u4F9D\u8D56\u7EBF\u7D22\u9ED8\u8BA4\u6298\u53E0\uFF0C\u4E0D\u8BA1\u4F5C\u8FD0\u884C\u4E2D\u7684 Agent\u3002",
      admissionRegistry: "\u51C6\u5165\u767B\u8BB0",
      approvedWorkloads: "\u5DF2\u767B\u8BB0\u5DE5\u4F5C\u8D1F\u8F7D",
      registryBoundary: "\u767B\u8BB0\u53EA\u63A7\u5236\u5DE5\u4F5C\u8D1F\u8F7D\u51C6\u5165\uFF1B\u5B83\u7684\u6BCF\u6B21\u884C\u4E3A\u4ECD\u987B\u7ECF\u8FC7\u7B56\u7565\u4E0E\u5BA1\u8BA1\u3002",
      addOrEditRegistration: "\u6DFB\u52A0\u6216\u7F16\u8F91\u767B\u8BB0",
      agentName: "Agent \u540D\u79F0",
      agentType: "Agent \u7C7B\u578B",
      pathEvidence: "\u8BC1\u636E\u8DEF\u5F84\u7247\u6BB5",
      relativeEvidenceOnly: "\u4EC5\u4F7F\u7528\u76F8\u5BF9\u626B\u63CF\u6839\u76EE\u5F55\u7684\u7A33\u5B9A\u7247\u6BB5\u3002",
      fingerprint: "\u53D1\u73B0\u6307\u7EB9",
      owner: "\u8D1F\u8D23\u4EBA",
      environment: "\u73AF\u5883",
      approvalRef: "\u6279\u51C6\u5355\u53F7",
      expiresOn: "\u5230\u671F\u65E5",
      registryState: "\u767B\u8BB0\u72B6\u6001",
      active: "\u751F\u6548",
      suspended: "\u6682\u505C",
      policyProfile: "\u7B56\u7565\u6863\u6848",
      saveRegistration: "\u4FDD\u5B58\u767B\u8BB0",
      clearForm: "\u6E05\u7A7A",
      safeFixtures: "\u5B89\u5168\u6D4B\u8BD5\u5939\u5177",
      demoCopy: "\u516D\u4E2A\u573A\u666F\u7528\u4E8E\u56DE\u5F52\u6388\u6743\u4E0E\u68C0\u6D4B\u6D41\u7A0B\uFF0C\u4E0D\u4EE3\u8868\u771F\u5B9E\u751F\u4EA7\u9065\u6D4B\u3002",
      truthfulDemo: "\u8FD9\u91CC\u4EA7\u751F\u7684\u884C\u4E3A\u8BC1\u636E\u4F1A\u660E\u786E\u6807\u8BB0\u4E3A simulated_demo\u3002",
      sandboxTruth: "SANDBOX \u4EC5\u8868\u793A\u8DEF\u7531\uFF1B\u9694\u79BB\u540E\u7AEF\uFF1ANOT CONNECTED / DEMO\u3002",
      scenarioLibrary: "\u573A\u666F\u5E93",
      securityScenarios: "\u5B89\u5168\u573A\u666F",
      actionRequest: "\u52A8\u4F5C\u8BF7\u6C42",
      chooseScenario: "\u9009\u62E9\u573A\u666F",
      requestPayload: "\u670D\u52A1\u7AEF\u6D4B\u8BD5\u5939\u5177\uFF08\u53EA\u8BFB\uFF09",
      privacyNote: "\u8BE5\u8BF7\u6C42\u7531\u670D\u52A1\u7AEF\u573A\u666F\u56FA\u5B9A\u63D0\u4F9B\uFF1B\u4E0D\u5F97\u653E\u5165\u771F\u5B9E\u4EE4\u724C\u3001\u79D8\u5BC6\u3001\u63D0\u793A\u8BCD\u5185\u5BB9\u6216\u4E2A\u4EBA\u8DEF\u5F84\u3002",
      authorizeAction: "\u8FD0\u884C\u573A\u666F",
      footerTruth: "\u9ED8\u8BA4\u62D2\u7EDD \xB7 \u9010\u52A8\u4F5C\u6388\u6743 \xB7 \u6765\u6E90\u53EF\u8FA8\u7684\u5BA1\u8BA1",
      noDecisions: "\u8FD8\u6CA1\u6709\u7F51\u5173\u88C1\u51B3\u3002\u8BF7\u5728\u6F14\u793A\u5B9E\u9A8C\u5BA4\u8FD0\u884C\u4E00\u4E2A\u5B89\u5168\u573A\u666F\u3002",
      noAlerts: "\u6682\u65E0\u963B\u65AD\u6216\u6388\u6743\u8FB9\u754C\u8D8A\u754C\u8BB0\u5F55\u3002",
      noRuntimeEvidence: "\u6CA1\u6709\u5E26\u6765\u6E90\u6807\u8BC6\u7684\u8FD0\u884C\u65F6\u8BC1\u636E\u3002\u672A\u77E5\u4E0D\u4EE3\u8868\u6CA1\u6709\u884C\u4E3A\u3002",
      noInventory: "\u672A\u53D1\u73B0\u5DF2\u90E8\u7F72\u6216\u5DF2\u914D\u7F6E\u7684 Agent \u5019\u9009\u3002",
      noAvailableEvidence: "\u6CA1\u6709\u4EC5\u53EF\u7528\u7684\u96C6\u6210\u6216\u4F9D\u8D56\u8BC1\u636E\u3002",
      noRegistrations: "\u767B\u8BB0\u6E05\u5355\u4E3A\u7A7A\u3002\u672A\u5339\u914D\u7684\u5DF2\u90E8\u7F72\u5DE5\u4F5C\u8D1F\u8F7D\u4F1A\u6807\u4E3A Shadow\u3002",
      noRules: "\u5C1A\u65E0\u5BA1\u8BA1\u8BB0\u5F55\u53EF\u7528\u4E8E\u6C47\u603B\u547D\u4E2D\u89C4\u5219\u3002",
      principal: "\u4E3B\u4F53",
      principalType: "\u4E3B\u4F53\u7C7B\u578B",
      agentIdentity: "Agent \u8EAB\u4EFD",
      workload: "\u5DE5\u4F5C\u8D1F\u8F7D",
      issuer: "\u9881\u53D1\u8005",
      delegatedSubject: "\u59D4\u6258\u4E3B\u4F53",
      scopes: "\u59D4\u6258\u8303\u56F4",
      credential: "\u51ED\u636E\u6307\u7EB9",
      requestedAction: "\u8BF7\u6C42\u52A8\u4F5C",
      capability: "\u80FD\u529B",
      tool: "\u5DE5\u5177",
      resource: "\u8D44\u6E90",
      operation: "\u64CD\u4F5C",
      sideEffect: "\u526F\u4F5C\u7528",
      policyDecision: "\u7B56\u7565\u88C1\u51B3",
      riskAssessment: "\u98CE\u9669\u8BC4\u4F30",
      dispatchDecision: "\u5206\u6D3E\u7ED3\u679C",
      matchedRules: "\u547D\u4E2D\u89C4\u5219",
      riskSignals: "\u98CE\u9669\u4FE1\u53F7",
      selectedExecutor: "\u6267\u884C\u5668",
      finalVerdict: "\u6700\u7EC8\u7ED3\u8BBA",
      duration: "\u8017\u65F6",
      permitId: "\u8BB8\u53EF ID",
      issuedAt: "\u7B7E\u53D1\u65F6\u95F4",
      expiresAt: "\u5931\u6548\u65F6\u95F4",
      allowedOperations: "\u5141\u8BB8\u64CD\u4F5C",
      permitNotIssued: "\u672A\u7B7E\u53D1\u6267\u884C\u8BB8\u53EF",
      deniedBeforeExecution: "\u8BF7\u6C42\u5728\u6267\u884C\u524D\u88AB\u7B56\u7565\u963B\u65AD\uFF0C\u56E0\u6B64\u6CA1\u6709\u6388\u6743\u4FE1\u5C01\u3002",
      legacyEnvelopeMissing: "\u65E7\u7248\u54CD\u5E94\u6CA1\u6709\u6388\u6743\u4FE1\u5C01\uFF1B\u754C\u9762\u4E0D\u4F1A\u4ECE ALLOW \u7ED3\u679C\u63A8\u6D4B\u8BB8\u53EF\u8303\u56F4\u3002",
      runtimeEvents: "\u8FD0\u884C\u65F6\u4E8B\u4EF6",
      source: "\u6765\u6E90",
      trust: "\u53EF\u4FE1\u5EA6",
      violation: "\u6388\u6743\u8FB9\u754C\u8D8A\u754C",
      withinEnvelope: "\u4FE1\u5C01\u8303\u56F4\u5185",
      isolationBackend: "\u9694\u79BB\u540E\u7AEF",
      notConnectedDemo: "NOT CONNECTED / DEMO",
      unknown: "UNKNOWN",
      notInstrumented: "NOT INSTRUMENTED",
      instrumented: "INSTRUMENTED",
      adapterReported: "ADAPTER REPORTED",
      simulatedDemo: "SIMULATED DEMO",
      selfReported: "AGENT SELF-REPORTED",
      connected: "CONNECTED",
      gatewayRequests: "\u7F51\u5173\u8BF7\u6C42",
      toolEvents: "\u5DE5\u5177\u4E8B\u4EF6",
      filesystem: "\u6587\u4EF6\u7CFB\u7EDF",
      network: "\u7F51\u7EDC",
      osSyscalls: "OS \u7CFB\u7EDF\u8C03\u7528",
      isolation: "\u9694\u79BB\u6267\u884C",
      derivedFromAudit: "\u6765\u81EA\u7F51\u5173\u5BA1\u8BA1\u8BB0\u5F55",
      noSensor: "\u672A\u8FDE\u63A5\u72EC\u7ACB\u4F20\u611F\u5668",
      noAdapterEvidence: "\u6CA1\u6709\u9002\u914D\u5668\u8BC1\u636E",
      demoOnly: "\u4EC5\u6F14\u793A\u540E\u7AEF",
      approved: "\u5DF2\u767B\u8BB0",
      unassessed: "\u5F85\u8BC4\u4F30",
      available: "\u4EC5\u53EF\u7528",
      installed: "\u5DF2\u5B89\u88C5",
      configured: "\u5DF2\u914D\u7F6E",
      observed: "\u5DF2\u89C2\u5BDF",
      discoveryConfidence: "\u53D1\u73B0\u7F6E\u4FE1\u5EA6",
      potentialExposure: "\u6F5C\u5728\u66B4\u9732",
      unclassified: "\u672A\u5206\u7C7B",
      prepareRegistration: "\u586B\u5199\u767B\u8BB0",
      edit: "\u7F16\u8F91",
      remove: "\u79FB\u9664",
      confirmRemove: "\u79FB\u9664\u8FD9\u6761\u767B\u8BB0\u8BB0\u5F55\uFF1F\u4E0B\u6B21\u6838\u5BF9\u540E\u8BE5\u5DE5\u4F5C\u8D1F\u8F7D\u53EF\u80FD\u53D8\u4E3A Shadow\u3002",
      registrationSaved: "\u767B\u8BB0\u5DF2\u4FDD\u5B58\u5E76\u91CD\u65B0\u6838\u5BF9\u3002",
      registrationRemoved: "\u767B\u8BB0\u5DF2\u79FB\u9664\u5E76\u91CD\u65B0\u6838\u5BF9\u3002",
      scanComplete: "\u626B\u63CF\u5B8C\u6210\uFF0C\u6E05\u5355\u5DF2\u5237\u65B0\u3002",
      scanIncomplete: "\u90E8\u5206\u626B\u63CF\u6E90\u4E0D\u53EF\u8BFB\u53D6\uFF1B\u8986\u76D6\u4FDD\u6301 UNKNOWN\u3002",
      expected: "\u9884\u671F",
      authorizing: "\u6B63\u5728\u6388\u6743\u2026",
      inspectDecision: "\u67E5\u770B\u5B8C\u6574\u88C1\u51B3",
      demoEvidence: "\u6F14\u793A\u8BC1\u636E",
      noExecutionEvidence: "\u6CA1\u6709\u8FD0\u884C\u65F6\u4E8B\u4EF6\uFF1B\u7CFB\u7EDF\u4E0D\u4F1A\u628A\u201C\u672A\u6536\u5230\u8BC1\u636E\u201D\u5199\u6210\u201C\u884C\u4E3A\u4E3A\u96F6\u201D\u3002",
      requestFailed: "\u8BF7\u6C42\u5931\u8D25",
      refreshed: "\u6570\u636E\u5DF2\u5237\u65B0\u3002"
    },
    en: {
      skipContent: "Skip to main content",
      brandSubtitle: "A Policy-Driven Security Router for AI Agents",
      navOverview: "Overview",
      navDecisions: "Decisions",
      navInvestigations: "Audit / Investigations",
      navPolicies: "Policies",
      navInventory: "Agent Inventory",
      navDemo: "Demo Lab",
      doctrineLabel: "Zero-trust principle",
      doctrine: "Approving an Agent to exist does not approve its behavior.",
      controlPlane: "Security control plane",
      checking: "Checking",
      online: "Policy engine online",
      offline: "Control plane unavailable",
      refresh: "Refresh",
      overviewTitle: "Runtime posture",
      decisionsTitle: "Per-action decisions",
      investigationsTitle: "Audit & investigations",
      policiesTitle: "Authorization policies",
      inventoryTitle: "Agent inventory",
      demoTitle: "Demo lab",
      runtimeFirst: "RUNTIME ENFORCEMENT FIRST",
      overviewHero: "Clear every action before it crosses the boundary.",
      overviewCopy: "Aegis verifies identity, delegated authority, and action constraints between Agents and tools or resources, then bounds execution with an Authorization Envelope.",
      identity: "Identity",
      policy: "Policy",
      risk: "Risk",
      dispatch: "Dispatch",
      observation: "Observation",
      audit: "Audit",
      securityBoundary: "Security boundary",
      envelopeIsBoundary: "Authorization Envelope, not the Agent's declared plan",
      governedIdentities: "Governed identities",
      allowedActions: "Permitted actions",
      restrictedActions: "Restricted execution",
      sandboxRoutes: "Sandbox routes",
      blockedActions: "Blocked pre-execution",
      needsReview: "Awaiting review",
      decisionStream: "DECISION STREAM",
      recentDecisions: "Recent decisions",
      viewAll: "View all",
      attentionQueue: "ATTENTION QUEUE",
      blockedAndViolations: "Blocks & violations",
      evidencePlane: "EVIDENCE PLANE",
      runtimeCoverage: "Runtime coverage",
      unknownNotZero: "UNKNOWN \u2260 0",
      coverageCopy: "Only connected, source-labeled evidence is shown. Disconnected sensors remain unknown.",
      identityPlane: "IDENTITY PLANE",
      workloadIdentities: "Agent workloads",
      openInventory: "Open inventory",
      registered: "Registered",
      evidenceOnly: "Evidence only",
      identityBoundary: "Registration asks whether a workload may participate; policy asks whether it may perform this action now.",
      runtimeGateway: "RUNTIME GATEWAY",
      decisionsCopy: "Authorization and risk are evaluated separately. A numerical risk score never overrides an explicit policy denial.",
      tryDemo: "Run a security scenario",
      all: "All",
      blocked: "Blocked",
      permitted: "Permitted",
      evidenceChain: "EVIDENCE CHAIN",
      investigationsCopy: "Preserve an explainable decision and evidence chain from request context to final verdict.",
      boundaryEvents: "BOUNDARY EVENTS",
      violationsAndBlocks: "Violations & blocks",
      runtimeEvidence: "RUNTIME EVIDENCE",
      sourceAndTrust: "Source & trust",
      evidenceRule: "Self-report, adapters, OS sensors, and network sensors must never collapse into one generic \u201CObserved\u201D state.",
      policyPlane: "POLICY PLANE",
      policiesCopy: "Authorize explicitly across identity, delegation, capability, tool, resource, operation, and constraints.",
      assetRegistration: "Asset registration",
      mayParticipate: "May this workload participate in the governed environment?",
      actionAuthorization: "Per-action authorization",
      mayActNow: "May it perform this action now under this delegated authority?",
      evaluationOrder: "EVALUATION INPUTS",
      authorizationAnatomy: "Authorization anatomy",
      principalAndAgent: "Principal + Agent identity",
      principalAndAgentCopy: "Human or service principal and the actual workload",
      delegatedAuthority: "Delegated authority",
      delegatedAuthorityCopy: "Credential fingerprint, issuer, subject, scopes, and expiry",
      capabilityAndTool: "Capability + tool",
      capabilityAndToolCopy: "Granted capability, tool identity, and schema",
      resourceAndOperation: "Resource + operation",
      resourceAndOperationCopy: "Resource class, read/write/admin, and side effects",
      constraints: "Execution constraints",
      constraintsCopy: "Network, secrets, writes, duration, and executor profile",
      observedRules: "OBSERVED RULES",
      rulesSeenInAudits: "Rules seen in audits",
      notPolicyEditor: "READ-ONLY EVIDENCE",
      policyApiNote: "The UI does not pretend an unexposed policy editing API exists. This list only summarizes rules present in real audit records.",
      securityObject: "SECURITY OBJECT",
      envelopeTitle: "Authorization Envelope",
      envelopeCopy: "Only ALLOW, RESTRICT, or SANDBOX can produce an envelope. Runtime events must bind to it and undergo boundary checks.",
      visibilityModule: "OPTIONAL VISIBILITY MODULE",
      inventoryCopy: "Discovery evidence can identify workload candidates, but a dependency, plugin, or cache file is not an Agent identity.",
      rescan: "Rescan",
      scanCoverage: "Scan coverage",
      workloadEvidence: "WORKLOAD EVIDENCE",
      deployedCandidates: "Deployed / configured candidates",
      availableIntegrations: "Discovery evidence / available integrations",
      availableDisclosure: "Marketplace, catalog, cache, and dependency clues stay collapsed and do not count as running Agents.",
      admissionRegistry: "ADMISSION REGISTRY",
      approvedWorkloads: "Registered workloads",
      registryBoundary: "Registration controls workload admission only. Every action still passes through policy and audit.",
      addOrEditRegistration: "Add or edit registration",
      agentName: "Agent name",
      agentType: "Agent type",
      pathEvidence: "Evidence path fragment",
      relativeEvidenceOnly: "Use a stable fragment relative to the scan root only.",
      fingerprint: "Discovery fingerprint",
      owner: "Owner",
      environment: "Environment",
      approvalRef: "Approval reference",
      expiresOn: "Expires on",
      registryState: "Registry state",
      active: "Active",
      suspended: "Suspended",
      policyProfile: "Policy profile",
      saveRegistration: "Save registration",
      clearForm: "Clear",
      safeFixtures: "SAFE FIXTURES",
      demoCopy: "Six scenarios exercise authorization and detection as regression fixtures\u2014not production telemetry.",
      truthfulDemo: "Behavior evidence generated here is explicitly labeled simulated_demo.",
      sandboxTruth: "SANDBOX is a route only. Isolation backend: NOT CONNECTED / DEMO.",
      scenarioLibrary: "SCENARIO LIBRARY",
      securityScenarios: "Security scenarios",
      actionRequest: "ACTION REQUEST",
      chooseScenario: "Choose a scenario",
      requestPayload: "Server-owned fixture (read-only)",
      privacyNote: "The request is fixed by the server-owned scenario; never place real tokens, secrets, prompt contents, or personal paths here.",
      authorizeAction: "Run scenario",
      footerTruth: "Default deny \xB7 per-action authorization \xB7 source-labeled audit",
      noDecisions: "No gateway decisions yet. Run a safe fixture in Demo Lab.",
      noAlerts: "No blocked requests or authorization-boundary violations.",
      noRuntimeEvidence: "No source-labeled runtime evidence. Unknown does not mean no behavior.",
      noInventory: "No deployed or configured Agent candidates were found.",
      noAvailableEvidence: "No available integration or dependency evidence.",
      noRegistrations: "The registry is empty. Unmatched deployed workloads are Shadow.",
      noRules: "No audit records exist from which to summarize matched rules.",
      principal: "Principal",
      principalType: "Principal type",
      agentIdentity: "Agent identity",
      workload: "Workload",
      issuer: "Issuer",
      delegatedSubject: "Delegated subject",
      scopes: "Delegated scopes",
      credential: "Credential fingerprint",
      requestedAction: "Requested action",
      capability: "Capability",
      tool: "Tool",
      resource: "Resource",
      operation: "Operation",
      sideEffect: "Side effect",
      policyDecision: "Policy decision",
      riskAssessment: "Risk assessment",
      dispatchDecision: "Dispatch decision",
      matchedRules: "Matched rules",
      riskSignals: "Risk signals",
      selectedExecutor: "Executor",
      finalVerdict: "Final verdict",
      duration: "Duration",
      permitId: "Permit ID",
      issuedAt: "Issued at",
      expiresAt: "Expires at",
      allowedOperations: "Allowed operations",
      permitNotIssued: "No execution permit issued",
      deniedBeforeExecution: "Policy blocked the request before execution, so no Authorization Envelope exists.",
      legacyEnvelopeMissing: "The legacy response has no Authorization Envelope. The UI will not infer a permit from an ALLOW result.",
      runtimeEvents: "Runtime events",
      source: "Source",
      trust: "Trust",
      violation: "Authorization boundary violation",
      withinEnvelope: "Inside envelope",
      isolationBackend: "Isolation backend",
      notConnectedDemo: "NOT CONNECTED / DEMO",
      unknown: "UNKNOWN",
      notInstrumented: "NOT INSTRUMENTED",
      instrumented: "INSTRUMENTED",
      adapterReported: "ADAPTER REPORTED",
      simulatedDemo: "SIMULATED DEMO",
      selfReported: "AGENT SELF-REPORTED",
      connected: "CONNECTED",
      gatewayRequests: "Gateway requests",
      toolEvents: "Tool events",
      filesystem: "Filesystem",
      network: "Network",
      osSyscalls: "OS syscalls",
      isolation: "Isolation execution",
      derivedFromAudit: "Derived from gateway audit records",
      noSensor: "No independent sensor connected",
      noAdapterEvidence: "No adapter evidence",
      demoOnly: "Demo backend only",
      approved: "Registered",
      unassessed: "Unassessed",
      available: "Available only",
      installed: "Installed",
      configured: "Configured",
      observed: "Observed",
      discoveryConfidence: "Discovery confidence",
      potentialExposure: "Potential exposure",
      unclassified: "Unclassified",
      prepareRegistration: "Prepare registration",
      edit: "Edit",
      remove: "Remove",
      confirmRemove: "Remove this registration? The workload may become Shadow after reconciliation.",
      registrationSaved: "Registration saved and discovery reconciled.",
      registrationRemoved: "Registration removed and discovery reconciled.",
      scanComplete: "Scan complete. Inventory refreshed.",
      scanIncomplete: "Some scan sources are unreadable; coverage remains UNKNOWN.",
      expected: "Expected",
      authorizing: "Authorizing\u2026",
      inspectDecision: "Inspect full decision",
      demoEvidence: "Demo evidence",
      noExecutionEvidence: "No runtime events exist. The system does not rewrite \u201Cno evidence received\u201D as \u201Czero behavior.\u201D",
      requestFailed: "Request failed",
      refreshed: "Data refreshed."
    }
  };
  var viewTitles = {
    overview: { key: "overviewTitle", kicker: "OVERVIEW" },
    decisions: { key: "decisionsTitle", kicker: "DECISIONS" },
    investigations: { key: "investigationsTitle", kicker: "AUDIT / INVESTIGATIONS" },
    policies: { key: "policiesTitle", kicker: "POLICIES" },
    inventory: { key: "inventoryTitle", kicker: "AGENT INVENTORY" },
    demo: { key: "demoTitle", kicker: "DEMO LAB" }
  };
  var state = {
    locale: localStorage.getItem("aegis-locale") === "en" ? "en" : "zh-CN",
    view: "overview",
    decisions: [],
    selectedDecision: "",
    decisionFilter: "all",
    scenarios: [],
    selectedScenario: "",
    coverage: [],
    sessionEvents: [],
    inventory: { agents: [], approvals: [], governedCount: 0, agentTypes: [], scannedAt: "", rootCount: 0, gaps: [], truncated: false },
    modernAgentsAPI: false
  };
  var HTTPError = class extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  };
  function qs(selector) {
    const node2 = document.querySelector(selector);
    if (!node2) throw new Error(`Missing UI element: ${selector}`);
    return node2;
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
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function list(value) {
    return Array.isArray(value) ? value : [];
  }
  function get(value, path) {
    return path.split(".").reduce((current, key) => record(current)[key], value);
  }
  function first(value, paths) {
    for (const path of paths) {
      const candidate = get(value, path);
      if (candidate !== void 0 && candidate !== null && candidate !== "") return candidate;
    }
    return void 0;
  }
  function textValue(value, paths, fallback = "\u2014") {
    const candidate = first(value, paths);
    return typeof candidate === "string" || typeof candidate === "number" || typeof candidate === "boolean" ? String(candidate) : fallback;
  }
  function strings(value, paths) {
    const candidate = first(value, paths);
    if (Array.isArray(candidate)) return candidate.map((item) => typeof item === "string" ? item : textValue(item, ["name", "id", "rule"], "")).filter(Boolean);
    if (typeof candidate === "string" && candidate) return [candidate];
    return [];
  }
  function numberValue(value, paths) {
    const candidate = first(value, paths);
    return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
  }
  function slug(value) {
    return value.toLowerCase().replaceAll("_", "-").replace(/[^a-z0-9-]/g, "-");
  }
  function titleToken(value) {
    return value ? value.replaceAll("_", " ").toUpperCase() : tr("unknown");
  }
  function shortID(value) {
    return value.length > 22 ? `${value.slice(0, 10)}\u2026${value.slice(-7)}` : value;
  }
  function formatTime(value, compact = false) {
    if (!value) return tr("unknown");
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return compact ? new Intl.DateTimeFormat(state.locale, { hour: "2-digit", minute: "2-digit" }).format(date) : new Intl.DateTimeFormat(state.locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  function privacySafe(value) {
    if (!value) return "\u2014";
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
  function fingerprintSafe(value) {
    if (!value || value === "\u2014") return value;
    return value.length > 20 ? `${value.slice(0, 11)}\u2026${value.slice(-6)}` : value;
  }
  async function requestJSON(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    if (!response.ok) throw new HTTPError(response.status, textValue(payload, ["message", "error"], `HTTP ${response.status}`));
    return payload;
  }
  async function optionalJSON(url) {
    try {
      return await requestJSON(url);
    } catch {
      return null;
    }
  }
  function extractArray(payload, keys) {
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {
      const value = get(payload, key);
      if (Array.isArray(value)) return value;
    }
    return [];
  }
  function normalizeEnvelope(rawDecision) {
    const source = first(rawDecision, ["authorization_envelope", "execution_permit", "permit", "authorization.envelope"]);
    if (!source || typeof source !== "object") return null;
    const constraintsSource = record(first(source, ["constraints"]));
    const constraints = {};
    Object.entries(constraintsSource).forEach(([key, value]) => {
      if (Array.isArray(value)) constraints[key] = value.map(String).join(", ");
      else if (["string", "number", "boolean"].includes(typeof value)) constraints[key] = String(value);
    });
    return {
      permitId: textValue(source, ["permit_id", "id"], "\u2014"),
      principal: textValue(source, ["principal_id", "principal"], "\u2014"),
      agent: textValue(source, ["agent_id", "agent"], "\u2014"),
      capability: textValue(source, ["allowed_capability", "capability"], "\u2014"),
      tool: textValue(source, ["allowed_tool", "tool", "tool_id"], "\u2014"),
      resource: privacySafe(textValue(source, ["allowed_resource", "resource", "resource_class"], "\u2014")),
      operations: strings(source, ["allowed_operations", "operations"]),
      constraints,
      issuedAt: textValue(source, ["issued_at"], "\u2014"),
      expiresAt: textValue(source, ["expires_at", "expiry"], "\u2014")
    };
  }
  function normalizeRuntimeEvent(rawEvent, index, violations, violatingEventIDs = /* @__PURE__ */ new Set()) {
    const capability = textValue(rawEvent, ["capability", "action_class"], "\u2014");
    const operation = textValue(rawEvent, ["operation", "event_type", "action"], capability);
    const resource = privacySafe(textValue(rawEvent, ["resource_class", "resource", "target_resource"], "\u2014"));
    const eventID = textValue(rawEvent, ["event_id", "id", "sequence"], `event-${index + 1}`);
    const violationFlag = first(rawEvent, ["violation", "envelope_violation"]) === true || first(rawEvent, ["allowed", "within_authorization_envelope"]) === false;
    const combined = `${capability} ${operation} ${resource}`.toLowerCase();
    return {
      id: eventID,
      source: textValue(rawEvent, ["source"], "unknown"),
      trust: textValue(rawEvent, ["trust_level", "trust"], "unknown"),
      capability,
      tool: textValue(rawEvent, ["tool", "tool_id", "tool_name"], "\u2014"),
      operation,
      resource,
      timestamp: textValue(rawEvent, ["timestamp", "observed_at", "created_at"], ""),
      violation: violationFlag || violatingEventIDs.has(eventID) || violations.some((item) => combined.includes(item.toLowerCase()) || item.toLowerCase().includes(operation.toLowerCase()))
    };
  }
  function normalizeDecision(input) {
    const wrapped = record(input);
    const raw = Object.keys(record(wrapped.audit)).length ? record(wrapped.audit) : Object.keys(record(wrapped.record)).length ? record(wrapped.record) : wrapped;
    const policyRoute = textValue(raw, ["policy_decision.route", "decision.route", "authorization.route"], "unknown").toLowerCase();
    const route = textValue(raw, ["dispatch_decision.route", "dispatch.route", "route"], policyRoute).toLowerCase();
    const violations = strings(raw, ["runtime_observation.authorization_violations", "envelope_violations", "runtime_observation.envelope_violations", "runtime_observation.violations", "violations"]);
    let eventInputs = extractArray(first(raw, ["runtime_events", "runtime_observation.events", "events"]), []);
    const violatingEventIDs = new Set(
      extractArray(first(raw, ["runtime_observation.event_evaluations", "event_evaluations"]), []).filter((evaluation) => first(evaluation, ["within_authorization_envelope", "accepted"]) === false || first(evaluation, ["execution_terminated"]) === true).map((evaluation) => textValue(evaluation, ["event_id"], "")).filter(Boolean)
    );
    if (!eventInputs.length) {
      eventInputs = strings(raw, ["runtime_observation.actual_actions"]).map((action2, index) => ({
        event_id: `legacy-demo-${index + 1}`,
        source: "simulated_demo",
        trust_level: "simulated_demo",
        capability: action2,
        operation: action2,
        envelope_violation: strings(raw, ["runtime_observation.unexpected_actions"]).includes(action2)
      }));
    }
    const policyReasons = strings(raw, ["policy_decision.reasons", "decision.reasons", "authorization.reasons"]);
    const riskScore = numberValue(raw, ["risk_assessment.score", "risk.score"]);
    const requestedCapability = textValue(raw, ["request.action_request.capability", "request.action.capability", "request.requested_capability", "action_request.capability"], "\u2014");
    const action = textValue(raw, ["request.action_request.operation", "request.action.operation", "request.requested_action", "action_request.operation"], requestedCapability);
    const isolation = textValue(raw, ["dispatch_decision.isolation_backend", "dispatch.isolation_backend.status", "execution.isolation_backend.status", "isolation_backend.status"], "");
    return {
      raw,
      requestId: textValue(raw, ["request_id", "request.request_id"], "unassigned"),
      createdAt: textValue(raw, ["created_at", "timestamp"], ""),
      principal: textValue(raw, ["request.principal_context.principal_id", "request.principal.principal_id", "request.user_id"], "\u2014"),
      principalType: textValue(raw, ["request.principal_context.principal_type", "request.principal.principal_type"], "\u2014"),
      agent: textValue(raw, ["request.agent_identity.agent_id", "request.agent.agent_id", "request.agent_id"], "\u2014"),
      workload: textValue(raw, ["request.agent_identity.workload_id", "request.agent.workload_id"], "\u2014"),
      delegatedIssuer: textValue(raw, ["request.delegated_authority.issuer", "request.authority.issuer"], "\u2014"),
      delegatedSubject: textValue(raw, ["request.delegated_authority.subject", "request.authority.subject"], "\u2014"),
      scopes: strings(raw, ["request.delegated_authority.scopes", "request.authority.scopes", "request.token_scopes"]),
      credentialFingerprint: fingerprintSafe(textValue(raw, ["request.delegated_authority.credential_fingerprint", "request.delegated_authority.credential_id", "request.authority.credential_fingerprint"], "\u2014")),
      capability: requestedCapability,
      action,
      operation: textValue(raw, ["request.action_request.operation", "request.action.operation", "request.operation"], action),
      tool: textValue(raw, ["request.tool_context.tool_id", "request.tool_context.name", "request.tool_identity.name", "request.tool.name"], "\u2014"),
      resource: privacySafe(textValue(raw, ["request.action_request.target_resource", "request.action.target_resource", "request.target_resource"], "\u2014")),
      sideEffect: textValue(raw, ["request.action_request.side_effect", "request.action.side_effect", "request.side_effect"], "\u2014"),
      policyRoute,
      route,
      policyReasons,
      matchedRules: strings(raw, ["policy_decision.matched_rules", "policy_decision.rules", "decision.matched_rules"]),
      riskLevel: textValue(raw, ["risk_assessment.level", "risk.level"], "unknown").toLowerCase(),
      riskScore,
      riskSignals: strings(raw, ["risk_assessment.signals", "risk.signals"]),
      executor: textValue(raw, ["selected_executor", "dispatch.executor", "executor"], route === "deny" ? "not invoked" : "\u2014"),
      isolationStatus: isolation || (["sandbox", "restrict"].includes(route) ? "not_connected_demo" : "not_applicable"),
      envelope: normalizeEnvelope(raw),
      events: eventInputs.map((event, index) => normalizeRuntimeEvent(event, index, violations, violatingEventIDs)),
      violations,
      finalVerdict: textValue(raw, ["final_verdict", "verdict"], route),
      durationMs: numberValue(raw, ["duration_ms", "duration"])
    };
  }
  function normalizeScenario(input) {
    return {
      id: textValue(input, ["id"], crypto.randomUUID()),
      title: textValue(input, ["title"], "Scenario"),
      description: textValue(input, ["description"], ""),
      expectedRoute: textValue(input, ["expected_route", "expected"], "\u2014"),
      request: record(get(input, "request"))
    };
  }
  function normalizeDiscoveryAgent(input) {
    const evidence = extractArray(get(input, "evidence"), []).map((item) => ({
      source: textValue(item, ["source"], "evidence"),
      indicator: privacySafe(textValue(item, ["indicator"], "\u2014")),
      confidence: numberValue(item, ["confidence"])
    }));
    return {
      fingerprint: textValue(input, ["fingerprint"], "\u2014"),
      name: textValue(input, ["display_name", "name"], "Unnamed workload"),
      agentType: textValue(input, ["agent_type", "type"], "unknown"),
      deploymentState: textValue(input, ["deployment_state", "deployment.state"], "available").toLowerCase(),
      status: textValue(input, ["status", "registration_status"], "unassessed").toLowerCase(),
      owner: textValue(input, ["owner"], ""),
      approvalId: textValue(input, ["approval_id", "registration_id"], ""),
      confidence: numberValue(input, ["confidence", "discovery_confidence"]),
      evidence,
      exposure: textValue(input, ["potential_exposure.classification", "potential_exposure.level", "exposure.classification"], "unclassified"),
      potentialCapabilities: strings(input, ["potential_exposure.potential_capabilities", "potential_exposure.capabilities", "exposure.capabilities"]),
      exposureFactors: strings(input, ["potential_exposure.factors", "exposure.factors"])
    };
  }
  function normalizeApproval(input) {
    return {
      id: textValue(input, ["id", "registration_id"], ""),
      agent_id: textValue(input, ["agent_id"], "") || void 0,
      workload_identity: textValue(input, ["workload_identity", "workload_id"], "") || void 0,
      name: textValue(input, ["name", "display_name"], "Unnamed workload"),
      display_name: textValue(input, ["display_name"], "") || void 0,
      agent_type: textValue(input, ["agent_type", "framework"], "unknown"),
      fingerprint: textValue(input, ["fingerprint"], "") || void 0,
      path_contains: textValue(input, ["path_contains", "evidence_path"], ""),
      owner: textValue(input, ["owner"], "unassigned"),
      environment: textValue(input, ["environment"], "") || void 0,
      framework: textValue(input, ["framework"], "") || void 0,
      approval_ref: textValue(input, ["approval_ref", "approval_reference"], "") || void 0,
      expires_on: textValue(input, ["expires_on", "expiry"], "") || void 0,
      state: textValue(input, ["state"], "") || void 0,
      status: textValue(input, ["status"], "") || void 0,
      policy_profile: textValue(input, ["policy_profile"], "") || void 0
    };
  }
  function applyTranslations() {
    document.documentElement.lang = state.locale;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (key) element.textContent = tr(key);
    });
    qs("#language-toggle").textContent = state.locale === "zh-CN" ? "EN" : "\u4E2D\u6587";
    updateViewHeading();
  }
  function updateViewHeading() {
    const heading = viewTitles[state.view];
    qs("#view-kicker").textContent = heading.kicker;
    qs("#view-title").textContent = tr(heading.key);
  }
  function validView(value) {
    return ["overview", "decisions", "investigations", "policies", "inventory", "demo"].includes(value);
  }
  function navigate(view, updateHash = true) {
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
    if (updateHash && location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
    document.documentElement.scrollTop = 0;
  }
  function showToast(message, error = false) {
    const toast = node("div", `toast${error ? " error" : ""}`, message);
    qs("#toast-region").append(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }
  async function checkHealth() {
    const indicator = qs("#system-state");
    indicator.className = "system-state checking";
    indicator.querySelector("b").textContent = tr("checking");
    try {
      await requestJSON("/api/health");
      indicator.className = "system-state";
      indicator.querySelector("b").textContent = tr("online");
    } catch {
      indicator.className = "system-state offline";
      indicator.querySelector("b").textContent = tr("offline");
    }
  }
  async function loadDecisions() {
    let payload;
    try {
      payload = await requestJSON("/api/decisions?limit=50");
    } catch (error) {
      if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
      payload = await requestJSON("/api/audits?limit=50");
    }
    state.decisions = extractArray(payload, ["decisions", "audits", "records", "items"]).map(normalizeDecision);
    if (!state.selectedDecision && state.decisions.length) state.selectedDecision = state.decisions[0].requestId;
  }
  function normalizeCoverage(payload) {
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
  async function loadSessionEvents() {
    const payload = await optionalJSON("/api/session-events?limit=40");
    const inputs = extractArray(payload, ["events", "items"]);
    state.sessionEvents = inputs.map((event, index) => normalizeRuntimeEvent(event, index, []));
  }
  function fallbackCoverage() {
    const adapterEvents = state.sessionEvents.filter((event) => ["instrumented_adapter", "observer_recorded"].includes(event.trust) || event.source === "instrumented_adapter");
    const selfReported = state.sessionEvents.filter((event) => event.trust === "agent_self_reported" || event.trust === "self_reported");
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
  async function loadCoverage() {
    const payload = await optionalJSON("/api/runtime-coverage");
    state.coverage = payload ? normalizeCoverage(payload) : [];
    if (!state.coverage.length) state.coverage = fallbackCoverage();
  }
  function legacyDiscoveryPayload(discoveryPayload, approvalsPayload) {
    const report = record(discoveryPayload);
    const approvalResponse = record(approvalsPayload);
    return {
      agents: extractArray(report, ["agents", "discoveries"]).map(normalizeDiscoveryAgent),
      approvals: extractArray(approvalResponse, ["approved_agents", "agents", "registrations"]).map(normalizeApproval),
      governedCount: 0,
      agentTypes: strings(approvalResponse, ["agent_types"]),
      scannedAt: textValue(report, ["scanned_at"], ""),
      rootCount: extractArray(report, ["roots", "scan_roots"]).length,
      gaps: extractArray(report, ["coverage_gaps", "gaps"]).map((gap) => ({ source: privacySafe(textValue(gap, ["source"], "scan")), reason: textValue(gap, ["reason"], tr("unknown")) })),
      truncated: first(report, ["summary.truncated", "truncated"]) === true
    };
  }
  function normalizeAgentsPayload(payload) {
    const container = record(payload);
    const discovery = Object.keys(record(container.discovery)).length ? record(container.discovery) : container;
    return {
      agents: extractArray(discovery, ["agents", "discoveries", "items"]).map(normalizeDiscoveryAgent),
      approvals: extractArray(container, ["asset_registry", "registered_agents", "approved_agents", "registrations", "registry"]).map(normalizeApproval),
      governedCount: extractArray(container, ["governed_identities"]).length,
      agentTypes: strings(container, ["agent_types"]),
      scannedAt: textValue(discovery, ["scanned_at"], ""),
      rootCount: extractArray(discovery, ["roots", "scan_roots"]).length,
      gaps: extractArray(discovery, ["coverage_gaps", "gaps"]).map((gap) => ({ source: privacySafe(textValue(gap, ["source"], "scan")), reason: textValue(gap, ["reason"], tr("unknown")) })),
      truncated: first(discovery, ["summary.truncated", "truncated"]) === true
    };
  }
  async function loadInventory() {
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
  async function loadScenarios() {
    const payload = await requestJSON("/api/scenarios");
    state.scenarios = extractArray(payload, ["scenarios", "items"]).map(normalizeScenario);
    if (!state.selectedScenario && state.scenarios.length) state.selectedScenario = state.scenarios[0].id;
  }
  async function refreshAll(notify = false) {
    const button = qs("#refresh-all");
    button.disabled = true;
    button.classList.add("loading");
    await checkHealth();
    const results = await Promise.allSettled([loadDecisions(), loadSessionEvents(), loadInventory(), loadScenarios()]);
    await loadCoverage();
    renderAll();
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length) showToast(`${tr("requestFailed")}: ${failures.length}`, true);
    else if (notify) showToast(tr("refreshed"));
    button.disabled = false;
    button.classList.remove("loading");
  }
  function empty(message) {
    return node("p", "empty-state", message);
  }
  function decisionButton(decision, index, compact = false) {
    const button = node("button", compact ? "stream-row" : `decision-index-row${state.selectedDecision === decision.requestId ? " active" : ""}`);
    button.type = "button";
    const badge = node("span", `route-badge ${slug(decision.route)}`, titleToken(decision.route));
    const action = node("span", "stream-action");
    action.append(node("strong", "", privacySafe(decision.action)), node("code", "", `${privacySafe(decision.agent)} \xB7 ${privacySafe(decision.capability)}`));
    if (compact) {
      button.append(badge, action, node("span", "stream-meta", `${privacySafe(decision.tool)} \u2192 ${privacySafe(decision.resource)}`), node("time", "stream-time", formatTime(decision.createdAt, true)));
    } else {
      const header = node("header");
      header.append(badge, node("time", "stream-time", formatTime(decision.createdAt, true)));
      button.append(header, node("strong", "", privacySafe(decision.action)), node("code", "", `${shortID(decision.requestId)} \xB7 ${privacySafe(decision.agent)} \xB7 ${privacySafe(decision.resource)}`));
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
  function renderOverview() {
    const counts = { allow: 0, restrict: 0, sandbox: 0, deny: 0, escalate: 0 };
    state.decisions.forEach((decision) => {
      if (decision.route in counts) counts[decision.route] += 1;
    });
    Object.entries(counts).forEach(([route, count]) => {
      qs(`#count-${route}`).textContent = String(count);
    });
    qs("#nav-decision-count").textContent = String(state.decisions.length);
    const stream = qs("#overview-decisions");
    stream.replaceChildren();
    if (!state.decisions.length) stream.append(empty(tr("noDecisions")));
    else state.decisions.slice(0, 5).forEach((decision, index) => stream.append(decisionButton(decision, index, true)));
    const alerts = state.decisions.filter((decision) => ["deny", "escalate"].includes(decision.route) || decision.violations.length || decision.events.some((event) => event.violation));
    qs("#alert-count").textContent = String(alerts.length);
    qs("#nav-violation-count").textContent = String(alerts.length);
    const alertList = qs("#overview-alerts");
    alertList.replaceChildren();
    if (!alerts.length) alertList.append(empty(tr("noAlerts")));
    else alerts.slice(0, 4).forEach((decision) => {
      const row = node("article", "alert-row");
      const label = decision.violations[0] || (decision.events.some((event) => event.violation) ? tr("violation") : titleToken(decision.route));
      row.append(node("strong", "", privacySafe(decision.action)), node("span", "", `${label} \xB7 ${privacySafe(decision.agent)} \xB7 ${shortID(decision.requestId)}`));
      alertList.append(row);
    });
    renderCoverage();
    const inventory = state.inventory;
    const shadow = inventory.agents.filter((agent) => agent.status === "shadow" && agent.deploymentState !== "available").length;
    const available = inventory.agents.filter((agent) => agent.deploymentState === "available").length;
    qs("#summary-registered").textContent = String(inventory.governedCount || inventory.approvals.length);
    qs("#summary-shadow").textContent = String(shadow);
    qs("#summary-evidence").textContent = String(available);
    qs("#nav-shadow-count").textContent = String(shadow);
  }
  function coverageName(source) {
    const normalized = slug(source.key);
    if (normalized.includes("gateway")) return tr("gatewayRequests");
    if (normalized.includes("tool") || normalized.includes("adapter")) return tr("toolEvents");
    if (normalized.includes("file")) return tr("filesystem");
    if (normalized.includes("network")) return tr("network");
    if (normalized.includes("syscall") || normalized === "os") return tr("osSyscalls");
    if (normalized.includes("sandbox") || normalized.includes("isolation")) return tr("isolation");
    return source.name;
  }
  function coverageStatus(value) {
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
  function coverageEvidence(source) {
    if (source.evidence) return privacySafe(source.evidence);
    const key = slug(source.key);
    const status = slug(source.status);
    if (key.includes("gateway") && status === "instrumented") return tr("derivedFromAudit");
    if (key.includes("tool")) return tr("noAdapterEvidence");
    if (key.includes("isolation") || key.includes("sandbox")) return tr("demoOnly");
    if (["not-instrumented", "not-connected", "not-reported", "unknown"].includes(status)) return tr("noSensor");
    return tr("unknown");
  }
  function renderCoverage() {
    const grid = qs("#coverage-grid");
    grid.replaceChildren();
    const sources = state.coverage.length ? state.coverage : fallbackCoverage();
    sources.forEach((source) => {
      const status = slug(source.status);
      const card = node("article", `coverage-source ${status}`);
      card.append(node("span", "", coverageName(source)), node("strong", "", coverageStatus(source.status)), node("small", "", coverageEvidence(source)));
      grid.append(card);
    });
  }
  function fact(label, value) {
    const row = node("div");
    row.append(node("dt", "", label), node("dd", "", privacySafe(value || "\u2014")));
    return row;
  }
  function detailCard(title, facts) {
    const card = node("section", "detail-card");
    card.append(node("h4", "", title));
    const dl = node("dl", "fact-list");
    facts.forEach(([label, value]) => dl.append(fact(label, value)));
    card.append(dl);
    return card;
  }
  function railNode(code, label, detail, status) {
    const item = node("div", `investigation-node ${status}`);
    item.append(node("b", "", code), node("span", "", label), node("small", "", detail));
    return item;
  }
  function renderInvestigationRail(decision) {
    const rail = node("div", "investigation-rail");
    const identityFailed = decision.matchedRules.some((rule) => /identity|unknown.agent/i.test(rule)) && decision.route === "deny";
    const policyState = decision.policyRoute === "deny" ? "fail" : decision.policyRoute === "escalate" ? "warn" : "";
    const riskState = decision.riskLevel === "high" || decision.riskLevel === "critical" ? "warn" : "";
    const dispatchState = ["sandbox", "restrict", "escalate"].includes(decision.route) ? "warn" : decision.route === "deny" ? "fail" : "";
    const observationState = decision.violations.length || decision.events.some((event) => event.violation) ? "fail" : !decision.events.length ? "warn" : "";
    rail.append(
      railNode("I", tr("identity"), decision.agent, identityFailed ? "fail" : ""),
      railNode("P", tr("policy"), titleToken(decision.policyRoute), policyState),
      railNode("R", tr("risk"), decision.riskScore === null ? tr("unknown") : String(decision.riskScore), riskState),
      railNode("D", tr("dispatch"), decision.executor, dispatchState),
      railNode("O", tr("observation"), decision.events.length ? String(decision.events.length) : tr("unknown"), observationState),
      railNode("A", tr("audit"), titleToken(decision.finalVerdict), "")
    );
    return rail;
  }
  function renderPolicyRisk(decision) {
    const grid = node("div", "policy-risk-grid");
    const policy = node("section", `policy-result${decision.policyRoute === "deny" ? " denied" : ""}`);
    const policyHead = node("div", "result-heading");
    policyHead.append(node("span", "", tr("policyDecision")), node("strong", "", titleToken(decision.policyRoute)));
    const policyReasons = node("ul", "reason-list");
    const reasons = [...decision.policyReasons, ...decision.matchedRules.map((rule) => `${tr("matchedRules")}: ${rule}`)];
    (reasons.length ? reasons : [tr("unknown")]).forEach((reason) => policyReasons.append(node("li", "", privacySafe(reason))));
    policy.append(policyHead, policyReasons);
    const risk = node("section", `risk-result ${slug(decision.riskLevel)}`);
    const riskHead = node("div", "result-heading");
    riskHead.append(node("span", "", tr("riskAssessment")), node("strong", "", `${titleToken(decision.riskLevel)}${decision.riskScore === null ? "" : ` \xB7 ${decision.riskScore}/100`}`));
    const signals = node("ul", "reason-list");
    (decision.riskSignals.length ? decision.riskSignals : [tr("unknown")]).forEach((signal) => signals.append(node("li", "", privacySafe(signal))));
    risk.append(riskHead, signals);
    grid.append(policy, risk);
    return grid;
  }
  function renderEnvelope(decision) {
    if (!decision.envelope) {
      const unavailable = node("div", "envelope-unavailable");
      unavailable.append(node("strong", "", tr("permitNotIssued")), node("span", "", decision.route === "deny" ? tr("deniedBeforeExecution") : tr("legacyEnvelopeMissing")));
      return unavailable;
    }
    const envelope = decision.envelope;
    const wrapper = node("section", "authorization-envelope");
    const head = node("div", "envelope-head");
    const title = node("div");
    title.append(node("p", "eyebrow", "SIGNED ROUTE CLEARANCE"), node("h4", "", tr("envelopeTitle")));
    head.append(title, node("code", "", shortID(envelope.permitId)));
    const grid = node("div", "envelope-grid");
    const fields = [
      [tr("principal"), envelope.principal],
      [tr("agentIdentity"), envelope.agent],
      [tr("capability"), envelope.capability],
      [tr("tool"), envelope.tool],
      [tr("resource"), envelope.resource],
      [tr("allowedOperations"), envelope.operations.join(", ") || "\u2014"],
      [tr("issuedAt"), formatTime(envelope.issuedAt)],
      [tr("expiresAt"), formatTime(envelope.expiresAt)]
    ];
    fields.forEach(([label, value]) => {
      const item = node("div", "envelope-field");
      item.append(node("span", "", label), node("strong", "", privacySafe(value)));
      grid.append(item);
    });
    wrapper.append(head, grid);
    const constraints = node("div", "constraint-strip");
    const entries = Object.entries(envelope.constraints);
    if (!entries.length) constraints.append(node("span", "", `${tr("constraints")}: ${tr("unknown")}`));
    else entries.forEach(([key, value]) => constraints.append(node("span", "", `${key}: ${privacySafe(value)}`)));
    wrapper.append(constraints);
    return wrapper;
  }
  function eventTrustLabel(event) {
    const combined = `${event.source}_${event.trust}`.toLowerCase();
    if (combined.includes("simulated") || combined.includes("demo")) return tr("simulatedDemo");
    if (combined.includes("self_report")) return tr("selfReported");
    if (combined.includes("adapter") || combined.includes("observer_recorded")) return tr("adapterReported");
    if (combined.includes("gateway")) return "GATEWAY ENFORCED";
    if (combined.includes("os_sensor")) return "OS SENSOR";
    if (combined.includes("network_sensor")) return "NETWORK SENSOR";
    return tr("unknown");
  }
  function renderRuntimeEvents(decision) {
    const section = node("section", "runtime-section");
    section.append(node("h4", "", tr("runtimeEvents")));
    if (!decision.events.length) {
      section.append(empty(tr("noExecutionEvidence")));
      return section;
    }
    decision.events.forEach((event) => {
      const row = node("article", `runtime-event${event.violation ? " violation" : ""}`);
      row.append(node("code", "", shortID(event.id)), node("strong", "", `${privacySafe(event.operation)} \xB7 ${privacySafe(event.tool)} \u2192 ${privacySafe(event.resource)}`), node("span", `trust-badge ${slug(`${event.source}-${event.trust}`)}`, `${event.violation ? `${tr("violation")} \xB7 ` : ""}${eventTrustLabel(event)}`));
      section.append(row);
    });
    return section;
  }
  function renderDecisionDetail(decision) {
    const container = qs("#decision-detail");
    container.replaceChildren();
    if (!decision) {
      const placeholder = node("div", "detail-empty");
      placeholder.append(node("b", "", "I\u2192A"), node("p", "", tr("noDecisions")));
      container.append(placeholder);
      return;
    }
    const hero = node("header", "detail-hero");
    const heroCopy = node("div");
    heroCopy.append(node("p", "eyebrow", `${tr("requestedAction")} \xB7 ${formatTime(decision.createdAt)}`), node("h3", "", privacySafe(decision.action)), node("code", "", shortID(decision.requestId)));
    const hasViolation = decision.violations.length > 0 || decision.events.some((event) => event.violation);
    hero.append(heroCopy, node("div", `verdict-stamp ${hasViolation ? "violation" : slug(decision.route)}`, titleToken(decision.finalVerdict)));
    const details = node("div", "detail-grid");
    details.append(
      detailCard(tr("identity"), [[tr("principal"), decision.principal], [tr("principalType"), decision.principalType], [tr("agentIdentity"), decision.agent], [tr("workload"), decision.workload]]),
      detailCard(tr("delegatedAuthority"), [[tr("issuer"), decision.delegatedIssuer], [tr("delegatedSubject"), decision.delegatedSubject], [tr("scopes"), decision.scopes.join(", ") || "\u2014"], [tr("credential"), decision.credentialFingerprint]]),
      detailCard(tr("actionRequest"), [[tr("capability"), decision.capability], [tr("tool"), decision.tool], [tr("resource"), decision.resource], [tr("operation"), decision.operation], [tr("sideEffect"), decision.sideEffect]]),
      detailCard(tr("dispatchDecision"), [[tr("selectedExecutor"), decision.executor], [tr("finalVerdict"), titleToken(decision.finalVerdict)], [tr("duration"), decision.durationMs === null ? "\u2014" : `${decision.durationMs} ms`], [tr("isolationBackend"), titleToken(decision.isolationStatus)]])
    );
    container.append(hero, renderInvestigationRail(decision), details, renderPolicyRisk(decision), renderEnvelope(decision));
    if (["sandbox", "restrict"].includes(decision.route) && slug(decision.isolationStatus) !== "connected") {
      container.append(node("p", "isolation-warning", `${tr("isolationBackend")}: ${tr("notConnectedDemo")}`));
    }
    container.append(renderRuntimeEvents(decision));
  }
  function visibleDecisions() {
    if (state.decisionFilter === "blocked") return state.decisions.filter((decision) => ["deny", "escalate"].includes(decision.route) || decision.events.some((event) => event.violation));
    if (state.decisionFilter === "permitted") return state.decisions.filter((decision) => ["allow", "restrict", "sandbox"].includes(decision.route));
    return state.decisions;
  }
  function renderDecisionViews() {
    const container = qs("#decision-list");
    container.replaceChildren();
    const decisions = visibleDecisions();
    if (!decisions.length) container.append(empty(tr("noDecisions")));
    else decisions.forEach((decision, index) => container.append(decisionButton(decision, index)));
    renderDecisionDetail(state.decisions.find((decision) => decision.requestId === state.selectedDecision) || decisions[0]);
  }
  function renderInvestigations() {
    const listContainer = qs("#investigation-list");
    listContainer.replaceChildren();
    const relevant = state.decisions.filter((decision) => ["deny", "escalate"].includes(decision.route) || decision.violations.length || decision.events.some((event) => event.violation));
    if (!relevant.length) listContainer.append(empty(tr("noAlerts")));
    relevant.forEach((decision) => {
      const row = node("article", "investigation-row");
      const route = node("span", `route-badge ${slug(decision.route)}`, decision.events.some((event) => event.violation) ? "VIOLATION" : titleToken(decision.route));
      const description = node("div");
      description.append(node("strong", "", privacySafe(decision.action)), node("code", "", `${privacySafe(decision.agent)} \xB7 ${shortID(decision.requestId)} \xB7 ${formatTime(decision.createdAt)}`));
      const inspect = node("button", "", tr("inspectDecision"));
      inspect.type = "button";
      inspect.addEventListener("click", () => {
        state.selectedDecision = decision.requestId;
        navigate("decisions");
        renderDecisionViews();
      });
      row.append(route, description, inspect);
      listContainer.append(row);
    });
    const evidenceContainer = qs("#runtime-event-list");
    evidenceContainer.replaceChildren();
    const decisionEvents = state.decisions.flatMap((decision) => decision.events.map((event) => ({ event, requestId: decision.requestId })));
    const looseEvents = state.sessionEvents.map((event) => ({ event, requestId: "session evidence" }));
    const combined = [...decisionEvents, ...looseEvents].slice(0, 50);
    if (!combined.length) evidenceContainer.append(empty(tr("noRuntimeEvidence")));
    combined.forEach(({ event, requestId }) => {
      const item = node("article", "evidence-item");
      const header = node("header");
      header.append(node("strong", "", privacySafe(event.operation)), node("span", `trust-badge ${slug(`${event.source}-${event.trust}`)}`, eventTrustLabel(event)));
      item.append(header, node("code", "", `${shortID(requestId)} \xB7 ${privacySafe(event.tool)} \u2192 ${privacySafe(event.resource)} \xB7 ${formatTime(event.timestamp)}`));
      evidenceContainer.append(item);
    });
  }
  function renderPolicies() {
    const container = qs("#policy-rule-list");
    container.replaceChildren();
    const counts = /* @__PURE__ */ new Map();
    state.decisions.forEach((decision) => decision.matchedRules.forEach((rule) => counts.set(rule, (counts.get(rule) || 0) + 1)));
    if (!counts.size) {
      container.append(empty(tr("noRules")));
      return;
    }
    [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([rule, count]) => {
      const item = node("div", "policy-rule");
      item.append(node("code", "", privacySafe(rule)), node("span", "", String(count)));
      container.append(item);
    });
  }
  function statusLabel(value) {
    const normalized = slug(value);
    if (["approved", "registered", "active"].includes(normalized)) return tr("approved");
    if (normalized === "shadow") return "SHADOW";
    if (normalized === "unassessed") return tr("unassessed");
    return titleToken(value);
  }
  function deploymentLabel(value) {
    const normalized = slug(value);
    return tr({ available: "available", installed: "installed", configured: "configured", observed: "observed" }[normalized] || "unknown");
  }
  function registrationPath(agent) {
    const raw = agent.evidence[0]?.source || agent.evidence[0]?.indicator || "";
    const normalized = raw.replaceAll("\\", "/");
    return normalized.replace(/^.*?\/Users\/[^/]+\//i, "").replace(/^[A-Za-z]:\//, "").slice(0, 160);
  }
  function prepareRegistration(agent) {
    resetApprovalForm();
    const details = qs(".registry-editor");
    details.open = true;
    qs("#approval-name").value = agent.name;
    const type = qs("#approval-type");
    if ([...type.options].some((option) => option.value === agent.agentType)) type.value = agent.agentType;
    qs("#approval-path").value = registrationPath(agent);
    qs("#approval-fingerprint").value = agent.fingerprint === "\u2014" ? "" : agent.fingerprint;
    qs("#approval-owner").focus();
    details.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function inventoryCard(agent, compact = false) {
    const entry = node("article", `inventory-entry ${slug(agent.status)}`);
    const identity = node("div");
    const badges = node("div", "inventory-badges");
    badges.append(node("span", "", statusLabel(agent.status)), node("span", "", deploymentLabel(agent.deploymentState)));
    identity.append(badges, node("h4", "", agent.name), node("code", "", `${agent.agentType} \xB7 ${fingerprintSafe(agent.fingerprint)}`));
    const confidence = node("div", "discovery-confidence");
    confidence.append(node("span", "", tr("discoveryConfidence")), node("strong", "", agent.confidence === null ? tr("unknown") : `${Math.round(agent.confidence * (agent.confidence <= 1 ? 100 : 1))}%`));
    const exposure = node("div", "exposure-copy");
    const capabilities = agent.potentialCapabilities.length ? ` \xB7 ${agent.potentialCapabilities.join(", ")}` : "";
    exposure.textContent = `${tr("potentialExposure")}: ${titleToken(agent.exposure)}${capabilities}`;
    entry.append(identity, confidence, exposure);
    if (!compact && agent.status === "shadow") {
      const button = node("button", "text-button", tr("prepareRegistration"));
      button.type = "button";
      button.addEventListener("click", () => prepareRegistration(agent));
      entry.append(button);
    }
    return entry;
  }
  function renderApprovals() {
    const container = qs("#approval-list");
    container.replaceChildren();
    if (!state.inventory.approvals.length) {
      container.append(empty(tr("noRegistrations")));
      return;
    }
    state.inventory.approvals.forEach((approval) => {
      const currentState = approval.status || approval.state || "active";
      const card = node("article", `approval-entry ${slug(currentState)}`);
      const header = node("header");
      header.append(node("strong", "", approval.display_name || approval.name), node("span", "", titleToken(currentState)));
      const identity = approval.agent_id || approval.workload_identity || approval.agent_type;
      card.append(
        header,
        node("code", "", `${privacySafe(identity)} \xB7 ${privacySafe(approval.path_contains || "evidence reference unavailable")}`),
        node("small", "", `${approval.owner}${approval.environment ? ` \xB7 ${approval.environment}` : ""}${approval.policy_profile ? ` \xB7 policy: ${approval.policy_profile}` : ""}`)
      );
      const actions = node("div", "approval-actions");
      const edit = node("button", "text-button", tr("edit"));
      edit.type = "button";
      edit.addEventListener("click", () => editApproval(approval));
      const remove = node("button", "danger-button", tr("remove"));
      remove.type = "button";
      remove.addEventListener("click", () => void deleteApproval(approval));
      actions.append(edit, remove);
      card.append(actions);
      container.append(card);
    });
  }
  function renderAgentTypes() {
    const select = qs("#approval-type");
    const current = select.value;
    select.replaceChildren();
    const types = state.inventory.agentTypes.length ? state.inventory.agentTypes : [...new Set(state.inventory.agents.map((agent) => agent.agentType).filter((type) => type !== "unknown"))];
    (types.length ? types : ["agent"]).forEach((type) => {
      const option = node("option", "", type);
      option.value = type;
      select.append(option);
    });
    if (types.includes(current)) select.value = current;
  }
  function renderInventory() {
    const { agents, approvals, gaps, scannedAt, truncated } = state.inventory;
    const primary = agents.filter((agent) => agent.deploymentState !== "available");
    const available = agents.filter((agent) => agent.deploymentState === "available");
    const shadow = primary.filter((agent) => agent.status === "shadow").length;
    qs("#inventory-approved").textContent = String(approvals.length);
    qs("#inventory-shadow").textContent = String(shadow);
    qs("#inventory-available").textContent = String(available.length);
    qs("#inventory-coverage").textContent = gaps.length || truncated ? tr("unknown") : state.inventory.rootCount ? tr("instrumented") : tr("unknown");
    qs("#available-count").textContent = String(available.length);
    qs("#scanned-at").textContent = scannedAt ? formatTime(scannedAt) : tr("unknown");
    const warning = qs("#inventory-warning");
    warning.hidden = !gaps.length && !truncated;
    warning.textContent = gaps.length || truncated ? `${tr("scanIncomplete")}${gaps.length ? ` (${gaps.length})` : ""}` : "";
    const primaryList = qs("#inventory-primary-list");
    primaryList.replaceChildren();
    if (!primary.length) primaryList.append(empty(tr("noInventory")));
    else primary.forEach((agent) => primaryList.append(inventoryCard(agent)));
    const evidenceList = qs("#inventory-evidence-list");
    evidenceList.replaceChildren();
    if (!available.length) evidenceList.append(empty(tr("noAvailableEvidence")));
    else available.forEach((agent) => evidenceList.append(inventoryCard(agent, true)));
    renderAgentTypes();
    renderApprovals();
  }
  function editApproval(approval) {
    const details = qs(".registry-editor");
    details.open = true;
    qs("#approval-id").value = approval.id;
    qs("#approval-name").value = approval.display_name || approval.name;
    const type = qs("#approval-type");
    if ([...type.options].some((option) => option.value === approval.agent_type)) type.value = approval.agent_type;
    qs("#approval-path").value = approval.path_contains;
    qs("#approval-fingerprint").value = approval.fingerprint || "";
    qs("#approval-owner").value = approval.owner;
    qs("#approval-environment").value = approval.environment || "";
    qs("#approval-ref").value = approval.approval_ref || "";
    qs("#approval-expiry").value = approval.expires_on || "";
    qs("#approval-state").value = approval.state || approval.status || "active";
    qs("#approval-policy-profile").value = approval.policy_profile || "";
    qs("#approval-name").focus();
  }
  function resetApprovalForm() {
    qs("#approval-form").reset();
    qs("#approval-id").value = "";
    qs("#approval-state").value = "active";
    const feedback = qs("#approval-feedback");
    feedback.textContent = "";
    feedback.classList.remove("error");
  }
  async function saveApproval(event) {
    event.preventDefault();
    const form = qs("#approval-form");
    const feedback = qs("#approval-feedback");
    const payload = Object.fromEntries(new FormData(form).entries());
    if (!state.modernAgentsAPI) {
      delete payload.environment;
      delete payload.policy_profile;
    }
    try {
      const response = await requestJSON("/api/approved-agents", { method: "POST", headers: { "Content-Type": "application/json", "X-Agent-Governance-Admin": "local-ui" }, body: JSON.stringify(payload) });
      const discovery = first(response, ["discovery"]);
      if (discovery) state.inventory = legacyDiscoveryPayload(discovery, { approved_agents: [...state.inventory.approvals] });
      await loadInventory();
      renderInventory();
      renderOverview();
      resetApprovalForm();
      feedback.textContent = tr("registrationSaved");
      showToast(tr("registrationSaved"));
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : tr("requestFailed");
      feedback.classList.add("error");
    }
  }
  async function deleteApproval(approval) {
    if (!window.confirm(tr("confirmRemove"))) return;
    const feedback = qs("#approval-feedback");
    try {
      await requestJSON(`/api/approved-agents/${encodeURIComponent(approval.id)}`, { method: "DELETE", headers: { "X-Agent-Governance-Admin": "local-ui" } });
      await loadInventory();
      renderInventory();
      renderOverview();
      feedback.textContent = tr("registrationRemoved");
      showToast(tr("registrationRemoved"));
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : tr("requestFailed");
      feedback.classList.add("error");
    }
  }
  async function rescanDiscoveries() {
    const button = qs("#rescan-discoveries");
    button.disabled = true;
    try {
      await requestJSON("/api/discoveries/rescan", { method: "POST", headers: { "X-Agent-Governance-Admin": "local-ui" } });
      await loadInventory();
      renderInventory();
      renderOverview();
      showToast(tr("scanComplete"));
    } catch (error) {
      showToast(error instanceof Error ? error.message : tr("requestFailed"), true);
    } finally {
      button.disabled = false;
    }
  }
  var localizedScenarios = {
    "safe-code": { zh: ["\u5B89\u5168\u4EE3\u7801\u8BF7\u6C42", "\u5408\u6CD5\u8EAB\u4EFD\u3001\u59D4\u6258\u8303\u56F4\u3001\u5DE5\u5177\u4E0E\u8D44\u6E90\uFF1B\u7B7E\u53D1\u8BB8\u53EF\u5E76\u4FDD\u6301\u5728\u4FE1\u5C01\u5185\u3002"], en: ["Safe code request", "Valid identity, delegation, tool, and resource; issue a permit and stay inside it."] },
    "scope-violation": { zh: ["\u672A\u6388\u6743\u8D22\u52A1\u8BBF\u95EE", "\u4EE3\u7801 Agent \u4F7F\u7528 code \u8303\u56F4\u8BF7\u6C42 finance.read\uFF1B\u6267\u884C\u524D\u62D2\u7EDD\u3002"], en: ["Unauthorized finance access", "A coder Agent uses code scope for finance.read and is denied before execution."] },
    "authorization-boundary-violation": { zh: ["\u6388\u6743\u8FB9\u754C\u8D8A\u754C", "\u4EC5\u83B7\u51C6 config.read\uFF0C\u968F\u540E\u6F14\u793A secret.read\uFF1B\u89E6\u53D1\u8D8A\u754C\u7ED3\u8BBA\u3002"], en: ["Authorization-boundary violation", "Only config.read is permitted, then demo secret.read triggers a boundary violation."] },
    "indirect-prompt-injection": { zh: ["\u95F4\u63A5\u63D0\u793A\u6CE8\u5165", "\u6765\u81EA\u68C0\u7D22\u5185\u5BB9\u7684\u98CE\u9669\u4FE1\u53F7\u5F71\u54CD\u98CE\u9669\u4E0E\u5206\u6D3E\u3002"], en: ["Indirect prompt injection", "Risk signals from retrieved content affect risk and dispatch."] },
    "sensitive-file-read": { zh: ["\u53D7\u4FDD\u62A4\u6587\u4EF6\u8BFB\u53D6", "\u53EA\u4F7F\u7528\u8D44\u6E90\u7C7B\u522B\u4E0E\u8BBF\u95EE\u5143\u6570\u636E\uFF0C\u4E0D\u5C55\u793A\u8DEF\u5F84\u6216\u5185\u5BB9\u3002"], en: ["Protected file read", "Use resource class and access metadata without revealing paths or contents."] },
    "cross-tool-egress": { zh: ["\u654F\u611F\u8BFB\u53D6\u540E\u5916\u4F20", "\u56E0\u679C\u94FE\u5173\u8054\u654F\u611F\u8BFB\u53D6\u4E0E\u540E\u7EED\u5916\u90E8\u51FA\u53E3\u3002"], en: ["Sensitive read followed by egress", "A causal chain links a sensitive read to subsequent external egress."] }
  };
  function scenarioCopy(scenario) {
    const direct = localizedScenarios[scenario.id];
    if (direct) return state.locale === "zh-CN" ? direct.zh : direct.en;
    const normalized = scenario.id.toLowerCase();
    const match = Object.entries(localizedScenarios).find(([key]) => normalized.includes(key) || key.includes(normalized));
    if (match) return state.locale === "zh-CN" ? match[1].zh : match[1].en;
    return [scenario.title, scenario.description];
  }
  function selectScenario(scenario) {
    state.selectedScenario = scenario.id;
    document.querySelectorAll(".scenario-card").forEach((card) => card.classList.toggle("active", card.dataset.scenario === scenario.id));
    const [title] = scenarioCopy(scenario);
    qs("#scenario-selection").textContent = title;
    qs("#scenario-expected").textContent = `${tr("expected")}: ${titleToken(scenario.expectedRoute)}`;
    qs("#request-json").value = JSON.stringify(scenario.request, null, 2);
    qs("#demo-error").textContent = "";
  }
  function renderScenarios() {
    const container = qs("#scenario-list");
    container.replaceChildren();
    if (!state.scenarios.length) {
      container.append(empty(tr("noDecisions")));
      return;
    }
    state.scenarios.forEach((scenario) => {
      const [title, description] = scenarioCopy(scenario);
      const button = node("button", `scenario-card${state.selectedScenario === scenario.id ? " active" : ""}`);
      button.type = "button";
      button.dataset.scenario = scenario.id;
      button.append(node("strong", "", title), node("span", "", description), node("em", "", `${tr("expected")} \xB7 ${titleToken(scenario.expectedRoute)}`));
      button.addEventListener("click", () => selectScenario(scenario));
      container.append(button);
    });
    const selected = state.scenarios.find((scenario) => scenario.id === state.selectedScenario) || state.scenarios[0];
    if (selected) {
      const [title] = scenarioCopy(selected);
      qs("#scenario-selection").textContent = title;
      qs("#scenario-expected").textContent = `${tr("expected")}: ${titleToken(selected.expectedRoute)}`;
      if (!qs("#request-json").value) qs("#request-json").value = JSON.stringify(selected.request, null, 2);
    }
  }
  function freshenRequest(input) {
    const request = structuredClone(input);
    delete request.simulated_actions;
    const suffix = crypto.randomUUID().slice(0, 8);
    for (const key of ["request_id", "session_id", "parent_event_id"]) {
      const value = request[key];
      if (typeof value === "string" && value.startsWith("demo-")) request[key] = `${value}-${suffix}`;
    }
    const sources = list(request.input_sources);
    if (sources.length) request.input_sources = sources.map((source) => {
      const copySource = { ...record(source) };
      const eventID = copySource.event_id;
      if (typeof eventID === "string" && eventID.startsWith("demo-")) copySource.event_id = `${eventID}-${suffix}`;
      return copySource;
    });
    return request;
  }
  async function postAuthorization(request) {
    const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) };
    try {
      return await requestJSON("/api/authorize", options);
    } catch (error) {
      if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
      return requestJSON("/api/route", options);
    }
  }
  async function runDemo() {
    const button = qs("#authorize-button");
    const errorBox = qs("#demo-error");
    const selected = state.scenarios.find((scenario) => scenario.id === state.selectedScenario);
    if (!selected) {
      errorBox.textContent = tr("chooseScenario");
      return;
    }
    let request;
    try {
      request = freshenRequest(record(JSON.parse(qs("#request-json").value)));
    } catch (error) {
      errorBox.textContent = error instanceof Error ? `JSON: ${error.message}` : "Invalid JSON";
      return;
    }
    button.disabled = true;
    button.querySelector("span").textContent = tr("authorizing");
    errorBox.textContent = "";
    let serverDemo = true;
    try {
      let payload;
      try {
        payload = await requestJSON(`/api/demo-lab/${encodeURIComponent(selected.id)}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      } catch (error) {
        if (!(error instanceof HTTPError) || ![404, 405].includes(error.status)) throw error;
        serverDemo = false;
        payload = await postAuthorization(request);
      }
      const decision = normalizeDecision(payload);
      if (!serverDemo) decision.events = decision.events.filter((event) => event.source !== "simulated_demo");
      state.decisions = [decision, ...state.decisions.filter((existing) => existing.requestId !== decision.requestId)];
      state.selectedDecision = decision.requestId;
      renderAll();
      renderDemoResult(decision, serverDemo);
    } catch (error) {
      errorBox.textContent = error instanceof Error ? error.message : tr("requestFailed");
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = tr("authorizeAction");
    }
  }
  function renderDemoResult(decision, serverDemo = false) {
    const container = qs("#demo-result");
    container.replaceChildren();
    if (!decision) {
      const placeholder = node("div", "demo-placeholder");
      placeholder.append(node("b", "", "D\u2192A"), node("p", "", tr("chooseScenario")));
      container.append(placeholder);
      return;
    }
    const head = node("header", "demo-result-head");
    head.append(node("span", "", serverDemo ? tr("demoEvidence") : tr("policyDecision")), node("strong", "", titleToken(decision.finalVerdict)));
    const body = node("div", "demo-result-body");
    const facts = [[tr("policyDecision"), titleToken(decision.policyRoute)], [tr("dispatchDecision"), titleToken(decision.route)], [tr("riskAssessment"), `${titleToken(decision.riskLevel)}${decision.riskScore === null ? "" : ` \xB7 ${decision.riskScore}/100`}`], [tr("permitId"), decision.envelope ? shortID(decision.envelope.permitId) : tr("permitNotIssued")], [tr("runtimeEvents"), serverDemo ? String(decision.events.length) : tr("unknown")]];
    facts.forEach(([label, value]) => {
      const row = node("div", "demo-result-fact");
      row.append(node("span", "", label), node("strong", "", value));
      body.append(row);
    });
    const truth = node("p", "demo-truth-note", serverDemo ? tr("truthfulDemo") : tr("noExecutionEvidence"));
    const inspect = node("button", "primary-button", tr("inspectDecision"));
    inspect.type = "button";
    inspect.addEventListener("click", () => {
      navigate("decisions");
      renderDecisionViews();
    });
    container.append(head, body, truth, inspect);
  }
  function renderAll() {
    renderOverview();
    renderDecisionViews();
    renderInvestigations();
    renderPolicies();
    renderInventory();
    renderScenarios();
    if (!qs("#demo-result").hasChildNodes()) renderDemoResult();
  }
  function bindEvents() {
    document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => {
      const target = button.dataset.nav || "overview";
      if (validView(target)) navigate(target);
    }));
    document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => {
      const target = button.dataset.go || "overview";
      if (validView(target)) navigate(target);
    }));
    document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
      state.decisionFilter = button.dataset.filter || "all";
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      renderDecisionViews();
    }));
    qs("#language-toggle").addEventListener("click", () => {
      state.locale = state.locale === "zh-CN" ? "en" : "zh-CN";
      localStorage.setItem("aegis-locale", state.locale);
      applyTranslations();
      renderAll();
    });
    qs("#refresh-all").addEventListener("click", () => void refreshAll(true));
    qs("#rescan-discoveries").addEventListener("click", () => void rescanDiscoveries());
    qs("#authorize-button").addEventListener("click", () => void runDemo());
    qs("#approval-form").addEventListener("submit", (event) => void saveApproval(event));
    qs("#cancel-approval").addEventListener("click", resetApprovalForm);
    window.addEventListener("hashchange", () => {
      const target = location.hash.slice(1);
      if (validView(target)) navigate(target, false);
    });
  }
  bindEvents();
  applyTranslations();
  var initialView = location.hash.slice(1);
  navigate(validView(initialView) ? initialView : "overview", false);
  renderDemoResult();
  void refreshAll();
})();
