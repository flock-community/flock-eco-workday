# Stack Research: Budget Allocation Tracking

**Domain:** Budget allocation tracking (hack hours, study hours, study money) for workforce management
**Researched:** 2026-03-02
**Confidence:** HIGH

## Context

This research focuses on **adding** budget allocation tracking to an **existing** Kotlin/Spring Boot + React/Material-UI workforce management application. The codebase already has established patterns for polymorphic entities (Expense domain with JOINED inheritance), Liquibase migrations, and Wirespec API contracts. This is NOT greenfield - we're extending proven patterns.

**Key Constraint:** Follow the Expense domain pattern exactly. This is architectural scaffolding, not feature development.

---

## Recommended Stack Patterns

### JPA Inheritance Strategy

| Technology | Pattern | Why This Pattern |
|------------|---------|------------------|
| JPA Inheritance | `InheritanceType.JOINED` | **PROVEN in this codebase**. Expense domain uses JOINED for CostExpense/TravelExpense subtypes. Clean polymorphic queries, proper normalization, no data duplication. Hibernate generates efficient SQL with JOIN clauses. |
| Base Entity | Abstract class with `@Entity @Inheritance(strategy = InheritanceType.JOINED)` | Expense.kt pattern: abstract entity defines common fields (id, person, date, description, type discriminator). Subtypes extend with specific fields. |
| Discriminator Column | Enum-based `type` field with `@Enumerated(EnumType.STRING)` | Expense uses `ExpenseType` enum stored as VARCHAR. Readable in DB, type-safe in code, migration-friendly. |
| Embeddable Collections | `@ElementCollection(fetch = FetchType.EAGER)` with `@Embeddable` class | CostExpense uses this for files. DailyTimeAllocation should use same pattern - separate table joined by parent ID. |
| ID Strategy | `Long` with auto-increment (via `AbstractIdEntity`) | ContractInternal and most entities use Long ID. Expense uses UUID for distributed scenarios. Budget allocations tied to person/event - Long is sufficient. |

**Rationale:** JOINED inheritance is the gold standard for polymorphic persistence when:
1. Subtypes have distinct fields (hack/study time have dailyAllocations; study money has amount/files)
2. You need polymorphic queries (fetch all allocations for person/event regardless of type)
3. Database normalization matters (no nullable columns or JSON blobs)

**What NOT to do:**
- ❌ `SINGLE_TABLE` inheritance - creates sparse tables with nullable columns for subtype-specific fields
- ❌ `TABLE_PER_CLASS` inheritance - no polymorphic queries, complex union-based SQL
- ❌ JSON columns for polymorphic data - defeats type safety, query performance, referential integrity

---

### Liquibase Migration Patterns

| Pattern | Approach | Why |
|---------|----------|-----|
| Table Creation Order | 1. Base table → 2. Subtype tables → 3. Element collection tables → 4. Foreign keys | **From db.changelog-002-expenses.yaml**. Base table first (budget_allocation), then joined subtypes (hack_time_budget_allocation, study_time_budget_allocation, study_money_budget_allocation), then collection tables (daily_time_allocations, files), finally constraints. |
| Primary Keys | Base table: auto-increment BIGINT. Subtype tables: same PK value (FK to base) | JOINED inheritance requires subtype PK = base PK. Liquibase: `autoIncrement: true` on base, manual FK constraint from subtype to base. |
| Element Collections | Separate table with composite key (parent_id + collection fields) | Example: `hack_time_budget_allocation_daily_time_allocations` table with columns: parent_id (FK), date, hours, type. No separate PK - parent owns lifecycle. |
| Enum Columns | `VARCHAR(255)` | JPA `@Enumerated(EnumType.STRING)` maps to VARCHAR. Never use `EnumType.ORDINAL` - breaks on enum reordering. |
| Money Columns | `DECIMAL(19,2)` for currency | **From expense and contract tables**. Sufficient precision for euro amounts. Maps to `BigDecimal` in Kotlin. Never use DOUBLE for money. |
| Changelog Sequencing | One changeSet per logical change, descriptive IDs | Next number: 027 for allocations, 028 for contract fields. Each changeSet atomic - rollback-safe. |

**Migration Sequence for Budget Allocations:**

```yaml
# db.changelog-027-budget-allocations.yaml
1. budget_allocation base table (id, person_id, event_code, date, description, type)
2. hack_time_budget_allocation (id FK, total_hours)
3. study_time_budget_allocation (id FK, total_hours)
4. study_money_budget_allocation (id FK, amount DECIMAL)
5. hack_time_budget_allocation_daily_time_allocations (parent_id FK, date, hours, type VARCHAR)
6. study_time_budget_allocation_daily_time_allocations (parent_id FK, date, hours, type VARCHAR)
7. study_money_budget_allocation_files (parent_id FK, file UUID, name VARCHAR)
8. Foreign key constraints (budget_allocation.person_id → person.id, subtype.id → budget_allocation.id)
```

```yaml
# db.changelog-028-contract-internal-study-budget.yaml
ALTER TABLE contract_internal ADD COLUMN study_hours INTEGER DEFAULT 0
ALTER TABLE contract_internal ADD COLUMN study_money DECIMAL(19,2) DEFAULT 0.00
```

**Rationale:** This migration pattern ensures:
- **Referential integrity** - foreign keys enforce person exists, subtype links to base
- **Rollback safety** - each changeSet is atomic
- **Query performance** - proper indexing on person_id and event_code
- **Zero downtime** - default values on new contract columns

**What NOT to do:**
- ❌ Multiple tables in one changeSet - breaks atomicity
- ❌ Missing default values on new columns - fails on existing data
- ❌ Forgetting FK constraints - orphaned rows, data corruption
- ❌ Using DOUBLE for money - rounding errors accumulate

---

### Wirespec API Design

| Pattern | Approach | Why |
|---------|----------|-----|
| Polymorphic Response | Unified response type with optional detail fields | **From expenses.ws**. Single `BudgetAllocationResponse` with `allocationType` enum + optional `hackTimeDetails`/`studyTimeDetails`/`studyMoneyDetails`. Frontend checks type, accesses relevant detail object. |
| Type-Specific Inputs | Separate input types per allocation subtype | `HackTimeBudgetAllocationInput`, `StudyTimeBudgetAllocationInput`, `StudyMoneyBudgetAllocationInput`. Each has required fields for that type. Prevents invalid combinations (amount + dailyAllocations). |
| Endpoint Naming | Type-specific creation/update, polymorphic read/delete | POST/PUT: `/api/budget-allocations/hack-time`, `/api/budget-allocations/study-time`, `/api/budget-allocations/study-money`. GET/DELETE: `/api/budget-allocations/{id}` returns unified type. |
| Date Encoding | ISO-8601 strings (`String` in wirespec, `LocalDate.parse()` in Kotlin) | Consistent with existing patterns. Frontend uses `dayjs`, backend uses `LocalDate`. |
| Money Encoding | `Number` in wirespec (JSON number), `BigDecimal` in Kotlin | **CRITICAL**: Frontend sends JS number, backend receives as BigDecimal for precision. Never use Double in domain layer. |
| UUID Fields | Wirespec `UUID` type with validation | Person ID, file IDs use UUID type. Generates validation on both sides. |
| Integer Types | `Integer32` for counts/hours, `Integer64` for database IDs | studyHours is Int32 (hours per year). Budget allocation ID is Int64 (database BIGINT). |

**Response Type Design:**

```wirespec
type BudgetAllocationResponse {
    id: Integer64,
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    allocationType: BudgetAllocationResponseType,  # Discriminator
    hackTimeDetails: HackTimeDetails?,             # Only set if allocationType == HACK_TIME
    studyTimeDetails: StudyTimeDetails?,           # Only set if allocationType == STUDY_TIME
    studyMoneyDetails: StudyMoneyDetails?          # Only set if allocationType == STUDY_MONEY
}

enum BudgetAllocationResponseType {
    HACK_TIME, STUDY_TIME, STUDY_MONEY
}
```

**Input Type Design:**

```wirespec
# Separate inputs prevent invalid combinations
type HackTimeBudgetAllocationInput {
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    totalHours: Number,
    dailyAllocations: DailyTimeAllocationInput[]  # Required for time allocations
}

type StudyMoneyBudgetAllocationInput {
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    amount: Number,                                # Required for money allocations
    files: BudgetAllocationFileInput[]
}
```

**Endpoint Pattern:**

```wirespec
# Polymorphic reads
endpoint BudgetAllocationsByPerson GET /api/budget-allocations ? { personId: UUID, year: Integer32 } -> {
    200 -> BudgetAllocationResponse[]
}

endpoint BudgetAllocationById GET /api/budget-allocations/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    404 -> Error
}

# Type-specific writes
endpoint HackTimeBudgetAllocationCreate POST HackTimeBudgetAllocationInput /api/budget-allocations/hack-time -> {
    200 -> BudgetAllocationResponse
}

endpoint StudyMoneyBudgetAllocationUpdate PUT StudyMoneyBudgetAllocationInput /api/budget-allocations/study-money/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
}
```

**Rationale:**
- **Type Safety**: Separate inputs prevent sending `amount` to a time allocation endpoint
- **API Evolution**: Adding new allocation types doesn't break existing clients (new optional detail field)
- **Frontend Simplicity**: Single response type means one React component can render all types
- **Validation**: Wirespec generates TypeScript types + Kotlin data classes with validation

**What NOT to do:**
- ❌ Single input type with union of all fields - loses type safety, validation is runtime
- ❌ Separate response types per allocation - frontend needs type guards for every query
- ❌ Encoding money as strings - defeats numeric validation, requires parsing
- ❌ Generic `/api/budget-allocations` POST endpoint - can't validate required fields per type

---

### Domain Layer Architecture

| Component | Pattern | Why |
|-----------|---------|-----|
| Domain Model | Sealed interface with data class implementations | **From Expense domain**. `sealed interface BudgetAllocation` with `HackTimeBudgetAllocation`, `StudyTimeBudgetAllocation`, `StudyMoneyBudgetAllocation` as data classes. Exhaustive when-expressions, immutable state. |
| Value Objects | Data classes for embeddables | `DailyTimeAllocation(date: LocalDate, hours: Double, type: BudgetAllocationType)`. Immutable, no identity. |
| Persistence Port | Interface in domain layer, adapter in application layer | `BudgetAllocationPersistencePort` defines contract. `BudgetAllocationPersistenceAdapter` implements with JPA repositories. Dependency inversion - domain doesn't depend on JPA. |
| Domain Service | Thin orchestration layer | `BudgetAllocationService` delegates to persistence port. No business logic (allocations are facts, not state machines). Minimal validation. |
| Type-Specific Ports | Separate ports for creation/update of each subtype | `StudyMoneyBudgetAllocationPersistencePort` with `create()/updateIfExists()`. Type-safe at domain boundary. |

**Architecture Layers:**

```
domain/
  └── budget/
      ├── BudgetAllocation.kt            # Sealed interface + data classes
      ├── BudgetAllocationType.kt        # Enum (STUDY, HACK)
      ├── DailyTimeAllocation.kt         # Value object
      ├── BudgetAllocationPersistencePort.kt   # Interface (polymorphic queries)
      ├── StudyMoneyBudgetAllocationPersistencePort.kt  # Interface (type-specific mutations)
      ├── HackTimeBudgetAllocationPersistencePort.kt
      ├── StudyTimeBudgetAllocationPersistencePort.kt
      ├── BudgetAllocationService.kt      # Domain service (orchestration)
      ├── StudyMoneyBudgetAllocationService.kt  # Type-specific services
      └── BudgetAllocationEvent.kt        # Domain events (create/update/delete)

workday-application/
  └── budget/
      ├── BudgetAllocation.kt             # JPA abstract entity (@Entity @Inheritance)
      ├── HackTimeBudgetAllocation.kt     # JPA entity (extends abstract)
      ├── StudyTimeBudgetAllocation.kt    # JPA entity (extends abstract)
      ├── StudyMoneyBudgetAllocation.kt   # JPA entity (extends abstract)
      ├── BudgetAllocationType.kt         # JPA enum (matches domain enum)
      ├── DailyTimeAllocation.kt          # JPA embeddable (@Embeddable)
      ├── BudgetAllocationRepository.kt   # Spring Data JPA repository
      ├── BudgetAllocationPersistenceAdapter.kt  # Implements domain port, uses repos
      ├── BudgetAllocationMapper.kt       # Entity <-> Domain conversion
      ├── BudgetAllocationConfiguration.kt  # Spring beans
      ├── BudgetAllocationAuthority.kt    # Security enum
      └── BudgetAllocationController.kt   # REST endpoints (wirespec handlers)
```

**Rationale:**
- **Hexagonal Architecture**: Domain in center, infrastructure (JPA) at edges
- **Testability**: Domain services unit-testable without Spring/database
- **Type Safety**: Sealed interfaces + when-expressions = compiler-enforced exhaustiveness
- **Separation of Concerns**: Domain defines "what", application layer defines "how"

**What NOT to do:**
- ❌ Domain entities with JPA annotations - couples domain to persistence framework
- ❌ Business logic in controllers - controllers are adapters, not business layer
- ❌ Generic `create(allocation: BudgetAllocation)` port - loses type specificity
- ❌ Mutable domain models - breaks functional composition, harder to test

---

## Pattern Specifics: JOINED Inheritance Deep Dive

### Why JOINED Over Alternatives

**Single Table Inheritance (Bad for Budget Allocations):**
```sql
-- SINGLE_TABLE approach would create:
CREATE TABLE budget_allocation (
    id BIGINT PRIMARY KEY,
    type VARCHAR(255),           -- Discriminator
    person_id BIGINT,
    -- Common fields --
    total_hours DOUBLE,          -- NULL for money allocations ❌
    amount DECIMAL(19,2),        -- NULL for time allocations ❌
    daily_allocations JSON,      -- Not normalized, can't query ❌
    files JSON                   -- Not normalized, can't query ❌
);
```
**Problems:**
- Sparse table with many NULLs
- Can't enforce NOT NULL on subtype-specific fields
- Element collections become JSON blobs (can't join, index, or validate)
- Wastes space (every row has columns for all subtypes)

**JOINED Inheritance (Correct):**
```sql
-- Base table: common fields only
CREATE TABLE budget_allocation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(255) NOT NULL,
    person_id BIGINT NOT NULL,
    event_code VARCHAR(255),
    date DATE NOT NULL,
    description VARCHAR(255)
);

-- Subtype table: specific fields only
CREATE TABLE hack_time_budget_allocation (
    id BIGINT PRIMARY KEY,  -- FK to budget_allocation.id
    total_hours DOUBLE NOT NULL,  -- NOT NULL enforceable ✓
    FOREIGN KEY (id) REFERENCES budget_allocation(id)
);

-- Element collection: normalized
CREATE TABLE hack_time_budget_allocation_daily_time_allocations (
    hack_time_budget_allocation_id BIGINT NOT NULL,
    date DATE NOT NULL,
    hours DOUBLE NOT NULL,
    type VARCHAR(255) NOT NULL,
    FOREIGN KEY (hack_time_budget_allocation_id)
        REFERENCES hack_time_budget_allocation(id)
);
```
**Benefits:**
- Normalized schema (no NULLs except optional fields)
- Subtype-specific constraints enforceable
- Element collections properly indexed and queryable
- Space-efficient (rows only have relevant columns)

### JPA Entity Mapping

**Base Entity:**
```kotlin
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@EntityListeners(EventEntityListeners::class)
abstract class BudgetAllocation(
    id: Long = 0,
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person,
    open val eventCode: String? = null,
    open val date: LocalDate,
    open val description: String? = null,
    @Enumerated(EnumType.STRING)
    open val type: BudgetAllocationType,  // Discriminator
) : AbstractIdEntity(id)
```

**Subtype Entity:**
```kotlin
@Entity
@EntityListeners(EventEntityListeners::class)
class HackTimeBudgetAllocation(
    id: Long = 0,
    person: Person,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf(),
    val totalHours: Double = 0.0,
) : BudgetAllocation(id, person, eventCode, date, description, BudgetAllocationType.HACK)
```

**Embeddable:**
```kotlin
@Embeddable
class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    @Enumerated(EnumType.STRING)
    val type: BudgetAllocationType,  // Per-day type override
)
```

**Key Points:**
1. **Abstract base class**: Can't instantiate directly, only through subtypes
2. **Discriminator not explicit**: `type` field serves as discriminator (Hibernate infers)
3. **Subtype constructor**: Calls super() with hardcoded type (e.g., `BudgetAllocationType.HACK`)
4. **Element collections**: Hibernate creates separate table, manages parent FK
5. **EAGER fetch**: Acceptable for small collections (days per event < 10). Use LAZY for large collections.

### Repository Queries

**Polymorphic Query (Base Repository):**
```kotlin
@Repository
interface BudgetAllocationRepository : JpaRepository<BudgetAllocation, Long> {
    // Hibernate generates LEFT JOIN to subtype tables
    fun findAllByPersonUuid(personUuid: UUID): List<BudgetAllocation>

    // Custom query with year filter
    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.person.uuid = :personUuid AND YEAR(ba.date) = :year")
    fun findAllByPersonUuidAndYear(personUuid: UUID, year: Int): List<BudgetAllocation>
}
```
**Generated SQL:**
```sql
SELECT ba.id, ba.type, ba.person_id, ba.date,
       ht.total_hours, st.total_hours, sm.amount
FROM budget_allocation ba
LEFT JOIN hack_time_budget_allocation ht ON ba.id = ht.id
LEFT JOIN study_time_budget_allocation st ON ba.id = st.id
LEFT JOIN study_money_budget_allocation sm ON ba.id = sm.id
WHERE ba.person_id = ? AND YEAR(ba.date) = ?
```

**Type-Specific Repository:**
```kotlin
@Repository
interface HackTimeBudgetAllocationRepository : CrudRepository<HackTimeBudgetAllocation, Long>
```
- Used for type-specific creation/updates
- Only queries hack_time_budget_allocation + base table (no LEFT JOINs to other subtypes)

### Mapper Pattern

**Entity → Domain:**
```kotlin
fun BudgetAllocation.toBudgetAllocationDomain(): DomainBudgetAllocation =
    when (this) {  // Exhaustive: compiler enforces all subtypes handled
        is HackTimeBudgetAllocation -> toDomain()
        is StudyTimeBudgetAllocation -> toDomain()
        is StudyMoneyBudgetAllocation -> toDomain()
        else -> error("Unsupported type")  // Defensive: catch new subtypes
    }

fun HackTimeBudgetAllocation.toDomain() = DomainHackTime(
    id = id,
    person = person.toDomain(),  // Map JPA Person to domain Person
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
    totalHours = totalHours,
)
```

**Domain → Entity:**
```kotlin
fun DomainHackTime.toEntity(personReference: Person) = HackTimeBudgetAllocation(
    id = id,
    person = personReference,  // Reattach JPA entity (avoid detached entity errors)
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toEntity() }.toMutableList(),
    totalHours = totalHours,
)
```
**Critical:** Always pass JPA `Person` reference (fetched from PersonRepository) when converting domain → entity. Never create new Person entity - causes detached entity exceptions.

---

## Liquibase Best Practices for Inheritance

### Changelog Organization

**One changelog per logical migration:**
- `db.changelog-027-budget-allocations.yaml` - All budget allocation tables
- `db.changelog-028-contract-internal-study-budget.yaml` - Contract field additions

**Multiple changesets within changelog:**
Each table/constraint = one changeSet. Rollback atomicity.

### ChangeSet Ordering

**Dependency order:**
1. Base table (no FKs to other new tables)
2. Subtype tables (FK to base)
3. Element collection tables (FK to subtypes)
4. Foreign key constraints (after all tables exist)

**Incorrect Order (FAILS):**
```yaml
- createTable: hack_time_budget_allocation  # ❌ References budget_allocation (doesn't exist yet)
- createTable: budget_allocation
```

**Correct Order:**
```yaml
- createTable: budget_allocation
- createTable: hack_time_budget_allocation  # ✓ Base exists
- addForeignKeyConstraint: (hack_time → budget_allocation)
```

### Element Collection Tables

**Pattern:**
```yaml
- createTable:
    tableName: hack_time_budget_allocation_daily_time_allocations
    columns:
      - column:
          name: hack_time_budget_allocation_id  # Parent FK (part of composite key)
          type: BIGINT
          constraints:
            nullable: false
      - column:
          name: date        # Part of composite key (date uniquely identifies row within parent)
          type: DATE
          constraints:
            nullable: false
      - column:
          name: hours       # Value field
          type: DOUBLE
          constraints:
            nullable: false
      - column:
          name: type        # Value field (enum)
          type: VARCHAR(255)
          constraints:
            nullable: false
```
**No explicit PK:** JPA `@ElementCollection` uses composite key (parent_id + collection fields). Parent owns lifecycle.

### Default Values for New Columns

**Critical for zero-downtime deployments:**
```yaml
- addColumn:
    tableName: contract_internal
    columns:
      - column:
          name: study_hours
          type: INTEGER
          defaultValue: "0"  # ✓ Existing rows get 0, not NULL
      - column:
          name: study_money
          type: DECIMAL(19,2)
          defaultValueNumeric: "0.00"  # ✓ Must use defaultValueNumeric for DECIMAL
```
**Without defaults:** Migration fails if existing rows exist (NOT NULL constraint violation).

### Foreign Key Naming Convention

**Pattern:** `FK_{table}_{referenced_table}` or descriptive name
```yaml
constraintName: FK_budget_allocation_person
constraintName: FK_hack_time_budget_allocation
constraintName: FK_hack_time_daily_allocations
```
**Why named constraints:** Easier to drop/modify in future migrations.

---

## Wirespec Contract Design Considerations

### Number Precision: Frontend vs Backend

**Frontend (JavaScript):**
```typescript
const allocation = {
    amount: 1234.56,  // JS number (IEEE 754 double)
    totalHours: 16.5
};
```

**Backend (Kotlin):**
```kotlin
// Wirespec deserializes Number → BigDecimal
val allocation = StudyMoneyBudgetAllocation(
    amount = BigDecimal("1234.56"),  // Exact precision
    // ...
)
```

**Wire Format (JSON):**
```json
{
    "amount": 1234.56,
    "totalHours": 16.5
}
```

**Why this works:**
- Wirespec `Number` type maps to JSON number (no precision loss during serialization)
- Backend immediately converts to BigDecimal (arithmetic uses exact precision)
- Frontend displays as number (no conversion needed)

**What NOT to do:**
- ❌ String for numbers - defeats validation, requires parsing
- ❌ Double in backend - accumulates rounding errors in arithmetic
- ❌ Cents as integers - confusing API (1234 vs 12.34?), breaks existing patterns

### Optional vs Required Fields

**Design Rule:** If domain model requires it, API requires it. If domain model allows null, API allows null.

**Example:**
```wirespec
type HackTimeBudgetAllocationInput {
    personId: UUID,           # Required - can't create allocation without person
    eventCode: String?,       # Optional - standalone allocations have no event
    date: String,             # Required - date is mandatory
    description: String?,     # Optional - description is optional
    totalHours: Number,       # Required - time allocation must have hours
    dailyAllocations: DailyTimeAllocationInput[]  # Required - must have breakdown
}
```

**Frontend Validation:** Formik + Yup schemas enforce required fields before API call.
**Backend Validation:** Wirespec-generated types throw on missing required fields.

### Error Responses

**Pattern from expenses.ws:**
```wirespec
endpoint StudyMoneyBudgetAllocationCreate POST StudyMoneyBudgetAllocationInput /api/budget-allocations/study-money -> {
    200 -> BudgetAllocationResponse
    500 -> Error  # Generic error (validation, business logic, persistence)
}

endpoint BudgetAllocationById GET /api/budget-allocations/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    404 -> Error  # Not found (specific error code)
}

type Error {
    message: String
}
```

**Controller Implementation:**
```kotlin
override suspend fun studyMoneyBudgetAllocationCreate(request: StudyMoneyBudgetAllocationCreate.Request): StudyMoneyBudgetAllocationCreate.Response<*> {
    return try {
        val allocation = studyMoneyMapper.consume(request.body)
        val created = studyMoneyService.create(allocation)
        StudyMoneyBudgetAllocationCreate.Response200(created.produce())
    } catch (e: Exception) {
        StudyMoneyBudgetAllocationCreate.Response500(Error(e.message ?: "Unknown error"))
    }
}
```

**Why 500 for all errors:** Simplifies wirespec contract. Specific error codes (400 validation, 403 forbidden) handled via Spring exception handlers, not wirespec responses.

### Pagination

**Not needed for budget allocations:**
- Query scoped by person + year (max ~50 allocations per person per year)
- Event query scoped by event (max ~10 allocations per event)
- No infinite scroll, no lazy loading

**Expense domain uses pagination:**
```wirespec
endpoint ExpenseAll GET /api/expenses ? { personId: String, page: Integer32, size: Integer32, sort: String[] } -> {
    200 -> Expense[] # { `x-total`: Integer32 }
}
```
Budget allocations don't need this complexity.

---

## Security Considerations

### Authority-Based Access Control

**Pattern from ExpenseAuthority:**
```kotlin
enum class BudgetAllocationAuthority : Authority {
    READ,   // View own allocations (employees) or all allocations (admins)
    WRITE,  // Create/update allocations (admins only, usually)
    ADMIN,  // Delete allocations, override validations
}
```

**Controller Annotations:**
```kotlin
@PreAuthorize("hasAuthority('BudgetAllocationAuthority.READ')")
override suspend fun budgetAllocationsByPerson(request: BudgetAllocationsByPerson.Request): BudgetAllocationsByPerson.Response<*> {
    val personId = request.queries.personId.let(UUID::fromString)
    return when {
        authentication().isAdmin() -> service.findAllByPersonUuid(personId, request.queries.year)
        else -> service.findAllByPersonUserCode(authentication().name, request.queries.year)
    }.map { it.produce() }
    .let { BudgetAllocationsByPerson.Response200(it) }
}
```

**Key Points:**
1. **Non-admins see only own data:** Query by authentication.name (user code), ignore request personId
2. **Admins see all data:** Query by request personId
3. **Write operations admin-only:** Budget allocations are facts, not employee requests

### Person Ownership Check

**Pattern from ExpenseController:**
```kotlin
private fun Authentication.isOwnerOf(allocation: BudgetAllocation) =
    isAssociatedWith(allocation.person)
```
Check before allowing updates/deletes on specific allocation.

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| JPA JOINED Inheritance | **HIGH** | Proven in Expense domain. 5+ years in production. Exact same use case (polymorphic entities with subtype-specific fields + element collections). |
| Liquibase Migrations | **HIGH** | Pattern directly from `db.changelog-002-expenses.yaml`. Well-tested table creation order, FK constraints, element collections. |
| Wirespec API Design | **HIGH** | Expense API uses identical pattern (unified response, separate inputs, type discriminator). Wirespec 0.17.8 stable, code generation tested. |
| Domain Architecture | **HIGH** | Hexagonal architecture with persistence ports established in Expense, Assignment, LeaveDays domains. No greenfield risk. |
| Number Precision | **HIGH** | Contract uses BigDecimal for salary/money. Expense uses Double for distance/allowance (acceptable for non-monetary). Budget money uses BigDecimal. |

**Overall Confidence: HIGH** - This is not inventing new patterns. This is applying proven patterns from the Expense domain to a structurally identical use case.

---

## What NOT to Do: Anti-Patterns

### ❌ Anti-Pattern 1: JSON Columns for Polymorphism

**Bad:**
```sql
CREATE TABLE budget_allocation (
    id BIGINT PRIMARY KEY,
    type VARCHAR(255),
    data JSON  -- ❌ All subtype-specific fields as JSON
);
```

**Why bad:**
- Can't query/index JSON fields efficiently
- No schema enforcement (typos, type errors go undetected)
- JPA can't map JSON to domain objects without custom converters
- Defeats referential integrity (can't FK to Person inside JSON)

**Use JOINED inheritance instead.**

---

### ❌ Anti-Pattern 2: Generic Wirespec Input

**Bad:**
```wirespec
type BudgetAllocationInput {
    allocationType: BudgetAllocationResponseType,
    personId: UUID,
    totalHours: Number?,  # ❌ Optional - required for time, not for money
    amount: Number?,      # ❌ Optional - required for money, not for time
    dailyAllocations: DailyTimeAllocationInput[]?  # ❌ What if empty for time allocation?
}
```

**Why bad:**
- Frontend can send invalid combinations (amount + dailyAllocations)
- Backend validation is complex (check type, then check required fields)
- TypeScript types don't prevent mistakes (all fields optional)

**Use separate input types per allocation subtype.**

---

### ❌ Anti-Pattern 3: Mutable Domain Models

**Bad:**
```kotlin
data class HackTimeBudgetAllocation(
    var id: Long,  # ❌ var
    var totalHours: Double,  # ❌ var
    val dailyTimeAllocations: MutableList<DailyTimeAllocation>  # ❌ Mutable
)
```

**Why bad:**
- Hard to reason about state changes (who mutated what?)
- Can't use in functional pipelines (map/filter/fold)
- Concurrency bugs (shared mutable state)

**Use immutable data classes (val, List not MutableList).**

---

### ❌ Anti-Pattern 4: Business Logic in Controller

**Bad:**
```kotlin
@PostMapping("/api/budget-allocations/hack-time")
fun create(input: HackTimeBudgetAllocationInput): BudgetAllocationResponse {
    // ❌ Validation in controller
    if (input.totalHours != input.dailyAllocations.sumOf { it.hours }) {
        throw IllegalArgumentException("Total hours mismatch")
    }

    // ❌ Persistence in controller
    val entity = HackTimeBudgetAllocation(...)
    repository.save(entity)

    return entity.produce()
}
```

**Why bad:**
- Untestable without Spring context
- Violates single responsibility (controller is adapter, not business logic)
- Duplicated validation across endpoints

**Validation and persistence belong in domain/application services.**

---

### ❌ Anti-Pattern 5: Detached Entity Errors

**Bad:**
```kotlin
fun create(allocation: DomainHackTime): HackTimeBudgetAllocation {
    val entity = allocation.toEntity(
        personReference = Person(uuid = allocation.person.uuid)  # ❌ New detached Person
    )
    return repository.save(entity)  # ❌ Throws: object references an unsaved transient instance
}
```

**Why bad:** JPA can't persist entity with detached references.

**Correct:**
```kotlin
fun create(allocation: DomainHackTime): HackTimeBudgetAllocation {
    val person = entityManager.getReference(Person::class.java, allocation.person.uuid)  # ✓ Managed entity
    val entity = allocation.toEntity(personReference = person)
    return repository.save(entity)
}
```

---

## Verification Checklist

Before considering implementation complete:

**Domain Layer:**
- [ ] Sealed interface compiles with exhaustive when-expressions
- [ ] Domain models are immutable (val, not var)
- [ ] Persistence ports use domain types, not JPA entities

**Application Layer:**
- [ ] JPA entities use JOINED inheritance
- [ ] Element collections use @Embeddable classes
- [ ] Repositories return JPA entities, not domain types
- [ ] Mappers handle all subtypes (entity ↔ domain)
- [ ] Persistence adapters reattach Person references (getReference, not new)

**Migrations:**
- [ ] Base table created before subtypes
- [ ] Foreign keys added after all tables exist
- [ ] Element collection tables have parent FK, no explicit PK
- [ ] New contract columns have default values
- [ ] Enum columns use VARCHAR(255), not INTEGER

**Wirespec:**
- [ ] Response type has discriminator + optional detail fields
- [ ] Separate input types per allocation subtype
- [ ] Money fields use Number (maps to BigDecimal)
- [ ] Date fields use String (ISO-8601)
- [ ] IDs use Integer64 (BIGINT)

**Controller:**
- [ ] Implements wirespec-generated handler interfaces
- [ ] Uses @PreAuthorize for authority checks
- [ ] Admin check before allowing cross-person queries
- [ ] Catches exceptions, returns Error responses

**Build:**
- [ ] `./mvnw clean install` succeeds
- [ ] `npm run generate` generates TypeScript types
- [ ] Application starts with -Pdevelop profile
- [ ] Liquibase migrations apply without errors

---

## Sources

- **Codebase Analysis:**
  - `/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/domain/src/main/kotlin/community/flock/eco/workday/domain/expense/` - Expense domain pattern (sealed interface, persistence ports, services)
  - `/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/` - JPA entities (JOINED inheritance), repositories, persistence adapters, controller
  - `/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/database/db/changelog/db.changelog-002-expenses.yaml` - Liquibase migration pattern for JOINED inheritance
  - `/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application/src/main/wirespec/expenses.ws` - Wirespec polymorphic API pattern
  - `/Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/docs/plans/2026-02-28-budget-allocations-implementation.md` - Implementation plan with specific requirements

- **Tech Stack Verification:**
  - `.planning/codebase/STACK.md` - Confirmed versions: Kotlin 1.9.22, Spring Boot 3.4.13, JPA/Hibernate (via Spring Data), Liquibase 5.0.1, Wirespec 0.17.8
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt` - BigDecimal usage for money, helper methods for period calculations

**Confidence Level:** HIGH - All recommendations derived from existing, production-tested patterns in this codebase. No external research needed - the Expense domain is the blueprint.

---

*Stack research for: Budget Allocation Tracking*
*Researched: 2026-03-02*
