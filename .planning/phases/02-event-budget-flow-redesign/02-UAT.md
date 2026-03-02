---
status: resolved
phase: 02-event-budget-flow-redesign
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md]
started: 2026-03-02T12:00:00Z
updated: 2026-03-02T12:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Budget section visibility
expected: Open EventDialog for an existing event — budget section appears below form fields. Open EventDialog for a new event — budget section does NOT appear.
result: pass

### 2. Progressive disclosure default state
expected: When opening an existing event, the budget section is collapsed by default showing only a summary banner. You should NOT see expanded accordion sections with participant details right away.
result: pass

### 3. Summary banner content
expected: The collapsed summary banner shows a compact one-liner like "N participants x Xh/day TYPE, EURX/person" with budget and allocated amount as chips.
result: pass

### 4. Three-level progressive disclosure
expected: Click the summary banner — it expands to show Time and Money accordion sections (both collapsed). Click the Time accordion — it expands to show the participant list. Participants with custom allocations show per-day breakdowns; others are hidden behind a "Show all" button.
result: pass

### 5. Reactive budget recalculation
expected: Change the event budget field value. Untouched participant money allocations should immediately recalculate to reflect the new total. Previously manually-edited participant amounts should remain unchanged.
result: pass

### 6. Reactive time type change
expected: Change the default time allocation type (event type). Untouched participant time allocations should update to the new type. Manually-edited participant time allocations should be preserved.
result: pass

### 7. Participant add/remove reactivity (retest)
expected: Remove a participant — they disappear from money budget and budget redistributes among remaining untouched participants. Add a participant — they appear with default allocations.
result: pass (retest after Option C fix — no auto-redistribution, allocated vs total indicator added)

### 8. Unsaved changes indicator
expected: Make a change to any budget allocation. A small colored dot (warning indicator) should appear on the collapsed summary banner, signaling unsaved changes even when the section is collapsed.
result: pass

### 8a. Conditional section visibility (retest)
expected: For a GENERAL_EVENT or FLOCK_COMMUNITY_DAY event, the time and money allocation sections should NOT appear. For a FLOCK_HACK_DAY or CONFERENCE event, both sections should appear.
result: pass

### 9. Unsaved changes warning on close
expected: Make a change to budget allocations, then try to close the EventDialog. A confirmation dialog should appear warning about unsaved changes.
result: pass

### 10. No STUDY defaults when type is None (retest)
expected: Set the event's default time allocation type to None/empty. The time allocation section should be hidden entirely — no accordion, no STUDY defaults. The summary banner should not mention STUDY.
result: pass

## Summary

total: 12
passed: 11
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "Money budget should not auto-redistribute on participant changes. Show allocated vs total indicator instead, let admin adjust manually."
  status: failed
  reason: "User reported: Redistribution doesn't respect dirty tracking. Simplify to no auto-redistribution (Option C). Remove person's allocation disappears, show budget gap, admin adjusts."
  severity: minor
  test: 7
  root_cause: "Current redistribution logic splits total among untouched participants, ignoring locked amounts. Design decision: remove auto-redistribution entirely for money allocations."
  artifacts:
    - path: "workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx"
      issue: "Remove redistribution logic from merged useEffect, add allocated vs total indicator"
  missing:
    - "Remove money redistribution logic — when participant removed, just remove their allocation"
    - "Remove money redistribution on budget total change — keep existing per-person amounts"
    - "Add 'EUR X allocated / EUR Y total' indicator to money section header or summary banner"
  debug_session: ""

- truth: "Time/money budget allocation sections should only appear for relevant event types"
  status: resolved
  reason: "Fixed in plan 02-03"
  severity: major
  test: 8a

- truth: "When allocation type is None, time allocation section should show no default allocations"
  status: resolved
  reason: "Fixed in plan 02-03"
  severity: major
  test: 10
