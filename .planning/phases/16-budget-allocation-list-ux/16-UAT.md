---
status: complete
phase: 16-budget-allocation-list-ux
source: 16-01-SUMMARY.md
started: 2026-04-01T12:00:00Z
updated: 2026-05-22T12:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Admin Event Link Navigation
expected: As an admin user, open the Budget page and find an allocation tied to an event. The event name should be a clickable link. Clicking it navigates to /event?code=<eventCode> with the correct event code in the URL.
result: pass

### 2. Employee View Unchanged
expected: As a non-admin (employee) user, open the Budget page. Event names in allocation list items should appear as plain text, NOT as clickable links.
result: pass

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
