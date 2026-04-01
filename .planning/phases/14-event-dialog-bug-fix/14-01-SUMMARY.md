---
phase: 14-event-dialog-bug-fix
plan: 01
subsystem: ui
tags: [react, useCallback, useEffect, infinite-loop, performance]

requires: []
provides:
  - Stable handleBudgetStateChange callback in EventDialog (no re-render cascade)
  - EventDialog can open/modify/save without Maximum update depth exceeded error
affects: [15-event-allocation-persistence]

tech-stack:
  added: []
  patterns: [useCallback with empty deps for ref-only callbacks]

key-files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/EventDialog.tsx
    - workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx

key-decisions:
  - "Empty dependency array for useCallback — all closed-over values are stable refs or state setters"
  - "eslint-disable for exhaustive-deps — callback is stable by convention, not data"

patterns-established:
  - "useCallback with [] deps for callbacks that only use refs and state setters"

requirements-completed: [BUG-01]

duration: 5min
completed: 2026-03-23
---

# Phase 14: Event Dialog Bug Fix Summary

**Stabilized EventDialog render cycle by wrapping handleBudgetStateChange in useCallback and removing callback from child useEffect deps**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Wrapped `handleBudgetStateChange` in `useCallback` with empty deps (all closures are stable refs/setters)
- Removed `onBudgetStateChange` from child useEffect dependency array with eslint-disable comment
- TypeScript compilation clean, budgetsDirtyRef guard preserved

## Task Commits

1. **Task 1+2: useCallback wrap + dep array fix** - `7f111eb9` (fix)

## Files Modified
- `workday-application/src/main/react/features/event/EventDialog.tsx` - Added useCallback import, wrapped handleBudgetStateChange
- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx` - Removed onBudgetStateChange from useEffect deps

## Decisions Made
- Used empty dependency array since handleBudgetStateChange only closes over stable state setters and refs
- Added eslint-disable comment for exhaustive-deps rule suppression

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- EventDialog is stable, ready for Phase 15 (event allocation persistence) to wire auto-create logic
- No blockers

---
*Phase: 14-event-dialog-bug-fix*
*Completed: 2026-03-23*
