# Roadmap: Budget Allocations for Flock Workday

**Project:** Budget Allocation Tracking
**Created:** 2026-03-02
**Status:** v1.2 In Progress

## Milestones

- ✅ **v1.0 Budget Allocations** — Phases 1-9 (shipped 2026-03-17)
- ✅ **v1.1 E2E Tests** — Phases 10-13 (complete 2026-03-22)
- 🔄 **v1.2 Polish & Gap Closure** — Phases 14-17 (in progress)

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

<details>
<summary>✅ v1.1 E2E Tests (Phases 10-13) — COMPLETE 2026-03-22</summary>

- [x] **Phase 10: Budget Management Admin Tests** - Playwright tests for admin CRUD flows on budget allocations (completed 2026-03-21)
- [x] **Phase 11: Event Workflow Tests** - Playwright tests for event-linked allocation creation, editing, and summary impact (completed 2026-03-21)
- [x] **Phase 12: Employee View and Contract Tests** - Playwright tests for employee read-only view and contract budget field impact (completed 2026-03-22)
- [x] **Phase 13: Budget Calculation Tests** - SpringBootTests for backend budget calculation correctness (completed 2026-03-22)

</details>

### v1.2 Polish & Gap Closure

**Milestone Goal:** Fix event allocation persistence so allocations are always saved automatically on event save, improve budget allocation list UX, and resolve the infinite render loop in the event dialog.

- [x] **Phase 14: Event Dialog Bug Fix** - Fix the infinite render loop in EventDialog so event saving is stable (completed 2026-03-25)
- [x] **Phase 15: Event Allocation Persistence** - Auto-create and sync allocations for all participants on event save without requiring manual "Customize" (completed 2026-03-25)
- [x] **Phase 16: Budget Allocation List UX** - Show event names, make event allocations clickable for admins, add filter chips by type (completed 2026-03-27)
- [ ] **Phase 17: Event Money Summary and UI Polish** - Distinguish assigned vs unassigned money in summary; align "Add study money" with site-wide + Add pattern

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
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — BDD step helpers and view-summary + create-allocation tests (BMGT-01, BMGT-02)
- [x] 10-02-PLAN.md — Edit and delete allocation tests (BMGT-03, BMGT-04, BMGT-05, BMGT-06)
- [x] 10-03-PLAN.md — Gap closure: wire onEdit, extend dialog for edit mode, replace BMGT-03 fixme with real test (BMGT-03)

### Phase 11: Event Workflow Tests
**Goal**: Admin can create events with budget allocations, modify per-day breakdowns, and see allocations reflected in participant summaries
**Depends on**: Phase 10 (reuses admin login and navigation patterns)
**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04
**Success Criteria** (what must be TRUE):
  1. Playwright test creates an event, adds participants with per-day time allocations, saves, and verifies allocations appear on each participant's Budget Allocation tab
  2. Playwright test modifies day types (hack vs study) and hours-per-day on an existing event allocation, saves, and verifies updated values
  3. Playwright test adds a new participant to an existing event and removes another, then verifies allocation list changes accordingly
  4. Playwright test verifies that event-created allocations are reflected in the participant's budget summary cards (used hours increase, remaining decrease)
**Plans**: 2 plans

Plans:
- [x] 11-01-PLAN.md — Event step helpers, create event with budget allocations, verify budget tab impact (EVNT-01, EVNT-04)
- [x] 11-02-PLAN.md — Modify event allocation hours, add/remove participants (EVNT-02, EVNT-03)

### Phase 12: Employee View and Contract Tests
**Goal**: Employees see their own budget allocations in read-only mode, and contract budget field changes are reflected in summaries
**Depends on**: Phase 10 (allocation data created by admin tests serves as test fixture context)
**Requirements**: EMPV-01, EMPV-02, EMPV-03, CTRT-01, CTRT-02
**Success Criteria** (what must be TRUE):
  1. Playwright test logs in as employee (ieniemienie or pino), navigates to Budget Allocation tab, and asserts summary cards display correct budget values
  2. Playwright test verifies allocation list shows correct details (dates, hours, amounts) for the logged-in employee
  3. Playwright test confirms that create, edit, and delete controls are not visible or not functional for an employee user
  4. Playwright test logs in as admin, edits a contract's studyHours and studyMoney fields, saves, and verifies the budget summary cards reflect the updated contract values
**Plans**: 2 plans

Plans:
- [x] 12-01-PLAN.md — Employee read-only view tests: summary cards, allocation list, no admin controls (EMPV-01, EMPV-02, EMPV-03)
- [x] 12-02-PLAN.md — Contract budget field impact tests: edit studyHours/studyMoney, verify summary updates (CTRT-01, CTRT-02)

### Phase 13: Budget Calculation Tests
**Goal**: Backend budget calculations are correct — remaining budget equals contract value minus sum of allocations, scoped by type and year
**Depends on**: Nothing (SpringBootTests are independent of Playwright tests)
**Requirements**: CALC-01, CALC-02, CALC-03
**Success Criteria** (what must be TRUE):
  1. SpringBootTest asserts that budget remaining for a person/year equals contract budget minus sum of allocations for that person/year
  2. SpringBootTest asserts that hack hours, study hours, and study money calculations are independent — allocating study hours does not affect hack hour budget
  3. SpringBootTest asserts that allocations from a different year are excluded from the current year's budget calculation
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md — Add CALC-01/02/03 tests to BudgetSummaryControllerTest: multi-allocation sum, type independence, year scoping (CALC-01, CALC-02, CALC-03)

### Phase 14: Event Dialog Bug Fix
**Goal**: The event dialog is stable and does not trigger infinite re-render cycles, making event save workflows reliable
**Depends on**: Nothing (isolated bug fix, no phase dependencies)
**Requirements**: BUG-01
**Success Criteria** (what must be TRUE):
  1. Opening the event dialog and saving an event with budget allocations does not produce a `Maximum update depth exceeded` console error
  2. The event dialog can be opened, modified, and saved multiple times in a session without browser freezing or React error overlay appearing
**Plans**: 1 plan

Plans:
- [ ] 14-01-PLAN.md — Stabilize handleBudgetStateChange with useCallback; remove onBudgetStateChange from child useEffect deps (BUG-01)

### Phase 15: Event Allocation Persistence
**Goal**: Saving an event automatically creates and syncs budget allocations for all participants — no manual "Customize" step required
**Depends on**: Phase 14 (stable event dialog required before wiring new auto-create logic)
**Requirements**: ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05
**Success Criteria** (what must be TRUE):
  1. Admin saves an event with participants and a default time type; budget allocations appear on each participant's Budget Allocation tab without the admin clicking "Customize"
  2. Admin reopens an event; the previously selected default allocation type (hack vs study) is shown as selected, not reset to a default
  3. Admin saves an event with a money budget amount; study money allocations are created for each participant with equal shares that sum to the total
  4. Admin changes the budget type on an existing event and saves; existing allocations on participant tabs reflect the new type
  5. Admin changes the event's total money budget and saves; each participant's study money allocation is recalculated to the new equal share
**Plans**: TBD

### Phase 16: Budget Allocation List UX
**Goal**: The budget allocation list is scannable and navigable — event names are shown, admin can click through to events, and type filters reduce noise
**Depends on**: Nothing (frontend-only changes to allocation list display)
**Requirements**: LIST-01, LIST-02, LIST-03
**Success Criteria** (what must be TRUE):
  1. Event-linked allocations in the budget allocation list show the event name (e.g., "React Summit 2026") rather than the raw event code
  2. Admin clicks an event allocation row and is navigated to that event's edit dialog; employee sees the same row as plain non-clickable text
  3. User selects a filter chip (Hack Hours, Study Hours, or Study Money) and the allocation list shows only items of that type; selecting no chip shows all
**Plans**: 1 plan

Plans:
- [ ] 16-01-PLAN.md — Fix admin event link href from /event to /event?code={eventCode} in EventAllocationListItem (LIST-01, LIST-02, LIST-03)

### Phase 17: Event Money Summary and UI Polish
**Goal**: The event money summary is informative (shows assigned vs unassigned amounts) and the "Add study money" button matches the site-wide add pattern
**Depends on**: Nothing (two independent small UX changes)
**Requirements**: SUMM-01, UI-01
**Success Criteria** (what must be TRUE):
  1. The event money allocation summary shows two distinct values: amount assigned per participant and amount remaining unassigned, not a single total
  2. The "Add study money" button renders as `+ Add` consistent with the Projects, Assignments, and Workdays resource pages
**Plans**: TBD

## Progress

**Execution Order:**
v1.2 phases execute in order: 14 → 15 → 16 → 17 (16 and 17 can run in parallel after 14)

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
| 10. Budget Management Admin Tests | v1.1 | 3/3 | Complete | 2026-03-21 |
| 11. Event Workflow Tests | v1.1 | 2/2 | Complete | 2026-03-21 |
| 12. Employee View and Contract Tests | v1.1 | 2/2 | Complete | 2026-03-22 |
| 13. Budget Calculation Tests | v1.1 | 1/1 | Complete | 2026-03-22 |
| 14. Event Dialog Bug Fix | v1.2 | 1/1 | Complete | 2026-03-25 |
| 15. Event Allocation Persistence | v1.2 | 1/1 | Complete | 2026-03-25 |
| 16. Budget Allocation List UX | v1.2 | 0/1 | Complete    | 2026-03-27 |
| 17. Event Money Summary and UI Polish | v1.2 | 0/TBD | Not started | - |

---

## Backlog

### Phase 999.1: Make e2e tests independent with dedicated test users and suite-level cleanup (BACKLOG)

**Goal:** [Captured for future planning]
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

---
*Full v1.0 details: .planning/milestones/v1.0-ROADMAP.md*
*Last updated: 2026-03-27 (backlog item 999.1 added)*
