# Phase 17: Event Money Summary and UI Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 17-Event Money Summary and UI Polish
**Areas discussed:** Money summary breakdown, Add button pattern, Placement & context

---

## Money Summary Breakdown (SUMM-01)

### Placement Decision

| Option | Description | Selected |
|--------|-------------|----------|
| Event dialog only | Show assigned/unassigned in EventBudgetSummaryBanner and EventMoneyAllocationSection inside event dialog. Budget page BudgetCard stays as-is. | ✓ |
| Both event + budget page | Show in event dialog AND update budget page BudgetCard for event-linked money allocations. | |
| You decide | Claude picks best placement based on context. | |

**User's choice:** Event dialog only
**Notes:** Budget page keeps its existing Used/Available display.

### Expanded View Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Add per-person chip | Add 4th chip showing €X/person alongside Budget, Allocated, Remaining in EventMoneyAllocationSection. | |
| Replace Allocated chip | Replace Allocated with €X/person × N participants — more informative, same chip count. | |
| Keep collapsed only | Collapsed banner summary is enough. Don't change expanded section. | ✓ |

**User's choice:** Keep collapsed only
**Notes:** The collapsed EventBudgetSummaryBanner already shows the per-person breakdown. No changes to expanded EventMoneyAllocationSection chips.

---

## Add Button Pattern (UI-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Verify and close | Confirm current implementation matches pattern. If it does, mark UI-01 as already satisfied. | ✓ |
| Something's different | User noticed a specific difference. | |

**User's choice:** Verify and close
**Notes:** Codebase scout found BudgetAllocationFeature already uses identical `<Button><AddIcon/> Add</Button>` pattern. Will verify during implementation and close if confirmed.

---

## Claude's Discretion

- Minor text formatting improvements to EventBudgetSummaryBanner if needed
- Exact wording of assigned/unassigned summary text

## Deferred Ideas

None — discussion stayed within phase scope
