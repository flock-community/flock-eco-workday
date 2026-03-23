---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Polish & Gap Closure
current_phase: 14
current_plan: —
status: roadmap_ready
last_updated: "2026-03-23T00:00:00Z"
last_activity: 2026-03-23 -- v1.2 roadmap created (phases 14-17, 11 requirements)
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-23
**Current Phase:** 14 — Event Dialog Bug Fix
**Current Plan:** —
**Status:** Roadmap ready, planning phase 14

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.
**Current focus:** v1.2 Polish & Gap Closure — event allocation persistence, list UX, bug fixes

## Current Position

**Milestone:** v1.2 Polish & Gap Closure
**Progress:** [░░░░░░░░░░] 0% (0/4 phases)

Phase: 14 — Event Dialog Bug Fix
Plan: —
Status: Roadmap ready
Last activity: 2026-03-23 -- v1.2 roadmap created (phases 14-17, 11 requirements mapped)

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

v1.2 decisions:
- Phase 14 (BUG-01 infinite render fix) is prerequisite for Phase 15 (ALLOC work) -- both touch EventDialog
- Phase 16 (list UX) and Phase 17 (money summary + UI polish) are independent of ALLOC work and can proceed after Phase 14

### Known Blockers

None.

### Technical Debt

4 info-level items from v1.0 audit. No blockers.
Pre-existing: workdaySteps.ts has dayjs default import error (esModuleInterop) -- out of scope for this plan.

## Session Continuity

### Last Session Summary
- Completed milestone v1.1 (E2E Tests for Budget Allocations) — all 18 requirements verified
- Conducted post-milestone review, identified 11 issues across 5 categories for v1.2
- Started milestone v1.2: Polish & Gap Closure
- Created v1.2 roadmap: 4 phases (14-17), 11 requirements fully mapped

### Next Session
Roadmap ready. Proceed to /gsd:plan-phase 14 (Event Dialog Bug Fix — BUG-01).

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-23 (v1.2 roadmap created — phases 14-17)*
