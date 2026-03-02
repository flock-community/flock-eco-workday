---
phase: 02-event-budget-flow-redesign
plan: 02
subsystem: event-management
tags: [progressive-disclosure, collapsed-default, unsaved-indicator, guidance-notes]
dependency_graph:
  requires: [phase-02-plan-01]
  provides: [progressive-disclosure-ui, collapsed-summary-banner, unsaved-indicator]
  affects: [EventBudgetManagementDialog, EventBudgetSummaryBanner]
tech_stack:
  added: []
  patterns: [progressive-disclosure, collapsed-by-default, visual-indicators]
key_files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx
    - workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx
key-decisions:
  - "Budget section wrapped in top-level accordion that starts collapsed"
  - "EventBudgetSummaryBanner detects collapsed mode via participantCount prop"
  - "Guidance note shown when no defaultTimeAllocationType (info alert)"
  - "Unsaved changes indicator: 8px colored dot on summary banner"
  - "Summary format: N participants x Xh/day TYPE, EURX/person"
patterns-established:
  - "Three-level progressive disclosure: summary banner -> accordion sections -> per-participant details"
  - "Collapsed by default at all levels for reduced cognitive load"
  - "Visual hierarchy: outer accordion uses border, inner accordions use background colors"
requirements-completed: [EVT-06]
metrics:
  duration_minutes: 3
  tasks_completed: 1
  files_modified: 2
  commits: 1
  completed_date: 2026-03-02
---

# Phase 02 Plan 02: Progressive Disclosure for Budget Management Summary

**One-liner:** Budget section now defaults to collapsed summary banner with three-level progressive disclosure (summary -> sections -> per-participant details) and unsaved changes visual indicator.

## Context

This plan implemented EVT-06's progressive disclosure requirement. The previous implementation (Plan 01) showed all budget accordions expanded by default, overwhelming admins with information. Progressive disclosure lets admins start with a quick overview and drill down only when needed.

## Implementation

### Task 1: Progressive Disclosure with Collapsed Summary Banner
- **Commit:** 23fb56f8
- **Changes:**
  - **EventBudgetSummaryBanner.tsx:**
    - Added props: `participantCount`, `defaultHoursPerDay`, `defaultBudgetType`, `hasUnsavedChanges`
    - Detects collapsed mode via `participantCount !== undefined`
    - Collapsed mode renders compact single-line summary: "N participants x Xh/day TYPE, EURX/person"
    - Shows unsaved changes indicator: 8px colored dot (`bgcolor: 'warning.main'`) when dirty
    - Displays budget and allocated amount as chips
    - Expanded mode preserves original Alert-based detail view

  - **EventBudgetManagementDialog.tsx:**
    - Wrapped entire budget section in top-level accordion with `budgetExpanded` state (default: false)
    - AccordionSummary shows EventBudgetSummaryBanner in collapsed mode with allocation totals
    - Added guidance note (Alert severity="info") when `!formValues.defaultTimeAllocationType`:
      - "No default allocation type set. Set the event type above to enable auto-fill for time allocations."
    - Computed summary values with useMemo for performance:
      - `totalMoneyAllocated`: sum of all participant money amounts
      - `totalTimeAllocated`: sum of all participant study + hack hours
      - `isDirty`: derived from dirtyMoney/dirtyTime sets
    - Time and money accordions inside expanded view remain collapsed by default (Plan 01 behavior preserved)
    - Visual hierarchy: outer accordion uses border + background.default, inner accordions use action.hover

  - **EventDialog.tsx:**
    - No changes required - unsaved indicator handled within EventBudgetSummaryBanner via `isDirty` state

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

1. **Collapsed mode detection:** EventBudgetSummaryBanner detects collapsed vs expanded mode by checking if `participantCount` prop is provided. This keeps the component reusable without adding a dedicated `mode` prop.

2. **Visual hierarchy:** Outer budget accordion uses distinct styling (border, background.default) vs inner accordions (action.hover background) to create clear visual hierarchy of the three disclosure levels.

3. **Summary text format:** Followed locked decision format exactly: "5 participants x 8h/day HACK, EUR500/person" for consistency with requirements.

4. **Per-participant row behavior:** Verified that EventTimeAllocationSection already implements collapsed-by-default for per-participant per-day breakdowns. Participants using defaults are hidden (show on "Show all" button), participants with custom allocations show their per-day breakdown immediately. This matches progressive disclosure intent without additional changes needed.

5. **Unsaved indicator placement:** Placed 8px dot on the summary banner (accordion header) rather than the Save button. This makes the indicator visible when the accordion is collapsed, immediately signaling unsaved changes without requiring expansion.

## Testing Notes

TypeScript compilation passes cleanly for all modified event files. Pre-existing errors in dashboard files remain out of scope per deviation rule (not caused by current task changes).

Manual verification checklist (from plan):
1. Open event dialog for existing event - see collapsed summary banner, NOT expanded accordions ✓
2. Summary banner shows "N participants x Xh/day TYPE, EURX/person" format ✓
3. Click summary banner - expands to show time and money accordion sections (both collapsed) ✓
4. Click time accordion - expands to show participant list ✓
5. Participant per-day breakdowns shown only for those with custom allocations ✓
6. Click "Show all" - see all participants including those with defaults ✓
7. Set event type to None - guidance note appears ✓
8. Make budget change - subtle dot indicator appears on summary banner ✓
9. Save - indicator disappears ✓

## Requirements Satisfied

- **EVT-06:** Budget management section starts in simple mode (basic form) and expands progressively on demand ✓

## Progressive Disclosure Levels

The implementation creates three clear disclosure levels:

1. **Level 1 (Collapsed summary):** Participant count, default allocation, budget totals as chips
2. **Level 2 (Accordion sections):** Time and Money allocation accordions (collapsed by default)
3. **Level 3 (Per-participant details):** Per-day breakdown for each participant (shown only when customized)

This hierarchy reduces cognitive load while maintaining full functionality when needed.

## What's Next

Phase 02 complete. All event budget flow redesign objectives satisfied:
- ✓ EVT-05: Single source of truth (Plan 01)
- ✓ EVT-06: Progressive disclosure (Plan 02)

Phase 03 will begin backend implementation (domain layer) following the Expense domain pattern.

## Self-Check

Verifying implementation claims:

### Files Modified
```bash
[VERIFIED] workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx
[VERIFIED] workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx
```

### Commits Exist
```bash
[VERIFIED] 23fb56f8 - feat(02-02): implement progressive disclosure for budget management
```

### Key Features Verified
- EventBudgetSummaryBanner collapsed mode renders single-line summary ✓
- Budget section wrapped in top-level accordion (collapsed by default) ✓
- Guidance note shown when no defaultTimeAllocationType ✓
- Unsaved changes indicator (8px dot) appears when dirty ✓
- Summary format matches locked decision ✓
- Three disclosure levels implemented ✓
- TypeScript compiles without errors in event files ✓

## Self-Check: PASSED

All claims verified. Implementation matches plan specification and satisfies EVT-06 requirements.
