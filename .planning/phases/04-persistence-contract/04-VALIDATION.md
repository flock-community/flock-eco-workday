---
phase: 4
slug: persistence-contract
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + kotlin-test-junit5 |
| **Config file** | Maven surefire plugin in pom.xml |
| **Quick run command** | `./mvnw test -pl workday-application -Dtest=BudgetAllocation*Test -Pdevelop` |
| **Full suite command** | `./mvnw test -pl workday-application -Pdevelop` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `./mvnw test -pl workday-application -Dtest=BudgetAllocation*Test -Pdevelop`
- **After every plan wave:** Run `./mvnw test -pl workday-application -Pdevelop`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DOM-03 | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationSchemaTest -Pdevelop` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DOM-03 | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationPersistenceTest -Pdevelop` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | DOM-04 | integration | `./mvnw test -pl workday-application -Dtest=ContractInternalPersistenceTest -Pdevelop` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | DOM-03 | manual | `./mvnw liquibase:update -pl workday-application -Pdevelop` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationSchemaTest.kt` — validates JOINED inheritance schema, element collection tables (covers DOM-03 schema validation)
- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceTest.kt` — tests save/retrieve with lazy collections, polymorphic queries (covers DOM-03 repository behavior)
- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt` — tests studyHours/studyMoney persistence (covers DOM-04)
- [ ] Spring Boot test configuration if not exists — `@DataJpaTest` with H2 database

*Existing infrastructure covers framework and config — only test stubs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Liquibase migrations run without FK failures | DOM-03 | Migration ordering is a deploy-time concern, not unit-testable | Run `./mvnw liquibase:update -pl workday-application -Pdevelop` and verify no errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
