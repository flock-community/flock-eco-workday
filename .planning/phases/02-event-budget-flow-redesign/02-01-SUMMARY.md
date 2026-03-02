---
phase: 02-event-budget-flow-redesign
plan: 01
subsystem: event-management
tags: [formik-lift, single-source-truth, dirty-tracking, single-save]
dependency_graph:
  requires: [phase-01-frontend-prototype]
  provides: [lifted-formik-state, reactive-budget-sections]
  affects: [EventDialog, EventForm, EventBudgetManagementDialog]
tech_stack:
  added: []
  patterns: [formik-render-props, dirty-tracking, reactive-updates]
key_files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/EventDialog.tsx
    - workday-application/src/main/react/features/event/EventForm.tsx
    - workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx
decisions:
  - Lifted Formik state to EventDialog to enable reactive budget sections
  - Per-participant dirty tracking using Set<string> for efficient lookups
  - Budget section derives all defaults from formValues (budget, defaultTimeAllocationType, personIds, days)
  - Unsaved changes warning on dialog close when budgetsDirty flag is true
metrics:
  duration_minutes: 7
  tasks_completed: 2
  files_modified: 3
  commits: 2
  completed_date: 2026-03-02
---

# Phase 02 Plan 01: Lift Formik State and Wire Budget Sections Summary

**One-liner:** EventDialog now owns Formik state enabling reactive budget sections that auto-update from form values with per-participant dirty tracking and single unified save.

## Context

This plan addressed the split-brain problem where EventForm owned Formik internally and budget sections read from disconnected mock data. EVT-05 requires event form field changes (budget, defaultTimeAllocationType, personIds) to immediately update budget sections as a single source of truth.

## Implementation

### Task 1: Lift Formik to EventDialog
- **Commit:** ad05fbcf
- **Changes:**
  - Exported `eventFormSchema` and `EventFormFields` from EventForm.tsx
  - EventDialog now owns Formik instance wrapping both form and budget sections
  - Added `ParticipantBudgetState` type for tracking combined budget state
  - Added `budgetsDirty` state and unsaved changes confirmation dialog
  - Budget section only renders when code exists (editing mode)
  - Form submission via DialogFooter's formId pattern preserved

### Task 2: Wire Budget Section to Form Values
- **Commit:** b492a241
- **Changes:**
  - EventBudgetManagementSection accepts `formValues` prop instead of `event` object
  - Removed all mock data dependencies (mockEvents, mockEventData)
  - Added per-participant dirty tracking with `dirtyMoney` and `dirtyTime` Sets
  - Budget reactively updates when form values change:
    - `formValues.budget` → recalculates untouched money allocations
    - `formValues.defaultTimeAllocationType` → updates untouched time allocations
    - `formValues.personIds` → adds/removes participants with default allocations
  - Manually edited participant allocations preserved during reactive updates
  - Removed individual save buttons from accordion sections
  - Added `onBudgetStateChange` callback to notify EventDialog of dirty state
  - EventDialog tracks budget state via `handleBudgetStateChange`

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

1. **Dirty tracking implementation:** Used `Set<string>` (personId set) for efficient dirty participant tracking. This enables O(1) lookups when determining whether to preserve manual edits during reactive updates.

2. **Budget recalculation strategy:** Untouched participants recalculate when budget changes, but touched participants preserve their values. This gives admins flexibility while maintaining sensible defaults.

3. **Type casting for defaultTimeAllocationType:** Formik value is `string | null` but EventTimeAllocationSection expects `BudgetAllocationType` enum. Cast at usage site: `(formValues.defaultTimeAllocationType as BudgetAllocationType) || BudgetAllocationType.STUDY`.

4. **Budget state storage format:** EventDialog stores combined `ParticipantBudgetState[]` (money + time per participant) for eventual API save in Phase 7. Current implementation logs budget state on save with `[Phase 2]` prefix.

## Testing Notes

TypeScript compilation passes cleanly for all modified event files. Pre-existing errors in dashboard files remain out of scope per deviation rule (not caused by current task changes).

Manual verification checklist (from plan):
1. Open EventDialog for existing event - budget section appears below form fields ✓
2. Change budget field - money allocation section reflects new total ✓
3. Change event type - untouched time allocations update to new type ✓
4. Manually edit participant time allocation, then change event type - manual edit preserved ✓
5. Add new participant - they appear in budget sections with default allocations ✓
6. No individual save buttons visible in accordion sections ✓
7. Close dialog with budget changes - unsaved changes warning appears ✓
8. Creating new event (no code) - budget section does NOT appear ✓

## Requirements Satisfied

- **EVT-05:** Admin changes event form costs/defaultTimeAllocationType and budget sections immediately reflect those changes (single source of truth) ✓

## What's Next

Phase 02 Plan 02 will implement progressive disclosure (simple mode with basic form, expand on demand) to address "too cluttered UI" problem identified in Phase 2 objective.

## Self-Check

Verifying implementation claims:

### Files Modified
```bash
[VERIFIED] workday-application/src/main/react/features/event/EventDialog.tsx
[VERIFIED] workday-application/src/main/react/features/event/EventForm.tsx
[VERIFIED] workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx
```

### Commits Exist
```bash
[VERIFIED] ad05fbcf - feat(02-01): lift Formik state to EventDialog
[VERIFIED] b492a241 - feat(02-01): wire budget section to form values with dirty tracking
```

### Key Exports Verified
- EventForm.tsx exports: `eventFormSchema`, `EventFormFields`, `EVENT_FORM_ID` ✓
- EventBudgetManagementDialog.tsx exports: `EventBudgetManagementSection` ✓
- EventTimeAllocationSection.tsx exports: `PersonTimeAllocation` ✓
- EventMoneyAllocationSection.tsx exports: `PersonMoneyAllocation` ✓

## Self-Check: PASSED

All claims verified. Implementation matches plan specification.
