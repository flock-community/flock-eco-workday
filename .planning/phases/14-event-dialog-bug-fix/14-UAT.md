---
status: complete
phase: 14-event-dialog-bug-fix
source: [14-01-SUMMARY.md]
started: 2026-05-27T00:00:00Z
updated: 2026-05-27T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. EventDialog Save Without Infinite Loop
expected: Open an event that has budget allocations (or create one with participants and a time allocation type). Open the event dialog, make any change, and save. No "Maximum update depth exceeded" error appears in the browser console. The dialog closes normally after save.
result: issue
reported: "No maximum update depth exceeded error, but console shows: In HTML, <form> cannot be a descendant of <form>. Stack trace shows EventDialog.tsx:136 renders a Formik <Form> and EventForm.tsx:54 renders another <Form id='event-form'> inside EventFormFields, creating nested forms."
severity: major

### 2. Multiple Open/Save Cycles
expected: Open the event dialog, modify it, and save. Repeat this at least 2 more times (open → modify → save). The dialog should remain stable throughout — no browser freeze, no React error overlay ("Something went wrong"), and the page continues to function normally.
result: pass

## Summary

total: 2
passed: 1
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Opening the event dialog produces no console errors — no Maximum update depth exceeded and no nested form warnings"
  status: failed
  reason: "User reported: console shows '<form> cannot be a descendant of <form>' — EventDialog.tsx:136 renders Formik <Form> and EventForm.tsx:54 renders another <Form id=event-form> inside EventFormFields"
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Time allocations that match the event's default type are labelled as the default, not as 'custom'"
  status: failed
  reason: "User reported: every time allocation shows as custom — allocations matching the event's default type should be distinguished visually from overridden/custom ones"
  severity: cosmetic
  test: 2
  deferred: true
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
