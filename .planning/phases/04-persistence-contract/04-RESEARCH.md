# Phase 4: Persistence & Contract - Research

**Researched:** 2026-03-05
**Domain:** JPA/Hibernate persistence with JOINED inheritance, Liquibase migrations, Spring Data JPA repositories
**Confidence:** HIGH

## Summary

Phase 4 implements the JPA persistence layer for budget allocations using JOINED inheritance strategy and extends ContractInternal with study budget fields. The codebase has established patterns from Expense domain: sealed interface in domain layer maps to JPA entity hierarchy in application layer with separate persistence adapters per type. Critical success factors: (1) correct Liquibase changeset ordering (base table → child tables → element collections → foreign keys), (2) LAZY fetch for element collections with explicit JOIN FETCH queries, (3) BigDecimal for monetary precision, (4) CASCADE deletion via database foreign keys not JPA annotations.

**Primary recommendation:** Follow Expense domain pattern exactly — sealed interface BudgetAllocation maps to abstract JPA entity with JOINED inheritance, separate repositories per concrete type, polymorphic adapter for reads and type-specific adapters for mutations, extension functions for domain↔entity mapping.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **ContractInternal Budget Fields:**
  - studyHours: `Int` (matches existing hackHours pattern — whole hours per year)
  - studyMoney: `BigDecimal` (monetary precision for Euro amounts)
  - Column name for money: `study_money_budget` (explicit budget naming, not just `study_money`)
  - hackHours stays as `Int` — no migration in this phase
  - Default values for existing contracts: 0 for both fields (not NULL — zero means "no budget allocated yet")

- **Allocation-Event Lifecycle:**
  - Event deletion: CASCADE — delete all budget allocations linked to the event
  - Person deletion: CASCADE — delete all budget allocations for that person
  - Delete type: Hard delete (remove rows from database, no soft-delete flag)
  - File cleanup on allocation deletion: Keep orphaned files in storage (simple, no cleanup logic needed)

### Claude's Discretion
- JPA entity class structure and annotation choices (following Expense pattern)
- Liquibase changeset organization (single vs multiple changesets)
- Repository query method signatures
- JOIN FETCH query design for lazy-loaded element collections
- Persistence adapter internal structure
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOM-03 | Liquibase migrations create budget_allocation table hierarchy and element collection tables | Liquibase JOINED inheritance pattern (base table + 3 child tables + 2 element collection tables), changeset ordering to prevent FK failures |
| DOM-04 | ContractInternal entity extended with studyHours and studyMoney fields | Simple addColumn migration pattern verified from db.changelog-025 (hackHours precedent), BigDecimal type mapping for monetary field |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Spring Data JPA | 3.x (via Spring Boot 3.x) | Repository abstraction over JPA | Established in codebase — all existing repositories use this |
| Hibernate | 6.x | JPA provider with JOINED inheritance support | Already configured, Hibernate 6 migration completed (changelog-026) |
| Liquibase | 4.x | Database schema migrations | Project standard for all schema changes |
| Jakarta Persistence API | 3.x | JPA annotations and interfaces | Required for Spring Boot 3.x (javax → jakarta migration complete) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Kotlin stdlib | 1.9+ | Kotlin language support | All Kotlin entity classes |
| JUnit 5 | 5.x | Testing framework | Already used in domain layer tests |

**Installation:**
No new dependencies needed — all libraries already present in workday-application module.

## Architecture Patterns

### Recommended Project Structure
```
workday-application/src/main/kotlin/community/flock/eco/workday/application/
├── budget/
│   ├── BudgetAllocation.kt                          # Abstract JPA entity
│   ├── HackTimeBudgetAllocation.kt                  # Concrete entity
│   ├── StudyTimeBudgetAllocation.kt                 # Concrete entity
│   ├── StudyMoneyBudgetAllocation.kt                # Concrete entity
│   ├── DailyTimeAllocation.kt                       # Embeddable value object
│   ├── BudgetAllocationRepository.kt                # Polymorphic queries
│   ├── HackTimeBudgetAllocationRepository.kt        # Type-specific mutations
│   ├── StudyTimeBudgetAllocationRepository.kt       # Type-specific mutations
│   ├── StudyMoneyBudgetAllocationRepository.kt      # Type-specific mutations
│   ├── BudgetAllocationPersistenceAdapter.kt        # Polymorphic adapter
│   ├── HackTimeBudgetAllocationPersistenceAdapter.kt
│   ├── StudyTimeBudgetAllocationPersistenceAdapter.kt
│   └── StudyMoneyBudgetAllocationPersistenceAdapter.kt
├── model/
│   └── ContractInternal.kt                          # Add studyHours, studyMoney fields
└── forms/
    └── ContractInternalForm.kt                      # Add studyHours, studyMoney fields
```

### Pattern 1: JOINED Inheritance Hierarchy
**What:** JPA @Inheritance with InheritanceType.JOINED maps sealed interface to table-per-subclass
**When to use:** Domain has type hierarchy with shared base properties and type-specific properties
**Example:**
```kotlin
// Application layer entity (workday-application)
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
abstract class BudgetAllocation(
    id: Long = 0,
    code: String = java.util.UUID.randomUUID().toString(),
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person?,
    open val eventCode: String?,
    open val date: LocalDate,
    open val description: String? = null,
) : AbstractCodeEntity(id, code)

@Entity
class HackTimeBudgetAllocation(
    id: Long = 0,
    code: String = java.util.UUID.randomUUID().toString(),
    person: Person?,
    eventCode: String?,
    date: LocalDate,
    description: String? = null,
    @ElementCollection(fetch = FetchType.LAZY)
    val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf(),
    val totalHours: Double,
) : BudgetAllocation(id, code, person, eventCode, date, description)

@Entity
class StudyMoneyBudgetAllocation(
    id: Long = 0,
    code: String = java.util.UUID.randomUUID().toString(),
    person: Person?,
    eventCode: String?,
    date: LocalDate,
    description: String? = null,
    val amount: BigDecimal,
    @ElementCollection(fetch = FetchType.LAZY)
    val files: MutableList<community.flock.eco.workday.application.model.Document> = mutableListOf(),
) : BudgetAllocation(id, code, person, eventCode, date, description)
```

**Critical details:**
- Base class extends `AbstractCodeEntity` (provides Long id with AUTO generation and unique String code)
- Base class is `abstract`, child classes are `concrete`
- Person is `@ManyToOne(fetch = FetchType.EAGER)` — matches Expense pattern
- Element collections use `FetchType.LAZY` to prevent N+1 queries (see Don't Hand-Roll section)
- BigDecimal for monetary amount (not Double) — monetary precision requirement

### Pattern 2: Embeddable Value Objects
**What:** @Embeddable classes for element collections that are value objects
**When to use:** Collections of structured values owned by the entity
**Example:**
```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationType
import jakarta.persistence.Embeddable
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import java.time.LocalDate

@Embeddable
class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    @Enumerated(EnumType.STRING)
    val type: BudgetAllocationType,
)
```

**Critical details:**
- No @Entity annotation — embeddable is not a separate table
- Enum uses `@Enumerated(EnumType.STRING)` for readability in database
- Fields match domain value object exactly (date, hours, type)

### Pattern 3: Persistence Adapters with EntityManager
**What:** Separate adapters per type, use EntityManager.getReference() for Person foreign key
**When to use:** Type-specific mutation operations (create/update)
**Example:**
```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class HackTimeBudgetAllocationPersistenceAdapter(
    private val repository: HackTimeBudgetAllocationRepository,
    private val entityManager: EntityManager,
) : HackTimeBudgetAllocationPersistencePort {

    @Transactional
    override fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        return repository
            .save(allocation.toEntity(personReference))
            .toDomain()
    }

    override fun findById(id: Long): HackTimeBudgetAllocation? =
        repository.findByIdOrNull(id)?.toDomain()

    @Transactional
    override fun updateIfExists(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation? {
        require(allocation.id == id) { "Cannot update allocation with different id" }
        return repository.existsById(id)
            .takeIf { it }
            ?.let {
                val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
                repository.save(allocation.toEntity(personReference))
            }?.toDomain()
    }
}
```

**Critical details:**
- `EntityManager.getReference()` creates lazy proxy without SELECT query (performance optimization)
- `@Transactional` on mutation methods (create/update/delete)
- Extension functions `toEntity()` and `toDomain()` separate in mapper file
- Constructor-based dependency injection

### Pattern 4: Polymorphic Repository Queries
**What:** Base repository on abstract entity for queries that return any subtype
**When to use:** Finding allocations regardless of type (by person, by event)
**Example:**
```kotlin
package community.flock.eco.workday.application.budget

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BudgetAllocationRepository : JpaRepository<BudgetAllocation, Long> {

    @Query("""
        SELECT ba FROM BudgetAllocation ba
        WHERE ba.person.uuid = :personUuid
        AND YEAR(ba.date) = :year
    """)
    fun findAllByPersonUuidAndYear(personUuid: UUID, year: Int): List<BudgetAllocation>

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>
}
```

**Critical details:**
- Return type is abstract base class `BudgetAllocation`
- Hibernate polymorphic queries automatically join child tables
- Use JPQL `YEAR()` function for year filtering
- No `@EntityGraph` or JOIN FETCH in base queries (lazy collections loaded on-demand)

### Pattern 5: Domain-Entity Mapping Extensions
**What:** Extension functions in separate mapper file for domain↔entity conversion
**When to use:** All persistence adapters need bidirectional mapping
**Example:**
```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation as HackTimeDomain
import community.flock.eco.workday.application.budget.HackTimeBudgetAllocation as HackTimeEntity

fun HackTimeDomain.toEntity(personReference: Person) =
    HackTimeEntity(
        id = id,
        code = if (id == 0L) java.util.UUID.randomUUID().toString() else null, // code managed by AbstractCodeEntity
        person = personReference,
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toEntity() }.toMutableList(),
        totalHours = totalHours,
    )

fun HackTimeEntity.toDomain() =
    HackTimeDomain(
        id = id,
        person = person!!.toDomain(), // Person is non-null in domain
        eventCode = eventCode,
        date = date,
        description = description,
        dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
        totalHours = totalHours,
    )
```

**Critical details:**
- Type aliases at top to avoid naming conflicts
- `personReference` parameter is EntityManager proxy (no SELECT)
- Mutable collections for JPA entities, immutable for domain
- Non-null assertion (`!!`) when domain type is non-nullable but entity allows null

### Anti-Patterns to Avoid

- **Don't use CascadeType annotations** — Codebase pattern is no cascade annotations anywhere, manual deletions via repository methods
- **Don't use FetchType.EAGER for element collections** — Causes N+1 query problems, use LAZY with explicit JOIN FETCH when needed
- **Don't use Double for monetary amounts** — Use BigDecimal for StudyMoney amount field
- **Don't create entities in domain module** — JPA entities belong in application layer, domain layer has pure Kotlin data classes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| N+1 query problem with element collections | Custom batch loading logic | `@ElementCollection(fetch = FetchType.LAZY)` + explicit `@Query` with JOIN FETCH when loading collections | Hibernate handles batching, but EAGER fetch causes N+1 on every query. Expense domain showed this pitfall clearly. |
| Person foreign key loading | `personRepository.findById()` in adapter | `EntityManager.getReference(Person::class.java, id)` | getReference() returns lazy proxy without SELECT query — significant performance gain when saving allocations |
| Polymorphic queries | Separate queries per subtype | Single repository on base class with JPA polymorphic queries | Hibernate automatically generates correct JOINs across inheritance hierarchy |
| Database migrations | Manual SQL scripts | Liquibase changesets with YAML | Project standard, provides rollback, tracks applied changes |
| ID generation | UUID.randomUUID() in entity constructor | `AbstractCodeEntity` with `@GeneratedValue(strategy = GenerationType.AUTO)` | Auto-increment Long ID is standard for entities using AbstractCodeEntity, ensures JOINED inheritance compatibility |

**Key insight:** JPA JOINED inheritance has subtle ordering requirements in both Liquibase migrations (base table before child tables before FKs) and entity fetching strategies (LAZY to avoid N+1, explicit JOIN FETCH when needed). Custom solutions miss these edge cases.

## Common Pitfalls

### Pitfall 1: Foreign Key Constraint Failures in Liquibase
**What goes wrong:** Migration fails with "table does not exist" error when creating foreign keys
**Why it happens:** Liquibase changesets run in order, foreign key creation must come after both tables exist
**How to avoid:** Follow Expense pattern exactly — create tables in order (base → children → element collections → foreign keys)
**Warning signs:** Liquibase error mentioning FK constraint on non-existent table

**Correct changeset order:**
```yaml
# Changeset 1: Base table
- createTable:
    tableName: budget_allocation
    columns:
      - column: {name: id, type: BIGINT, constraints: {primaryKey: true}}
      - column: {name: code, type: VARCHAR(255), constraints: {unique: true}}
      - column: {name: person_id, type: BIGINT}
      - column: {name: event_code, type: VARCHAR(255)}
      - column: {name: date, type: DATE}
      - column: {name: description, type: VARCHAR(255)}

# Changeset 2: Child tables
- createTable:
    tableName: hack_time_budget_allocation
    columns:
      - column: {name: id, type: BIGINT, constraints: {primaryKey: true}}
      - column: {name: total_hours, type: DOUBLE}

# Changeset 3: Element collection tables
- createTable:
    tableName: hack_time_budget_allocation_daily_time_allocations
    columns:
      - column: {name: hack_time_budget_allocation_id, type: BIGINT}
      - column: {name: date, type: DATE}
      - column: {name: hours, type: DOUBLE}
      - column: {name: type, type: VARCHAR(255)}

# Changeset 4: Foreign keys (LAST)
- addForeignKeyConstraint:
    baseTableName: budget_allocation
    baseColumnNames: person_id
    referencedTableName: person
    referencedColumnNames: id
    constraintName: fk_budget_allocation_person
    onDelete: CASCADE  # User decision: CASCADE deletion

- addForeignKeyConstraint:
    baseTableName: hack_time_budget_allocation
    baseColumnNames: id
    referencedTableName: budget_allocation
    referencedColumnNames: id
    constraintName: fk_hack_time_budget_allocation

- addForeignKeyConstraint:
    baseTableName: hack_time_budget_allocation_daily_time_allocations
    baseColumnNames: hack_time_budget_allocation_id
    referencedTableName: hack_time_budget_allocation
    referencedColumnNames: id
    constraintName: fk_hack_time_daily_allocations
    onDelete: CASCADE  # Element collection owned by entity
```

### Pitfall 2: N+1 Query Problem with EAGER Element Collections
**What goes wrong:** Single query to load 100 allocations triggers 100+ additional queries to load element collections
**Why it happens:** `@ElementCollection(fetch = FetchType.EAGER)` loads collections immediately for each entity
**How to avoid:** Use `FetchType.LAZY` by default, add explicit JOIN FETCH queries when collections are needed
**Warning signs:** Log shows hundreds of SELECT queries, slow performance when loading multiple allocations

**Wrong approach:**
```kotlin
@ElementCollection(fetch = FetchType.EAGER)
val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf()
// Result: N+1 queries on every findAll()
```

**Correct approach:**
```kotlin
// Entity
@ElementCollection(fetch = FetchType.LAZY)
val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf()

// Repository with explicit JOIN FETCH when needed
@Query("""
    SELECT DISTINCT hta FROM HackTimeBudgetAllocation hta
    LEFT JOIN FETCH hta.dailyTimeAllocations
    WHERE hta.person.uuid = :personUuid
    AND YEAR(hta.date) = :year
""")
fun findAllByPersonUuidAndYearWithDailyAllocations(personUuid: UUID, year: Int): List<HackTimeBudgetAllocation>
```

### Pitfall 3: BigDecimal vs Double for Monetary Amounts
**What goes wrong:** Monetary calculations produce incorrect results due to floating-point precision errors
**Why it happens:** Double uses binary floating-point, can't represent 0.1 exactly (0.1 + 0.2 ≠ 0.3)
**How to avoid:** Use `BigDecimal` for all monetary amounts in domain and entity layers
**Warning signs:** Budget totals off by small fractions, rounding errors accumulate

**Wrong:**
```kotlin
val amount: Double = 100.50  // Floating-point precision issues
```

**Correct:**
```kotlin
val amount: BigDecimal = BigDecimal("100.50")  // Exact decimal representation
```

**Database mapping:**
```yaml
- column:
    name: amount
    type: DECIMAL(19, 2)  # Precision 19, scale 2 for Euro cents
```

### Pitfall 4: Code Generation in AbstractCodeEntity
**What goes wrong:** Manually setting code on entity update overwrites existing code
**Why it happens:** AbstractCodeEntity auto-generates code via `UUID.randomUUID().toString()` default
**How to avoid:** Only pass code on new entities (id == 0L), use null/existing code on updates
**Warning signs:** Entity code changes unexpectedly on save

**Correct pattern:**
```kotlin
fun DomainAllocation.toEntity(personReference: Person) =
    EntityAllocation(
        id = id,
        code = if (id == 0L) java.util.UUID.randomUUID().toString() else null,
        // ... rest of fields
    )
```

### Pitfall 5: Event/Person Deletion Without CASCADE
**What goes wrong:** Deleting event/person fails with FK constraint violation
**Why it happens:** Budget allocations reference event (via eventCode) and person (via FK)
**How to avoid:** Add `onDelete: CASCADE` to foreign key constraints in Liquibase migration
**Warning signs:** SQLException about FK constraint violation on delete

**User decision from CONTEXT.md:** Event deletion CASCADE deletes allocations, Person deletion CASCADE deletes allocations

**Liquibase implementation:**
```yaml
- addForeignKeyConstraint:
    baseTableName: budget_allocation
    baseColumnNames: person_id
    referencedTableName: person
    referencedColumnNames: id
    constraintName: fk_budget_allocation_person
    onDelete: CASCADE  # Database-level cascade
```

**Note:** eventCode is String not FK, so no cascade needed. Event service must manually delete allocations before deleting event (or rely on application logic).

## Code Examples

Verified patterns from existing codebase:

### ContractInternal Extension (from db.changelog-025)
```yaml
# Source: workday-application/src/main/database/db/changelog/db.changelog-025-contract-internal-hackdays.yaml
databaseChangeLog:
  - changeSet:
      id: db.changelog-027-contract-internal-study-budget
      author: claude-opus-4.6
      changes:
        - addColumn:
            tableName: contract_internal
            columns:
              - column:
                  name: study_hours
                  type: integer
                  defaultValue: "0"
              - column:
                  name: study_money_budget
                  type: DECIMAL(19, 2)
                  defaultValue: "0.00"
```

**Pattern:** Simple addColumn on existing table with default values (0 for integer, 0.00 for decimal)

### Expense JOINED Inheritance (verified pattern)
```kotlin
// Source: workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/Expense.kt
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@EntityListeners(EventEntityListeners::class)
abstract class Expense(
    @Id
    open val id: UUID = UUID.randomUUID(),
    open val date: LocalDate = LocalDate.now(),
    open val description: String? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person,
    @Enumerated(EnumType.STRING)
    val status: Status = Status.REQUESTED,
    @Enumerated(EnumType.STRING)
    open val type: ExpenseType,
)
```

**Key differences for BudgetAllocation:**
- Use `Long` id (not UUID) — JOINED inheritance works better with auto-increment
- Extend `AbstractCodeEntity` (not standalone @Id) — provides code field
- No EventEntityListeners yet (add in API layer if needed)

### Repository Pattern (from ExpenseRepository)
```kotlin
// Source: workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/ExpenseRepository.kt
@Repository
interface ExpenseRepository : JpaRepository<Expense, UUID> {
    fun findAllByPersonUuid(personUuid: UUID, pageable: Pageable): Page<Expense>
    fun findAllByPersonUserCode(personCode: String, pageable: Pageable): Page<Expense>
    fun findAllByStatus(status: Status): Iterable<Expense>
}

@Repository
interface CostExpenseRepository : CrudRepository<CostExpense, UUID>
```

**Pattern:** Base repository for polymorphic queries, type-specific repositories for mutations

### Element Collection with EAGER Fetch (anti-pattern to avoid)
```kotlin
// Source: workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/CostExpense.kt
@ElementCollection(fetch = FetchType.EAGER)  // AVOID: causes N+1 queries
val files: MutableList<Document> = mutableListOf()
```

**Correction for BudgetAllocation:** Use `FetchType.LAZY` instead

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| javax.persistence.* | jakarta.persistence.* | 2024 (Spring Boot 3.x migration) | All JPA annotations use jakarta package |
| DTYPE discriminator column | Type field with @Enumerated | Still using DTYPE in Expense | No change needed — Hibernate auto-generates DTYPE for JOINED inheritance |
| Hibernate 5 | Hibernate 6 | 2024 (changelog-026) | Sequence generation strategy changed, AUTO now uses sequences not table |
| FetchType.EAGER everywhere | Selective LAZY with JOIN FETCH | Ongoing | Expense still uses EAGER (legacy), new code should use LAZY to prevent N+1 |

**Deprecated/outdated:**
- **javax.persistence package:** Replaced by jakarta.persistence in Spring Boot 3.x
- **GenerationType.TABLE:** Replaced by AUTO (uses sequences) in Hibernate 6

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | JUnit 5 + kotlin-test-junit5 |
| Config file | None (Maven surefire plugin in pom.xml) |
| Quick run command | `./mvnw test -pl workday-application -Dtest=BudgetAllocationPersistenceTest` |
| Full suite command | `./mvnw test -pl workday-application` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOM-03 | Database schema includes budget_allocation hierarchy | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationSchemaTest -Pdevelop` | ❌ Wave 0 |
| DOM-03 | Element collection tables created for daily allocations and files | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationSchemaTest -Pdevelop` | ❌ Wave 0 |
| DOM-03 | Developer can run Liquibase migrations without FK failures | integration | `./mvnw liquibase:update -pl workday-application -Pdevelop` (not a test, validation step) | N/A (manual) |
| DOM-04 | ContractInternal persists studyHours and studyMoney fields | integration | `./mvnw test -pl workday-application -Dtest=ContractInternalPersistenceTest::testStudyBudgetFields -Pdevelop` | ❌ Wave 0 |
| DOM-03 | JPA repositories can save and retrieve all three allocation types with lazy-loaded daily breakdowns | integration | `./mvnw test -pl workday-application -Dtest=BudgetAllocationPersistenceTest::testSaveAndRetrieve* -Pdevelop` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `./mvnw test -pl workday-application -Dtest=BudgetAllocation*Test -Pdevelop` (fast — integration tests with H2)
- **Per wave merge:** `./mvnw test -pl workday-application -Pdevelop` (full suite)
- **Phase gate:** Full suite green + manual Liquibase validation before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationSchemaTest.kt` — validates JOINED inheritance schema, element collection tables (covers DOM-03 schema validation)
- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceTest.kt` — tests save/retrieve with lazy collections, polymorphic queries (covers DOM-03 repository behavior)
- [ ] `workday-application/src/test/kotlin/community/flock/eco/workday/application/model/ContractInternalPersistenceTest.kt` — tests studyHours/studyMoney persistence (covers DOM-04)
- [ ] Spring Boot test configuration if not exists — `@DataJpaTest` with H2 database

**Note:** Liquibase migration validation (DOM-03 "Developer can run migrations without FK failures") is inherently manual — verify by running `./mvnw liquibase:update -Pdevelop` and checking for errors. No automated test needed.

## Sources

### Primary (HIGH confidence)
- **Existing codebase patterns** (direct inspection):
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/Expense.kt` — JOINED inheritance with UUID ID
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Contract.kt` — JOINED inheritance with Long ID + AbstractCodeEntity
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/ExpensePersistenceAdapter.kt` — Polymorphic adapter pattern
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/CostExpensePersistenceAdapter.kt` — Type-specific adapter with EntityManager.getReference()
  - `workday-application/src/main/database/db/changelog/db.changelog-002-expenses.yaml` — JOINED inheritance Liquibase pattern (base → children → element collections → FKs)
  - `workday-application/src/main/database/db/changelog/db.changelog-025-contract-internal-hackdays.yaml` — Simple addColumn pattern
  - `workday-core/src/main/kotlin/community/flock/eco/workday/core/model/AbstractCodeEntity.kt` — Long ID + unique code base class
  - `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/` — Domain layer types and ports

### Secondary (MEDIUM confidence)
- **Spring Data JPA documentation** (inferred from codebase patterns) — JpaRepository interface, polymorphic queries, derived query methods
- **Hibernate 6 documentation** (inferred from changelog-026) — GenerationType.AUTO now uses sequences, JOINED inheritance behavior unchanged

### Tertiary (LOW confidence)
None — all findings verified directly from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, versions verified from existing code
- Architecture: HIGH - Direct patterns from Expense and Contract domains, proven in production
- Pitfalls: HIGH - N+1 query issue documented in codebase history, FK ordering failure reproducible
- Liquibase: HIGH - Exact changeset structure from db.changelog-002-expenses.yaml
- ContractInternal extension: HIGH - Exact pattern from db.changelog-025-contract-internal-hackdays.yaml

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days — stable domain, JPA/Hibernate patterns unlikely to change)
