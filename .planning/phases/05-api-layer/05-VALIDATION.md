---
phase: 05
slug: api-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot Test |
| **Config file** | Standard Maven Surefire plugin |
| **Quick run command** | `cd workday-application && ../mvnw test -pl . -Dtest=BudgetAllocationControllerTest -Pdevelop` |
| **Full suite command** | `./mvnw test -Pdevelop` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd workday-application && ../mvnw test -pl . -Dtest=BudgetAllocationControllerTest -Pdevelop`
- **After every plan wave:** Run `./mvnw test -Pdevelop`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CTR-02 | build verification | `npm run generate && test -f workday-application/src/main/react/wirespec/contracts.ts` | No - W0 | pending |
| 05-01-02 | 01 | 1 | API-01, API-02 | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testGetByPersonAndYear -Pdevelop` | No - W0 | pending |
| 05-01-03 | 01 | 1 | API-03 | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testStudyMoneyCrud -Pdevelop` | No - W0 | pending |
| 05-01-04 | 01 | 1 | API-04 | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testTimeAllocationCrud -Pdevelop` | No - W0 | pending |
| 05-01-05 | 01 | 1 | API-05 | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testNonAdminForbidden -Pdevelop` | No - W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `workday-application/src/test/kotlin/.../budget/BudgetAllocationControllerTest.kt` — integration test stubs for API-01 through API-05
- [ ] Wirespec build verification script — covers CTR-02

*Existing test infrastructure (JUnit 5, Spring Boot Test, MockMvc) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wirespec TS types match Kotlin signatures | CTR-02 | Requires visual inspection of generated types | Run `npm run generate`, inspect generated TypeScript for studyHours/studyMoney fields |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
