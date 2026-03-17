---
phase: 03-domain-layer
plan: 01
subsystem: domain/budget
tags: [domain-layer, hexagonal-architecture, sealed-types, persistence-ports]
dependency_graph:
  requires: [Person, Document, Event, ApplicationEventPublisher]
  provides: [BudgetAllocation, BudgetAllocationType, DailyTimeAllocation, BudgetAllocationPersistencePort, HackTimeBudgetAllocationPersistencePort, StudyTimeBudgetAllocationPersistencePort, StudyMoneyBudgetAllocationPersistencePort]
  affects: []
tech_stack:
  added: [Kotlin sealed interfaces, data classes, Long id type, BigDecimal]
  patterns: [Hexagonal architecture ports, sealed type hierarchy, value objects]
key_files:
  created:
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationType.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/DailyTimeAllocation.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocation.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationPersistencePort.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/HackTimeBudgetAllocationPersistencePort.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyTimeBudgetAllocationPersistencePort.kt
    - domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyMoneyBudgetAllocationPersistencePort.kt
  modified: []
decisions:
  - Use Long id instead of UUID for JOINED inheritance compatibility with JPA auto-increment
  - Use BigDecimal for StudyMoneyBudgetAllocation amount to ensure monetary precision
  - Separate polymorphic (reads) and type-specific (mutations) persistence ports following Expense pattern
  - All three allocation types in single BudgetAllocation.kt file for cohesion
  - No approval status/workflow since allocations are admin-recorded facts
metrics:
  duration: 82
  completed: "2026-03-03T10:36:14Z"
---

# Phase 03 Plan 01: BudgetAllocation Domain Type Hierarchy Summary

**One-liner:** Created sealed BudgetAllocation type hierarchy with 3 concrete implementations (HackTime, StudyTime, StudyMoney) and 4 persistence port interfaces following hexagonal architecture pattern.

## Objective

Create the complete BudgetAllocation domain type hierarchy and persistence port interfaces following the established Expense domain pattern.

## What Was Built

### Domain Types (3 files)

1. **BudgetAllocationType.kt** - Enum with STUDY and HACK values for per-day type override
2. **DailyTimeAllocation.kt** - Value object for per-day hours allocation with type override capability
3. **BudgetAllocation.kt** - Sealed interface with 3 concrete data classes:
   - `HackTimeBudgetAllocation`: Hack time allocations with daily breakdown
   - `StudyTimeBudgetAllocation`: Study time allocations with daily breakdown
   - `StudyMoneyBudgetAllocation`: Study money allocations with BigDecimal amount and file attachments

### Persistence Ports (4 files)

4. **BudgetAllocationPersistencePort.kt** - Polymorphic queries (findAllByPersonUuid, findAllByEventCode, findById, delete)
5. **HackTimeBudgetAllocationPersistencePort.kt** - Type-specific create/update operations
6. **StudyTimeBudgetAllocationPersistencePort.kt** - Type-specific create/update operations
7. **StudyMoneyBudgetAllocationPersistencePort.kt** - Type-specific create/update operations

## Key Implementation Details

### Type Hierarchy Design

- **Sealed interface** ensures exhaustive when-expressions at compile time
- **Long id** (not UUID) for compatibility with JPA JOINED inheritance auto-increment pattern
- **BigDecimal amount** on StudyMoney to ensure monetary precision (no floating-point errors)
- **Optional eventCode** since some allocations (like study money) may not be tied to events
- **Default id = 0** for new entities (database assigns real ID after persistence)

### Port Separation Pattern

Following Expense domain pattern exactly:

- **Polymorphic port** (`BudgetAllocationPersistencePort`) handles reads and deletes across all types
- **Type-specific ports** handle create/update operations with type safety
- Clean separation enables adapters to use JPA JOINED inheritance for reads, but type-safe repositories for mutations

### Infrastructure Independence

- Zero JPA, Spring, or SQL imports in domain layer
- Pure Kotlin types using only `java.time`, `java.math`, and domain packages
- Enables testing domain logic without database or framework dependencies

## Tasks Completed

| Task | Status | Commit | Files |
|------|--------|--------|-------|
| 1. Create BudgetAllocationType enum, DailyTimeAllocation, BudgetAllocation hierarchy | Complete | f8b29f7f | 3 created |
| 2. Create persistence port interfaces (polymorphic + type-specific) | Complete | 6c52672f | 4 created |

## Verification Results

- [x] Domain module compiles cleanly (`./mvnw compile -pl domain`)
- [x] Zero infrastructure imports (grep verification passed)
- [x] 7 files created in budget package
- [x] Sealed interface BudgetAllocation exists
- [x] DailyTimeAllocation value object exists
- [x] BudgetAllocationType enum exists with STUDY and HACK
- [x] All persistence ports follow established patterns

## Deviations from Plan

None - plan executed exactly as written.

## Architecture Notes

This plan establishes the domain layer foundation for hexagonal architecture:

- **Inner layer** (this plan): Domain types and port interfaces
- **Next layer** (Plan 02): Domain services and events
- **Outer layer** (Phase 04): JPA adapters implementing ports

The sealed type hierarchy enables:
1. Type-safe polymorphic queries across all allocation types
2. Type-specific create/update with compile-time guarantees
3. Exhaustive when-expressions in service layer
4. Clean separation of concerns (domain vs persistence)

## What's Next

Plan 03-02 will add:
- Domain events (Create/Update/Delete)
- Domain services delegating to ports
- Unit tests proving domain works without infrastructure

## Self-Check: PASSED

All created files verified:
- ✓ BudgetAllocationType.kt
- ✓ DailyTimeAllocation.kt
- ✓ BudgetAllocation.kt
- ✓ BudgetAllocationPersistencePort.kt
- ✓ HackTimeBudgetAllocationPersistencePort.kt
- ✓ StudyTimeBudgetAllocationPersistencePort.kt
- ✓ StudyMoneyBudgetAllocationPersistencePort.kt

All commits verified:
- ✓ Commit f8b29f7f (Task 1)
- ✓ Commit 6c52672f (Task 2)
