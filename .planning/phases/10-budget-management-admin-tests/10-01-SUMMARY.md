---
phase: 10-budget-management-admin-tests
plan: 01
subsystem: testing
tags: [playwright, e2e, budget-allocations, bdd]

# Dependency graph
requires: []
provides:
  - BDD step helpers for budget allocation navigation and assertions (tests/steps/budgetSteps.ts)
  - Playwright spec for admin view-summary (BMGT-01) and create-study-money (BMGT-02)
affects:
  - 10-02 (edit/delete tests will import budgetSteps helpers)
  - 11 (event-linked allocation tests will reuse budgetSteps)
  - 12 (employee view tests will reuse budgetSteps)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - BDD-style step helpers in tests/steps/ with Given_/When_/Then_ naming
    - Selector pattern using semantic roles (getByRole, getByLabel, getByText) over data-testid
    - MuiCard-root / MuiPaper-root class selectors for MUI component targeting

key-files:
  created:
    - tests/steps/budgetSteps.ts
    - tests/budget-admin.spec.ts
  modified: []

key-decisions:
  - "Use € symbol (Unicode U+20AC) not 'EUR' text in assertions - BudgetCard.tsx formatValue renders €{value} with nl-NL locale"
  - "StudyMoneyAllocationListItem amount uses 2-decimal nl-NL format (350,00) while BudgetCard uses 0-decimal format (350)"
  - "Allocation list container targeted via .MuiPaper-root filtered by 'Budget Allocations' text (not Paper heading selector)"

patterns-established:
  - "BDD step convention: Given_I_am_on_budget_tab_for_person handles full login+nav+person-select flow"
  - "Summary card assertion: Then_summary_card_shows takes (page, cardTitle, available, budget, used)"
  - "Delete flow: When_I_delete_allocation handles ConfirmDialog interaction"

requirements-completed:
  - BMGT-01
  - BMGT-02

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 10 Plan 01: Budget Admin BDD Step Helpers and View/Create Tests Summary

**Playwright BDD step helpers and admin tests covering budget summary card assertions (BMGT-01) and standalone study money allocation creation (BMGT-02) for the budget allocations feature.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-21T15:47:02Z
- **Completed:** 2026-03-21T15:48:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `tests/steps/budgetSteps.ts` with 8 reusable BDD step helpers for the entire budget test suite (phases 10-12)
- Created `tests/budget-admin.spec.ts` with BMGT-01 (view summary cards) and BMGT-02 (create study money) admin tests
- Corrected EUR value assertions to use `€` symbol matching actual BudgetCard.tsx `formatValue` output

## Task Commits

Each task was committed atomically:

1. **Task 1: Create budget BDD step helpers** - `ac836334` (feat)
2. **Task 2: Create view-summary and create-allocation Playwright tests** - `7a3b1981` (feat)

## Files Created/Modified
- `tests/steps/budgetSteps.ts` - 8 exported BDD step helpers: Given_I_am_on_budget_tab_for_person, Then_summary_card_shows, When_I_click_add_study_money, When_I_fill_study_money_form, When_I_click_create_button, Then_allocation_list_contains, Then_allocation_list_does_not_contain, When_I_delete_allocation
- `tests/budget-admin.spec.ts` - Playwright spec with BMGT-01 (view 3 summary cards) and BMGT-02 (create study money and verify list + card update)

## Decisions Made
- Used `€` Unicode symbol in all EUR assertions rather than the "EUR" text prefix specified in the plan — reading `BudgetCard.tsx` `formatValue` function confirmed it renders `€{value}`, not `EUR{value}`
- Used `€350,00` format for list item amount assertions (2 decimal nl-NL) vs `€350` for BudgetCard assertions (0 decimal nl-NL) — both confirmed from their respective source files
- Targeted allocation list container with `.MuiPaper-root` filtered by "Budget Allocations" text, since `BudgetAllocationList.tsx` renders a `Paper` wrapper with a `Typography h6` reading "Budget Allocations ({count})"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected EUR symbol in all budget card assertions**
- **Found during:** Task 2 (Create view-summary Playwright tests)
- **Issue:** Plan specified "EUR2.500" as expected value but `BudgetCard.tsx` `formatValue` uses `\u20AC` (€) symbol, rendering "€2.500" not "EUR2.500"
- **Fix:** All BudgetCard EUR assertions use `€` instead of `EUR` prefix; updated plan comment and assertions
- **Files modified:** tests/budget-admin.spec.ts, tests/steps/budgetSteps.ts (no change — helpers are value-agnostic)
- **Verification:** Source code review of `BudgetCard.tsx` line 43 confirms `\u20AC${value.toLocaleString('nl-NL', ...)}`
- **Committed in:** 7a3b1981 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 incorrect assertion value from plan)
**Impact on plan:** Essential correction — tests would have failed at runtime with wrong expected values. No scope creep.

## Issues Encountered
- Pre-existing TypeScript error in `workdaySteps.ts` (`dayjs` default import with esModuleInterop) — out of scope, not caused by these changes, logged as observation only.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 BDD step helpers ready for reuse in phases 10-02, 11, and 12
- BMGT-01 and BMGT-02 test coverage complete
- Next: 10-02 edit and delete allocation tests (will import helpers from budgetSteps.ts)

---
*Phase: 10-budget-management-admin-tests*
*Completed: 2026-03-21*
