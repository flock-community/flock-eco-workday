---
phase: 15
plan: "02"
subsystem: event-budget
tags: [gap-closure, event-type-gating, money-allocations, budget-banner]
dependency_graph:
  requires: [15-01]
  provides: [money-allocation-event-type-gate, banner-event-type-gate]
  affects: [EventBudgetManagementSection, EventBudgetSummaryBanner, eventBudgetTransformers]
tech_stack:
  added: []
  patterns: [event-type-mapping-lookup, optional-prop-backwards-compat]
key_files:
  created: []
  modified:
    - workday-application/src/main/react/features/event/eventBudgetTransformers.ts
    - workday-application/src/main/react/features/event/eventBudgetTransformers.test.ts
    - workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx
    - workday-application/src/main/react/features/event/EventBudgetSummaryBanner.test.tsx
    - workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx
decisions:
  - eventType param on generateDefaultAllocations is required (not optional) to force type-system enforcement at all call sites
  - eventType prop on EventBudgetSummaryBanner is optional (undefined = money-eligible) for backwards compatibility with 11 existing tests
  - Used EventTypeMappingToDefaultBudgetType as single source of truth; null value signals non-money event type
metrics:
  duration: "~15 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  files_changed: 5
---

# Phase 15 Plan 02: Gap Closure - Event Type Gate for Money Allocations Summary

Gate money allocations and the collapsed-mode budget banner on event type, preventing money UI from showing for GENERAL_EVENT and FLOCK_COMMUNITY_DAY.

## What Was Built

### Task 1 - `generateDefaultAllocations` event type gate

Added required `eventType: EventType` as the last parameter. Uses `EventTypeMappingToDefaultBudgetType[eventType] !== null` to determine money eligibility. When not eligible, returns `moneyParticipants: []` immediately after building `timeParticipants`, skipping the per-person money loop entirely.

Also imported `EventTypeMappingToDefaultBudgetType` into the transformer (was already defined in `mappings.ts`; just needed import).

All 7 existing `generateDefaultAllocations` test calls updated to pass an `eventType` argument. 2 new gap-closure tests added:
- `gap closure: GENERAL_EVENT produces empty moneyParticipants regardless of budget`
- `gap closure: FLOCK_COMMUNITY_DAY produces empty moneyParticipants regardless of budget`

### Task 2 - `EventBudgetSummaryBanner` event type prop

Added optional `eventType?: EventType` to `EventBudgetSummaryBannerProps`. In collapsed mode, replaced:
```
const hasMoneySection = hasBudget;
```
with:
```
const isMoneyEligibleType = eventType === undefined ? true : EventTypeMappingToDefaultBudgetType[eventType] !== null;
const hasMoneySection = hasBudget && isMoneyEligibleType;
```

This gates both the money summary text and the Budget/Allocated chips. When `eventType` is undefined (backwards compat), defaults to money-eligible.

Wired `eventType={formValues.type as EventType}` to the `<EventBudgetSummaryBanner>` callsite in `EventBudgetManagementDialog.tsx` (the management section component, line ~425).

4 new tests added (Tests A-D):
- Test A: GENERAL_EVENT hides money chips even when totalBudget > 0
- Test B: FLOCK_COMMUNITY_DAY hides money chips even when totalBudget > 0
- Test C: FLOCK_HACK_DAY shows money chips when totalBudget > 0
- Test D: CONFERENCE shows money chips when totalBudget > 0

## Deviations from Plan

None - plan executed exactly as written.

Note: 2 pre-existing test failures existed in `EventBudgetSummaryBanner.test.tsx` before this plan (verified via `git stash`). These are not regressions:
- "shows participant count and allocation summary when participantCount is provided" - expects `/500\/person/` but component renders `€400/person` (1200/3=400, test data is wrong)
- "shows only money info when defaultBudgetType is null but budget exists" - same pattern

## Known Stubs

None.

## Threat Flags

None - no new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- `eventBudgetTransformers.ts` exists and has eventType param: FOUND
- `EventBudgetSummaryBanner.tsx` has eventType prop: FOUND
- `EventBudgetManagementDialog.tsx` has eventType wired: FOUND
- Commit 57650ce5 exists: FOUND
- Test results: 33/33 transformer tests pass, 13/15 banner tests pass (2 pre-existing failures, 4 new tests all pass)
