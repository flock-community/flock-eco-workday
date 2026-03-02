---
status: diagnosed
trigger: "Time budget allocation still shows for events with 'None' default time allocation type; money budget should only appear by default for hack day and conference; defaults shown when type is None"
created: 2026-03-02T00:00:00Z
updated: 2026-03-02T00:00:00Z
---

## Current Focus

hypothesis: EventBudgetManagementDialog renders both time and money sub-sections unconditionally, with no logic to hide them based on event type or defaultTimeAllocationType
test: Read all rendering code in EventBudgetManagementDialog.tsx for conditional rendering
expecting: No conditional rendering found for the time/money accordion sections
next_action: Document root cause and missing conditional logic

## Symptoms

expected: Time budget section hidden when defaultTimeAllocationType is None/null; Money budget section only visible by default for FLOCK_HACK_DAY and CONFERENCE event types; No study budget defaults shown when type is None
actual: Both time and money sections always render; accordion summary shows "X using defaults (8h/day STUDY)" even when type is None; banner shows "STUDY" as fallback
errors: No runtime errors - purely a missing conditional rendering issue
reproduction: Select any event type that maps to null (GENERAL_EVENT, FLOCK_COMMUNITY_DAY), observe both sections visible
started: Since initial implementation of EventBudgetManagementDialog

## Eliminated

(none - root cause found on first investigation)

## Evidence

- timestamp: 2026-03-02T00:01:00Z
  checked: EventTypeMappingToDefaultBudgetType in mappings.ts
  found: GENERAL_EVENT -> null, FLOCK_HACK_DAY -> HACK, FLOCK_COMMUNITY_DAY -> null, CONFERENCE -> STUDY
  implication: Only FLOCK_HACK_DAY and CONFERENCE have non-null time allocation types

- timestamp: 2026-03-02T00:02:00Z
  checked: EventBudgetManagementDialog.tsx lines 350-420 (time and money accordion rendering)
  found: Both time and money accordions are rendered unconditionally - no conditional check on formValues.defaultTimeAllocationType or event type
  implication: This is the primary bug - no visibility gating exists

- timestamp: 2026-03-02T00:03:00Z
  checked: EventBudgetManagementDialog.tsx line 70 (defaultBudgetType derivation)
  found: `const defaultBudgetType = (formValues.defaultTimeAllocationType as BudgetAllocationType) || BudgetAllocationType.STUDY;`
  implication: When defaultTimeAllocationType is null/empty, it FALLS BACK to STUDY. This means the summary text will show "using defaults (8h/day study)" even when the user explicitly chose "None"

- timestamp: 2026-03-02T00:04:00Z
  checked: EventBudgetManagementDialog.tsx lines 203-226 (getTimeSummary)
  found: Summary always uses defaultBudgetType which is STUDY when null. Shows "X using defaults (8h/day study)" regardless
  implication: Accordion summary is misleading when defaultTimeAllocationType is None

- timestamp: 2026-03-02T00:05:00Z
  checked: EventBudgetSummaryBanner.tsx line 52
  found: `const budgetTypeDisplay = defaultBudgetType || 'STUDY';` - another STUDY fallback
  implication: Collapsed banner also falls back to STUDY when type is None

- timestamp: 2026-03-02T00:06:00Z
  checked: EventBudgetManagementDialog.tsx lines 342-348 (the only conditional)
  found: There IS an Alert that shows when !formValues.defaultTimeAllocationType, but it only shows an info message - it does NOT hide the time section
  implication: The info alert acknowledges the issue conceptually but doesn't suppress the section

- timestamp: 2026-03-02T00:07:00Z
  checked: EventDialog.tsx lines 178-190 (where EventBudgetManagementSection is used)
  found: No event-type-based conditional rendering at the caller level either; formValues are passed through but no filtering
  implication: Conditional logic needs to be added at the EventBudgetManagementSection level

- timestamp: 2026-03-02T00:08:00Z
  checked: EventBudgetManagementDialog.tsx - formValues interface
  found: formValues does NOT include the event `type` field - only has `defaultTimeAllocationType`
  implication: Money section visibility (which should depend on event type) cannot be determined because event type is not passed through

## Resolution

root_cause: EventBudgetManagementSection renders both time and money accordion sub-sections unconditionally with no visibility gating based on defaultTimeAllocationType or event type, and uses a hardcoded STUDY fallback when the allocation type is None/null.
fix: (not applied - diagnosis only)
verification: (not applied)
files_changed: []
