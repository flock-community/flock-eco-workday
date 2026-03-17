---
phase: 4
slug: persistence-contract
status: draft
nyquist_compliant: true
wave_0_complete: true
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
| 04-01-01 | 01 | 1 | DOM-03 | compile | `./mvnw compile -pl workday-application -Pdevelop` | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | DOM-03 | compile | `./mvnw compile -pl workday-application -Pdevelop` | N/A | ⬜ pending |
| 04-01-03 | 01 | 1 | DOM-03 | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationSchemaTest -Pdevelop` | Created in task | ⬜ pending |
| 04-02-01 | 02 | 2 | DOM-03 | compile | `./mvnw compile -pl workday-application -Pdevelop` | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | DOM-03 | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationPersistenceTest -Pdevelop` | Created in task | ⬜ pending |
| 04-03-01 | 03 | 1 | DOM-04 | compile | `./mvnw compile -pl workday-application -Pdevelop` | N/A | ⬜ pending |
| 04-03-02 | 03 | 1 | DOM-04 | compile | `./mvnw compile -pl workday-application -Pdevelop` | N/A | ⬜ pending |
| 04-03-03 | 03 | 1 | DOM-04 | integration | `./mvnw test -pl workday-application -Dtest=ContractInternalPersistenceTest -Pdevelop` | Created in task | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationSchemaTest.kt` — validates JOINED inheritance schema, element collection tables (covers DOM-03 schema validation) -- **Plan 01 Task 3**
- [x] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceTest.kt` — tests save/retrieve with lazy collections, polymorphic queries (covers DOM-03 repository behavior) -- **Plan 02 Task 2**
- [x] `workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt` — tests studyHours/studyMoney persistence (covers DOM-04) -- **Plan 03 Task 3**
- [x] Spring Boot test configuration if not exists — `@DataJpaTest` with H2 database -- **Exists via WorkdayIntegrationTest**

*All Wave 0 test files are now created within their respective plans. No separate Wave 0 plan needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Liquibase migrations run without FK failures | DOM-03 | Migration ordering is a deploy-time concern, not unit-testable | Run `./mvnw liquibase:update -pl workday-application -Pdevelop` and verify no errors |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (revision pass)
