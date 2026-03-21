# Phase 11: Event Workflow Tests - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Playwright E2E tests proving admin can create events with budget allocations, modify per-day breakdowns, add/remove participants, and see allocations reflected in participant budget summaries. Covers requirements EVNT-01 through EVNT-04.

This phase does NOT add new features — it tests existing event-budget integration built in v1.0.

</domain>

<decisions>
## Implementation Decisions

### Test data strategy
- Create new events within test runs rather than relying on pre-seeded dev data events
- Use dev data for existing persons and their contracts (bert as admin, pino/ieniemienie as participants)
- Dev data budget values for pino: Hack(budget=160, used=16, avail=144), Study(budget=100, used=0, avail=100), Money(budget=2500, used=0, avail=2500)
- Tests must account for pre-existing allocations when asserting summary card changes

### Event identification in UI
- Find events in EventList by description text within `.MuiCard-root` cards
- Event codes are UUIDs (not human-readable) — never match on event code directly
- On budget tab, `EventAllocationListItem` renders eventCode as card title — scope assertions to card structure/content rather than code string

### Test flow for event creation with budgets (two-step)
- Step 1: Create event via EventDialog (budget section not available on create)
- Step 2: Reopen event from EventList, expand budget accordion, configure allocations, save
- This two-step flow is a UI constraint, not a bug — tests must follow it

### Budget accordion interaction sequence
- Main budget accordion is collapsed by default — must expand first
- Time sub-accordion only visible when `defaultTimeAllocationType` is set (Study Time or Hack Time)
- Money sub-accordion only visible for FLOCK_HACK_DAY or CONFERENCE event types
- "Show all participants" toggle must be clicked to see participants using defaults
- "Customize" button per participant to override default hours

### Budget verification on participant tab
- Reuse existing `Given_I_am_on_budget_tab_for_person` and `Then_summary_card_shows` from Phase 10
- Event-linked allocations appear as `EventAllocationListItem` cards (no edit/delete buttons)
- Info alert states "Event allocations are managed from the Events page"
- Time allocations shown as expandable accordions with readonly PeriodInput
- Money allocations shown inline with nl-NL number format

### Test file organization
- New spec file: `tests/event-workflow.spec.ts`
- New step helpers: `tests/steps/eventSteps.ts`
- Reuse helpers from `tests/steps/budgetSteps.ts` and `tests/steps/workdaySteps.ts`
- Same conventions as Phase 10: `fullyParallel: false`, `beforeEach` clear cookies, comment block with test context

### Close-warning dialog handling
- If budget fields are dirty, closing EventDialog shows confirm dialog "You have unsaved budget changes. Close anyway?"
- Tests that modify budgets and then close must either save first or handle this dialog

### Claude's Discretion
- Exact test descriptions and grouping within spec file
- Whether to use test.describe blocks for EVNT-01/02/03/04 grouping
- Helper function granularity (how many small helpers vs fewer larger ones)
- Whether to assert intermediate states or only final state after save

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing test infrastructure (reuse patterns)
- `tests/budget-admin.spec.ts` — Spec file structure, test conventions, assertion patterns
- `tests/steps/budgetSteps.ts` — Budget tab navigation, summary card assertions, allocation list assertions
- `tests/steps/workdaySteps.ts` — Admin login helper, date picker helper

### Event UI components (selector targets)
- `workday-application/src/main/react/features/event/EventFeature.tsx` — Route `/event`, EventList + EventDialog wiring
- `workday-application/src/main/react/features/event/EventDialog.tsx` — Full dialog: form fields, budget section, save logic, two ConfirmDialogs
- `workday-application/src/main/react/features/event/EventForm.tsx` — Form field labels and IDs for selectors
- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx` — Budget accordion, dirty tracking, section visibility conditions
- `workday-application/src/main/react/features/event/EventTimeAllocationSection.tsx` — Per-participant time UI, "Show all" toggle, "Customize" button
- `workday-application/src/main/react/features/event/EventMoneyAllocationSection.tsx` — Money input per participant, "Distribute Equally"

### Budget tab rendering (verification targets)
- `workday-application/src/main/react/features/budget/BudgetAllocationList.tsx` — Grouping logic: event-linked vs freeform
- `workday-application/src/main/react/features/budget/EventAllocationListItem.tsx` — Event allocation card rendering (no edit/delete)

### Dev data (test fixture values)
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadEventData.kt` — Event types, dates, participants
- `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt` — Allocation values per person per year

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Given_I_am_logged_in_as_user(page, 'bert')` — admin login (workdaySteps.ts)
- `Given_I_am_on_budget_tab_for_person(page, 'bert', personName)` — budget tab navigation (budgetSteps.ts)
- `Then_summary_card_shows(page, cardTitle, available, budget, used)` — summary card assertion (budgetSteps.ts)
- `Then_allocation_list_contains(page, description, amount)` — allocation list assertion (budgetSteps.ts)
- `selectDateInPicker(page, dateLabel, day, month, year)` — date picker interaction (workdaySteps.ts)

### Established Patterns
- MUI Select interaction: find `.MuiFormControl-root` with label text → `.getByRole('combobox').click()` → `getByRole('option', { name }).click()`
- MUI Autocomplete (PersonSelector): similar pattern with combobox role
- Dialog footer submit: button in `DialogFooter`, submits form by ID `event-form`
- Confirm dialogs: `getByRole('heading', { name: 'Confirm' })` → `getByRole('button', { name: 'Confirm' })`
- Test ordering: sequential (fullyParallel: false), later tests depend on earlier test state
- Number formatting: nl-NL locale (comma as decimal separator)

### Integration Points
- EventFeature route: `/event` (defined in AuthenticatedApplication.tsx)
- Budget tab route: `/budget-allocations` (existing, reuse navigation helper)
- Event save triggers allocation API calls: POST/PUT/DELETE to budget allocation endpoints
- EventDialog form ID: `event-form` (used for submit button targeting)

</code_context>

<specifics>
## Specific Ideas

- Event creation is a two-step flow: create event first, then reopen to configure budgets (budget section only shows on edit)
- The "Default Time Allocation Type" field determines whether time tracking is enabled — must be set before time allocations work
- Participants with default allocations are hidden behind a "Show all participants" toggle — tests must click this
- Event-linked allocations on the budget tab are read-only with an info message directing to Events page
- The EventDialog title is always "Create Event" even when editing — don't assert on dialog title for edit mode

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-event-workflow-tests*
*Context gathered: 2026-03-21*
