---
status: diagnosed
phase: 02-event-budget-flow-redesign
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-02T12:00:00Z
updated: 2026-03-02T12:05:00Z
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

### 7. Participant add/remove reactivity
expected: Add a new participant to the event. They should appear in the budget sections with default allocations. Remove a participant — they should disappear from the budget sections.
result: issue
reported: "Removing persons from an event doesn't remove them from the money budget, nor is redistribution happening."
severity: major

### 8. Unsaved changes indicator
expected: Make a change to any budget allocation. A small colored dot (warning indicator) should appear on the collapsed summary banner, signaling unsaved changes even when the section is collapsed.
result: pass

### 8a. Allocation type defaults (found during test 8)
expected: Time budget allocation should not appear for events with 'None' time allocation type. Money budget allocation should only default for Flock hack day and Conference type events, not the other two.
result: issue
reported: "Time budget allocation still happens for events with 'None' default time allocation. This should not be the case. Ideally we'd also have similar behaviour when it comes to money budget allocation. This should only occur for Flock hack day and Conference type events (by default), not for the other two."
severity: major

### 9. Unsaved changes warning on close
expected: Make a change to budget allocations, then try to close the EventDialog. A confirmation dialog should appear warning about unsaved changes.
result: pass

### 10. Guidance note for missing allocation type
expected: Set the event's default time allocation type to None/empty. An info alert should appear with guidance about setting the event type.
result: issue
reported: "Info alert does appear. However, the accordion below suggests there are default allocations on the study budget. This should not be the case when allocation type is None."
severity: major

## Summary

total: 12
passed: 8
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Removing a participant from the event should remove them from the money budget and redistribute amounts"
  status: failed
  reason: "User reported: Removing persons from an event doesn't remove them from the money budget, nor is redistribution happening."
  severity: major
  test: 7
  root_cause: "Two competing useEffect hooks in EventBudgetManagementDialog.tsx both fire when participantIds changes; Effect 2 (budget recalculation) reads stale moneyParticipants from closure and overwrites Effect 1's correctly-filtered result, causing removed persons to reappear with no redistribution."
  artifacts:
    - path: "workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx"
      issue: "Effect 1 (line ~74) correctly filters but Effect 2 (line ~140) overwrites with stale data"
  missing:
    - "Merge the two useEffects into a single effect that filters participants AND redistributes budget in one setMoneyParticipants call"
  debug_session: ".planning/debug/event-budget-person-removal.md"

- truth: "Time/money budget allocation sections should only appear for relevant event types (time: only when allocation type is set; money: only for Flock hack day and Conference)"
  status: failed
  reason: "User reported: Time budget allocation still happens for events with 'None' default time allocation. Money budget allocation should only occur for Flock hack day and Conference type events by default, not for the other two."
  severity: major
  test: 8a
  root_cause: "EventBudgetManagementSection renders both time and money accordions unconditionally with zero conditional rendering, and falls back to BudgetAllocationType.STUDY via || operator when defaultTimeAllocationType is null."
  artifacts:
    - path: "workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx"
      issue: "Line ~70: || BudgetAllocationType.STUDY fallback is wrong; lines ~350-419: both accordions rendered unconditionally; formValues interface missing event type field"
    - path: "workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx"
      issue: "Line ~52: another STUDY fallback; banner always shows budget type even when None"
    - path: "workday-application/src/main/react/utils/mappings.ts"
      issue: "Correctly maps GENERAL_EVENT and FLOCK_COMMUNITY_DAY to null (no changes needed)"
  missing:
    - "Add event type to formValues interface"
    - "Wrap time accordion in conditional: only render when defaultTimeAllocationType is non-null"
    - "Wrap money accordion in conditional: only render for FLOCK_HACK_DAY and CONFERENCE event types"
    - "Remove || BudgetAllocationType.STUDY fallback, handle null explicitly"
    - "Update summary banner to not show time info when type is None"
  debug_session: ".planning/debug/budget-section-visibility.md"

- truth: "When allocation type is None, time allocation section should show no default allocations"
  status: failed
  reason: "User reported: Info alert does appear but accordion below suggests there are default allocations on the study budget. This should not be the case when allocation type is None."
  severity: major
  test: 10
  root_cause: "Same root cause as gap 2: || BudgetAllocationType.STUDY fallback on line ~70 of EventBudgetManagementDialog.tsx causes null/None allocation type to resolve to STUDY, and the time accordion renders unconditionally showing STUDY defaults."
  artifacts:
    - path: "workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx"
      issue: "STUDY fallback + unconditional time accordion rendering"
  missing:
    - "Same fix as gap 2 — conditional rendering and removing STUDY fallback will resolve this"
  debug_session: ".planning/debug/budget-section-visibility.md"
