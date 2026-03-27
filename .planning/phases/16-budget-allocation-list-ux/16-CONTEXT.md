# Phase 16: Budget Allocation List UX - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the budget allocation list scannable and navigable — event names shown, admin can click through to events, and type filters reduce noise. Frontend-only changes to allocation list display.

</domain>

<decisions>
## Implementation Decisions

### Event Name Display (LIST-01)
- **D-01:** Already implemented — `BudgetAllocationFeature` resolves event names via `EventClient.get()` into `eventNameMap`, passed to `EventAllocationListItem` which displays `eventName` prop. No changes needed.

### Admin Event Click-Through (LIST-02)
- **D-02:** Add `?code=XYZ` query param to the admin event link in `EventAllocationListItem`. Change the href from `/event` to `/event?code={eventCode}`. The receiving side (`EventFeature`) does NOT need to consume this param yet — that's tracked in GitHub issue #458 (URL state management for deep linking across pages).
- **D-03:** Employee view remains plain non-clickable text (already implemented via `isAdmin` check in `EventAllocationListItem`).

### Filter Chips (LIST-03)
- **D-04:** Already implemented — `BudgetAllocationFeature` renders All/Hack Hours/Study Hours/Study Money chips with toggle behavior. No changes needed.

### Claude's Discretion
- Whether to add any visual polish to the existing implementations while touching these files

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — LIST-01, LIST-02, LIST-03 requirement definitions

### Related issues
- GitHub issue #458 — URL state management for deep linking across pages (EventFeature consuming `?code=` param is deferred to this issue)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EventAllocationListItem` (`workday-application/src/main/react/features/budget/EventAllocationListItem.tsx`) — Already has admin Link with OpenInNew icon; just needs href fix
- `BudgetAllocationFeature` (`workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx`) — Already has eventNameMap resolution and filter chips
- `BudgetAllocationList` (`workday-application/src/main/react/features/budget/BudgetAllocationList.tsx`) — Already groups by event, applies type/event filters

### Established Patterns
- URL state: `useQueryParams` hook in `BudgetAllocationFeature` manages `?year=` and `?eventCode=` params
- Event name resolution: `EventClient.get(code)` returns event with `description` field used as display name
- Admin vs employee: `isAdmin` prop controls Link vs plain text rendering

### Integration Points
- `EventAllocationListItem:148` — The admin Link href that needs updating from `/event` to `/event?code={eventCode}`
- `EventFeature` — Currently uses local state only (`useState` for code/open). Deep link consumption deferred to #458.

</code_context>

<specifics>
## Specific Ideas

- User wants the link to include the query param now (`/event?code=XYZ`) even though EventFeature doesn't consume it yet — this prepares for #458 deep linking work.

</specifics>

<deferred>
## Deferred Ideas

- EventFeature consuming `?code=` query param to auto-open event dialog — tracked in GitHub #458

</deferred>

---

*Phase: 16-budget-allocation-list-ux*
*Context gathered: 2026-03-27*
