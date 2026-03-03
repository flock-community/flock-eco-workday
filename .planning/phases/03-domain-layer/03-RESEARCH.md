# Phase 3: Domain Layer - Research

**Researched:** 2026-03-03
**Domain:** Kotlin domain modeling with hexagonal architecture (ports & adapters)
**Confidence:** HIGH

## Summary

Phase 3 implements the core business logic for budget allocations following the established Expense domain pattern in this codebase. The domain layer exists in the separate `domain/` Maven module with zero infrastructure dependencies. All business entities are Kotlin data classes and sealed interfaces. Persistence contracts are defined as port interfaces in the domain, with adapters implemented in `workday-application/` module.

The key architectural decisions are locked: sealed interface pattern (BudgetAllocation with HackTime/StudyTime/StudyMoney subtypes), persistence port interfaces, and pure domain services that delegate to ports. The implementation pattern is proven and already used successfully for Expense domain.

**Primary recommendation:** Follow the Expense domain implementation exactly. The pattern is proven in this codebase, reduces risk, and maintains architectural consistency.

## Phase Requirements

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|-----------------|
| DOM-01 | System stores BudgetAllocation as sealed hierarchy (HackTime, StudyTime, StudyMoney) with JOINED inheritance | Sealed interface pattern exists in domain/expense/Expense.kt; JOINED inheritance in workday-application/expense/Expense.kt; mapper pattern in ExpenseMapper.kt |
| DOM-02 | DailyTimeAllocation tracks per-day hours with type override (STUDY/HACK) | Embeddable value objects pattern exists; will be data class in domain, @Embeddable in JPA entity |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Kotlin | 1.9.x | Domain modeling language | Project standard; all domain code in Kotlin |
| kotlin-stdlib | 1.9.x | Standard library | Required for Kotlin data classes and sealed interfaces |
| Domain module (pure) | N/A | Business logic isolation | Zero infrastructure dependencies; hexagonal architecture |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| kotlin-test | 1.9.x | Unit testing framework | Domain layer tests (not used currently but available) |
| mockk | Latest | Mocking for Kotlin | If domain service tests needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sealed interface | Sealed class | Sealed interface is modern Kotlin; class used in legacy code |
| Separate port interfaces | Single persistence port | Multiple ports enable type-specific operations (create/update per subtype) |
| Pure domain module | Domain in workday-application | Pure module enforces hexagonal architecture; prevents accidental infrastructure coupling |

**Installation:**
Domain module has no external dependencies beyond kotlin-stdlib (already configured).

## Architecture Patterns

### Recommended Project Structure
```
domain/src/main/kotlin/community/flock/eco/workday/domain/
├── budget/                    # Budget allocation domain (NEW)
│   ├── BudgetAllocationType.kt      # Enum: STUDY, HACK
│   ├── DailyTimeAllocation.kt       # Value object (data class)
│   ├── BudgetAllocation.kt          # Sealed interface + concrete types
│   ├── BudgetAllocationPersistencePort.kt  # Polymorphic queries (read/delete)
│   ├── HackTimeBudgetAllocationPersistencePort.kt   # Type-specific create/update
│   ├── StudyTimeBudgetAllocationPersistencePort.kt  # Type-specific create/update
│   ├── StudyMoneyBudgetAllocationPersistencePort.kt # Type-specific create/update
│   ├── BudgetAllocationService.kt   # Domain service (polymorphic operations)
│   ├── HackTimeBudgetAllocationService.kt   # Domain service (type-specific)
│   ├── StudyTimeBudgetAllocationService.kt  # Domain service (type-specific)
│   ├── StudyMoneyBudgetAllocationService.kt # Domain service (type-specific)
│   └── BudgetAllocationEvent.kt     # Domain events (Create/Update/Delete)
├── common/                    # Shared domain concepts (EXISTING)
│   ├── Document.kt            # File reference value object
│   ├── Event.kt               # Domain event marker interface
│   └── ApplicationEventPublisher.kt  # Event publishing port
└── person/                    # Person domain (EXISTING)
    └── Person.kt              # Person aggregate
```

### Pattern 1: Sealed Interface Hierarchy
**What:** Kotlin sealed interface with concrete data class implementations for type-safe polymorphism
**When to use:** When domain concept has multiple subtypes with shared behavior but different data (BudgetAllocation → HackTime/StudyTime/StudyMoney)
**Example:**
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/Expense.kt
sealed interface BudgetAllocation {
    val id: Long
    val person: Person
    val eventCode: String?
    val date: LocalDate
    val description: String?
}

data class HackTimeBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String?,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double,
) : BudgetAllocation

data class StudyTimeBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String?,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double,
) : BudgetAllocation

data class StudyMoneyBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String? = null,
    override val date: LocalDate,
    override val description: String? = null,
    val amount: BigDecimal,
    val files: List<Document> = emptyList(),
) : BudgetAllocation
```

### Pattern 2: Persistence Port Interfaces
**What:** Separate port interfaces for polymorphic (read/delete) vs. type-specific (create/update) operations
**When to use:** Always in hexagonal architecture; domain defines contracts, application implements adapters
**Example:**
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpensePersistencePort.kt
interface BudgetAllocationPersistencePort {
    fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation>
    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>
    fun findById(id: Long): BudgetAllocation?
    fun delete(id: Long): BudgetAllocation?
}

interface StudyMoneyBudgetAllocationPersistencePort {
    fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation
    fun findById(id: Long): StudyMoneyBudgetAllocation?
    fun updateIfExists(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation?
}

// Similar for HackTimeBudgetAllocationPersistencePort and StudyTimeBudgetAllocationPersistencePort
```

### Pattern 3: Pure Domain Services
**What:** Domain services that orchestrate business logic using only port interfaces (no direct infrastructure)
**When to use:** When business logic spans multiple aggregates or requires external interactions
**Example:**
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpenseService.kt
class BudgetAllocationService(
    private val budgetAllocationRepository: BudgetAllocationPersistencePort,
) {
    fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation> =
        budgetAllocationRepository.findAllByPersonUuid(personUuid, year)

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
        budgetAllocationRepository.findAllByEventCode(eventCode)

    fun findById(id: Long): BudgetAllocation? =
        budgetAllocationRepository.findById(id)

    fun deleteById(id: Long): BudgetAllocation? =
        budgetAllocationRepository.delete(id)
}

class StudyMoneyBudgetAllocationService(
    private val repository: StudyMoneyBudgetAllocationPersistencePort,
) {
    fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation =
        repository.create(allocation)

    fun update(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation? =
        repository.updateIfExists(id, allocation)
}
```

### Pattern 4: Domain Events
**What:** Sealed interface for domain events (Create/Update/Delete) that carry entity state
**When to use:** When domain state changes need to be communicated to other parts of the system
**Example:**
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpenseEvent.kt
sealed interface BudgetAllocationEvent : Event {
    val entity: BudgetAllocation
}

data class CreateBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent

data class UpdateBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent

data class DeleteBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent
```

### Pattern 5: Value Objects
**What:** Immutable data classes representing domain concepts without identity (DailyTimeAllocation)
**When to use:** When concept is defined by its attributes, not identity (e.g., date + hours + type)
**Example:**
```kotlin
data class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    val type: BudgetAllocationType,
)
```

### Anti-Patterns to Avoid
- **Infrastructure leakage:** NO JPA annotations, Spring annotations, or database types in domain module
- **Mutable entities:** Domain entities should be immutable (use `val`, not `var`; use data classes)
- **Anemic domain:** Domain services contain business logic, not just CRUD delegation
- **God services:** Each allocation subtype has its own service for type-specific operations

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Polymorphic type discrimination | Custom type field + if/when chains | Kotlin sealed interfaces | Compile-time exhaustiveness checking; type safety |
| Immutability | Manual defensive copying | Kotlin data classes | Built-in copy() method; structural equality |
| Domain events | Custom observer pattern | ApplicationEventPublisher port | Decouples domain from event infrastructure |
| Value object equality | Override equals/hashCode | Kotlin data classes | Automatic structural equality |

**Key insight:** Kotlin language features (sealed interfaces, data classes) eliminate most boilerplate and error-prone manual implementations. Use them.

## Common Pitfalls

### Pitfall 1: Infrastructure Coupling
**What goes wrong:** Domain code imports JPA, Spring, or persistence libraries
**Why it happens:** Convenience - directly annotate domain entities with @Entity/@Table
**How to avoid:** Strict module separation; domain module has ZERO infrastructure dependencies
**Warning signs:** Import statements with `jakarta.persistence`, `org.springframework`, or `java.sql`

### Pitfall 2: Sealed Type Hierarchy ID Strategy Mismatch
**What goes wrong:** Using UUID in domain but JOINED inheritance requires shared ID across child tables
**Why it happens:** Copy-paste from Expense pattern (which uses UUID) without considering BudgetAllocation uses Long ID
**How to avoid:** Use Long ID (auto-increment) for JOINED inheritance; UUID for SINGLE_TABLE (see implementation plan)
**Warning signs:** Domain uses UUID but database migration creates BIGINT autoIncrement ID

### Pitfall 3: Forgetting Type Discriminator
**What goes wrong:** Sealed interface in domain but no way to distinguish types when mapping from JPA
**Why it happens:** Domain sealed interface doesn't need explicit type field (Kotlin `when` handles it)
**How to avoid:** JPA entity needs `type` field for JOINED inheritance discriminator column
**Warning signs:** JPA entity missing @Enumerated type field that domain doesn't have

### Pitfall 4: Mutable Collections in Domain
**What goes wrong:** Using `MutableList` in domain data classes breaks immutability
**Why it happens:** Habit from JPA entities (which need mutable collections)
**How to avoid:** Domain uses `List` (immutable interface); JPA adapter maps to `MutableList`
**Warning signs:** Domain data class has `val dailyTimeAllocations: MutableList<...>`

### Pitfall 5: Missing Person Reference
**What goes wrong:** Domain uses Person but implementation plan shows person_id column
**Why it happens:** Domain models relationships as objects; persistence stores foreign keys
**How to avoid:** Domain references Person aggregate; persistence port converts UUID to entity reference
**Warning signs:** Domain service receives UUID but tries to construct domain object with Person reference

## Code Examples

Verified patterns from existing codebase:

### Domain Sealed Interface (Polymorphic Type)
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/Expense.kt
sealed interface BudgetAllocation {
    val id: Long
    val person: Person
    val eventCode: String?
    val date: LocalDate
    val description: String?
}
```

### Domain Concrete Type (with Collections)
```kotlin
data class HackTimeBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String?,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyTimeAllocations: List<DailyTimeAllocation>,  // Immutable List
    val totalHours: Double,
) : BudgetAllocation
```

### Persistence Port (Polymorphic Queries)
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpensePersistencePort.kt
interface BudgetAllocationPersistencePort {
    fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation>
    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>
    fun findById(id: Long): BudgetAllocation?
    fun delete(id: Long): BudgetAllocation?
}
```

### Persistence Port (Type-Specific Mutations)
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/CostExpensePersistencePort.kt
interface StudyMoneyBudgetAllocationPersistencePort {
    fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation
    fun findById(id: Long): StudyMoneyBudgetAllocation?
    fun updateIfExists(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation?
}
```

### Domain Service (Delegating to Port)
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpenseService.kt
class BudgetAllocationService(
    private val budgetAllocationRepository: BudgetAllocationPersistencePort,
) {
    fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation> =
        budgetAllocationRepository.findAllByPersonUuid(personUuid, year)

    fun deleteById(id: Long): BudgetAllocation? =
        budgetAllocationRepository.delete(id)
}
```

### Value Object (Embeddable in JPA)
```kotlin
data class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    val type: BudgetAllocationType,
)
```

### Domain Events
```kotlin
// Source: domain/src/main/kotlin/.../domain/expense/ExpenseEvent.kt
sealed interface BudgetAllocationEvent : Event {
    val entity: BudgetAllocation
}

data class CreateBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sealed class hierarchy | Sealed interface hierarchy | Kotlin 1.5+ | Sealed interfaces more flexible (multiple inheritance) |
| Abstract class entities | Data class with sealed interface | Modern Kotlin | Immutability by default, structural equality |
| Single persistence port | Separate ports (polymorphic + type-specific) | This codebase pattern | Clear separation: queries polymorphic, mutations type-specific |
| Domain events with Spring | Domain event interfaces + port | Hexagonal arch | Domain independent of Spring event system |

**Deprecated/outdated:**
- Sealed classes as primary polymorphism mechanism: Sealed interfaces are now preferred (more flexible)
- Domain services publishing Spring events directly: Use ApplicationEventPublisher port interface instead

## Open Questions

1. **Should domain layer have unit tests?**
   - What we know: No tests currently in domain/src/test/; workday-application has integration tests
   - What's unclear: Whether pure domain services need isolated unit tests (no Spring, no DB)
   - Recommendation: Phase 3 success criteria require "developer can run domain layer tests without Spring context or database" - this means we SHOULD add minimal tests, but they're not critical path

2. **Should domain services include validation logic?**
   - What we know: Expense domain services are thin delegation layers
   - What's unclear: Whether validation (e.g., totalHours = sum of daily hours) belongs in domain or controller
   - Recommendation: Keep domain services thin for Phase 3; validation can be added later if needed

3. **How to handle ApplicationEventPublisher port dependency?**
   - What we know: ExpenseService injects ApplicationEventPublisher from domain/common
   - What's unclear: Whether BudgetAllocationService needs event publishing (Expense has TODO comment questioning it)
   - Recommendation: Include events in domain model for consistency, but implementation can be minimal (services don't have to publish if not needed)

## Validation Architecture

> Validation section skipped - workflow.nyquist_validation not found in config.json (project uses standard test approach)

## Sources

### Primary (HIGH confidence)
- Expense domain implementation: domain/src/main/kotlin/.../domain/expense/ (direct codebase reference)
- Person domain model: domain/src/main/kotlin/.../domain/person/Person.kt
- Common domain concepts: domain/src/main/kotlin/.../domain/common/
- Implementation plan: docs/plans/2026-02-28-budget-allocations-implementation.md (Phase 2 tasks 1-6)
- Project decisions: .planning/STATE.md (Decision #3: Follow Expense domain pattern exactly)

### Secondary (MEDIUM confidence)
- Kotlin sealed interfaces documentation (standard Kotlin feature, stable since 1.5)
- Hexagonal architecture pattern (ports & adapters) - widely documented pattern

### Tertiary (LOW confidence)
- None - all findings verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Kotlin/stdlib only, already configured in domain module
- Architecture: HIGH - Exact pattern exists in Expense domain, proven in production
- Pitfalls: HIGH - Observed from Expense implementation and implementation plan notes

**Research date:** 2026-03-03
**Valid until:** 90 days (stable architecture, unlikely to change)

**Critical considerations for planner:**
1. **ID Strategy:** Domain uses `Long` (not UUID like Expense) - affects entity construction
2. **Person Reference:** Domain references Person aggregate; adapters must resolve UUID → Person entity
3. **Collections:** Domain uses immutable `List`; JPA adapters use `MutableList`
4. **Zero Dependencies:** Domain module must remain pure (no JPA, Spring, SQL)
5. **Testing:** Phase requires runnable tests without Spring/DB - keep scope minimal (unit tests optional but planned)
