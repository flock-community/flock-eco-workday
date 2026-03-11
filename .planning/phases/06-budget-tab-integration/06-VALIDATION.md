---
phase: 6
slug: budget-tab-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (frontend), JUnit 5 + Spring Boot Test (backend) |
| **Config file** | `jest.config.js` (root), existing Maven test config |
| **Quick run command** | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest,BudgetSummaryControllerTest -x` |
| **Full suite command** | `./mvnw clean test && npm test -- --watchAll=false` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest,BudgetSummaryControllerTest -x`
- **After every plan wave:** Run `./mvnw clean test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | TAB-01 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | TAB-05 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | TAB-02 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | TAB-03 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ⬜ pending |
| 06-02-03 | 02 | 2 | TAB-04 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `BudgetSummaryControllerTest.kt` — integration test for new budget summary endpoint (covers TAB-01, TAB-05)
- [ ] Budget summary wirespec endpoint definition in `budget-allocations.ws`
- [ ] `BudgetSummaryService.kt` — new service joining contract + allocation data

*Existing `BudgetAllocationControllerTest.kt` covers TAB-02, TAB-03, TAB-04.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Budget summary cards display correctly | TAB-01 | Visual layout verification | Open Budget tab, verify three cards show budget/used/available with correct formatting |
| Event links navigate to correct records | TAB-02 | Navigation/routing verification | Click event link in allocation list, verify redirect to correct event page |
| PersonSelector switches budget data | TAB-05 | Visual + interaction verification | As admin, select different person, verify all data updates |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
