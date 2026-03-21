# Phase 10: Budget Management Admin Tests - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Playwright e2e tests proving admin can manage budget allocations through the Budget Allocation tab — view summary cards, create standalone study money allocations, edit existing allocations (all three types), and delete allocations. No new application code; test-only phase.

</domain>

<decisions>
## Implementation Decisions

### Test structure
- Single spec file: `tests/budget-admin.spec.ts`
- Describe blocks aligned to operations: view summary, create, edit, delete
- Covers all 4 success criteria from ROADMAP.md (BMGT-01 through BMGT-06)

### Test helpers
- New file: `tests/steps/budgetSteps.ts` (separate from workdaySteps.ts)
- BDD-style helpers following existing convention (e.g., `Given_I_am_on_budget_tab`, `Then_summary_card_shows`)
- Designed for reuse across phases 10, 11, 12

### Test data
- Rely on existing dev data from `-Pdevelop` mock data loader (H2 in-memory database)
- Target person: `pino@sesam.straat` — admin (bert) acts, pino is acted upon
- No cleanup after write tests — tests assume fresh dev data on each server start
- Document assumption in test file comment: "Run against a freshly started dev server"

### Navigation
- Navigate directly to `/budget-allocations` route after login
- Use PersonSelector dropdown to select pino as the target person
- Year defaults to current year (no year manipulation needed)

### Selector strategy
- Semantic selectors only: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`
- No `data-testid` additions — no frontend changes in this phase
- For scoping within list items, use `.locator()` relative to a parent card when needed

### Assertion depth
- Summary cards: assert **exact values** (e.g., "40h remaining") — gives strong regression protection; document exact dev data values in test comments
- After create: verify new item appears in allocation list with correct amount and description
- After edit: verify updated values shown in list
- After delete: verify item gone from list AND summary card values update accordingly (used decreases, remaining increases)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing test patterns
- `tests/steps/workdaySteps.ts` — BDD helper pattern to follow (login helper, selector conventions)
- `tests/workday.spec.ts` — Example spec structure (describe/test layout, beforeEach/afterEach)
- `tests/person.spec.ts` — Example of CRUD-style test for reference

### Budget allocation UI
- `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx` — Main feature component (routes, admin detection, PersonSelector)
- `workday-application/src/main/react/features/budget/BudgetSummaryCards.tsx` — Summary cards structure (Hack Hours / Study Hours / Study Money)
- `workday-application/src/main/react/features/budget/BudgetCard.tsx` — Individual card with h4 value, LinearProgress, used/remaining text
- `workday-application/src/main/react/features/budget/BudgetAllocationList.tsx` — Allocation list with empty state
- `workday-application/src/main/react/features/budget/StudyMoneyAllocationListItem.tsx` — Renders edit/delete buttons per item
- `workday-application/src/main/react/features/budget/EventAllocationListItem.tsx` — Event-linked allocation display (no edit/delete here)

### Dev data
- `workday-application/src/develop/kotlin/` — Dev data loader; look for budget allocation seed data to understand exact values to assert

### Playwright config
- `playwright.config.ts` — baseURL, workers, fullyParallel=false settings

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tests/steps/workdaySteps.ts`: `Given_I_am_logged_in_as_user(page, 'bert')` — direct reuse for admin login
- `BudgetAllocationClient.ts`: API endpoints available if API-level setup is ever needed

### Established Patterns
- beforeEach/afterEach clear cookies and storage — continue this pattern
- `getByRole`, `getByLabel`, `getByText` preferred over CSS selectors
- `fullyParallel: false` means tests run sequentially — order within describe blocks matters for data-mutating tests (view → create → edit → delete)

### Integration Points
- Login → `/budget-allocations` → PersonSelector picks pino → assertions
- StudyMoneyAllocationListItem renders edit (`aria-label="edit"`) and delete (`aria-label="delete"`) icon buttons

</code_context>

<specifics>
## Specific Ideas

- Tests run sequentially (fullyParallel off), so order within the describe block matters — put view test first, delete test last to avoid removing data that edit test needs
- Exact dev data values for pino's allocations must be looked up from the dev data loader before writing assertions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-budget-management-admin-tests*
*Context gathered: 2026-03-21*