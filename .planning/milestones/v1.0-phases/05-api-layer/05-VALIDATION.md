---
phase: 05
slug: api-layer
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-05
validated: 2026-03-17
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
| 05-01-01 | 01 | 1 | CTR-02 | build verification | `grep -q 'studyHours' workday-application/src/main/wirespec/contracts.ws && grep -q 'studyMoney' workday-application/src/main/wirespec/contracts.ws` | Yes | green |
| 05-01-02 | 02 | 2 | API-01, API-02 | integration | `cd workday-application && ../mvnw test -pl . -Dtest="BudgetAllocationControllerTest#admin can GET allocations by personId and year+admin can GET allocations by eventCode" -Pdevelop` | Yes | green |
| 05-01-03 | 02 | 2 | API-03 | integration | `cd workday-application && ../mvnw test -pl . -Dtest="BudgetAllocationControllerTest#admin can POST study-money allocation and receive response+admin can DELETE allocation" -Pdevelop` | Yes | green |
| 05-01-04 | 02 | 2 | API-04 | integration | `cd workday-application && ../mvnw test -pl . -Dtest="BudgetAllocationControllerTest#admin can POST hack-time allocation and receive response" -Pdevelop` | Yes | green |
| 05-01-05 | 02 | 2 | API-05 | integration | `cd workday-application && ../mvnw test -pl . -Dtest="BudgetAllocationControllerTest#non-admin user receives 403 on POST mutation+non-admin user GET returns only own allocations" -Pdevelop` | Yes | green |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] `workday-application/src/test/kotlin/.../budget/BudgetAllocationControllerTest.kt` -- 7 integration tests covering API-01 through API-05 (all pass)
- [x] Wirespec contract verification -- contracts.ws lines 81-82, 96-97 confirm studyHours/studyMoney (CTR-02)

*Existing test infrastructure (JUnit 5, Spring Boot Test, MockMvc) covers all phase requirements.*

---

## Test-to-Requirement Mapping

| Requirement | Test Method | Behavior Verified |
|-------------|------------|-------------------|
| API-01 | `admin can GET allocations by personId and year` | GET with personId+year returns 200 with correct allocations |
| API-02 | `admin can GET allocations by eventCode` | GET with eventCode returns 200 with event-linked allocations |
| API-03 | `admin can POST study-money allocation and receive response` + `admin can DELETE allocation` | StudyMoney create returns 200 with details; DELETE returns 204 |
| API-04 | `admin can POST hack-time allocation and receive response` | HackTime create returns 200 with dailyAllocations and totalHours |
| API-05 | `non-admin user receives 403 on POST mutation` + `non-admin user GET returns only own allocations` | Non-admin mutation blocked with 403; GET scoped to own data |
| CTR-02 | File inspection: contracts.ws | studyHours (Integer32?) and studyMoney (Number?) on ContractInternalForm and ContractInternal |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wirespec TS types match Kotlin signatures | CTR-02 | Requires visual inspection of generated types | Run `npm run generate`, inspect generated TypeScript for studyHours/studyMoney fields |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-03-17
