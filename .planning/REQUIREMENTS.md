# Requirements: Budget Allocations

**Defined:** 2026-03-18
**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

## v1.1 Requirements

Requirements for e2e test coverage of budget allocation feature.

### Budget Management (Admin)

- [x] **BMGT-01**: Admin can view budget summary cards showing used/remaining for hack hours, study hours, and study money
- [x] **BMGT-02**: Admin can create a standalone study money allocation with amount and description
- [x] **BMGT-03**: Admin can edit an existing study money allocation (amount, description)
- [x] **BMGT-04**: Admin can edit an existing study time allocation (hours, dates)
- [x] **BMGT-05**: Admin can edit an existing hack time allocation (hours, dates)
- [x] **BMGT-06**: Admin can delete an existing budget allocation

### Event Workflow (Admin)

- [x] **EVNT-01**: Admin can create an event and add budget allocations for participants with per-day breakdowns
- [x] **EVNT-02**: Admin can modify event allocation day types (hack/study) and hours per day
- [x] **EVNT-03**: Admin can add/remove participants from event allocations
- [x] **EVNT-04**: Event allocations reflect correctly in participant budget summaries

### Employee View

- [x] **EMPV-01**: Employee can view their own budget allocation tab with summary cards
- [x] **EMPV-02**: Employee can see allocation list with correct details (dates, hours, amounts)
- [x] **EMPV-03**: Employee cannot create, edit, or delete allocations (read-only)

### Contract Setup (E2E)

- [x] **CTRT-01**: Admin can view/edit contract with studyHours and studyMoney fields
- [x] **CTRT-02**: Changing contract budget fields updates the budget summary values

### Budget Calculation (SpringBootTest)

- [x] **CALC-01**: Budget remaining equals contract budget minus sum of allocations for a given person and year
- [x] **CALC-02**: Budget calculation handles multiple allocation types (hack hours, study hours, study money) independently
- [x] **CALC-03**: Budget calculation scopes allocations to the correct year

## v1.2 Requirements

Requirements for v1.2 Polish & Gap Closure milestone.

### Event Allocation Persistence

- [ ] **ALLOC-01**: When an admin saves an event, time allocations are automatically created for all participants using the default type — no "Customize" step required
- [ ] **ALLOC-02**: The default time allocation type is persisted on the event entity and restored on reopen
- [ ] **ALLOC-03**: Study money allocations are automatically created with equal share per participant when saving an event that has a budget amount
- [ ] **ALLOC-04**: Changing the budget type on an existing event updates all existing allocations to the new type
- [ ] **ALLOC-05**: Changing the event's total money budget redistributes study money allocations equally across all participants

### Budget Allocation List UX

- [ ] **LIST-01**: Event allocations in the budget allocation list display the event name instead of the event code
- [ ] **LIST-02**: Admin clicking an event allocation navigates to that event; employees see it as non-clickable text
- [ ] **LIST-03**: User can filter the budget allocation list by type using chips (Hack Hours / Study Hours / Study Money)

### Event Money Summary

- [ ] **SUMM-01**: The event money allocation summary distinguishes between assigned (€X/person) and unassigned (€Y remaining) amounts

### UI Consistency

- [ ] **UI-01**: The "Add study money" button uses the same `+ Add` pattern as other resource pages (Projects, Assignments, Workdays)

### Bug Fixes

- [ ] **BUG-01**: The event dialog no longer triggers a `Maximum update depth exceeded` infinite render loop

## v2 Requirements

None defined yet.

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
| BMGT-01 | Phase 10 | Complete |
| BMGT-02 | Phase 10 | Complete |
| BMGT-03 | Phase 10 | Complete |
| BMGT-04 | Phase 10 | Complete |
| BMGT-05 | Phase 10 | Complete |
| BMGT-06 | Phase 10 | Complete |
| EVNT-01 | Phase 11 | Complete |
| EVNT-02 | Phase 11 | Complete |
| EVNT-03 | Phase 11 | Complete |
| EVNT-04 | Phase 11 | Complete |
| EMPV-01 | Phase 12 | Complete |
| EMPV-02 | Phase 12 | Complete |
| EMPV-03 | Phase 12 | Complete |
| CTRT-01 | Phase 12 | Complete |
| CTRT-02 | Phase 12 | Complete |
| CALC-01 | Phase 13 | Complete |
| CALC-02 | Phase 13 | Complete |
| CALC-03 | Phase 13 | Complete |
| BUG-01 | Phase 14 | Pending |
| ALLOC-01 | Phase 15 | Pending |
| ALLOC-02 | Phase 15 | Pending |
| ALLOC-03 | Phase 15 | Pending |
| ALLOC-04 | Phase 15 | Pending |
| ALLOC-05 | Phase 15 | Pending |
| LIST-01 | Phase 16 | Pending |
| LIST-02 | Phase 16 | Pending |
| LIST-03 | Phase 16 | Pending |
| SUMM-01 | Phase 17 | Pending |
| UI-01 | Phase 17 | Pending |

**Coverage:**
- v1.1 requirements: 18 total — mapped to phases: 18 — unmapped: 0
- v1.2 requirements: 11 total — mapped to phases: 11 — unmapped: 0

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-23 (v1.2 traceability added — phases 14-17)*
