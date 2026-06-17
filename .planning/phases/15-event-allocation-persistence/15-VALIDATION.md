---
phase: 15
slug: event-allocation-persistence
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 15 — Validation Strategy

## Test Infrastructure
jest + dayjs, `jest.config.cjs`, runner: `npm test -- --testPathPattern eventBudgetTransformers`

## Per-Task Verification Map
| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | Task 1 | 1 | ALLOC-01: HACK type creates hackPeriod with correct from/to/days, studyPeriod null | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-01: STUDY type creates studyPeriod, hackPeriod null | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-01: null type — both periods null | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-02: equal-share money 500/2=250.00 each | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-02: rounds down to cents 100/3=33.33 | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-02: zero budget still creates money allocation entries | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-01 | Task 1 | 1 | ALLOC-01/02: empty personIds returns empty arrays | unit | `npm test -- --testPathPattern eventBudgetTransformers` | yes | green |
| 15-01-02 | Task 2 | 1 | ALLOC-03: type change updates existing allocations on save | manual | Playwright EVNT-01/EVNT-04 (tests/event-workflow.spec.ts) | yes | partial |
| 15-01-02 | Task 2 | 1 | ALLOC-04: budget change redistributes money on save | manual | Playwright EVNT-01/EVNT-04 (tests/event-workflow.spec.ts) | yes | partial |
| 15-01-02 | Task 2 | 1 | ALLOC-05: manual customizations preserved (budgetsDirtyRef=true) | manual | none — requires full dialog submit + backend | no | manual-only |

## Manual-Only Verifications
- **ALLOC-03**: changing `defaultTimeAllocationType` on an existing event and saving updates all non-customized time allocations — requires full EventDialog submit + backend persistence to verify. Two-path logic in `EventDialog.tsx` is the path under test.
- **ALLOC-04**: changing the money budget on an existing event and saving redistributes money allocations equally — same constraint as ALLOC-03.
- **ALLOC-05**: manual customizations via the budget accordion are preserved when `budgetsDirtyRef.current === true` — requires full dialog render cycle, Formik context, and budgetsDirtyRef mutation, which cannot be unit-tested without mocking the entire component tree.

## Validation Sign-Off
- **15-01-01 (ALLOC-01, ALLOC-02)**: FILLED — 7 behavioral unit tests added to `eventBudgetTransformers.test.ts`, all 7 pass (31/31 total). Tests cover: HACK period shape, STUDY period shape, null type, equal-share division, floor-to-cents rounding, zero-budget entry creation, empty-personIds edge case.
- **15-01-02 (ALLOC-03, ALLOC-04, ALLOC-05)**: MANUAL-ONLY — two-path handleSubmit in `EventDialog.tsx` requires component + API context. ALLOC-03/04 partially covered by Playwright EVNT-01/EVNT-04; ALLOC-05 is untestable without full component harness.
