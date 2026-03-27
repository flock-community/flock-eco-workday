---
phase: 17-event-money-summary-and-ui-polish
verified: 2026-03-27T00:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 17: Event Money Summary and UI Polish — Verification Report

**Phase Goal:** Fix collapsed EventBudgetSummaryBanner text and confirm Add button UI pattern
**Verified:** 2026-03-27
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Collapsed EventBudgetSummaryBanner shows 'assigned €X/person' and '€Y unassigned' as two distinct values in all three budget states | VERIFIED | `EventBudgetSummaryBanner.tsx` line 72: `` `, ${assignedStr}, ${currency}0 unassigned (fully allocated)` `` — all three branches (unassigned>0, <0, =0) are explicit |
| 2 | The '+ Add' button on the budget allocation page renders with AddIcon and text 'Add', matching the pattern on Projects, Assignments, and Workdays pages | VERIFIED | `BudgetAllocationFeature.tsx` line 164: `<AddIcon/> Add` — identical pattern confirmed |
| 3 | EVNT-06 Playwright test opens an event with a money budget and asserts the collapsed banner text contains both the assigned-per-person and unassigned figures | VERIFIED | `tests/event-workflow.spec.ts` lines 160-174: EVNT-06 test exists, calls `Then_collapsed_banner_shows_money_summary` with `'assigned €500/person'` and `'€0 unassigned (fully allocated)'` |
| 4 | A test assertion or code comment in budget-admin.spec.ts closes UI-01 with evidence that the Add button matches the reference pattern | VERIFIED | `tests/budget-admin.spec.ts` lines 209-216: `UI-01: Add button renders with + Add pattern` test asserts `getByRole('button', { name: 'Add' })` and `addButton.locator('svg')` are visible |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `workday-application/src/main/react/features/event/EventBudgetSummaryBanner.tsx` | Collapsed-mode summary text with explicit assigned/unassigned values in all three states | VERIFIED | Line 72 contains `` `${currency}0 unassigned (fully allocated)` ``; lines 68 and 70 handle the other two branches. All three branches are explicit. |
| `tests/steps/eventSteps.ts` | Exports `Then_collapsed_banner_shows_money_summary` | VERIFIED | Lines 368-383: function exported; locates MUI AccordionSummary by `participant` text, asserts both substrings in `<p>` |
| `tests/event-workflow.spec.ts` | Contains EVNT-06 test asserting collapsed banner text | VERIFIED | Lines 160-174: EVNT-06 test block inside `'Event Workflow - Create and Budget Verification'` describe, after EVNT-05 |
| `tests/budget-admin.spec.ts` | Contains UI-01 verification comment or assertion | VERIFIED | Lines 190-217: `'Budget Admin - UI Pattern Verification'` describe block with `UI-01` test, SVG assertion, and source reference comment |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tests/event-workflow.spec.ts` | `tests/steps/eventSteps.ts` | `import Then_collapsed_banner_shows_money_summary` | WIRED | Line 35: imported in the import block; line 169: called inside EVNT-06 |
| `EventBudgetSummaryBanner.tsx` | `AccordionSummary in EventBudgetManagementDialog` | `isCollapsedMode` (`participantCount !== undefined`) | WIRED | `EventBudgetManagementDialog.tsx` line 424: `participantCount={participantIds.length}` passed to the banner, triggering collapsed-mode rendering |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SUMM-01 | 17-01-PLAN.md | Money allocation summary distinguishes assigned vs unassigned amounts | SATISFIED | Banner now shows `, assigned €X/person, €0 unassigned (fully allocated)` for fully-allocated state; EVNT-06 test asserts this at runtime |
| UI-01 | 17-01-PLAN.md | "Add study money" button uses site-wide `+ Add` pattern | SATISFIED | `BudgetAllocationFeature.tsx` line 164 contains `<AddIcon/> Add`; UI-01 Playwright test asserts button + SVG visible |

REQUIREMENTS.md cross-reference:
- Line 63: `[x] **SUMM-01**` — marked complete, Phase 17
- Line 67: `[x] **UI-01**` — marked complete, Phase 17
- Lines 119-120: both IDs listed as `Complete` in the phase tracking table

No orphaned requirements found for this phase.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tests/event-workflow.spec.ts` | 87 | `page.waitForTimeout(300)` in step helpers | Info | Pre-existing; not introduced by this phase. Does not affect correctness. |

No blocker or warning anti-patterns introduced by this phase.

---

### Human Verification Required

#### 1. Collapsed banner visual readability (SUMM-01)

**Test:** Open the application as admin, navigate to an event with a money budget. Confirm the AccordionSummary text is readable and the two values (`assigned €X/person` and `€0 unassigned (fully allocated)`) are visually distinct and unambiguous.
**Expected:** Both values appear clearly in a single line of body2 typography. The phrase "fully allocated" reads as a qualifier, not a standalone label.
**Why human:** Visual clarity and text density are subjective — cannot be verified programmatically.

---

### Gaps Summary

No gaps. All four must-have truths are verified at all three levels (exists, substantive, wired). Both requirement IDs are satisfied with direct source evidence and Playwright tests. Both commits (`5ec72c7e`, `0b3e0106`) exist in git history.

The only open item is the visual readability human check noted above, which does not block the phase from being marked passed — it is an optional quality confirmation.

---

_Verified: 2026-03-27_
_Verifier: Claude (gsd-verifier)_
