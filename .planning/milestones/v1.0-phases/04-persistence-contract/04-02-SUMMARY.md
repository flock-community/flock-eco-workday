---
phase: 04-persistence-contract
plan: 02
subsystem: persistence
tags: [spring-data, persistence-adapter, domain-mapper, hexagonal-architecture]
dependency_graph:
  requires: [DOM-03]
  provides: [DOM-03]
  affects: []
tech_stack:
  added: []
  patterns: [Polymorphic JPA repository, EntityManager.getReference, Import aliases for domain/entity disambiguation, Extension function mappers]
key_files:
  created:
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationRepository.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMapper.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceAdapter.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocationPersistenceAdapter.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocationPersistenceAdapter.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocationPersistenceAdapter.kt
    - workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceTest.kt
  modified: []
decisions:
  - decision: Use findAllByPersonUuid queries instead of relying on returned id from create
    rationale: Kotlin val fields in AbstractIdEntity don't reflect Hibernate-generated ids after persist; polymorphic queries provide reliable retrieval
    alternatives: [entityManager.refresh after save, JpaRepository.saveAndFlush]
  - decision: Add entityManager.flush() after repository.save() in create methods
    rationale: Ensure INSERT is executed within transaction for id generation with AUTO strategy
    alternatives: [CrudRepository without flush]
  - decision: Polymorphic when/is dispatch in mapper following ExpensePersistenceAdapter pattern
    rationale: Proven pattern in codebase for handling JOINED inheritance entity hierarchies
    alternatives: [Visitor pattern, separate query per type]
---

# Plan 04-02 Summary: Repositories, Mappers & Persistence Adapters

## What Was Built

Persistence layer completing the hexagonal architecture for budget allocations:

1. **4 Spring Data Repositories** — Polymorphic `BudgetAllocationRepository` (JpaRepository with JPQL year query) + 3 type-specific `CrudRepository` interfaces for mutations
2. **BudgetAllocationMapper** — Bidirectional extension functions mapping all 3 domain types to/from JPA entities, using import aliases to avoid naming conflicts
3. **4 Persistence Adapters** — `@Component` implementations of domain port interfaces: polymorphic reads/delete + type-specific create/update with `EntityManager.getReference`
4. **7 Integration Tests** — Full CRUD verification including polymorphic queries, lazy element collection loading, BigDecimal precision, and delete operations

## Architecture

```
Domain Ports (Phase 3)          Adapters (this plan)           Repositories
─────────────────────           ────────────────────           ────────────
BudgetAllocationPersistencePort → BudgetAllocationPersistenceAdapter → BudgetAllocationRepository
HackTimePersistencePort         → HackTimePersistenceAdapter         → HackTimeBudgetAllocationRepository
StudyTimePersistencePort        → StudyTimePersistenceAdapter        → StudyTimeBudgetAllocationRepository
StudyMoneyPersistencePort       → StudyMoneyPersistenceAdapter       → StudyMoneyBudgetAllocationRepository
```

## Key Patterns

- **Import aliases** (`as HackTimeDomain` / `as HackTimeEntity`) prevent naming conflicts between domain and JPA types
- **EntityManager.getReference()** avoids extra SELECT for Person FK when creating allocations
- **Polymorphic `when(this)`** dispatch in mapper matches Expense domain pattern exactly
- **@Transactional** on all mutation methods ensures lazy collections load within transaction
- **entityManager.flush()** after save ensures id generation with AUTO strategy

## Test Results

All 7 tests pass:
- `test create and retrieve hack time allocation` — CRUD with daily time allocations
- `test create and retrieve study time allocation` — CRUD with study-type allocations
- `test create and retrieve study money allocation` — BigDecimal precision + file documents
- `test find all by person uuid and year` — Polymorphic query returns all 3 types
- `test find all by event code` — Event-based allocation lookup
- `test delete allocation` — Delete returns domain object, entity removed
- `test update hack time allocation` — Update preserves changes through persistence

## Commits

| Hash | Message |
|------|---------|
| 62a59718 | feat(04-02): add repositories and domain-entity mapper for budget allocations |
| 939dc3ef | feat(04-02): add persistence adapters implementing domain ports with integration tests |

## Self-Check

- [x] All 4 domain ports have implementing @Component adapters
- [x] Polymorphic queries return correct subtypes
- [x] Type-specific mutations use EntityManager.getReference
- [x] 7 integration tests pass with H2
- [x] Lazy element collections loaded correctly within transactions
- [x] BigDecimal precision preserved in StudyMoney round-trip
- [x] Existing tests (schema + contract) still pass

**Self-Check: PASSED**
