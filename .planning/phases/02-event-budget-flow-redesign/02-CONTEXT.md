# Phase 2: Event Budget Flow Redesign - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the event dialog so that EventForm fields (costs, defaultTimeAllocationType) are the single source of truth driving the budget management sections. The result should be a cohesive, intuitive single flow for admins: define event basics -> manage participant budgets. Frontend-only changes (no backend work).

</domain>

<decisions>
## Implementation Decisions

### Save Flow
- Single save button saves event details AND budget allocations together
- Budget sections only appear when editing existing events (not during creation)
- Individual save buttons removed from time/money accordion sections
- Subtle visual indicator (dot/badge) on Save button or accordion header when unsaved budget changes exist
- Closing the dialog with unsaved budget changes shows a confirmation warning ("You have unsaved budget changes. Close anyway?")

### Default Allocations
- Money allocations auto-populate with equal split of event budget across participants
- Time allocations auto-fill from event's daily hours and defaultTimeAllocationType (e.g., 8h/day HACK for a Flock Hack Day)
- When admin changes event type (which changes defaultTimeAllocationType), untouched participant allocations update to new type; manually edited allocations are preserved
- When a new participant is added to the event, they auto-get allocations matching the current defaults (both time and money)

### Progressive Disclosure
- Default view: summary banner showing allocation totals (e.g., "5 participants x 8h/day HACK, EUR500/person")
- Click summary banner to expand into full budget management
- Per-day time breakdowns hidden by default; click a specific participant row to expand and see/edit per-day breakdown
- Budget section appears even for events without defaultTimeAllocationType, with a guidance note ("No default allocation type set - set event type to enable auto-fill")

### Claude's Discretion
- Expanded detail view organization (accordions vs. unified participant list vs. tabs)
- Exact summary banner layout and information density
- How the "dirty state" tracking works per-participant for the "update if untouched" behavior
- Specific MUI component choices for unsaved changes indicator

</decisions>

<specifics>
## Specific Ideas

- EventBudgetSummaryBanner.tsx already exists in the codebase and can be reused/adapted for the summary banner
- EventBudgetParticipantRow.tsx already supports expand/collapse pattern for per-day breakdowns
- ConfirmDialog component exists for the unsaved changes warning
- The "update if untouched" behavior needs per-participant dirty tracking to know which allocations were manually edited vs. still using defaults

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EventBudgetSummaryBanner.tsx`: Existing summary banner component - adapt for collapsed default view
- `EventBudgetParticipantRow.tsx`: Expandable participant row with per-day breakdown support
- `EventBudgetManagementSection` (in `EventBudgetManagementDialog.tsx`): Current accordion-based implementation to refactor
- `EventTimeAllocationSection.tsx`: Per-participant time allocation controls
- `EventMoneyAllocationSection.tsx`: Per-participant money allocation controls
- `ConfirmDialog` from `@workday-core`: Reuse for unsaved changes warning
- `PeriodInputField`: Existing day-by-day hour input component
- `EventTypeMappingToDefaultBudgetType`: Mapping from event type to default budget type already exists

### Established Patterns
- Formik + Yup for form state management (EventForm already uses this)
- MUI Accordion for collapsible sections
- MUI Dialog with DialogHeader/DialogBody/DialogFooter pattern
- `EventClient` for API communication
- `useEffect` for data loading on dialog open

### Integration Points
- `EventDialog.tsx`: Container that renders EventForm and EventBudgetManagementSection as siblings - needs refactoring to pass form values down
- `EventForm.tsx`: Formik form with `costs` and `defaultTimeAllocationType` fields - these values need to flow to budget sections
- `handleSubmit` in EventDialog: Currently only saves event data via EventClient - needs to include budget allocation save
- Budget sections currently read from `mockEvents` and `BudgetAllocationMocks` - these mock dependencies must be replaced with EventForm-driven data flow

</code_context>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-event-budget-flow-redesign*
*Context gathered: 2026-03-02*
