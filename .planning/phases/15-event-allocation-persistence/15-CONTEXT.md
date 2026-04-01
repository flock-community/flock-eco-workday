# Phase 15: Event Allocation Persistence - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Auto-create and sync budget allocations for all participants on event save. No "Customize" step required — saving an event with participants and a default allocation type should create time and money allocations automatically.

</domain>

<decisions>
## Implementation Decisions

### Root Cause
- For NEW events: `EventBudgetManagementSection` is gated by `code && eventData` (line 243 of EventDialog.tsx), so it never renders. `participantBudgetsRef.current` stays `[]`, and the `budgetsDirtyRef` guard prevents any allocation processing.
- For EXISTING events: Even though the budget section renders, `budgetsDirtyRef.current` only becomes true when users manually edit budget values. Just changing the event type or budget amount doesn't trigger allocation saves.

### Fix Strategy
- Add a `generateDefaultAllocations()` helper in `eventBudgetTransformers.ts` that synthesizes default time and money allocations from form values
- Modify `handleSubmit` in `EventDialog.tsx`: when `budgetsDirtyRef.current` is false but participants exist, generate defaults and diff against loaded allocations
- This handles: new events (empty loaded → pure creates), type changes (diff detects type switch), budget changes (diff detects amount changes)

### Claude's Discretion
- Exact signature and return type of `generateDefaultAllocations`
- Whether to refactor handleSubmit allocation logic into a separate function for clarity
- How to handle the case where defaultTimeAllocationType is null (no time allocations)

</decisions>

<canonical_refs>
## Canonical References

### Files to modify
- `workday-application/src/main/react/features/event/EventDialog.tsx` — handleSubmit (lines 94-152): remove/loosen budgetsDirtyRef guard, add default allocation generation
- `workday-application/src/main/react/features/event/eventBudgetTransformers.ts` — add generateDefaultAllocations helper

### Files to read (no changes expected)
- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx` — understand participant sync and dirty tracking
- `workday-application/src/main/react/clients/BudgetAllocationClient.ts` — API for creating allocations
- `workday-application/src/main/react/clients/EventClient.ts` — event save API

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `diffAllocations()` already computes create/update/delete from loaded vs current state
- `periodToDailyAllocations()` converts Period to daily items
- `eventBudgetTypeToDailyType()` maps HACK/STUDY to daily allocation type
- `BudgetAllocationClient` has all CRUD methods for hack time, study time, study money

### Key Data Flow
- `formValues.days[]` contains hours per day (positional array, index 0 = from date)
- `formValues.defaultTimeAllocationType` is 'HACK' or 'STUDY' or null
- `formValues.budget` is total money budget
- `formValues.personIds` lists participant UUIDs
- `diffAllocations` expects `PersonTimeAllocation[]` and `PersonMoneyAllocation[]`

### Integration Points
- Must preserve the existing `budgetsDirtyRef` flow for manual customizations
- Must work for both create (no code) and update (has code) flows
- Backend needs no changes — all allocation management is frontend-driven via BudgetAllocationClient

</code_context>

---

*Phase: 15-event-allocation-persistence*
*Context gathered: 2026-03-23*
