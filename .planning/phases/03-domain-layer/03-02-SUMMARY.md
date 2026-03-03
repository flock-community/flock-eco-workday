---
phase: 03-domain-layer
plan: 02
subsystem: domain/budget
tags: [domain-layer, domain-events, domain-services, unit-tests, hexagonal-architecture]
dependency_graph:
  requires: [BudgetAllocation, BudgetAllocationType, DailyTimeAllocation, BudgetAllocationPersistencePort, HackTimeBudgetAllocationPersistencePort, StudyTimeBudgetAllocationPersistencePort, StudyMoneyBudgetAllocationPersistencePort, Person, ApplicationEventPublisher, Event]
  provides: [BudgetAllocationEvent, BudgetAllocationService, HackTimeBudgetAllocationService, StudyTimeBudgetAllocationService, StudyMoneyBudgetAllocationService]
  affects: []
tech_stack:
  added: [JUnit 5, kotlin-test-junit5, domain events pattern, manual test doubles]
  patterns: [Domain events, service delegation to ports, event publishing, TDD with manual test doubles]
key_files:
  created:
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationEvent.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationService.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/HackTimeBudgetAllocationService.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyTimeBudgetAllocationService.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyMoneyBudgetAllocationService.kt
    - domain/src/test/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationTest.kt
  modified:
    - domain/pom.xml
decisions:
  - Use JUnit 5 instead of pure kotlin-test for consistency with existing codebase
  - Manual test doubles (object expressions and lambda implementations) instead of mocking frameworks to keep domain tests lightweight
  - Services follow ExpenseService pattern exactly (polymorphic queries + type-specific mutations)
  - Domain events carry the full BudgetAllocation entity for downstream consumers
  - No mail port injection (budget allocations are admin-recorded facts, not employee-submitted requests)
metrics:
  duration: 232
  completed: "2026-03-03T10:44:27Z"
---

# Phase 03 Plan 02: Domain Services, Events, and Tests Summary

**One-liner:** Created domain services delegating to persistence ports with event publishing, plus 7 unit tests proving domain correctness without Spring or database dependencies.

## Objective

Complete the domain layer with behavioral logic (services delegating to ports), domain events for cross-cutting concerns, and tests proving the domain works without any infrastructure.

## What Was Built

### Domain Events (1 file)

1. **BudgetAllocationEvent.kt** - Sealed interface with three variants:
   - `CreateBudgetAllocationEvent` - Published when allocation is created
   - `UpdateBudgetAllocationEvent` - Published when allocation is updated
   - `DeleteBudgetAllocationEvent` - Published when allocation is deleted
   - Each event carries the full `BudgetAllocation` entity for downstream consumers

### Domain Services (4 files)

2. **BudgetAllocationService.kt** - Polymorphic query and delete service:
   - `findAllByPersonUuid(UUID, Int)` - Query allocations by person and year
   - `findAllByEventCode(String)` - Query allocations by event code
   - `findById(Long)` - Find single allocation
   - `deleteById(Long)` - Delete and publish DeleteBudgetAllocationEvent

3. **HackTimeBudgetAllocationService.kt** - Type-specific create/update service:
   - `create(HackTimeBudgetAllocation)` - Create and publish CreateBudgetAllocationEvent
   - `update(Long, HackTimeBudgetAllocation)` - Update and publish UpdateBudgetAllocationEvent

4. **StudyTimeBudgetAllocationService.kt** - Type-specific create/update service:
   - `create(StudyTimeBudgetAllocation)` - Create and publish event
   - `update(Long, StudyTimeBudgetAllocation)` - Update and publish event

5. **StudyMoneyBudgetAllocationService.kt** - Type-specific create/update service:
   - `create(StudyMoneyBudgetAllocation)` - Create and publish event
   - `update(Long, StudyMoneyBudgetAllocation)` - Update and publish event

### Unit Tests (1 file)

6. **BudgetAllocationTest.kt** - 7 test methods covering:
   - Type instantiation for all three allocation types (HackTime, StudyTime, StudyMoney)
   - DailyTimeAllocation data class equality with type override (HACK vs STUDY)
   - Sealed interface exhaustiveness in when-expressions
   - Service event publishing using manual test doubles
   - Zero Spring context or database dependencies

## Key Implementation Details

### Service Pattern

Following the Expense domain pattern exactly:
- **Polymorphic service** (`BudgetAllocationService`) for reads and deletes across all types
- **Type-specific services** for create/update with type safety
- All services inject `ApplicationEventPublisher` and publish events after successful operations
- Services use `.also { }` to publish events after delegating to ports

### Event Publishing Pattern

```kotlin
fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation =
    repository.create(allocation)
        .also { applicationEventPublisher.publishEvent(CreateBudgetAllocationEvent(it)) }
```

This pattern ensures:
- Events always contain the persisted entity (with generated ID)
- Event publishing happens atomically after persistence
- Downstream consumers get accurate entity state

### Testing Strategy

Tests use **manual test doubles** instead of mocking frameworks:
- `ApplicationEventPublisher` is a `fun interface` → implemented as lambda
- Persistence ports → implemented as object expressions
- This keeps tests lightweight and avoids test-specific dependencies

Example:
```kotlin
val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }
val repository = object : HackTimeBudgetAllocationPersistencePort { ... }
```

## Tasks Completed

| Task | Status | Commit | Files |
|------|--------|--------|-------|
| 1. Create domain events and domain services | Complete | f778cd14 | 5 created |
| 2. Create domain layer unit tests | Complete | a5087426 | 1 created, 1 modified |

## Verification Results

- [x] Domain module compiles cleanly (`./mvnw compile -pl domain`)
- [x] All 7 tests pass (`./mvnw test -pl domain`)
- [x] Zero infrastructure imports (grep verification passed)
- [x] 12 files in budget package (7 from Plan 01 + 5 from Plan 02)
- [x] BudgetAllocationTest.kt exists with 7 test methods
- [x] Tests run without Spring context or database

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added JUnit 5 dependency to domain module**
- **Found during:** Task 2 (test creation)
- **Issue:** kotlin-test imports not resolving (compile errors on `@Test` annotation)
- **Fix:** Added JUnit 5 and kotlin-test-junit5 to domain/pom.xml for consistency with existing codebase
- **Files modified:** domain/pom.xml
- **Commit:** a5087426 (included in Task 2 commit)
- **Rationale:** Existing tests in workday-application use JUnit 5. Using the same framework ensures consistency and avoids dependency resolution issues.

**2. [Rule 1 - Bug] Fixed test constructor parameters**
- **Found during:** Task 2 (test compilation)
- **Issue:** Test file missing required constructor parameters (`totalHours` on time allocations, `date` on DailyTimeAllocation)
- **Fix:** Updated all test instantiations to include required fields
- **Files modified:** BudgetAllocationTest.kt
- **Commit:** a5087426 (included in Task 2 commit)
- **Rationale:** Domain types created in Plan 01 have more fields than initially assumed from plan context. Fixed inline during test creation.

## Architecture Notes

This plan completes the domain layer for BudgetAllocation:

**Domain Layer (Phase 3) - COMPLETE:**
- Plan 01: Types and port interfaces
- Plan 02: Services, events, and tests

**What's Next (Phase 4):**
- JPA entity adapters implementing the domain types
- JPA repository adapters implementing the persistence ports
- Liquibase changesets for database schema
- Wirespec contracts defining the API surface

The domain layer is now **fully functional and tested** without any infrastructure dependencies. Phase 4 will add the outer layer (persistence adapters) while keeping the domain pure.

## Domain Layer Completeness

With both plans complete, the budget domain now has:
- ✓ 3 allocation types (sealed interface + data classes)
- ✓ 1 value object (DailyTimeAllocation)
- ✓ 1 enum (BudgetAllocationType)
- ✓ 4 persistence port interfaces (1 polymorphic + 3 type-specific)
- ✓ 4 domain services (1 polymorphic + 3 type-specific)
- ✓ 3 domain events (Create/Update/Delete)
- ✓ 7 unit tests proving correctness
- ✓ Zero infrastructure dependencies
- ✓ Complete hexagonal architecture foundation

**Total files:** 12 in `domain/budget/` + 1 test file

## Self-Check: PASSED

All created files verified:
- ✓ BudgetAllocationEvent.kt
- ✓ BudgetAllocationService.kt
- ✓ HackTimeBudgetAllocationService.kt
- ✓ StudyTimeBudgetAllocationService.kt
- ✓ StudyMoneyBudgetAllocationService.kt
- ✓ BudgetAllocationTest.kt

All commits verified:
- ✓ Commit f778cd14 (Task 1 - services and events)
- ✓ Commit a5087426 (Task 2 - tests)

Test execution verified:
- ✓ All 7 tests pass
- ✓ No Spring context loaded
- ✓ No database connection required
- ✓ Clean compilation
