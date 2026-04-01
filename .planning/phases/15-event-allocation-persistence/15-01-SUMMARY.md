---
phase: 15-event-allocation-persistence
plan: 01
subsystem: ui
tags: [react, event-dialog, budget-allocations, auto-create]

requires:
  - phase: 14-event-dialog-bug-fix
    provides: Stable EventDialog render cycle
provides:
  - Auto-creation of time and money allocations on event save
  - generateDefaultAllocations helper for synthesizing defaults from form values
affects: [16-budget-allocation-list-ux, 17-event-money-summary-ui-polish]

tech-stack:
  added: []
  patterns: [two-path allocation processing in handleSubmit]

key-files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/eventBudgetTransformers.ts
    - workday-application/src/main/react/features/event/EventDialog.tsx

key-decisions:
  - "Two-path approach: manual customizations preserved via budgetsDirtyRef, defaults auto-generated otherwise"
  - "generateDefaultAllocations creates equal money shares rounded down to cents"
  - "Backend unchanged — all allocation management is frontend-driven"

patterns-established:
  - "generateDefaultAllocations for synthesizing default allocations from form values"

requirements-completed: [ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05]

duration: 10min
completed: 2026-03-23
---

# Phase 15: Event Allocation Persistence Summary

**Auto-create time and money allocations on event save via generateDefaultAllocations helper and two-path handleSubmit logic**

## Performance

- **Duration:** 10 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `generateDefaultAllocations()` helper that creates default PersonTimeAllocation and PersonMoneyAllocation arrays from form values
- Modified handleSubmit with two-path approach: Path A uses manual customizations (budgetsDirtyRef), Path B auto-generates defaults
- New events now auto-create allocations; existing events auto-sync on type/budget changes

## Task Commits

1. **Task 1+2: generateDefaultAllocations + handleSubmit modification** - `1536fac4` (feat)

## Files Modified
- `workday-application/src/main/react/features/event/eventBudgetTransformers.ts` - Added generateDefaultAllocations function
- `workday-application/src/main/react/features/event/EventDialog.tsx` - Updated import, replaced budgetsDirtyRef guard with two-path logic

## Decisions Made
- Two-path approach preserves backward compatibility — manual edits still work via budgetsDirtyRef
- Equal share money distribution rounds down to cents to avoid floating point issues

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- Event allocation auto-creation working, ready for Phase 16 (list UX) and Phase 17 (summary polish)

---
*Phase: 15-event-allocation-persistence*
*Completed: 2026-03-23*
