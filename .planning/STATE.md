---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: E2E Tests
current_phase: 11
current_plan: 01
status: in_progress
last_updated: "2026-03-21T17:37:00Z"
last_activity: 2026-03-21 -- Completed 11-01-PLAN.md (event workflow tests)
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 5
  completed_plans: 4
  percent: 80
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-21
**Current Phase:** Phase 11 (Event Workflow Tests)
**Current Plan:** 11-01 (complete)
**Status:** In progress

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.
**Current focus:** v1.1 Phase 11 -- Event Workflow Tests (11-01 complete)

## Current Position

**Milestone:** v1.1 E2E Tests for Budget Allocations
**Progress:** [████████░░] 80%

Phase: 11 of 13 (Event Workflow Tests)
Plan: 11-01 complete (1 of 2)
Status: In progress
Last activity: 2026-03-21 -- Completed 11-01 (event workflow step helpers and EVNT-01/EVNT-04 tests)

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

### Known Blockers

None.

### Technical Debt

4 info-level items from v1.0 audit. No blockers.
Pre-existing: workdaySteps.ts has dayjs default import error (esModuleInterop) -- out of scope for this plan.

## Session Continuity

### Last Session Summary
- Completed 11-01: Created event workflow step helpers and Playwright tests
  - tests/steps/eventSteps.ts: 12 BDD step helpers for event page, form, budget accordion, participant customization
  - tests/event-workflow.spec.ts: EVNT-01 (two-step event creation with budget allocations) and EVNT-04 (budget summary verification)
  - Customize button must be clicked to materialize default allocations before save

### Next Session
Continue Phase 11: 11-02 (remaining event workflow tests).

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-21 (11-01 complete)*
