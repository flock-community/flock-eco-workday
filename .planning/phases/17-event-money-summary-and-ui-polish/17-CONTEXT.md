# Phase 17: Event Money Summary and UI Polish - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Two independent UX improvements: (1) ensure the event money summary clearly distinguishes assigned vs unassigned amounts, and (2) verify the "Add study money" button matches the site-wide `+ Add` pattern. Both are frontend-only, no backend changes.

</domain>

<decisions>
## Implementation Decisions

### Money Summary Breakdown (SUMM-01)
- **D-01:** The assigned vs unassigned breakdown should appear in the **event dialog only** — specifically in the collapsed `EventBudgetSummaryBanner`. The budget page `BudgetCard` stays as-is (shows Used/Available).
- **D-02:** The collapsed `EventBudgetSummaryBanner` already computes `assignedPerPerson` and `unassigned` and displays them. Verify this logic is correct and the text clearly communicates the distinction.
- **D-03:** The expanded `EventMoneyAllocationSection` (Budget/Allocated/Remaining chips) does NOT need changes — the collapsed banner summary is sufficient for the per-person breakdown.

### Add Button Pattern (UI-01)
- **D-04:** Codebase scout found `BudgetAllocationFeature` already uses `<Button><AddIcon/> Add</Button>` — identical to Projects, Assignments, Workdays, and Events pages. **Verify during implementation and close UI-01 if confirmed.** No code change expected.

### Claude's Discretion
- Whether to add any minor visual polish to the EventBudgetSummaryBanner text formatting while verifying SUMM-01
- Exact wording of the assigned/unassigned summary text if current wording needs improvement

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — SUMM-01 and UI-01 requirement definitions

### Event money summary
- `workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx` — Collapsed mode (lines 50-115) already computes assignedPerPerson and unassigned; verify correctness
- `workday-application/src/main/react/features/event/EventMoneyAllocationSection.tsx` — Expanded mode chips (Budget/Allocated/Remaining); no changes needed per D-03

### Add button pattern verification
- `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx` — Current Add button (lines 163-165)
- `workday-application/src/main/react/features/project/ProjectFeature.tsx` — Reference `+ Add` pattern
- `workday-application/src/main/react/features/assignment/AssignmentFeature.tsx` — Reference `+ Add` pattern
- `workday-application/src/main/react/features/workday/WorkDayFeature.tsx` — Reference `+ Add` pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EventBudgetSummaryBanner`: Already has `assignedPerPerson` and `unassigned` calculation in collapsed mode
- `getMoneySummary()` in `EventBudgetManagementDialog`: Computes per-person amounts for equal shares and mixed allocations
- Standard `<Button><AddIcon/> Add</Button>` pattern used across all resource pages

### Established Patterns
- Collapsed banner shows text summary: "assigned X/person, Y unassigned"
- Expanded section shows chip-based breakdown: Budget, Allocated, Remaining
- All resource pages use identical Add button pattern with MUI Button + AddIcon

### Integration Points
- `EventBudgetSummaryBanner` is rendered inside `EventDialog` — no routing changes needed
- `BudgetAllocationFeature` Add button is conditionally rendered for admin only (`isAdmin`)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. This is a verification-heavy phase: most of the expected behavior may already be implemented.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-event-money-summary-and-ui-polish*
*Context gathered: 2026-03-27*
