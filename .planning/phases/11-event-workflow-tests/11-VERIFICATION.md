---
phase: 11-event-workflow-tests
verified: 2026-03-21T18:00:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Run `npx playwright test tests/event-workflow.spec.ts --reporter=line` against a live dev server"
    expected: "All 4 tests pass (EVNT-01, EVNT-02, EVNT-03, EVNT-04) in sequential order with no failures"
    why_human: "Tests require a running Spring Boot backend (-Pdevelop) with seeded dev data and a live browser. Allocations only materialize through actual API calls."
  - test: "After EVNT-01 runs: navigate to Pino's budget tab and verify hack hours show 24h used / 136h available"
    expected: "Summary card for 'Hack Hours' shows budget=160h, used=24h, available=136h. An EventAllocationListItem card is visible with 'Hack Time: 8h'. Info alert 'Event allocations are managed from the Events page' is visible."
    why_human: "Budget summary depends on server-side diffAllocations logic creating an actual allocation record. Cannot verify API side-effects without a running backend."
  - test: "After EVNT-02 runs: verify Pino's hack hours show 20h used / 140h available"
    expected: "Summary card for 'Hack Hours' shows budget=160h, used=20h, available=140h after reducing event allocation from 8h to 4h."
    why_human: "Requires live backend to confirm PeriodInput value change propagates through the PUT allocation API."
  - test: "After EVNT-03 Part A: verify Ieniemienie Mouse's budget tab shows 48h hack used / 112h available"
    expected: "Ieniemienie's 'Hack Hours' card shows budget=160h, used=48h, available=112h. EventAllocationListItem with 'Hack Time: 8h' appears."
    why_human: "Requires live backend; Ieniemienie's contract values (hackHours=160) need server confirmation."
  - test: "After EVNT-03 Part B: verify Pino's hack hours revert to 16h used / 144h available after removal"
    expected: "Pino's 'Hack Hours' card shows budget=160h, used=16h, available=144h. The 'PW Test Hack Day' EventAllocationListItem is gone from Pino's allocation list."
    why_human: "Requires live backend to confirm participant removal triggers allocation deletion via diffAllocations."
---

# Phase 11: Event Workflow Tests Verification Report

**Phase Goal:** Admin can create events with budget allocations, modify per-day breakdowns, and see allocations reflected in participant summaries
**Verified:** 2026-03-21T18:00:00Z
**Status:** human_needed (all automated checks pass)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Playwright test creates a FLOCK_HACK_DAY event with Pino as participant, configures hack time allocations via two-step flow, saves, and event appears in EventList | VERIFIED | `tests/event-workflow.spec.ts` line 56: EVNT-01 test — two-step flow implemented, `Then_event_list_contains(page, 'PW Test Hack Day')` called after create and customize/save cycle |
| 2 | After event creation with budget allocations, navigating to Pino's budget tab shows the event-linked hack time allocation | VERIFIED | `tests/event-workflow.spec.ts` line 88: EVNT-04 calls `Then_budget_tab_shows_event_allocation(page, 'Hack Time', '8h')` and asserts info alert text |
| 3 | Pino's budget summary cards reflect the event-created allocation (hack hours used increases, remaining decreases) | VERIFIED | EVNT-04 line 94: `Then_summary_card_shows(page, 'Hack Hours', '136h', '160h', '24h')` — correct arithmetic (16h pre-existing + 8h new = 24h used, 160-24=136h avail) |
| 4 | Playwright test modifies an existing event's time allocation hours per participant and verifies updated values persist after save | VERIFIED | `tests/event-workflow.spec.ts` line 127: EVNT-02 — opens PW Test Hack Day, calls `When_I_customize_participant_hours(page, 'Pino', 'Hack Time', 0, '4')`, saves, then asserts `Then_summary_card_shows(page, 'Hack Hours', '140h', '160h', '20h')` |
| 5 | Playwright test adds a new participant to an existing event and verifies they appear in the time allocation section | VERIFIED | EVNT-03 lines 155-188: adds 'Ieniemienie Mouse', does two-step save, expands budget accordion, clicks show all participants, asserts `page.getByText('Ieniemienie Mouse').first()` visible, customizes and saves, then verifies budget summary `('112h', '160h', '48h')` |
| 6 | Playwright test removes a participant from an existing event and verifies their allocation is removed from the budget tab | VERIFIED | EVNT-03 lines 191-203: calls `When_I_remove_participant_from_event(page, 'Pino Woodpecker')`, saves, then asserts `Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h')` — hack hours reverted |
| 7 | eventSteps.ts exports reusable BDD helpers covering event navigation, form fill, budget accordion, participant management | VERIFIED | 16 exported async functions — all 11 required by plan 11-01 present + 3 new helpers from plan 11-02 + `When_I_customize_participant_allocation` (unlisted but used) |

**Score:** 7/7 truths verified (automated)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tests/steps/eventSteps.ts` | Event workflow BDD step helpers | VERIFIED | Exists, 306 lines, 16 exported async functions. Imports `Page` and `expect` from `@playwright/test`, imports `Given_I_am_logged_in_as_user` from `./workdaySteps`. No React source tree imports. |
| `tests/event-workflow.spec.ts` | EVNT-01 and EVNT-04 test cases (plan 11-01), EVNT-02 and EVNT-03 (plan 11-02) | VERIFIED | Exists, 205 lines. Contains all 4 test IDs as `test('EVNT-01:...`, `test('EVNT-04:...`, `test('EVNT-02:...`, `test('EVNT-03:...`. Two describe blocks. `beforeEach`/`afterEach` clearing cookies and storage. Comment block at top with dev data. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tests/event-workflow.spec.ts` | `tests/steps/eventSteps.ts` | `import` at line 16 | WIRED | Imports 13 named exports; all used in tests |
| `tests/event-workflow.spec.ts` | `tests/steps/budgetSteps.ts` | `import` at line 34 | WIRED | Imports `Given_I_am_on_budget_tab_for_person` and `Then_summary_card_shows`; both called in EVNT-04, EVNT-02, EVNT-03 |
| `tests/event-workflow.spec.ts` | new helpers `When_I_customize_participant_hours`, `When_I_remove_participant_from_event` | import at lines 30-31 | WIRED | Both imported and used in EVNT-02 (line 138) and EVNT-03 (line 195) |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EVNT-01 | 11-01 | Admin can create an event and add budget allocations for participants with per-day breakdowns | SATISFIED | `test('EVNT-01:...` — two-step create + budget configure flow fully implemented |
| EVNT-02 | 11-02 | Admin can modify event allocation day types (hack/study) and hours per day | SATISFIED | `test('EVNT-02:...` — reopens event, changes hours from 8h to 4h via `When_I_customize_participant_hours`, verifies budget summary update |
| EVNT-03 | 11-02 | Admin can add/remove participants from event allocations | SATISFIED | `test('EVNT-03:...` — Part A adds Ieniemienie Mouse, Part B removes Pino Woodpecker, each followed by budget tab verification |
| EVNT-04 | 11-01 | Event allocations reflect correctly in participant budget summaries | SATISFIED | `test('EVNT-04:...` — asserts all 3 summary cards (Hack Hours, Study Hours, Study Money) and event allocation list item presence |

No orphaned requirements: all 4 EVNT requirements are claimed by plans and implemented in the spec.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tests/steps/workdaySteps.ts` | 2 | Pre-existing `dayjs` esModuleInterop TS error (causes `tsc --noEmit` to surface when compiling full chain) | Info | Pre-existing issue, not introduced by phase 11. Event files themselves compile cleanly in isolation. |

No anti-patterns found in phase 11 files:
- No TODO/FIXME/placeholder comments in `eventSteps.ts` or `event-workflow.spec.ts`
- No empty implementations (all helpers have substantive Playwright interactions)
- No stub returns (`return null`, `return {}`, etc.)
- No React source tree imports in test files

---

## Human Verification Required

### 1. Full end-to-end test run

**Test:** Start the dev server with `cd workday-application && ../mvnw spring-boot:run -Pdevelop`, then run `npx playwright test tests/event-workflow.spec.ts --reporter=line`
**Expected:** 4 tests pass in sequence. EVNT-01 creates "PW Test Hack Day" and configures Pino's allocation. EVNT-04 verifies Pino's budget summary shows 24h used / 136h available. EVNT-02 edits to 4h and verifies 20h used / 140h available. EVNT-03 adds Ieniemienie Mouse and verifies 48h hack used, then removes Pino and verifies revert to 16h used / 144h available.
**Why human:** Tests require a live Spring Boot backend with dev data seeded via LoadEventData, LoadBudgetAllocationData, and LoadContractData. The `diffAllocations` server logic must execute for allocations to actually be created/deleted in the database. Cannot verify API side-effects statically.

### 2. PersonSelector display name for "Pino"

**Test:** Open an event form in the dev UI, open the Person select dropdown. Observe the exact display name for Pino.
**Expected:** The form and budget accordion should both show "Pino Woodpecker" — the spec uses this in `When_I_remove_participant_from_event(page, 'Pino Woodpecker')`. However `When_I_add_participant(page, 'Pino')` only uses "Pino" to filter by. Verify both the add (partial name) and remove (full name) selectors target the same person.
**Why human:** The Person display format (firstname + lastname) is determined by the server's PersonSelector render string. A mismatch will cause EVNT-03 remove step to silently fail (option not found).

### 3. Budget accordion selector reliability

**Test:** Open an existing event with participants and observe whether `page.locator('.MuiAccordion-root').filter({ hasText: 'participant' })` uniquely targets the budget accordion.
**Expected:** Only the budget accordion contains the word "participant" in its summary banner text.
**Why human:** The `When_I_expand_budget_accordion` selector relies on the EventBudgetSummaryBanner containing "participant" (e.g. "1 participant"). If the text rendering changes or another accordion contains that word, the test will target the wrong element.

---

## Summary

Phase 11 goal is **structurally achieved** — all 4 EVNT requirement test cases exist, are substantively implemented (not stubs), and are properly wired through correct imports and function calls. The test logic correctly encodes the two-step event creation flow, the `Customize` button pattern for materializing default allocations, and the expected budget arithmetic for each scenario.

The only outstanding items are runtime verification concerns that cannot be assessed statically: whether the Playwright selectors correctly interact with the live MUI components and whether the server-side `diffAllocations` logic produces the expected allocation state after each test action.

---

_Verified: 2026-03-21T18:00:00Z_
_Verifier: Claude (gsd-verifier)_
