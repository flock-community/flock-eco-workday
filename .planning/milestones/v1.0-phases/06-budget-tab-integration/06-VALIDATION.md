---
phase: 6
slug: budget-tab-integration
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
validated: 2026-03-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot Test (backend integration tests) |
| **Config file** | Maven surefire in `workday-application/pom.xml` |
| **Quick run command** | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest,BudgetSummaryControllerTest -x` |
| **Full suite command** | `./mvnw clean test` |
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
| 06-01-01 | 01 | 1 | TAB-01 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | ✅ | ✅ green |
| 06-01-02 | 01 | 1 | TAB-05 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | ✅ | ✅ green |
| 06-02-01 | 02 | 2 | TAB-02 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ✅ green |
| 06-02-02 | 02 | 2 | TAB-03 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ✅ green |
| 06-02-03 | 02 | 2 | TAB-04 | integration | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `BudgetSummaryControllerTest.kt` -- integration test for new budget summary endpoint (covers TAB-01, TAB-05). 4/4 tests passing.
- [x] Budget summary wirespec endpoint definition in `budget-allocations.ws` -- BudgetSummary endpoint with BudgetSummaryResponse and BudgetItem types.
- [x] `BudgetSummaryService.kt` -- service joining contract data with allocation sums. @Service with ContractService + BudgetAllocationService injection.

*Existing `BudgetAllocationControllerTest.kt` covers TAB-02, TAB-03, TAB-04. 7/7 tests passing.*

---

## Test Evidence

### BudgetSummaryControllerTest (4/4 passed) -- 2026-03-17

| # | Test Method | Requirement | Behavior Verified |
|---|-------------|-------------|-------------------|
| 1 | `budget summary returns correct values for person with contract and allocations` | TAB-01 | hackHours budget/used/available = 100/8/92, studyHours = 80/4/76, studyMoney = 2500/500/2000 |
| 2 | `budget summary returns zeros when no contract exists` | TAB-01 | All budget/used/available values return 0.0 when person has no contract |
| 3 | `non-admin user auto-scoped to own data` | TAB-05 | Non-admin GET without personId returns own budget data (hackHours=50, studyHours=40, studyMoney=1000) |
| 4 | `admin can query any person budget summary` | TAB-05 | Admin queries other person's summary successfully (hackHours.budget=200) |

### BudgetAllocationControllerTest (7/7 passed) -- 2026-03-17

| # | Test Method | Requirement | Behavior Verified |
|---|-------------|-------------|-------------------|
| 1 | `admin can GET allocations by personId and year` | TAB-02 | Returns HACK_TIME allocation with personId, hackTimeDetails.totalHours, dailyAllocations |
| 2 | `admin can GET allocations by eventCode` | TAB-02 | Returns allocation filtered by eventCode with correct type |
| 3 | `admin can POST hack-time allocation and receive response` | TAB-03 | Creates hack-time allocation, returns id, personId, type=HACK_TIME, hackTimeDetails |
| 4 | `admin can POST study-money allocation and receive response` | TAB-03 | Creates study-money allocation, returns id, type=STUDY_MONEY, studyMoneyDetails.amount |
| 5 | `admin can DELETE allocation` | TAB-03 | Deletes allocation, returns 204 No Content |
| 6 | `non-admin user receives 403 on POST mutation` | TAB-03 | Read-only user blocked from creating allocations |
| 7 | `non-admin user GET returns only own allocations` | TAB-04 | Regular user sees only own allocation (length=1), not admin's allocation |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Budget summary cards display correctly | TAB-01 | Visual layout verification | Open Budget tab, verify three cards show budget/used/available with correct formatting |
| Event links navigate to correct records | TAB-02 | Navigation/routing verification | Click event link in allocation list, verify redirect to correct event page |
| PersonSelector switches budget data | TAB-05 | Visual + interaction verification | As admin, select different person, verify all data updates |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-03-17
