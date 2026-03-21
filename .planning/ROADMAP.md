# Roadmap: Budget Allocations for Flock Workday

**Project:** Budget Allocation Tracking
**Created:** 2026-03-02
**Status:** v1.1 In Progress

## Milestones

- ✅ **v1.0 Budget Allocations** — Phases 1-9 (shipped 2026-03-17)
- 🚧 **v1.1 E2E Tests** — Phases 10-13 (in progress)

## Phases

<details>
<summary>✅ v1.0 Budget Allocations (Phases 1-9) — SHIPPED 2026-03-17</summary>

- [x] Phase 1: Frontend Prototype (N/A) — completed 2026-03-02
- [x] Phase 2: Event Budget Flow Redesign (3/3 plans) — completed 2026-03-02
- [x] Phase 3: Domain Layer (2/2 plans) — completed 2026-03-03
- [x] Phase 4: Persistence & Contract (3/3 plans) — completed 2026-03-05
- [x] Phase 5: API Layer (2/2 plans) — completed 2026-03-06
- [x] Phase 6: Budget Tab Integration (3/3 plans) — completed 2026-03-12
- [x] Phase 7: Event Integration (1/1 plan) — completed 2026-03-12
- [x] Phase 8: Contract Form & Dev Data (1/1 plan) — completed 2026-03-16
- [x] Phase 9: Verification Gap Closure (1/1 plan) — completed 2026-03-17

</details>

### 🚧 v1.1 E2E Tests (In Progress)

**Milestone Goal:** Comprehensive Playwright e2e tests and SpringBootTests proving budget allocation feature works end-to-end.

- [ ] **Phase 10: Budget Management Admin Tests** - Playwright tests for admin CRUD flows on budget allocations
- [ ] **Phase 11: Event Workflow Tests** - Playwright tests for event-linked allocation creation, editing, and summary impact
- [ ] **Phase 12: Employee View and Contract Tests** - Playwright tests for employee read-only view and contract budget field impact
- [ ] **Phase 13: Budget Calculation Tests** - SpringBootTests for backend budget calculation correctness

## Phase Details

### Phase 10: Budget Management Admin Tests
**Goal**: Admin can manage budget allocations through the Budget Allocation tab — view summaries, create, edit, and delete allocations of all types
**Depends on**: Nothing (first phase of v1.1; v1.0 feature code is complete)
**Requirements**: BMGT-01, BMGT-02, BMGT-03, BMGT-04, BMGT-05, BMGT-06
**Success Criteria** (what must be TRUE):
  1. Playwright test logs in as admin (bert@sesam.straat), navigates to a person's Budget Allocation tab, and asserts summary cards show used/remaining values for hack hours, study hours, and study money
  2. Playwright test creates a standalone study money allocation, saves it, and verifies it appears in the allocation list with correct amount and description
  3. Playwright test edits existing allocations (study money, study time, and hack time variants) and verifies updated values persist after page reload
  4. Playwright test deletes an allocation and verifies it is removed from the list and summary cards update accordingly
**Plans**: 2 plans

Plans:
- [ ] 10-01-PLAN.md — BDD step helpers and view-summary + create-allocation tests (BMGT-01, BMGT-02)
- [ ] 10-02-PLAN.md — Edit and delete allocation tests (BMGT-03, BMGT-04, BMGT-05, BMGT-06)

### Phase 11: Event Workflow Tests
**Goal**: Admin can create events with budget allocations, modify per-day breakdowns, and see allocations reflected in participant summaries
**Depends on**: Phase 10 (reuses admin login and navigation patterns)
**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04
**Success Criteria** (what must be TRUE):
  1. Playwright test creates an event, adds participants with per-day time allocations, saves, and verifies allocations appear on each participant's Budget Allocation tab
  2. Playwright test modifies day types (hack vs study) and hours-per-day on an existing event allocation, saves, and verifies updated values
  3. Playwright test adds a new participant to an existing event and removes another, then verifies allocation list changes accordingly
  4. Playwright test verifies that event-created allocations are reflected in the participant's budget summary cards (used hours increase, remaining decrease)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

### Phase 12: Employee View and Contract Tests
**Goal**: Employees see their own budget allocations in read-only mode, and contract budget field changes are reflected in summaries
**Depends on**: Phase 10 (allocation data created by admin tests serves as test fixture context)
**Requirements**: EMPV-01, EMPV-02, EMPV-03, CTRT-01, CTRT-02
**Success Criteria** (what must be TRUE):
  1. Playwright test logs in as employee (ieniemienie or pino), navigates to Budget Allocation tab, and asserts summary cards display correct budget values
  2. Playwright test verifies allocation list shows correct details (dates, hours, amounts) for the logged-in employee
  3. Playwright test confirms that create, edit, and delete controls are not visible or not functional for an employee user
  4. Playwright test logs in as admin, edits a contract's studyHours and studyMoney fields, saves, and verifies the budget summary cards reflect the updated contract values
**Plans**: TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

### Phase 13: Budget Calculation Tests
**Goal**: Backend budget calculations are correct — remaining budget equals contract value minus sum of allocations, scoped by type and year
**Depends on**: Nothing (SpringBootTests are independent of Playwright tests)
**Requirements**: CALC-01, CALC-02, CALC-03
**Success Criteria** (what must be TRUE):
  1. SpringBootTest asserts that budget remaining for a person/year equals contract budget minus sum of allocations for that person/year
  2. SpringBootTest asserts that hack hours, study hours, and study money calculations are independent — allocating study hours does not affect hack hour budget
  3. SpringBootTest asserts that allocations from a different year are excluded from the current year's budget calculation
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Frontend Prototype | v1.0 | N/A | Complete | 2026-03-02 |
| 2. Event Budget Flow Redesign | v1.0 | 3/3 | Complete | 2026-03-02 |
| 3. Domain Layer | v1.0 | 2/2 | Complete | 2026-03-03 |
| 4. Persistence & Contract | v1.0 | 3/3 | Complete | 2026-03-05 |
| 5. API Layer | v1.0 | 2/2 | Complete | 2026-03-06 |
| 6. Budget Tab Integration | v1.0 | 3/3 | Complete | 2026-03-12 |
| 7. Event Integration | v1.0 | 1/1 | Complete | 2026-03-12 |
| 8. Contract Form & Dev Data | v1.0 | 1/1 | Complete | 2026-03-16 |
| 9. Verification Gap Closure | v1.0 | 1/1 | Complete | 2026-03-17 |
| 10. Budget Management Admin Tests | v1.1 | 0/2 | Not started | - |
| 11. Event Workflow Tests | v1.1 | 0/2 | Not started | - |
| 12. Employee View and Contract Tests | v1.1 | 0/2 | Not started | - |
| 13. Budget Calculation Tests | v1.1 | 0/1 | Not started | - |

---
*Full v1.0 details: .planning/milestones/v1.0-ROADMAP.md*
*Last updated: 2026-03-21 (Phase 10 plans created)*
