# Phase 6: Budget Tab Integration - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the person-centric Budget Allocation tab (currently using mock data from Phase 1 prototype) to the real REST API from Phase 5. Users see real budget data; admins can manage standalone StudyMoney allocations. Requirements: TAB-01, TAB-02, TAB-03, TAB-04, TAB-05.

</domain>

<decisions>
## Implementation Decisions

### Mock-to-API Migration Strategy
- Create a `BudgetAllocationClient` in `clients/` directory following ExpenseClient pattern, wrapping wirespec-generated endpoint types
- Delete mock types (`mocks/BudgetAllocationTypes.ts`) and mock data (`mocks/BudgetAllocationMocks.ts`) entirely — replace all imports with wirespec-generated types from `wirespec/model/`
- Delete `BudgetAllocationDemo.tsx` — it served its prototype purpose

### Budget Calculation Approach
- New server-side budget summary endpoint: `GET /api/budget-summary?personId=X&year=Y`
- Returns single response with all three budget types: `{ hackHours: {budget, used, available}, studyHours: {budget, used, available}, studyMoney: {budget, used, available} }`
- Backend joins contract data (budget limits) with allocation sums (used amounts), calculates available
- Same ownership/access pattern as allocations: non-admin auto-scoped to own data, admin can query any person
- Requires new wirespec contract, controller endpoint, and service method
- Reusable for future dashboard (DASH-01, DASH-02 in v2)

### Admin Person-Switching UX
- Reuse existing `PersonSelector` dropdown component for admin person selection
- All users can access the Budget tab and view their own budget data
- Non-admin users: no person selector shown, auto-scoped to own data
- Admin users: PersonSelector + year selector shown at top of tab
- Budget tab is a new top-level route (not a tab within person detail page)

### StudyMoney CRUD from Tab
- Reuse existing `StudyMoneyAllocationDialog.tsx` from Phase 1 prototype, wired to real API via BudgetAllocationClient
- Only StudyMoney allocations can be created/edited/deleted from the Budget tab (TAB-03)
- HackTime and StudyTime allocations shown read-only with event links (managed via Event dialog in Phase 7)
- File attachments: reuse `DropzoneAreaField` component with `/api/budget-allocations/files` endpoint, same pattern as expenses
- Delete requires confirmation dialog (reuse ConfirmDialog from @workday-core)

### Claude's Discretion
- Loading and error state UX (skeleton cards, spinners, etc.)
- URL state management (whether person/year selection reflects in URL query params)
- Exact layout and spacing of person selector + year selector toolbar
- Error handling patterns (toast notifications, inline errors, etc.)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PersonSelector` (`components/selector/PersonSelector.tsx`): Dropdown for selecting persons, used in EventForm and other features
- `StudyMoneyAllocationDialog.tsx` (`features/budget/`): Existing dialog from Phase 1 prototype — wire to real API
- `BudgetAllocationFeature.tsx` (`features/budget/`): Main tab component — refactor to use BudgetAllocationClient instead of mocks
- `BudgetSummaryCards.tsx` (`features/budget/`): Summary card components — wire to budget summary endpoint
- `BudgetAllocationList.tsx` (`features/budget/`): Allocation list — wire to allocation query endpoint
- `BudgetCard.tsx` (`features/budget/`): Individual budget card component
- `EventAllocationListItem.tsx` (`features/budget/`): List item for event-linked allocations
- `StudyMoneyAllocationListItem.tsx` (`features/budget/`): List item for study money allocations
- `DropzoneAreaField` (from expenses): File upload field component
- `ConfirmDialog` (`@workday-core`): Confirmation dialog for delete operations
- `ExpenseClient.ts` (`clients/`): Reference pattern for BudgetAllocationClient

### Established Patterns
- Client classes in `clients/` directory wrapping fetch calls (ExpenseClient, EventClient, etc.)
- Wirespec-generated types in `wirespec/model/` and `wirespec/endpoint/`
- Formik + Yup for form state management in dialogs
- MUI components throughout the app
- File upload via DropzoneAreaField + dedicated file endpoints

### Integration Points
- Wirespec endpoint types: `BudgetAllocationAll`, `BudgetAllocationDeleteById`, `HackTimeAllocationCreate`, `StudyMoneyAllocationCreate`, etc. (all generated in `wirespec/endpoint/`)
- Wirespec model types: `BudgetAllocation`, `BudgetAllocationType`, `StudyMoneyAllocationInput`, etc. (in `wirespec/model/`)
- Backend API: `GET /api/budget-allocations`, `POST /api/budget-allocations/study-money`, `DELETE /api/budget-allocations/{id}`, file endpoints
- New budget summary endpoint needs wirespec contract + backend implementation
- App routing: new top-level route for Budget tab

</code_context>

<specifics>
## Specific Ideas

- Budget summary endpoint designed to be reusable for v2 dashboard (DASH-01 horizontal stacked bar charts)
- BudgetAllocationClient should use wirespec-generated endpoint types internally (not raw fetch)
- Non-admin users seeing their own budget data is important for transparency — employees should be able to check their own budget usage

</specifics>

<deferred>
## Deferred Ideas

- Dashboard with stacked bar charts (DASH-01, DASH-02) — v2 requirement, but budget summary endpoint built in Phase 6 enables it
- HackTime/StudyTime CRUD from Budget tab — managed through Event dialog in Phase 7
- Budget utilization warnings (ENH-03) — v2 enhancement

</deferred>

---

*Phase: 06-budget-tab-integration*
*Context gathered: 2026-03-06*
