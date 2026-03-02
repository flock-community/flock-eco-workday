# Architecture Research: Budget Allocation Tracking

**Domain:** Workforce Management - Budget Tracking
**Researched:** 2026-03-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

Budget allocation tracking follows the proven **Expense domain pattern** from the existing codebase. This is a hexagonal architecture with domain-driven design, using sealed interfaces for polymorphic types.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Presentation Layer (React)                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Budget Tab      │  │ Event Dialog     │  │ Dashboard Charts │   │
│  │ (read-mostly)   │  │ (admin writes)   │  │ (visualization)  │   │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                    │                      │              │
├───────────┴────────────────────┴──────────────────────┴─────────────┤
│                    API Layer (REST Controllers)                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ BudgetAllocationController (Wirespec handlers)              │    │
│  │ - findAll, findById, create*, update*, delete*              │    │
│  │ - Authority-based access control (@PreAuthorize)            │    │
│  └────────────────────────┬────────────────────────────────────┘    │
├────────────────────────────┴─────────────────────────────────────────┤
│                    Application Layer (Services)                      │
│  ┌──────────────────────┐     ┌───────────────────────────────┐     │
│  │ BudgetAllocationMapper│────▶│ BudgetAllocationPersistence   │     │
│  │ (Domain ↔ Entity)     │     │ Adapter                       │     │
│  │ (Domain ↔ API)        │     │ - Implements port             │     │
│  └──────────────────────┘     │ - Injects all repos           │     │
│                                └───────────┬───────────────────┘     │
├────────────────────────────────────────────┴─────────────────────────┤
│                    Domain Layer (Business Logic)                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ BudgetAllocation (sealed interface)                          │   │
│  │   ├─ HackTimeBudgetAllocation                                │   │
│  │   ├─ StudyTimeBudgetAllocation                               │   │
│  │   └─ StudyMoneyBudgetAllocation                              │   │
│  │                                                               │   │
│  │ BudgetAllocationPersistencePort (interface)                  │   │
│  │ BudgetAllocationService (business rules)                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│                    Persistence Layer (JPA)                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ BudgetAllocation│  │ HackTime      │  │ StudyTime     │         │
│  │ Repository      │  │ Repository    │  │ Repository    │         │
│  │ (polymorphic)   │  │               │  │               │         │
│  └────────┬───────┘  └────────┬───────┘  └────────┬──────┘         │
│           └──────────────┬─────┴──────────────┬────┘                │
├──────────────────────────┴────────────────────┴─────────────────────┤
│                    Database (PostgreSQL / H2)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ budget_        │  │ hack_time_     │  │ study_time_    │         │
│  │ allocation     │  │ allocation     │  │ allocation     │         │
│  │ (base table)   │  │ (JOINED)       │  │ (JOINED)       │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **BudgetAllocationFeature** (React) | Person-centric budget view with summary cards and allocation list | React component with year/person selectors, delegates to BudgetAllocationList |
| **EventBudgetAllocationDialog** (React) | Event-centric budget management for admins | React component embedded in Event dialog, per-participant allocation forms |
| **BudgetAllocationClient** (TypeScript) | Type-safe API client | InternalizingClient wrapper for REST endpoints, date transformations |
| **BudgetAllocationController** (Kotlin) | REST endpoints with authority checks | Wirespec handler implementing endpoints, @PreAuthorize annotations |
| **BudgetAllocationMapper** (Kotlin) | Data transformations | Converts between domain models, JPA entities, and API types |
| **BudgetAllocationPersistenceAdapter** (Kotlin) | Implements domain port | Single adapter injecting all repositories, delegates to appropriate repo based on type |
| **BudgetAllocation (domain)** (Kotlin) | Sealed interface for polymorphic allocations | Sealed interface with HackTime, StudyTime, StudyMoney concrete types |
| **BudgetAllocationPersistencePort** (Kotlin) | Outgoing port interface | Interface defining repository operations for domain layer |
| **BudgetAllocationRepository** (JPA) | Base polymorphic queries | JpaRepository<BudgetAllocation, UUID> for cross-type queries |
| **HackTimeBudgetAllocationRepository** (JPA) | Type-specific queries | CrudRepository<HackTimeBudgetAllocation, UUID> |
| **BudgetAllocation (entity)** (Kotlin) | Abstract JPA entity | @Entity with @Inheritance(JOINED), common fields |

## Component Boundaries

### Domain Layer → Application Layer
- **Communication:** Domain defines persistence port interface; application implements adapter
- **Dependencies:** Domain has ZERO dependencies on application; application depends on domain
- **Location:**
  - Domain: `/domain/src/main/kotlin/.../budget/`
  - Application: `/workday-application/src/main/kotlin/.../budget/`

### Application Layer → Presentation Layer
- **Communication:** REST API via Wirespec-generated contracts
- **Dependencies:** Frontend consumes API; backend is unaware of frontend
- **Type Safety:** TypeScript types generated from `.ws` files ensure contract adherence
- **Location:**
  - Wirespec contracts: `/workday-application/src/main/wirespec/budget-allocations.ws`
  - Frontend: `/workday-application/src/main/react/features/budget/`

### Integration Points

| Boundary | Communication Method | Notes |
|----------|---------------------|-------|
| **BudgetAllocation ↔ Person** | Foreign key relationship | BudgetAllocation.person → Person entity |
| **BudgetAllocation ↔ Event** | Optional foreign key | BudgetAllocation.event (nullable) → Event entity |
| **BudgetAllocation ↔ ContractInternal** | Read-only for budget calculation | ContractInternal provides budget totals (hackHours, studyHours, studyMoney); allocations are subtracted |
| **Frontend ↔ Backend** | REST + Wirespec | Type-safe API contract with unified response type |

## Data Flow

### Request Flow: View Budget Allocations

```
User navigates to Budget tab
    ↓
BudgetAllocationFeature (React)
    ↓
BudgetAllocationClient.findAll(personId, year)
    ↓
HTTP GET /api/budget-allocations?personId={id}&year={year}
    ↓
BudgetAllocationController.findAll (Kotlin)
    ↓ @PreAuthorize("hasAuthority('BudgetAllocationAuthority.READ')")
BudgetAllocationService.findAllByPersonAndYear (domain)
    ↓
BudgetAllocationPersistencePort.findAllByPersonAndYear
    ↓
BudgetAllocationPersistenceAdapter.findAllByPersonAndYear (application)
    ↓
BudgetAllocationRepository.findAllByPersonUuidAndDateBetween (JPA)
    ↓
Database query (polymorphic - returns all allocation types)
    ↓
Entities → Adapter.toDomain() → Service → Controller.toWirespec()
    ↓
JSON response (unified BudgetAllocation type with optional fields)
    ↓
BudgetAllocationClient.internalize() (date transformations)
    ↓
React component state update → UI renders
```

### Request Flow: Create StudyMoney Allocation (Admin)

```
Admin clicks "Add Study Money" in Budget tab
    ↓
StudyMoneyAllocationDialog (React form)
    ↓
BudgetAllocationClient.createStudyMoney(input)
    ↓
HTTP POST /api/budget-allocations/study-money
    ↓
BudgetAllocationController.createStudyMoney (Kotlin)
    ↓ @PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")
BudgetAllocationMapper.consumeStudyMoney(input)
    ↓
StudyMoneyBudgetAllocationService.create (domain)
    ↓
StudyMoneyBudgetAllocationPersistencePort.save
    ↓
BudgetAllocationPersistenceAdapter.save (application)
    ↓
StudyMoneyBudgetAllocationRepository.save (JPA)
    ↓
Database INSERT into study_money_allocation + budget_allocation
    ↓
Entity → Adapter.toDomain() → Service → Controller.toWirespec()
    ↓
JSON response (created allocation)
    ↓
React component refreshes list → UI updates
```

### Request Flow: Create Time Allocations from Event (Admin)

```
Admin manages Event → expands budget section
    ↓
EventBudgetAllocationDialog (React form)
    ↓
Per-participant form: daily breakdown + type override
    ↓
BudgetAllocationClient.createTimeAllocationsFromEvent(eventCode, allocations)
    ↓
HTTP POST /api/budget-allocations/time-from-event
    ↓
BudgetAllocationController.createTimeAllocationsFromEvent (Kotlin)
    ↓ @PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")
BudgetAllocationMapper.consumeTimeAllocations(input)
    ↓
BudgetAllocationService.createTimeAllocationsFromEvent (domain)
    ↓ (business logic: validates event exists, participants match, dates align)
Multiple allocations created (HackTime and/or StudyTime per person)
    ↓
BudgetAllocationPersistencePort.saveAll
    ↓
BudgetAllocationPersistenceAdapter.saveAll (application)
    ↓ (adapter determines type → routes to appropriate repository)
HackTimeBudgetAllocationRepository.save + StudyTimeBudgetAllocationRepository.save
    ↓
Database INSERT into multiple tables (per allocation type)
    ↓
Entities → Adapter.toDomain() → Service → Controller.toWirespec()
    ↓
JSON response (list of created allocations)
    ↓
React component updates event → Budget tab reflects new allocations
```

### State Management Pattern

**No global state library** (no Redux/MobX). Budget allocation state follows existing patterns:

1. **Component-local state** for UI (loading, errors, forms)
2. **API-driven state** via InternalizingClient pattern
3. **Context propagation** via HTTP headers (`Context-Person-Id`)
4. **StatusHook** for current user/person context

```typescript
// Example state management in BudgetAllocationFeature
const [budgetDetails, setBudgetDetails] = useState<BudgetAllocationDetails | null>(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadBudgetDetails = async () => {
    setLoading(true);
    const data = await BudgetAllocationClient.findAllByPersonAndYear(personId, year);
    setBudgetDetails(data);
    setLoading(false);
  };
  loadBudgetDetails();
}, [personId, year]);
```

## Architectural Patterns

### Pattern 1: Sealed Interface for Polymorphic Domain Models

**What:** Use Kotlin sealed interface to model discriminated union types in domain layer

**When to use:** When domain has multiple concrete types sharing a common interface (e.g., HackTime, StudyTime, StudyMoney allocations)

**Trade-offs:**
- ✅ Type-safe exhaustive when expressions
- ✅ Domain expresses business rules without persistence concerns
- ✅ Clean separation between domain and infrastructure
- ❌ Requires mapping between domain and JPA entities

**Example:**
```kotlin
// Domain layer (domain/src/main/kotlin/.../budget/)
sealed interface BudgetAllocation {
    val id: UUID
    val person: Person
    val event: Event?
    val date: LocalDate
    val description: String?
}

data class HackTimeBudgetAllocation(
    override val id: UUID,
    override val person: Person,
    override val event: Event?,
    override val date: LocalDate,
    override val description: String?,
    val dailyAllocations: List<DailyTimeAllocation>,
    val totalHours: Double,
) : BudgetAllocation

data class StudyMoneyBudgetAllocation(
    override val id: UUID,
    override val person: Person,
    override val event: Event?,
    override val date: LocalDate,
    override val description: String?,
    val amount: BigDecimal,
    val files: List<Document>,
) : BudgetAllocation
```

### Pattern 2: Persistence Port + Adapter (Hexagonal Architecture)

**What:** Domain defines outgoing port interface; application implements adapter injecting JPA repositories

**When to use:** Always for domain entities requiring persistence (enforces dependency inversion)

**Trade-offs:**
- ✅ Domain has zero infrastructure dependencies
- ✅ Testable without database
- ✅ Clear ownership boundaries
- ❌ More boilerplate (port interface + adapter implementation)

**Example:**
```kotlin
// Domain layer (domain/src/main/kotlin/.../budget/)
interface BudgetAllocationPersistencePort {
    fun findAllByPersonAndYear(personId: UUID, year: Int): List<BudgetAllocation>
    fun findByIdOrNull(id: UUID): BudgetAllocation?
    fun save(allocation: BudgetAllocation): BudgetAllocation
    fun delete(id: UUID): BudgetAllocation?
}

// Application layer (workday-application/.../budget/)
@Component
class BudgetAllocationPersistenceAdapter(
    private val budgetAllocationRepository: BudgetAllocationRepository,
    private val hackTimeRepository: HackTimeBudgetAllocationRepository,
    private val studyTimeRepository: StudyTimeBudgetAllocationRepository,
    private val studyMoneyRepository: StudyMoneyBudgetAllocationRepository,
) : BudgetAllocationPersistencePort {

    override fun findAllByPersonAndYear(personId: UUID, year: Int): List<BudgetAllocation> =
        budgetAllocationRepository
            .findAllByPersonUuidAndDateBetween(personId, LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31))
            .map { it.toDomain() }

    override fun save(allocation: BudgetAllocation): BudgetAllocation {
        val entity = allocation.toEntity()
        return when (allocation) {
            is HackTimeBudgetAllocation -> hackTimeRepository.save(entity as HackTimeBudgetAllocationEntity)
            is StudyTimeBudgetAllocation -> studyTimeRepository.save(entity as StudyTimeBudgetAllocationEntity)
            is StudyMoneyBudgetAllocation -> studyMoneyRepository.save(entity as StudyMoneyBudgetAllocationEntity)
        }.toDomain()
    }
}
```

### Pattern 3: JPA JOINED Inheritance for Sealed Hierarchies

**What:** Use JPA `@Inheritance(strategy = InheritanceType.JOINED)` for polymorphic entity hierarchies

**When to use:** When persistence model mirrors domain sealed interface (multiple concrete types with shared base)

**Trade-offs:**
- ✅ Clean database schema (normalized, no NULLs)
- ✅ Efficient polymorphic queries
- ✅ Type-specific repositories for specialized queries
- ❌ Joins required for polymorphic queries (performance consideration at scale)

**Example:**
```kotlin
// Application layer (workday-application/.../budget/)
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "budget_allocation")
abstract class BudgetAllocationEntity(
    @Id
    open val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.EAGER)
    open val person: Person,
    @ManyToOne(fetch = FetchType.EAGER)
    open val event: Event?,
    open val date: LocalDate,
    open val description: String?,
)

@Entity
@Table(name = "hack_time_allocation")
class HackTimeBudgetAllocationEntity(
    id: UUID,
    person: Person,
    event: Event?,
    date: LocalDate,
    description: String?,
    @ElementCollection
    @CollectionTable(name = "daily_time_allocation")
    val dailyAllocations: List<DailyTimeAllocationEmbeddable>,
    val totalHours: Double,
) : BudgetAllocationEntity(id, person, event, date, description)

// Polymorphic repository (base)
@Repository
interface BudgetAllocationRepository : JpaRepository<BudgetAllocationEntity, UUID> {
    fun findAllByPersonUuidAndDateBetween(personId: UUID, from: LocalDate, to: LocalDate): List<BudgetAllocationEntity>
}

// Type-specific repository
@Repository
interface HackTimeBudgetAllocationRepository : CrudRepository<HackTimeBudgetAllocationEntity, UUID>
```

### Pattern 4: Wirespec Unified Response with Discriminated Union

**What:** Single API response type with optional detail fields + type discriminator; separate input types per concrete type

**When to use:** API needs to return polymorphic types (e.g., list mixing HackTime, StudyTime, StudyMoney)

**Trade-offs:**
- ✅ Clean TypeScript discriminated union (type narrowing)
- ✅ Single endpoint for all allocation types
- ✅ Type-safe frontend without runtime checks
- ❌ Response has optional fields (less strict than separate types)

**Example:**
```wirespec
// workday-application/src/main/wirespec/budget-allocations.ws

type BudgetAllocation {
  id: String,
  personId: UUID,
  personName: String,
  eventCode: String?,
  eventName: String?,
  dateFrom: String,
  dateTo: String,
  description: String?,
  allocationType: BudgetAllocationType,
  // Optional fields based on allocationType
  dailyAllocations: DailyTimeAllocation[]?,  // HackTime, StudyTime only
  totalHours: Number?,                       // HackTime, StudyTime only
  amount: Number?,                           // StudyMoney only
  files: Document[]?                         // StudyMoney only
}

enum BudgetAllocationType {
  HACK_TIME, STUDY_TIME, STUDY_MONEY
}

type DailyTimeAllocation {
  date: String,
  hours: Number,
  type: BudgetAllocationType  // Per-day override
}

// Separate input types per concrete allocation
type HackTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  dateFrom: String,
  dateTo: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationInput[]
}

type StudyMoneyAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String,
  amount: Number,
  files: FileInput[]
}

endpoint BudgetAllocationAll GET /api/budget-allocations ? { personId: String, year: Integer32 } -> {
  200 -> BudgetAllocation[]
}

endpoint StudyMoneyAllocationCreate POST StudyMoneyAllocationInput /api/budget-allocations/study-money -> {
  200 -> BudgetAllocation
}
```

### Pattern 5: InternalizingClient for API Consumption

**What:** Wrapper around fetch that transforms API types (raw) to frontend types (internalized with parsed dates)

**When to use:** Always for frontend API clients (ensures date handling consistency)

**Trade-offs:**
- ✅ Single source of truth for date transformations
- ✅ Type-safe at both boundaries (API raw → internalized)
- ✅ Reusable query/page helpers
- ❌ Requires defining both raw and internalized types

**Example:**
```typescript
// workday-application/src/main/react/clients/BudgetAllocationClient.ts

import InternalizingClient from '../utils/InternalizingClient';
import { internalize } from '../wirespec/generated/BudgetAllocation';

export type BudgetAllocationRaw = {
  id: string;
  personId: string;
  dateFrom: string;  // ISO date string
  dateTo: string;
  allocationType: 'HACK_TIME' | 'STUDY_TIME' | 'STUDY_MONEY';
  // ... other fields
};

export type BudgetAllocation = {
  id: string;
  personId: string;
  dateFrom: Dayjs;  // Parsed date
  dateTo: Dayjs;
  allocationType: 'HACK_TIME' | 'STUDY_TIME' | 'STUDY_MONEY';
  // ... other fields
};

const path = '/api/budget-allocations';

const internalize = (json: BudgetAllocationRaw): BudgetAllocation => ({
  ...json,
  dateFrom: dayjs(json.dateFrom),
  dateTo: dayjs(json.dateTo),
});

const internalizingClient = InternalizingClient<
  BudgetAllocationInput,
  BudgetAllocationRaw,
  BudgetAllocation
>(path, internalize);

export const BudgetAllocationClient = {
  ...internalizingClient,
  findAllByPersonAndYear: (personId: string, year: number) =>
    internalizingClient.query({ personId, year }),
  createStudyMoney: (input: StudyMoneyAllocationInput) =>
    internalizingClient.post('/study-money', input),
};
```

## Build Order Dependencies

### Phase 1: Domain Layer (No Dependencies)
**Location:** `/domain/src/main/kotlin/.../budget/`
**Build:** `./mvnw clean install -pl domain`

1. `BudgetAllocation.kt` (sealed interface)
2. `HackTimeBudgetAllocation.kt`, `StudyTimeBudgetAllocation.kt`, `StudyMoneyBudgetAllocation.kt` (data classes)
3. `DailyTimeAllocation.kt` (value object)
4. `BudgetAllocationPersistencePort.kt` (port interface)
5. `BudgetAllocationService.kt` (domain service)

**Rationale:** Domain has zero external dependencies. Can be built and tested in isolation.

### Phase 2: Application Persistence Layer (Depends on Domain)
**Location:** `/workday-application/src/main/kotlin/.../budget/`
**Build:** `./mvnw clean install -pl workday-application`

1. `BudgetAllocationEntity.kt` (abstract JPA entity)
2. `HackTimeBudgetAllocationEntity.kt`, `StudyTimeBudgetAllocationEntity.kt`, `StudyMoneyBudgetAllocationEntity.kt` (JPA entities)
3. `DailyTimeAllocationEmbeddable.kt` (JPA embeddable)
4. `BudgetAllocationRepository.kt`, `HackTimeBudgetAllocationRepository.kt`, etc. (JPA repositories)
5. `BudgetAllocationPersistenceAdapter.kt` (implements domain port)
6. Database migration: `workday-application/src/main/database/db/changelog/db.changelog-XXX-budget-allocations.yaml`

**Rationale:** JPA entities mirror domain models. Adapter implements port defined by domain.

**Critical:** Run Liquibase after entities are created:
```bash
cd workday-application
../mvnw clean compile liquibase:update liquibase:diff
```

### Phase 3: Contract Extension (Depends on Persistence)
**Location:** `/workday-application/src/main/kotlin/.../model/`
**Build:** Same as Phase 2 (part of workday-application)

1. Modify `ContractInternal.kt`: add `studyHours: Int = 0` and `studyMoney: BigDecimal = BigDecimal.ZERO`
2. Database migration: Alter `contract_internal` table

**Rationale:** Budget calculation requires contract fields. Must happen after initial persistence setup to avoid circular dependencies.

### Phase 4: Wirespec API Contract (Depends on Domain Concepts)
**Location:** `/workday-application/src/main/wirespec/budget-allocations.ws`
**Build:**
- Backend: `./mvnw clean compile` (auto-generates Kotlin to `target/generated-sources/`)
- Frontend: `npm run generate` (generates TypeScript to `src/main/react/wirespec/`)

1. Define `BudgetAllocation` response type (unified with optional fields)
2. Define input types per allocation type
3. Define endpoints (GET all, GET by id, POST create, PUT update, DELETE)
4. Generate types

**Rationale:** Wirespec contract must be defined before controller and frontend client.

### Phase 5: Application API Layer (Depends on Wirespec + Persistence)
**Location:** `/workday-application/src/main/kotlin/.../budget/`
**Build:** `./mvnw clean install -pl workday-application`

1. `BudgetAllocationMapper.kt` (domain ↔ entity ↔ API transformations)
2. `BudgetAllocationAuthority.kt` (authority enum)
3. `BudgetAllocationController.kt` (Wirespec handlers with @PreAuthorize)

**Rationale:** Controller depends on Wirespec-generated types and mapper depends on domain + entity types.

### Phase 6: Frontend Client (Depends on Wirespec)
**Location:** `/workday-application/src/main/react/clients/`
**Build:** `npm run build`

1. `BudgetAllocationClient.ts` (InternalizingClient wrapper)
2. Update `BudgetAllocationTypes.ts` to import from Wirespec-generated types (remove mocks)

**Rationale:** Client consumes Wirespec-generated TypeScript types. Must run after `npm run generate`.

### Phase 7: Frontend Integration (Depends on Client)
**Location:** `/workday-application/src/main/react/features/budget/`
**Build:** `npm run build`

1. Update `BudgetAllocationFeature.tsx`: replace mock API calls with `BudgetAllocationClient`
2. Update `EventBudgetAllocationDialog.tsx`: wire to real API
3. Remove mock data files

**Rationale:** UI integration happens last, after backend and client are stable.

### Phase 8: Development Mock Data (Depends on Application Layer)
**Location:** `/workday-application/src/develop/kotlin/.../mocks/`
**Build:** Run with `-Pdevelop` profile

1. Add budget allocation loading to `LoadData.kt`

**Rationale:** Mock data loader depends on JPA repositories being available.

## Dependency Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Phase 8: Development Mock Data                               │
│ (workday-application/src/develop/...)                        │
└────────────────────────────┬─────────────────────────────────┘
                             │ depends on
┌────────────────────────────▼─────────────────────────────────┐
│ Phase 7: Frontend Integration                                │
│ (features/budget/*.tsx - replace mocks with real API)        │
└────────────────────────────┬─────────────────────────────────┘
                             │ depends on
┌────────────────────────────▼─────────────────────────────────┐
│ Phase 6: Frontend Client                                     │
│ (BudgetAllocationClient.ts)                                  │
└───────────────────┬──────────────────────────────────────────┘
                    │ depends on
┌───────────────────▼──────────────────────────────────────────┐
│ Phase 5: Application API Layer                               │
│ (BudgetAllocationController, Mapper, Authority)              │
└───────────────────┬──────────────────────────────────────────┘
                    │ depends on
┌───────────────────▼──────────────────────────────────────────┐
│ Phase 4: Wirespec API Contract                               │
│ (budget-allocations.ws → generate types)                     │
└───────────────────┬──────────────────────────────────────────┘
                    │ depends on (conceptually)
┌───────────────────▼──────────────────────────────────────────┐
│ Phase 3: Contract Extension                                  │
│ (ContractInternal + migration)                               │
└───────────────────┬──────────────────────────────────────────┘
                    │ depends on
┌───────────────────▼──────────────────────────────────────────┐
│ Phase 2: Application Persistence Layer                       │
│ (JPA entities, repositories, adapter, migration)             │
└───────────────────┬──────────────────────────────────────────┘
                    │ depends on
┌───────────────────▼──────────────────────────────────────────┐
│ Phase 1: Domain Layer                                        │
│ (Sealed interface, data classes, port, service)              │
│ NO EXTERNAL DEPENDENCIES                                     │
└──────────────────────────────────────────────────────────────┘
```

## Critical Build Order Rules

1. **Domain must build before Application** - Application depends on domain types
2. **Liquibase must run after JPA entities** - Schema migrations require entity definitions
3. **Wirespec generation must run before Controller** - Controller implements Wirespec handlers
4. **npm run generate must run after Wirespec changes** - Frontend types depend on Wirespec
5. **Frontend Client must be built before UI components** - UI consumes Client API
6. **Mock data loader is last** - Requires all repositories to be available

## Anti-Patterns

### Anti-Pattern 1: Domain Depending on Infrastructure

**What people do:** Import JPA annotations or Spring types in domain layer

**Why it's wrong:** Violates hexagonal architecture; makes domain untestable without infrastructure

**Do this instead:** Keep domain as pure Kotlin with zero Spring/JPA dependencies. Use port interfaces for outgoing dependencies.

### Anti-Pattern 2: Single Polymorphic Repository Only

**What people do:** Only define `BudgetAllocationRepository` and try to use it for type-specific saves

**Why it's wrong:** JPA JOINED inheritance requires type-specific repositories for saves (polymorphic repo is for queries only)

**Do this instead:** Define both base repository (for polymorphic queries) AND type-specific repositories (for saves). Adapter routes to appropriate repository based on type.

### Anti-Pattern 3: Multiple API Endpoints per Allocation Type

**What people do:** `/api/hack-time-allocations`, `/api/study-time-allocations`, `/api/study-money-allocations` (separate endpoints)

**Why it's wrong:** Frontend must call multiple endpoints and merge results; no single source for "all allocations"

**Do this instead:** Single endpoint `/api/budget-allocations` returning unified type with discriminator. Frontend gets all types in one call.

### Anti-Pattern 4: Business Logic in Mapper

**What people do:** Put validation or budget calculation logic in `BudgetAllocationMapper`

**Why it's wrong:** Mapper is for data transformation only; business rules belong in domain service

**Do this instead:** Mapper is dumb (1:1 field mapping). Business rules live in `BudgetAllocationService` (domain layer).

### Anti-Pattern 5: Direct Entity Access in Controller

**What people do:** Inject JPA repositories directly into controller

**Why it's wrong:** Bypasses domain layer; duplicates business logic in multiple places

**Do this instead:** Controller delegates to domain service; service uses persistence port; adapter implements port.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users | Monolith with H2 (dev) / PostgreSQL (prod) is fine. JOINED inheritance performs well. |
| 100-1k users | Add database indices on `person_uuid`, `date`, `event_code`. Enable query caching in JPA. |
| 1k-10k users | Consider read replicas for budget summary queries. Polymorphic queries may need optimization (batch fetching). |
| 10k+ users | Profile slow queries. If JOINED inheritance becomes bottleneck, consider table-per-class strategy or denormalization. Add Redis cache for budget summaries. |

### Scaling Priorities

1. **First bottleneck:** Database query performance (polymorphic joins)
   - **Fix:** Add indices on foreign keys and date columns
   - **Fix:** Enable batch fetching for @ManyToOne relationships
   - **Fix:** Use query projection for summary cards (avoid fetching full entities)

2. **Second bottleneck:** API response time for "all allocations" queries
   - **Fix:** Implement pagination (already supported by Wirespec pattern)
   - **Fix:** Add caching layer (Redis) for frequently accessed person/year combinations
   - **Fix:** Consider GraphQL for flexible field selection (long-term)

## Integration Patterns

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| DocumentStorage | Dependency injection in Controller | File upload/download for StudyMoney receipts; same pattern as Expense |
| Email (future) | Domain event + listener | If approval workflow is added, use domain events to trigger emails |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| BudgetAllocation ↔ Person | JPA @ManyToOne | EAGER fetch; Person must exist before allocation |
| BudgetAllocation ↔ Event | JPA @ManyToOne (nullable) | EAGER fetch; Event is optional (standalone StudyMoney has no event) |
| BudgetAllocation ↔ ContractInternal | Read-only calculation | No direct FK; controller/service queries Contract to calculate available budget |
| Domain ↔ Application | Persistence port interface | Adapter in application implements port defined by domain |

## Sources

**HIGH Confidence:**
- Existing codebase analysis: `/workday-application/src/main/kotlin/.../expense/` (reference pattern)
- Architecture documentation: `.planning/codebase/ARCHITECTURE.md`
- Design document: `docs/plans/2026-02-28-budget-allocations-design.md`
- Frontend prototype: `/workday-application/src/main/react/features/budget/` (15 commits)

**MEDIUM Confidence:**
- Wirespec pattern: Observed from `expenses.ws` and `ExpenseController.kt`
- InternalizingClient pattern: Observed from `PersonClient.ts`
- JPA JOINED inheritance: Observed from `Expense.kt` and Liquibase changesets

---
*Architecture research for: Budget Allocation Tracking*
*Researched: 2026-03-02*
