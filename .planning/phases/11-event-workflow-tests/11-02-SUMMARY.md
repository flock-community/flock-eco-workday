---
phase: 11-event-workflow-tests
plan: 02
subsystem: testing
tags: [playwright, e2e, event-workflow, budget-allocations, mui-select]

requires:
  - phase: 11-01
    provides: "Event workflow step helpers, EVNT-01 create event test, EVNT-04 budget verification test"
provides:
  - "EVNT-02 test: modify event allocation hours per day and verify budget summary"
  - "EVNT-03 test: add/remove participants from event and verify budget impact"
  - "New helpers: When_I_customize_participant_hours, When_I_remove_participant_from_event, When_I_add_second_participant"
affects: []

tech-stack:
  added: []
  patterns: ["MUI Select multi-toggle for participant add/remove (not Autocomplete chips)"]

key-files:
  created: []
  modified:
    - tests/event-workflow.spec.ts
    - tests/steps/eventSteps.ts

key-decisions:
  - "PersonSelector uses MUI Select (not Autocomplete), so add/remove participants uses MenuItem toggle instead of chip delete"
  - "EVNT-03 saves form first then reopens to configure budgets, because budget section requires server-side eventData.persons"
  - "Ieniemienie's full display name is 'Ieniemienie Mouse' (firstname lastname from PersonSelector renderString)"

patterns-established:
  - "MUI multi-Select toggle: open dropdown, click option to select/deselect, Escape to close"

requirements-completed: [EVNT-02, EVNT-03]

duration: 3min
completed: 2026-03-21
---

# Phase 11 Plan 02: Event Modify Allocations Tests Summary

**Playwright tests for modifying event allocation hours (EVNT-02) and adding/removing participants (EVNT-03) with budget summary verification**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-21T17:40:33Z
- **Completed:** 2026-03-21T17:43:12Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- EVNT-02 test: reopens PW Test Hack Day, changes Pino's hack hours from 8h to 4h, verifies budget summary shows 20h used / 140h available
- EVNT-03 test: adds Ieniemienie Mouse as second participant (verifies 48h hack used on their budget tab), then removes Pino (verifies hack hours revert to 16h used / 144h available)
- Three new helpers in eventSteps.ts adapted for MUI Select pattern (not Autocomplete)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add EVNT-02 and EVNT-03 helpers and tests** - `8842ed2d` (feat)

## Files Created/Modified
- `tests/steps/eventSteps.ts` - Added When_I_customize_participant_hours, When_I_remove_participant_from_event, When_I_add_second_participant helpers
- `tests/event-workflow.spec.ts` - Added "Event Workflow - Modify Allocations" describe block with EVNT-02 and EVNT-03 tests

## Decisions Made
- PersonSelector uses MUI Select with multiple mode, not Autocomplete with chips. Add/remove uses MenuItem toggle pattern (click to select/deselect) instead of chip delete icons.
- EVNT-03 uses two-step flow: save form with new participant, then reopen to configure budgets. Budget section only renders when eventData.persons is loaded from server.
- Verified Ieniemienie's contract: hackHours=160, studyHours=200, studyMoney=5000. Current year hack used=40h. After adding 8h event: 48h used, 112h available.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adapted participant add/remove for MUI Select instead of Autocomplete**
- **Found during:** Task 1 (reading PersonSelector.tsx source)
- **Issue:** Plan assumed PersonSelector was MUI Autocomplete with chip delete icons. It is actually MUI Select with MenuItem toggle.
- **Fix:** When_I_remove_participant_from_event opens the Select dropdown and clicks the MenuItem to toggle deselect. When_I_add_second_participant does the same to select. No chip manipulation needed.
- **Files modified:** tests/steps/eventSteps.ts
- **Verification:** TypeScript compiles without errors (excluding pre-existing dayjs issue)
- **Committed in:** 8842ed2d

**2. [Rule 1 - Bug] Corrected Ieniemienie budget values from plan placeholders**
- **Found during:** Task 1 (reading LoadContractData.kt and LoadBudgetAllocationData.kt)
- **Issue:** Plan used placeholder values for Ieniemienie's budget (marked as needing verification). Contract has hackHours=160 (same as Pino), studyHours=200, studyMoney=5000.
- **Fix:** Used verified values: hack budget=160h, used=48h (40h existing + 8h new), available=112h
- **Files modified:** tests/event-workflow.spec.ts
- **Committed in:** 8842ed2d

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correct test assertions. No scope creep.

## Issues Encountered
- Pre-existing dayjs esModuleInterop error in workdaySteps.ts prevents clean `tsc --noEmit` on the full chain, but all event-workflow files compile correctly (no errors beyond the known issue).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 event workflow tests (EVNT-01 through EVNT-04) now exist in tests/event-workflow.spec.ts
- Tests run sequentially (fullyParallel: false) and depend on shared state (PW Test Hack Day event)
- Phase 11 complete, ready for next phase

---
*Phase: 11-event-workflow-tests*
*Completed: 2026-03-21*
