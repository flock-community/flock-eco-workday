---
status: complete
phase: 15-event-allocation-persistence
source: [15-01-SUMMARY.md]
started: 2026-05-27T00:00:00Z
updated: 2026-05-27T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Auto-Create Time Allocations on Save
expected: Create a new event with at least 2 participants and a default time allocation type (e.g. Hack Day). Save without clicking "Customize". Navigate to each participant's Budget Allocation tab. Time allocations for the event should already be present — no manual Customize step required.
result: skipped
reason: Feature was removed at a later stage — time allocations on event creation no longer exist

### 2. Allocation Type Persists on Reopen
expected: Reopen an event that was saved with a default time allocation type (e.g. Hack Day). The same type should still be selected in the dialog — not reset to a blank or different default.
result: pass
note: Allocations display as "custom allocations" rather than showing as event default — cosmetic, tracked in phase 14 gaps

### 3. Auto-Create Money Allocations on Save
expected: Create or edit an event with a money budget (e.g. €600) and at least 2 participants. Save. Navigate to each participant's Budget Allocation tab. A study money allocation should appear with an equal share (e.g. €300 each for 2 participants). The shares should sum to the total budget.
result: issue
reported: "Study money allocations appear or not depending on event type, but the condition is wrong. Expected: Flock Hack Day and Conference → study money allocations created; General Event and Flock Community Day → no study money allocations. Additionally, budget/allocated pills are always shown in the event form even when no money allocations exist for that event type."
severity: major

### 4. Type Change Syncs Allocations
expected: Open an existing event that has time allocations. Change the default allocation type (e.g. from Hack Day to Conference/Study). Save. Navigate to a participant's Budget Allocation tab. The allocation should now reflect the new type, not the old one.
result: pass

### 5. Budget Change Recalculates Shares
expected: Open an existing event that has money allocations with participants. Change the total money budget (e.g. from €600 to €900). Save. Navigate to a participant's Budget Allocation tab. The study money allocation should show the recalculated equal share (e.g. €450 for 2 participants).
result: pass

## Summary

total: 5
passed: 3
issues: 1
pending: 0
skipped: 1
blocked: 0

## Gaps

- truth: "Study money allocations are created only for Flock Hack Day and Conference event types; General Event and Flock Community Day produce no money allocations"
  status: resolved
  reason: "User reported: money allocation creation condition is wrong — wrong event types get allocations or don't get them"
  severity: major
  test: 3
  root_cause: "generateDefaultAllocations in eventBudgetTransformers.ts (lines 345-349) unconditionally creates moneyParticipants for all event types. It lacks an eventType parameter; EventTypeMappingToDefaultBudgetType in mappings.ts already encodes null for GENERAL_EVENT and FLOCK_COMMUNITY_DAY but is not consulted here."
  resolution: "Fixed in commit 57650ce5 — generateDefaultAllocations now accepts eventType and returns empty moneyParticipants when EventTypeMappingToDefaultBudgetType[eventType] is null"
  artifacts:
    - path: "workday-application/src/main/react/features/event/eventBudgetTransformers.ts"
      issue: "generateDefaultAllocations always generates moneyParticipants regardless of event type"
  missing:
    - "Pass eventType into generateDefaultAllocations and return empty moneyParticipants when EventTypeMappingToDefaultBudgetType[eventType] is null"
  debug_session: ""

- truth: "Budget/allocated summary pills in the event form are only shown when the event type supports money allocations"
  status: resolved
  reason: "User reported: budget/allocated pills are always visible in the event form even for event types that should have no money allocations"
  severity: minor
  test: 3
  root_cause: "EventBudgetSummaryBanner.tsx line 56 sets hasMoneySection = hasBudget without checking event type. EventBudgetManagementDialog.tsx already has a correct showMoneySection guard (type === FLOCK_HACK_DAY || CONFERENCE) but the banner doesn't use it."
  resolution: "Fixed in commit 57650ce5 — EventBudgetSummaryBanner now has isMoneyEligibleType guard gating hasMoneySection"
  artifacts:
    - path: "workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx"
      issue: "hasMoneySection = hasBudget on line 56 ignores event type"
  missing:
    - "Pass eventType prop to EventBudgetSummaryBanner and gate hasMoneySection on type being FLOCK_HACK_DAY or CONFERENCE"
  debug_session: ""
