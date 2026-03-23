# Phase 14: Event Dialog Bug Fix - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the `Maximum update depth exceeded` infinite render loop in the EventDialog. The event dialog must be stable: open, modify, and save events multiple times in a session without React errors or freezing.

</domain>

<decisions>
## Implementation Decisions

### Root Cause
- The infinite loop is caused by `handleBudgetStateChange` in EventDialog.tsx (lines 179-206) not being wrapped in `useCallback`, creating a new function reference on every render
- EventBudgetManagementSection.tsx (lines 263-269) has `onBudgetStateChange` in its `useEffect` dependency array, which triggers re-execution when the parent re-renders
- This creates a cascade: effect fires → calls parent callback → parent re-renders → new callback ref → effect fires again

### Fix Strategy
- Wrap `handleBudgetStateChange` in `useCallback` with stable dependencies (use refs for values that change frequently)
- Remove `onBudgetStateChange` from the useEffect dependency array in EventBudgetManagementSection (ESLint rule can be suppressed for this case — the callback is stable by convention)
- Consider separating the large participant sync effect (lines 104-225) into smaller, targeted effects to reduce render pressure

### Claude's Discretion
- Exact dependency arrays for useCallback
- Whether to use `useRef` pattern for callback stability or direct `useCallback`
- Whether to split the participant sync effect or just stabilize the callback

</decisions>

<canonical_refs>
## Canonical References

### Files to fix
- `workday-application/src/main/react/features/event/EventDialog.tsx` — handleBudgetStateChange (line 179-206), onBudgetStateChange prop (line 252)
- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx` — onBudgetStateChange effect (line 263-269), participant sync effect (line 104-225)

### Related files (read but likely no changes needed)
- `workday-application/src/main/react/features/event/EventTimeAllocationSection.tsx` — child of budget management
- `workday-application/src/main/react/features/event/EventForm.tsx` — sibling component in dialog

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `budgetsDirtyRef` pattern already exists in EventDialog.tsx (added in v1.1 Phase 12 fix) — useRef for tracking state without triggering re-renders
- `participantBudgetsRef` / `loadedAllocationsRef` pattern already used for avoiding stale closures in Formik's onSubmit

### Established Patterns
- React refs used throughout for reading latest state in async callbacks
- Formik for form state management
- MUI components for UI

### Integration Points
- The fix must not break the budget allocation save flow (the `budgetsDirtyRef` guard from the Phase 12 fix must remain intact)
- Event-linked tests in `tests/event-workflow.spec.ts` should still pass after the fix

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard React performance fix using useCallback/useRef patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-event-dialog-bug-fix*
*Context gathered: 2026-03-23*
