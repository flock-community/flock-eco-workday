---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Polish & Gap Closure
current_phase: 999.1
current_plan: Not started
status: planning
last_updated: "2026-03-27T15:25:42.330Z"
progress:
  total_phases: 9
  completed_phases: 7
  total_plans: 12
  completed_plans: 10
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-27
**Current Phase:** 999.1
**Current Plan:** Not started
**Status:** Ready to plan

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.
**Current focus:** Phase 17 — event-money-summary-and-ui-polish

## Current Position

Phase: 17 (event-money-summary-and-ui-polish) — COMPLETE
Plan: 1 of 1 (all plans done)

## Accumulated Context

### Key Decisions

v1.2 decisions (updated 2026-03-27):

- **Backend owns event allocation lifecycle** — `EventService.syncBudgetAllocations` creates, updates, and deletes allocations atomically. Frontend does NOT orchestrate allocation CRUD for events.
- **Event endpoints return budgetAllocations** — GET /api/events/{code}, POST, PUT all return `budgetAllocations[]` in the Event response via `@Transient` field. Frontend gets allocations from event response, no separate BudgetAllocationClient calls needed for event-linked allocations.
- **`costs` renamed to `budget` across the full stack** — wirespec EventForm, Kotlin Event entity (`@Column(name = "costs")` preserves DB column), EventService, EventController, EventClient.ts, EventList.tsx. No migration needed.
- **Negative time validation** — PeriodInput has `min: 0` + `Math.max(0, val)` in onChange. Backend has `require(hours >= 0)` in BudgetAllocationApiMapper for all three consume methods.
- **URL state management** — BudgetAllocationFeature reads/writes `?year=` and `?eventCode=` query params. GitHub issue #458 tracks broader URL state management.
- **EventBudgetManagementSection is read-only** — Still renders in EventDialog but `onBudgetStateChange` callback removed. Shows current allocations from backend; custom per-person overrides not saved (backend recalculates defaults on every save).
- **StudyMoneyAllocationDialog still uses BudgetAllocationClient** — This is correct: freeform (non-event) study money is managed directly from the budget page, not through events.
- **Pino contract dev data updated** — `studyHours=200, studyMoney=5000` (was 100/2500). Old values caused study money to go over budget due to 26 event-synced allocations (~€3,182 used).
- **EVNT-06 must run in full suite** — test depends on EVNT-01 creating "PW Test Hack Day"; running via `--grep EVNT-06` alone fails because the event doesn't exist yet.

### Known Blockers

None.

### Skipped Tests (need to be addressed)

- **BMGT-04: Edit study time allocation** (`test.fixme`) — No standalone study time allocations exist for Pino in dev data. Study time comes only from event-linked allocations, which don't expose edit buttons. Needs: either add a standalone study time allocation to dev data, or implement a way to create one from the budget page.
- **BMGT-05: Edit hack time allocation** (`test.fixme`) — Same issue: Pino's hack time is event-linked and doesn't expose edit buttons. Needs: same resolution as BMGT-04.
- **EVNT-02: Modify event allocation hours per day** (`test.fixme`) — Backend recalculates default allocations on every save; custom per-person hour overrides are NOT persisted. The EventBudgetManagementSection is read-only. Needs: implement per-person override persistence in `EventService.syncBudgetAllocations`, or remove the edit UI and drop this test.

### Technical Debt

- ~~**E2e tests should NOT hardcode exact study money amounts**~~ — **RESOLVED**: Refactored all e2e money assertions to delta-based (`Then_money_used_changed_by`). Baseline read before action, then verify exact delta. Hours remain exact (deterministic). `BudgetSummaryControllerTest` already covers exact calculations server-side.
- EventBudgetManagementSection still has custom per-person editing UI but changes aren't persisted (backend overwrites with defaults). Consider removing or making explicitly read-only.
- `diffAllocations` and `generateDefaultAllocations` in eventBudgetTransformers.ts are no longer used by EventDialog — could be cleaned up.

## Session Continuity

### Last Session Summary (2026-03-27) — Phase 17 Plan 01 Complete

Executed Phase 17 Plan 01: fixed EventBudgetSummaryBanner fully-allocated wording (SUMM-01) and added EVNT-06 + UI-01 Playwright tests.

**Completed:**

- `EventBudgetSummaryBanner.tsx`: unassigned===0 branch now shows `, assigned €X/person, €0 unassigned (fully allocated)` — both values explicit
- `tests/steps/eventSteps.ts`: Added `Then_collapsed_banner_shows_money_summary` step helper
- `tests/event-workflow.spec.ts`: Added EVNT-06 test (passes in full suite: 4 passed in "Create and Budget Verification")
- `tests/budget-admin.spec.ts`: Added UI-01 test in new "Budget Admin - UI Pattern Verification" describe block (1 passed)

**Test Results (after Phase 17):**

- `budget-admin.spec.ts` alone: **5 passed, 2 skipped** (BMGT-04/05)
- `event-workflow.spec.ts` "Create and Budget Verification": **4 passed**
- `budget-admin.spec.ts --grep UI-01`: **1 passed**
- **New total: 15 passed, 3 skipped** (EVNT-06 + UI-01 added)

**Requirements closed:** SUMM-01, UI-01

### Next Session

Phase 17 is complete. v1.2 milestone Polish & Gap Closure is done.

### Files Modified This Session

- `workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx` — SUMM-01 fix
- `tests/steps/eventSteps.ts` — Then_collapsed_banner_shows_money_summary helper
- `tests/event-workflow.spec.ts` — EVNT-06 test
- `tests/budget-admin.spec.ts` — UI-01 test, expect import

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-27 (Phase 17 complete — SUMM-01 and UI-01 closed)*
