---
status: complete
phase: 08-contract-form-dev-data
source: [08-01-SUMMARY.md]
started: 2026-03-31T12:00:00Z
updated: 2026-04-01T12:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. StudyHours Field on Contract Form
expected: Open an internal contract form (create new or edit existing). You should see a "Study Hours" number input field alongside the existing hack hours field. The field accepts numeric input.
result: pass

### 2. StudyMoney Field on Contract Form
expected: Open an internal contract form (create new or edit existing). You should see a "Study Money" number input field. The field accepts numeric input.
result: pass

### 3. Contract Seed Data has Budget Values
expected: Open a seeded internal contract (e.g. for Person A). The studyHours field should show 200 (or 100 for a secondary contract) and studyMoney should show 5000 (or 2500). These values are pre-populated from dev seed data.
result: pass

### 4. Budget Allocation Dev Data Loaded
expected: Navigate to the budget allocation list. Verify dev data follows business rules: StudyMoney is standalone (books, courses, tools), StudyTime/HackTime are event-linked (compensated time). Multiple persons across multiple years.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
