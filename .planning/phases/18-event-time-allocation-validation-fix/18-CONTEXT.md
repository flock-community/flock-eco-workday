# Phase 18 — Event Time Allocation Validation Fix

## Problem

When an event spans multiple days with **non-uniform hours** (e.g., day 1 = 8h, day 2 = 4h), opening the event detail dialog shows spurious validation errors in the Time Budget Allocations section:

> 22 May 2026: Total hours (8h) exceeds event hours (6h)

The allocations themselves are correct (they match what was entered on creation). The error is a false positive caused by a wrong comparison value.

## Root Cause

`EventBudgetManagementDialog.tsx` computed a single scalar `defaultHoursPerDay` as the **average** of all event days (`totalHours / eventDays`). For a [8h, 4h] event this yields 6h.

`EventTimeAllocationSection.tsx:183` (before fix) compared each day's allocation against that averaged scalar:

```ts
if (totalDayHours > defaultHoursPerDay) { // BUG: 6h ≠ day-specific cap
```

For day 1 (actual cap = 8h, average = 6h): `8 > 6` → false validation error.

The same scalar was also used as the seed when clicking "Customize" (producing [6h, 6h] instead of [8h, 4h]) and as the default-total fallback in `getTotalHours`.

## Scope

- StudyTime and HackTime are both affected (same code path).
- StudyMoney is unaffected (no per-day cap).
- Backend `EventService.syncBudgetAllocations` is unaffected — persisted allocations are correct.

## Fix

Introduced `eventDayHours: number[]` (one entry per event day, derived from `formValues.days`) and propagated it into `EventTimeAllocationSection`. The validation, seed, and totals now use the per-day value at `eventDayHours[index]`.

## Files changed

- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx`
- `workday-application/src/main/react/features/event/EventTimeAllocationSection.tsx`
