🔍 PHASE 1: STRATEGIC FOUNDATION
Before writing a single line of code/design/spec:

    Define the business objective and measurable success criteria (KPIs)
    Map primary and edge-case user journeys with pain points addressed
    Identify compliance requirements (GDPR, HIPAA, SOC 2, WCAG 2.1 AA+, etc.)
    Specify performance SLAs: load time, throughput, error rate thresholds
    Document integration contracts with upstream/downstream systems
    Outline failure modes and graceful degradation strategy

🧱 PHASE 2: ARCHITECTURAL EXCELLENCE
Deliver a design that embodies:

    Separation of concerns: clear boundaries between presentation, logic, state, and side effects
    Single responsibility principle: each unit does one thing exceptionally well
    Extensibility: new features can be added without modifying core logic
    Resilience: handles network failures, invalid inputs, and third-party outages gracefully
    Observability: built-in instrumentation for metrics, logs, and traces
    Security-by-design: input validation, least-privilege access, secrets management, audit trails
    Internationalization-ready: text externalized, layout direction-agnostic, locale-aware formatting

⚙️ PHASE 3: IMPLEMENTATION STANDARDS
All deliverables must include:

    Defensive programming: validate all inputs, assume dependencies will fail
    Zero silent failures: every error is logged, contextualized, and recoverable where possible
    Performance-conscious design: minimize blocking operations, optimize critical path
    Accessibility-first: semantic structure, keyboard navigability, screen reader compatibility
    Cross-environment robustness: works consistently across target devices/browsers/platforms
    No technical debt: no TODOs, FIXMEs, or temporary hacks in production-ready output
    Self-documenting structure: naming conveys intent; complexity is encapsulated

✅ PHASE 4: VALIDATION RIGOR
Provide comprehensive validation artifacts:

    Test coverage: 90%+ unit test coverage on business logic; 100% on critical paths
    Integration validation: all external contracts verified with realistic mocks/stubs
    Security audit: OWASP Top 10 risks mitigated; no hardcoded secrets or unsafe patterns
    Performance benchmarking: meets SLAs under simulated peak load
    Accessibility audit: passes automated tools + manual keyboard/screen reader verification
    Cross-environment matrix: validated on all target platforms with discrepancies documented
    User acceptance scenarios: real-world workflows tested end-to-end

📚 PHASE 5: PRODUCTION READINESS
Deliver complete operational package:

    Technical documentation: architecture decisions, data flows, configuration options
    Operational runbook: deployment steps, rollback procedure, health checks, scaling guidance
    Monitoring blueprint: key metrics to track, alert thresholds, anomaly detection rules
    Maintenance guide: common failure modes, debugging steps, upgrade path
    Compliance evidence: audit trails, data handling procedures, consent mechanisms

🚀 PHASE 6: FUTURE-PROOFING
Ensure longevity through:

    Versioning strategy: backward-compatible evolution path defined
    Deprecation policy: clear sunset timeline for any legacy dependencies
    Scalability envelope: documented limits and horizontal scaling triggers
    Ownership model: clear team accountability and escalation paths

📌 FINAL DELIVERABLE REQUIREMENTS
Your output must be:
✅ Production-ready (no placeholders, stubs, or "to be implemented" gaps)
✅ Self-contained with explicit dependencies called out
✅ Accompanied by validation evidence for all quality gates above
✅ Structured for immediate handoff to engineering/QA teams  
Begin execution only after confirming understanding of all phases above. Present Phase 1 analysis first for alignment before proceeding.
