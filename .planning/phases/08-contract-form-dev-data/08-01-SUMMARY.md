---
phase: 08-contract-form-dev-data
plan: 01
subsystem: ui, database
tags: [formik, react, spring, dev-data, budget-allocation]

# Dependency graph
requires:
  - phase: 04-persistence-contract
    provides: "ContractInternal entity with studyHours/studyMoney fields"
  - phase: 05-api-layer
    provides: "Budget allocation entities and repositories"
  - phase: 07-event-integration
    provides: "Event dialog budget API wiring"
provides:
  - "studyHours and studyMoney form fields on internal contract form"
  - "Dev data loader seeding budget allocations for 3 persons across 2 years"
  - "Contract seed data with studyHours and studyMoney budget values"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dev data loader pattern: @Component + @ConditionalOnProperty + loadData.load {}"

key-files:
  created:
    - "workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt"
  modified:
    - "workday-application/src/main/react/features/contract/ContractFormInternal.tsx"
    - "workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadContractData.kt"

key-decisions:
  - "Follow existing hackHours field pattern exactly for studyHours and studyMoney (no conditional visibility)"
  - "Use bert as Person C for standalone StudyMoney allocation (external contract holder for variety)"

patterns-established:
  - "Budget allocation dev data: event-linked and standalone allocations with dailyTimeAllocations per-day breakdowns"

requirements-completed: [CTR-01, DEV-01]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 8 Plan 01: Contract Form & Dev Data Summary

**studyHours and studyMoney fields added to internal contract form, plus budget allocation dev data loader seeding 3 allocation types for 3 persons across 2 years**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T10:25:52Z
- **Completed:** 2026-03-16T10:28:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added studyHours and studyMoney number input fields to ContractFormInternal with Formik binding and Yup validation
- Updated LoadContractData to set studyHours (200/100) and studyMoney (5000/2500) on internal contract seed data
- Created LoadBudgetAllocationData with comprehensive seed data: Person A (all 3 types, 2 years, ~80% prior year consumption), Person B (HackTime only), Person C (StudyMoney standalone)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add studyHours and studyMoney fields to ContractFormInternal** - `8c268218` (feat)
2. **Task 2: Create dev data loader and update contract seed data** - `4ad40daf` (feat)

## Files Created/Modified
- `workday-application/src/main/react/features/contract/ContractFormInternal.tsx` - Added studyHours and studyMoney fields (JSX, init, schema)
- `workday-application/src/develop/kotlin/.../mocks/LoadContractData.kt` - Added studyHours/studyMoney to ContractInternal constructors
- `workday-application/src/develop/kotlin/.../mocks/LoadBudgetAllocationData.kt` - New dev data loader seeding all 3 budget allocation types

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 is the final phase; all budget allocation feature work is complete
- Full workflow testable in dev profile: contract budget fields, budget tab, event integration, and budget allocations all seeded

---
*Phase: 08-contract-form-dev-data*
*Completed: 2026-03-16*
