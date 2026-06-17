---
phase: 14
slug: event-dialog-bug-fix
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 14 — Validation Strategy

## Test Infrastructure

- Framework: Jest + @testing-library/react
- Config: `jest.config.cjs` (root)
- Runner: `npm test -- --testPathPattern EventBudgetManagementDialog`
- Environment: jsdom

## Per-Task Verification Map

| Task ID | Requirement | Type | Command | Status |
|---------|-------------|------|---------|--------|
| 14-01-01 | useCallback wrap in EventDialog.tsx | manual-only | n/a — code eliminated by architectural redesign | SKIP (justified) |
| 14-01-02 | onBudgetStateChange excluded from useEffect dep array | unit | `npm test -- --testPathPattern EventBudgetManagementDialog` | green |

## Manual-Only Verifications

**14-01-01 — useCallback / EventDialog.tsx**

The original bug's root cause (handleBudgetStateChange as an unstable function reference passed to EventBudgetManagementSection) was eliminated by a subsequent architectural redesign. The EventDialog.tsx file no longer contains `handleBudgetStateChange` as a prop-passing function. Commit 7f111eb9 applied the useCallback fix; later commits refactored the component such that the prop pathway no longer exists in the current form.

No automated test is possible or meaningful for a code path that has been removed.

## Test File

`workday-application/src/main/react/features/event/EventBudgetManagementDialog.test.tsx`

Covers two behaviors:
1. **Dep array stability (adversarial):** Replacing the `onBudgetStateChange` callback reference via `rerender` does NOT trigger an additional effect call. This test would fail if `onBudgetStateChange` were reintroduced to the `[moneyParticipants, timeParticipants, isDirty]` dep array.
2. **Sanity check:** The effect DOES fire when `moneyParticipants` changes (participant added), confirming the effect is live and the dep array is not broken in the other direction.

## Validation Sign-Off

- 14-01-02: FILLED — behavioral test passes, dep array stability confirmed
- 14-01-01: SKIP (justified) — original bug's code path eliminated by later refactor; no test surface exists
- nyquist_compliant: true — all testable gaps have passing tests; manual-only gap is explicitly justified
