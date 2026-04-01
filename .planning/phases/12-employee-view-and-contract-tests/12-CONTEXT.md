# Phase 12: Employee View and Contract Tests - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Playwright E2E tests proving: (1) employees see their own budget allocations in read-only mode with no create/edit/delete controls, and (2) admin contract budget field changes are reflected in budget summaries. Covers EMPV-01, EMPV-02, EMPV-03, CTRT-01, CTRT-02.

This phase does NOT add new features — it tests existing authorization and contract-budget integration built in v1.0.

</domain>

<decisions>
## Implementation Decisions

### Employee test user selection
- Use `pino@sesam.straat` (password: `pino`) for employee view tests — internal contract with known budget values (hackHours=160, studyHours=100, studyMoney=2500)
- Pino has seed allocations: 16h hack (Hack Day - March), 0h study, €0 money — well-understood baseline from Phase 10/11
- IMPORTANT: budget-admin.spec.ts creates+edits+deletes a study money allocation for Pino, leaving data at baseline. event-workflow.spec.ts creates/modifies/removes event allocations for Pino, also leaving at baseline after EVNT-03 removes Pino. So Pino's data should be at seed baseline when employee-view tests run.
- If test ordering becomes fragile, consider using `ieniemienie@sesam.straat` as fallback — internal contract with studyHours=200, studyMoney=5000, but has more pre-existing allocations (hack=40h, study=24h, money=€500)

### Read-only verification strategy (EMPV-03)
- Assert `PersonSelector` dropdown is NOT visible (employees cannot select other people)
- Assert "Add Study Money" button is NOT visible
- Assert edit/delete icon buttons are NOT visible within allocation list items
- Use `expect(locator).not.toBeVisible()` pattern — straightforward negative assertions
- No need for `toBeDisabled()` — the controls are simply not rendered (conditional rendering via `isAdmin`)

### Employee budget view assertions (EMPV-01, EMPV-02)
- Employee navigates to `/budget-allocations` after login — auto-loads their own person context
- Summary cards show same format as admin view: BudgetCard with h4 available value, "Budget: X" and "Used: X" body text
- Allocation list shows same items as admin view but without edit/delete buttons
- Reuse `Then_summary_card_shows` from budgetSteps.ts for card assertions
- For allocation list: verify event-linked allocations show event name and hours (EventAllocationListItem)

### Contract editing flow (CTRT-01, CTRT-02)
- Admin (bert) navigates to contract management — route is via PersonLayout at `/contracts`
- Find and open Pino's internal contract (ContractDialog with ContractFormInternal)
- ContractFormInternal has labeled fields: `studyHours` (number), `studyMoney` (number), `hackHours` (number)
- Form ID: `internal-contract-form`
- Edit studyHours from 100 to 150, save, verify budget summary card updates (Budget: 150h)
- IMPORTANT: Restore original values after test to avoid polluting data for subsequent test files
- Consider doing the contract test LAST so data restoration is less critical

### Test file organization
- New spec file: `tests/employee-view.spec.ts`
- Reuse existing step helpers from `tests/steps/budgetSteps.ts` and `tests/steps/workdaySteps.ts`
- Add minimal new helpers if needed (e.g., `Given_I_am_on_budget_tab_as_employee`)
- Two describe blocks: "Employee View (Read-Only)" and "Contract Budget Field Impact"
- Same beforeEach/afterEach cookie clearing pattern as Phase 10/11

### Claude's Discretion
- Exact test case naming within describe blocks
- Whether CTRT tests go in same spec file or separate
- Exact contract navigation flow (may need to explore PersonLayout routing)
- Whether to add a helper for contract editing or inline the logic
- How to handle contract field restoration (afterAll hook vs inline restore)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing test infrastructure (reuse)
- `tests/budget-admin.spec.ts` — Spec structure, assertion patterns, test ordering conventions
- `tests/steps/budgetSteps.ts` — Budget tab navigation, summary card assertions, allocation list assertions (8 helpers)
- `tests/steps/workdaySteps.ts` — Login helper, date picker helper

### Budget allocation UI (employee view)
- `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx` — Admin detection via `BudgetAllocationAuthority.ADMIN`, conditional PersonSelector, Add button, `hasWritePermission` prop
- `workday-application/src/main/react/features/budget/BudgetAllocationList.tsx` — `hasWritePermission` prop controls edit/delete button rendering
- `workday-application/src/main/react/features/budget/BudgetSummaryCards.tsx` — Summary cards (same for admin and employee)
- `workday-application/src/main/react/features/budget/EventAllocationListItem.tsx` — Event-linked allocation display (read-only for everyone)
- `workday-application/src/main/react/features/budget/StudyMoneyAllocationListItem.tsx` — Shows edit/delete only when hasWritePermission

### Contract UI (admin editing)
- `workday-application/src/main/react/features/contract/ContractDialog.tsx` — Contract dialog wrapper
- `workday-application/src/main/react/features/contract/ContractFormInternal.tsx` — Internal contract form with hackHours, studyHours, studyMoney fields
- `workday-application/src/main/react/application/AuthenticatedApplication.tsx` — Route definitions including contract routes

### Auth system
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationAuthority.kt` — READ, WRITE, ADMIN authority enum
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/Users.kt` — Test user definitions and roles
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadUserData.kt` — Authority assignment: ADMIN gets all, USER gets workerAuthorities subset (no BudgetAllocationAuthority.ADMIN)

### Dev data (test fixture values)
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt` — Seed allocation values
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadContractData.kt` — Contract values (pino: internal, studyHours=100, studyMoney=2500)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Given_I_am_logged_in_as_user(page, 'pino')` — employee login (workdaySteps.ts)
- `Given_I_am_on_budget_tab_for_person(page, 'bert', 'Pino')` — admin budget navigation (budgetSteps.ts) — need employee variant that skips person selection
- `Then_summary_card_shows(page, cardTitle, available, budget, used)` — summary card assertion (budgetSteps.ts)
- `Then_allocation_list_contains(page, description, amount)` — allocation list assertion (budgetSteps.ts)

### Established Patterns
- Admin detection: `user?.authorities?.includes('BudgetAllocationAuthority.ADMIN')` — conditional rendering, not route protection
- Employee auto-loads own person via PersonHook — no PersonSelector needed
- Contract forms use Formik with `enableReinitialize`, form IDs per contract type
- MUI number fields use `getByLabel` with field label text
- Sequential test execution (workers:1, fullyParallel:false)

### Integration Points
- Employee login → `/budget-allocations` → auto-loads own person → read-only view
- Admin login → contract route → find person → edit contract → save → verify budget tab
- Budget summary API recalculates from contract + allocations — changing contract values changes summary

</code_context>

<specifics>
## Specific Ideas

- Employee view is the SAME route (`/budget-allocations`) as admin — just conditional rendering based on authority
- PersonSelector is not rendered for employees, so the employee auto-loads their own person via PersonHook
- Contract editing requires navigating to the person's contract section — need to explore exact route (likely PersonLayout-based)
- After editing contract studyHours, the budget summary "Budget: Xh" value should update on next load of budget tab
- Prior test files (budget-admin, event-workflow) should leave pino's data at baseline if all tests pass — but this is a fragile assumption

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-employee-view-and-contract-tests*
*Context gathered: 2026-03-21*
