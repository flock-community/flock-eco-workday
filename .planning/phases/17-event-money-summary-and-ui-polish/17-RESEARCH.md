# Phase 17: Event Money Summary and UI Polish - Research

**Researched:** 2026-03-27
**Domain:** React/MUI frontend verification and minor UX fix
**Confidence:** HIGH

## Summary

Phase 17 is a verification-heavy phase with two independent UX items. SUMM-01 concerns the collapsed `EventBudgetSummaryBanner` in the event dialog showing assigned-per-person and unassigned amounts distinctly. The code already implements this logic (lines 51-73 of `EventBudgetSummaryBanner.tsx`). The primary research finding is that the logic is present and mostly correct, but the text wording has a subtle issue: when `unassigned === 0` (fully allocated) the text says `"assigned €X/person (fully allocated)"` which does obscure the distinction — it omits the unassigned figure. This may need a minor wording fix depending on whether the reviewer considers "fully allocated" a sufficient expression of `unassigned = 0`.

UI-01 is confirmed already done. `BudgetAllocationFeature.tsx` lines 163-165 shows `<Button onClick={() => setDialogOpen(true)}><AddIcon/> Add</Button>`, which is identical to `ProjectFeature.tsx` lines 56-57 `<Button onClick={newProject}><AddIcon /> Add</Button>`. No code change is needed; the task is pure verification.

Neither requirement needs backend changes. No new libraries are needed. The planner should produce a single plan with two tasks: one to read and verify `EventBudgetSummaryBanner` collapsed-mode text (with an optional minor wording fix), and one to read and confirm the Add button is already correct.

**Primary recommendation:** Verify both items by reading the source; fix SUMM-01 wording if the zero-unassigned case is ambiguous; close UI-01 with a confirm comment.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Assigned vs unassigned breakdown appears in the event dialog only — specifically in the collapsed `EventBudgetSummaryBanner`. `BudgetCard` stays as-is.
- **D-02:** The collapsed `EventBudgetSummaryBanner` already computes `assignedPerPerson` and `unassigned` and displays them. Verify this logic is correct and the text clearly communicates the distinction.
- **D-03:** The expanded `EventMoneyAllocationSection` (Budget/Allocated/Remaining chips) does NOT need changes.
- **D-04:** `BudgetAllocationFeature` already uses `<Button><AddIcon/> Add</Button>`. Verify during implementation and close UI-01 if confirmed. No code change expected.

### Claude's Discretion
- Whether to add any minor visual polish to the EventBudgetSummaryBanner text formatting while verifying SUMM-01
- Exact wording of the assigned/unassigned summary text if current wording needs improvement

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SUMM-01 | The event money allocation summary distinguishes between assigned (€X/person) and unassigned (€Y remaining) amounts | `EventBudgetSummaryBanner.tsx` collapsed mode already implements `assignedPerPerson` and `unassigned`. Text renders both values except in the fully-allocated (zero unassigned) case where only "(fully allocated)" appears. May need wording fix. |
| UI-01 | The "Add study money" button uses the same `+ Add` pattern as other resource pages | `BudgetAllocationFeature.tsx` lines 163-165 already renders `<Button><AddIcon/> Add</Button>` — identical to `ProjectFeature.tsx`. Confirmed no code change needed. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (project version) | Component rendering | Already in use |
| MUI (Material UI) | (project version) | Button, Typography, Chip | Already in use — all existing UI uses MUI |
| @mui/icons-material | (project version) | AddIcon, Info, Warning, CheckCircle | Already imported in both components |

### Supporting
None needed. Phase is pure verification / minor string change.

### Alternatives Considered
None — locked decisions preclude alternatives.

**Installation:** No new packages needed.

## Architecture Patterns

### Collapsed-mode detection in EventBudgetSummaryBanner

The component uses a single-prop sentinel to switch between two render modes:

```typescript
// Source: workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx
const isCollapsedMode = participantCount !== undefined;
```

When `isCollapsedMode` is true the component renders a `Box` with inline summary text and chips. When false it renders an `Alert` with chip breakdown.

### Current collapsed-mode money text (lines 65-73)

```typescript
// Source: EventBudgetSummaryBanner.tsx lines 65-73
if (hasMoneySection) {
  const assignedStr = `assigned ${currency}${assignedPerPerson.toFixed(0)}/person`;
  if (unassigned > 0) {
    summaryText += `, ${assignedStr}, ${currency}${unassigned.toFixed(0)} unassigned`;
  } else if (unassigned < 0) {
    summaryText += `, ${assignedStr}, ${currency}${Math.abs(unassigned).toFixed(0)} over budget`;
  } else {
    summaryText += `, ${assignedStr} (fully allocated)`;
  }
}
```

**Assessment:** The `unassigned > 0` and `unassigned < 0` branches both show two distinct values (assigned/person AND unassigned/over amount). The `unassigned === 0` branch shows only assigned/person with "(fully allocated)" — this satisfies SUMM-01 because zero-unassigned means everything is assigned; the distinction is implicit. Whether to make it explicit ("€0 unassigned") is Claude's discretion.

### Add button pattern (confirmed identical)

```typescript
// BudgetAllocationFeature.tsx lines 162-166
{isAdmin && (
  <Button onClick={() => setDialogOpen(true)}>
    <AddIcon/> Add
  </Button>
)}

// ProjectFeature.tsx lines 56-57 (reference pattern)
<Button onClick={newProject}>
  <AddIcon /> Add
```

Pattern is identical. No change needed.

### Anti-Patterns to Avoid
- **Changing the expanded mode:** D-03 locks it out of scope. Do not touch `EventMoneyAllocationSection`.
- **Changing `BudgetCard`:** D-01 explicitly leaves it as-is.
- **Adding new components:** Phase is verification + optional string fix only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom formatter | `.toLocaleString('nl-NL')` | Already used consistently in chips — keep same locale |
| Number rounding | Custom rounding | `.toFixed(0)` | Already used in summary text |

**Key insight:** All formatting helpers are already in place and used consistently. The only potential change is the string template in the `unassigned === 0` branch.

## Common Pitfalls

### Pitfall 1: Breaking the `isCollapsedMode` sentinel
**What goes wrong:** Removing or renaming the `participantCount` prop causes collapsed mode to never activate, breaking the summary display entirely.
**Why it happens:** The mode switch relies on `participantCount !== undefined` — any refactor that changes prop passing breaks it.
**How to avoid:** Do not rename or remove `participantCount`. Only modify the string template inside the `if (hasMoneySection)` block.
**Warning signs:** Summary banner shows Alert-style layout instead of inline text in accordion.

### Pitfall 2: Locale inconsistency in wording fix
**What goes wrong:** Using `toLocaleString('nl-NL')` in some places and `.toFixed(0)` in others within the same sentence produces mixed formatting (e.g., "€1.500 unassigned" vs "assigned €1500/person").
**Why it happens:** The chips use `toLocaleString('nl-NL')` (thousands separator) but the summary text uses `toFixed(0)`.
**How to avoid:** Keep consistency with existing text — `toFixed(0)` is used in `assignedStr`, so any new text for unassigned in the zero branch should use the same approach.

### Pitfall 3: Treating UI-01 as a code change
**What goes wrong:** Planner creates a task that modifies the Add button, wasting effort.
**Why it happens:** Requirement says "ensure button matches pattern" — implementer assumes a change is needed.
**How to avoid:** Task should read lines 162-166 of `BudgetAllocationFeature.tsx`, confirm match with reference, and close UI-01 with a code comment or PR note.

## Code Examples

### SUMM-01: Optional improved wording for zero-unassigned case
```typescript
// Potential fix for the unassigned === 0 branch — makes both values explicit
} else {
  summaryText += `, ${assignedStr}, ${currency}0 unassigned (fully allocated)`;
}
```
This is Claude's discretion per CONTEXT.md. The current wording already satisfies SUMM-01 logically.

### UI-01: Confirmation that pattern matches
```typescript
// BudgetAllocationFeature.tsx (current) — lines 163-165
<Button onClick={() => setDialogOpen(true)}>
  <AddIcon/> Add
</Button>

// ProjectFeature.tsx (reference) — lines 56-57
<Button onClick={newProject}>
  <AddIcon /> Add
```
These are structurally identical (MUI Button with AddIcon child and text "Add"). UI-01 is already satisfied.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single "Budget/Allocated/Remaining" chips in expanded view | Collapsed banner with inline text + Budget/Allocated chips | Phase 16-17 work | Better at-a-glance summary in accordion header |

## Open Questions

1. **Zero-unassigned wording**
   - What we know: `unassigned === 0` branch reads "assigned €X/person (fully allocated)" — both values can be inferred
   - What's unclear: Whether the reviewer wants "€0 unassigned" stated explicitly
   - Recommendation: Add it for completeness — it removes any ambiguity and is a one-line change

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (project root `tests/`) |
| Config file | `playwright.config.ts` (project root) |
| Quick run command | `npx playwright test tests/event-workflow.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUMM-01 | Collapsed event dialog summary shows assigned €X/person AND unassigned €Y | e2e (Playwright) | `npx playwright test tests/event-workflow.spec.ts` | ❌ Wave 0 — new test needed |
| UI-01 | "Add study money" button renders with AddIcon + "Add" text | e2e (Playwright) or visual read-only confirm | `npx playwright test tests/budget-admin.spec.ts` | ❌ Wave 0 — new test or confirm comment |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/event-workflow.spec.ts --grep "SUMM"`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/event-workflow.spec.ts` — add test asserting collapsed banner text shows "assigned €X/person" and "€Y unassigned" (covers SUMM-01)
- [ ] `tests/budget-admin.spec.ts` — add a brief assertion or code-comment confirming Add button pattern matches (covers UI-01); or document as confirmed-in-code (no runtime test needed)

## Sources

### Primary (HIGH confidence)
- `workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx` — collapsed mode logic lines 49-115, directly read
- `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx` — Add button lines 162-166, directly read
- `workday-application/src/main/react/features/project/ProjectFeature.tsx` — reference Add button lines 56-57, directly read
- `.planning/phases/17-event-money-summary-and-ui-polish/17-CONTEXT.md` — locked decisions D-01 through D-04

### Secondary (MEDIUM confidence)
- `playwright.config.ts` — test framework config, run commands, timeout settings

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing code, no new libraries
- Architecture: HIGH — component code directly read and verified
- Pitfalls: HIGH — derived from direct code inspection
- SUMM-01 status: HIGH — logic is present; zero-unassigned wording is Claude's discretion
- UI-01 status: HIGH — confirmed already matches reference pattern

**Research date:** 2026-03-27
**Valid until:** Stable — no external dependencies; only changes if component is refactored
