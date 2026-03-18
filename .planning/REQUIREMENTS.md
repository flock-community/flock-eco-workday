# Requirements: Budget Allocations E2E Tests

**Defined:** 2026-03-18
**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

## v1.1 Requirements

Requirements for e2e test coverage of budget allocation feature.

### Budget Management (Admin)

- [ ] **BMGT-01**: Admin can view budget summary cards showing used/remaining for hack hours, study hours, and study money
- [ ] **BMGT-02**: Admin can create a standalone study money allocation with amount and description
- [ ] **BMGT-03**: Admin can edit an existing study money allocation (amount, description)
- [ ] **BMGT-04**: Admin can edit an existing study time allocation (hours, dates)
- [ ] **BMGT-05**: Admin can edit an existing hack time allocation (hours, dates)
- [ ] **BMGT-06**: Admin can delete an existing budget allocation

### Event Workflow (Admin)

- [ ] **EVNT-01**: Admin can create an event and add budget allocations for participants with per-day breakdowns
- [ ] **EVNT-02**: Admin can modify event allocation day types (hack/study) and hours per day
- [ ] **EVNT-03**: Admin can add/remove participants from event allocations
- [ ] **EVNT-04**: Event allocations reflect correctly in participant budget summaries

### Employee View

- [ ] **EMPV-01**: Employee can view their own budget allocation tab with summary cards
- [ ] **EMPV-02**: Employee can see allocation list with correct details (dates, hours, amounts)
- [ ] **EMPV-03**: Employee cannot create, edit, or delete allocations (read-only)

### Contract Setup (E2E)

- [ ] **CTRT-01**: Admin can view/edit contract with studyHours and studyMoney fields
- [ ] **CTRT-02**: Changing contract budget fields updates the budget summary values

### Budget Calculation (SpringBootTest)

- [ ] **CALC-01**: Budget remaining equals contract budget minus sum of allocations for a given person and year
- [ ] **CALC-02**: Budget calculation handles multiple allocation types (hack hours, study hours, study money) independently
- [ ] **CALC-03**: Budget calculation scopes allocations to the correct year

## v2 Requirements

None — this is a test-focused milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Negative/error case testing | Happy-path focus for v1.1; error cases deferred |
| Performance/load testing | Not needed for functional e2e coverage |
| Mobile viewport testing | Desktop-first, existing responsive patterns sufficient |
| API-level integration tests | SpringBootTest covers backend; e2e covers user flows |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BMGT-01 | Phase 10 | Pending |
| BMGT-02 | Phase 10 | Pending |
| BMGT-03 | Phase 10 | Pending |
| BMGT-04 | Phase 10 | Pending |
| BMGT-05 | Phase 10 | Pending |
| BMGT-06 | Phase 10 | Pending |
| EVNT-01 | Phase 11 | Pending |
| EVNT-02 | Phase 11 | Pending |
| EVNT-03 | Phase 11 | Pending |
| EVNT-04 | Phase 11 | Pending |
| EMPV-01 | Phase 12 | Pending |
| EMPV-02 | Phase 12 | Pending |
| EMPV-03 | Phase 12 | Pending |
| CTRT-01 | Phase 12 | Pending |
| CTRT-02 | Phase 12 | Pending |
| CALC-01 | Phase 13 | Pending |
| CALC-02 | Phase 13 | Pending |
| CALC-03 | Phase 13 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 (traceability updated after roadmap creation)*
