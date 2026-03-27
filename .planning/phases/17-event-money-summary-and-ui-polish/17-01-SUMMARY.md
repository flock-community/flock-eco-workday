---
phase: 17-event-money-summary-and-ui-polish
plan: "01"
subsystem: frontend-ui + e2e-tests
tags: [budget, event, playwright, ux, ui-polish]
dependency_graph:
  requires: []
  provides: [SUMM-01, UI-01]
  affects: [EventBudgetSummaryBanner, event-workflow.spec.ts, budget-admin.spec.ts]
tech_stack:
  added: []
  patterns: [playwright-bdd-steps, mui-accordion-locator]
key_files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx
    - tests/steps/eventSteps.ts
    - tests/event-workflow.spec.ts
    - tests/budget-admin.spec.ts
decisions:
  - "EVNT-06 depends on EVNT-01 creating PW Test Hack Day — test must run in the full suite, not in isolation via --grep"
  - "BMGT-01 fails when budget-admin and event-workflow suites run together due to shared DB state ordering; this is pre-existing, not caused by plan changes"
metrics:
  duration_minutes: 10
  completed_date: "2026-03-27"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 17 Plan 01: Event Money Summary and UI Polish Summary

**One-liner:** Fixed EventBudgetSummaryBanner fully-allocated branch to show explicit `€0 unassigned (fully allocated)` text, and added EVNT-06 + UI-01 Playwright tests closing SUMM-01 and UI-01.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix EventBudgetSummaryBanner fully-allocated wording and add EVNT-06 test | 5ec72c7e | EventBudgetSummaryBanner.tsx, tests/steps/eventSteps.ts, tests/event-workflow.spec.ts |
| 2 | Confirm Add button matches + Add pattern and close UI-01 with test | 0b3e0106 | tests/budget-admin.spec.ts |

## What Was Built

### Task 1 — SUMM-01: EventBudgetSummaryBanner fully-allocated wording

**Fix:** In the collapsed-mode `if (hasMoneySection)` block, the `else` branch (unassigned === 0) previously produced:

```
, assigned €500/person (fully allocated)
```

Changed to:

```
, assigned €500/person, €0 unassigned (fully allocated)
```

This makes all three states consistent — partially allocated, over budget, and fully allocated each show both values explicitly.

**Step helper added:** `Then_collapsed_banner_shows_money_summary(page, assignedPerPersonText, unassignedText)` in `tests/steps/eventSteps.ts`. Locates the MUI AccordionSummary by `participant` text and asserts both substrings in the Typography `<p>` element.

**Test added:** EVNT-06 in `tests/event-workflow.spec.ts` inside the "Create and Budget Verification" describe block (after EVNT-05). Opens "PW Test Hack Day" (created by EVNT-01 with budget=500, 1 participant) and asserts:
- `'assigned €500/person'`
- `'€0 unassigned (fully allocated)'`

### Task 2 — UI-01: Add button pattern verification

**Source confirmed:** `BudgetAllocationFeature.tsx` lines 162-166 already contain `<Button><AddIcon/> Add</Button>` — identical to ProjectFeature, AssignmentFeature, WorkDayFeature. No source change needed.

**Test added:** `UI-01: Add button renders with + Add pattern` in a new `'Budget Admin - UI Pattern Verification'` describe block at the end of `tests/budget-admin.spec.ts`. Navigates to Pino's budget tab as admin and asserts:
- `getByRole('button', { name: 'Add' })` is visible
- The button contains an `svg` element (AddIcon)

## Test Results

**Individual suite results (correct baselines):**

- `tests/budget-admin.spec.ts` alone: **5 passed, 2 skipped** (UI-01 is new pass; BMGT-04/05 remain fixme)
- `tests/event-workflow.spec.ts` "Create and Budget Verification": **4 passed** (EVNT-06 is new pass)
- `tests/budget-admin.spec.ts --grep UI-01`: **1 passed**

**Cross-suite run note:** When running `tests/event-workflow.spec.ts tests/budget-admin.spec.ts` together, BMGT-01 fails due to a pre-existing cross-suite ordering issue (event-workflow creates a Hack Day event affecting Pino's hack hours before BMGT-01 expects the baseline). This failure pre-dates this plan.

## Deviations from Plan

None — plan executed exactly as written. Source BudgetAllocationFeature.tsx already matched the expected pattern (no code change for UI-01 as anticipated by the plan).

## Requirements Closed

- **SUMM-01** — Money allocation summary distinguishes assigned vs unassigned amounts (all three states now explicit)
- **UI-01** — "Add study money" button uses site-wide + Add pattern (verified in source + Playwright test)

## Self-Check

Files exist:
- `workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx` — modified
- `tests/steps/eventSteps.ts` — modified
- `tests/event-workflow.spec.ts` — modified
- `tests/budget-admin.spec.ts` — modified

Commits:
- `5ec72c7e` — feat(17-01): fix collapsed banner fully-allocated wording and add EVNT-06 test
- `0b3e0106` — test(17-01): add UI-01 verification test for Add button pattern
