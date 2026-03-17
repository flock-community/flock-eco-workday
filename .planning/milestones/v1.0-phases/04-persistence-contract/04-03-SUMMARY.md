---
phase: 04-persistence-contract
plan: 03
subsystem: contract-internal-study-budget
tags: [persistence, migration, entity, form, integration-test]
dependency_graph:
  requires: []
  provides:
    - contract_internal.study_hours
    - contract_internal.study_money_budget
    - ContractInternal.studyHours
    - ContractInternal.studyMoney
    - ContractInternalForm.studyHours
    - ContractInternalForm.studyMoney
  affects:
    - ContractService.internalize
tech_stack:
  added:
    - Liquibase changelog-028 (study budget columns)
  patterns:
    - BigDecimal for monetary precision
    - Default values for backward compatibility
    - @Column annotation for custom column naming
    - @Transactional integration testing
key_files:
  created:
    - workday-application/src/main/database/db/changelog/db.changelog-028-contract-internal-study-budget.yaml
    - workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt
  modified:
    - workday-application/src/main/database/db/changelog/db.changelog-master.yaml
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/forms/ContractInternalForm.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/services/ContractService.kt
    - workday-application/src/test/kotlin/community/flock/eco/workday/helpers/CreateHelper.kt
    - workday-application/src/test/kotlin/community/flock/eco/workday/controllers/EventControllerTest.kt
decisions:
  - "Use BigDecimal for studyMoney field to ensure monetary precision without floating-point errors"
  - "Use explicit column name 'study_money_budget' (not 'study_money') via @Column annotation per user decision"
  - "Default values of 0 and BigDecimal.ZERO for backward compatibility with existing contracts"
  - "Add totalStudyDayHoursInPeriod method following existing hackHours pattern"
  - "H2 test database stores identifiers in lowercase (not uppercase)"
metrics:
  duration: 485
  completed: "2026-03-05T08:16:14Z"
  tasks: 3
  commits: 3
---

# Phase 04 Plan 03: Contract Internal Study Budget Summary

**One-liner:** Extended ContractInternal entity with studyHours (Int) and studyMoney (BigDecimal) fields, added Liquibase migration, and validated persistence with integration tests.

## What Was Built

Added study budget fields to ContractInternal entity to enable tracking of study time and money allocations per contract. This provides the foundation for budget allocation logic in later phases.

**Key Components:**
1. **Liquibase Migration (changelog-028):** Added `study_hours` (integer, default 0) and `study_money_budget` (DECIMAL(19,2), default 0.00) columns to `contract_internal` table
2. **Entity Extensions:** Added `studyHours` and `studyMoney` fields to ContractInternal with proper defaults and column mapping
3. **Form Extensions:** Added matching fields to ContractInternalForm for API input
4. **Service Updates:** Updated ContractService.internalize to map new fields
5. **Integration Test:** Created ContractInternalPersistenceTest validating round-trip persistence with correct types

## Tasks Completed

| Task | Name                                                   | Commit   | Files |
|------|--------------------------------------------------------|----------|-------|
| 1    | Add Liquibase migration for study budget columns       | 6d27a425 | 2     |
| 2    | Extend ContractInternal entity and form with fields    | ecd2c602 | 3     |
| 3    | Create ContractInternalPersistenceTest                 | fd9d186d | 3     |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated ContractService.internalize mapping**
- **Found during:** Task 2
- **Issue:** ContractService.internalize function didn't map new studyHours and studyMoney fields from form to entity
- **Fix:** Added `studyHours = studyHours` and `studyMoney = studyMoney` to internalize function
- **Files modified:** ContractService.kt
- **Commit:** ecd2c602
- **Rationale:** Without this mapping, the new fields would never be saved to the database, blocking the functionality

**2. [Rule 3 - Blocking] Fixed EventForm parameter name from 'costs' to 'budget'**
- **Found during:** Task 3 test compilation
- **Issue:** Plan 01 changed EventForm parameter from 'costs' to 'budget', but test helpers (CreateHelper.kt and EventControllerTest.kt) still used old parameter name
- **Fix:** Updated both test files to use 'budget' parameter
- **Files modified:** CreateHelper.kt, EventControllerTest.kt
- **Commit:** fd9d186d
- **Rationale:** Blocking issue - tests wouldn't compile without this fix due to parallel Plan 01 changes

**3. [Rule 3 - Blocking] Fixed H2 identifier case sensitivity in test**
- **Found during:** Task 3 test execution
- **Issue:** Column name test used uppercase identifiers (CONTRACT_INTERNAL, STUDY_MONEY_BUDGET) but H2 stores them in lowercase
- **Fix:** Changed test to use lowercase identifiers (contract_internal, study_money_budget)
- **Files modified:** ContractInternalPersistenceTest.kt
- **Commit:** fd9d186d
- **Rationale:** Test would always fail without understanding H2's identifier storage behavior

## Technical Decisions

1. **BigDecimal for monetary precision:** Used `BigDecimal` type for `studyMoney` field instead of `Double` to avoid floating-point precision errors in monetary calculations

2. **Explicit column naming:** Used `@Column(name = "study_money_budget")` annotation on `studyMoney` field because the database column name doesn't follow Hibernate's default camelCase-to-snake_case conversion (would map to `study_money`, not `study_money_budget`)

3. **Default values for backward compatibility:** Set defaults of `0` and `BigDecimal.ZERO` to ensure existing contracts work without modification

4. **Pattern consistency:** Added `totalStudyDayHoursInPeriod` method following the exact pattern of existing `totalHackDayHoursInPeriod` method for consistency

5. **@Transactional test annotation:** Applied `@Transactional` at class level to enable EntityManager flush/clear operations for proper persistence testing

## Verification Results

All verification criteria met:

- [x] Liquibase migration compiles cleanly
- [x] Entity and form changes compile without errors
- [x] Integration test passes with 4/4 tests:
  - studyHours persists as Int (120 round-trip)
  - studyMoney persists as BigDecimal with precision (2500.50 round-trip)
  - Default values work correctly (0 and BigDecimal.ZERO)
  - Column named study_money_budget per user decision
- [x] All existing tests still pass (backward compatibility confirmed)

**Test execution:** 7.7 seconds (H2 in-memory database)

## Parallel Execution Context

This plan (04-03) ran in parallel with Plan 04-01. Both plans modified `db.changelog-master.yaml`:
- Plan 01 added `db.changelog-027-budget-allocations.yaml`
- Plan 03 added `db.changelog-028-contract-internal-study-budget.yaml`

Both changesets were successfully merged in the same commit (6d27a425) with changelog-028 appearing after changelog-027 as intended.

## Impact Assessment

**Database:**
- Added 2 columns to `contract_internal` table
- All existing contracts will have default values (0 hours, 0.00 money)
- No data migration needed

**API:**
- ContractInternalForm now accepts studyHours and studyMoney (both optional with defaults)
- Backward compatible - existing API calls work without changes

**Code:**
- ContractInternal entity extended with 2 new fields
- ContractService updated to persist new fields
- No breaking changes to existing functionality

## Next Steps

The study budget fields are now persisted and ready to be:
1. Exposed via Wirespec API contracts (Phase 04 Plan 02)
2. Referenced by budget allocation logic (Phase 05)
3. Displayed in contract forms (Phase 08)

## Files Modified

**Created (2):**
- `/workday-application/src/main/database/db/changelog/db.changelog-028-contract-internal-study-budget.yaml`
- `/workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt`

**Modified (6):**
- `/workday-application/src/main/database/db/changelog/db.changelog-master.yaml`
- `/workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt`
- `/workday-application/src/main/kotlin/community/flock/eco/workday/application/forms/ContractInternalForm.kt`
- `/workday-application/src/main/kotlin/community/flock/eco/workday/application/services/ContractService.kt`
- `/workday-application/src/test/kotlin/community/flock/eco/workday/helpers/CreateHelper.kt`
- `/workday-application/src/test/kotlin/community/flock/eco/workday/controllers/EventControllerTest.kt`

## Self-Check: PASSED

**Created files exist:**
- FOUND: /workday-application/src/main/database/db/changelog/db.changelog-028-contract-internal-study-budget.yaml
- FOUND: /workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt

**Commits exist:**
- FOUND: 6d27a425 (Task 1: Liquibase migration)
- FOUND: ecd2c602 (Task 2: Entity and form extensions)
- FOUND: fd9d186d (Task 3: Integration test)

**Key files contain expected content:**
- changelog-028 contains study_money_budget column definition
- ContractInternal.kt contains studyHours and studyMoney fields
- ContractInternalForm.kt contains studyHours and studyMoney fields
- ContractInternalPersistenceTest.kt contains 4 test methods

All artifacts verified successfully.
