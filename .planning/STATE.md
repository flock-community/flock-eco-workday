---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: E2E Tests
current_phase: 13
current_plan: 01
status: phase_complete
last_updated: "2026-03-22T08:37:07Z"
last_activity: 2026-03-22 -- Completed 13-01-PLAN.md (CALC-01/02/03 budget calculation SpringBootTests)
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 8
  completed_plans: 8
  percent: 100
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-22
**Current Phase:** Phase 13 (Budget Calculation Tests)
**Current Plan:** 13-01 (complete)
**Status:** Phase complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.
**Current focus:** v1.1 Phase 13 -- Budget Calculation Tests (complete)

## Current Position

**Milestone:** v1.1 E2E Tests for Budget Allocations
**Progress:** [██████████] 100%

Phase: 13 of 13 (Budget Calculation Tests)
Plan: 13-01 complete (1 of 1)
Status: Phase complete — milestone v1.1 complete
Last activity: 2026-03-22 -- Completed 13-01 (CALC-01/02/03 budget calculation SpringBootTests)

## Accumulated Context

### Key Decisions

Archived to .planning/milestones/v1.0-ROADMAP.md. See also PROJECT.md Key Decisions table.

v1.1 decisions:
- Phase 13 (CALC SpringBootTests) has no dependency on Playwright phases -- can run in parallel if needed
- BudgetCard renders EUR values with `€` symbol (U+20AC) via nl-NL locale, NOT "EUR" text prefix -- confirmed from BudgetCard.tsx formatValue
- BDD step helpers established in tests/steps/budgetSteps.ts: 8 exported helpers reusable across phases 10-12
- Amount format differs by component: BudgetCard uses 0-decimal (€350), StudyMoneyAllocationListItem uses 2-decimal nl-NL (€350,00)
- BMGT-03/04/05 edit tests use test.fixme() -- onEdit is NOT wired in BudgetAllocationFeature.tsx (only onDelete passed to BudgetAllocationList); edit button does not render
- BMGT-06 delete test fully runnable: onDelete IS wired, ConfirmDialog confirm flow works
- EventBudgetSummaryBanner uses "participant" text in collapsed mode, not "Budget Allocations" heading -- use participant text to locate budget accordion
- Customize button must be clicked on participant row to materialize default allocations; diffAllocations only processes non-null periods
- PersonSelector uses MUI Select (not Autocomplete), add/remove participants via MenuItem toggle
- EVNT-03 requires save-reopen cycle: budget section uses server-side eventData.persons, not form personIds

### Known Blockers

None.

### Technical Debt

4 info-level items from v1.0 audit. No blockers.
Pre-existing: workdaySteps.ts has dayjs default import error (esModuleInterop) -- out of scope for this plan.

## Session Continuity

### Last Session Summary
- Completed Phase 13: Budget Calculation Tests
  - 13-01: CALC-01/02/03 SpringBootTests for BudgetSummaryController
    - CALC-01: two hack allocations sum correctly (8h + 12h = 20h used, 80h available)
    - CALC-02: study-time allocation does not affect hackHours or studyMoney values
    - CALC-03: year scoping excludes 2025 allocations when querying year=2026
  - BudgetSummaryControllerTest now has 7 tests, all passing
  - Milestone v1.1 (E2E Tests for Budget Allocations) complete

### Next Session
Milestone v1.1 complete. All phases (10-13) done.

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-21 (11-02 complete)*
