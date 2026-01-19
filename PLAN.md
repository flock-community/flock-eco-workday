# Budget Allocation Feature - Implementation Plan

## Overview

This feature adds comprehensive budget tracking for internal contracts with three budget types: hackHours, studyHours, and studyMoney. Budgets are allocated through event participation and free-form budget allocations, with clear visibility into total budgets, usage, and remaining allocations.

**Key UX Principle:** Make complex budget allocation intuitive through progressive disclosure, smart defaults, and clear visualization.

## User Requirements Summary

1. **Budget Source:** Contract-level yearly allocation (studyHours and studyMoney added to ContractInternal; hackHours exists)
2. **studyMoney Spending:** Simple allocation entry form (description, amount, date) - creates StudyMoneyBudgetAllocation
3. **Event Money Division:** Manual amount per participant with UI shortcuts (assign to Flock, divide remainder) - creates StudyMoneyBudgetAllocation or FlockMoneyBudgetAllocation
4. **Event Time Allocation:** Event-level defaults with per-person overrides (days attended, hours, allocation type) - creates StudyTimeBudgetAllocation or HackTimeBudgetAllocation

## Architecture: Domain-Driven Design & Hexagonal Architecture

Following the **Expense domain pattern**, the budget allocation feature will use a **two-module DDD architecture** with complete domain isolation:

### Module Structure

```
domain/                                      (Pure business logic - NO framework dependencies)
└── budget/
    ├── BudgetAllocation.kt                 (sealed interface - root aggregate)
    ├── StudyTimeBudgetAllocation.kt        (data class - time tracking for study)
    ├── StudyMoneyBudgetAllocation.kt       (data class - money spending for study)
    ├── HackTimeBudgetAllocation.kt         (data class - time tracking for hack days)
    ├── FlockMoneyBudgetAllocation.kt       (data class - money allocated to Flock company)
    ├── DailyTimeAllocation.kt              (value object - per-day time breakdown)
    ├── BudgetAllocationType.kt             (enum: STUDY, HACK)
    ├── BudgetAllocationService.kt          (domain service - business logic)
    ├── BudgetAllocationEvent.kt            (sealed interface - domain events)
    ├── BudgetAllocationPersistencePort.kt  (outgoing port interface)
    └── BudgetAllocationMailPort.kt         (outgoing port interface)

workday-application/                         (Infrastructure - Spring, JPA, Web)
└── budget/
    ├── BudgetAllocation.kt                 (JPA @Entity - abstract base class)
    ├── StudyTimeBudgetAllocation.kt        (JPA @Entity - extends BudgetAllocation)
    ├── StudyMoneyBudgetAllocation.kt       (JPA @Entity - extends BudgetAllocation)
    ├── HackTimeBudgetAllocation.kt         (JPA @Entity - extends BudgetAllocation)
    ├── FlockMoneyBudgetAllocation.kt       (JPA @Entity - extends BudgetAllocation)
    ├── DailyTimeAllocation.kt              (JPA @Embeddable)
    ├── BudgetAllocationType.kt             (enum: STUDY, HACK)
    ├── BudgetAllocationController.kt       (REST controller - implements wirespec handlers)
    ├── BudgetAllocationConfiguration.kt    (Spring @Configuration for DI)
    ├── BudgetAllocationRepository.kt       (JpaRepository for BudgetAllocation)
    ├── StudyTimeBudgetAllocationRepository.kt
    ├── StudyMoneyBudgetAllocationRepository.kt
    ├── HackTimeBudgetAllocationRepository.kt
    ├── FlockMoneyBudgetAllocationRepository.kt
    ├── BudgetAllocationPersistenceAdapter.kt (implements domain port)
    ├── BudgetAllocationMapper.kt           (domain ↔ JPA entity conversion)
    ├── BudgetAllocationMailService.kt      (implements BudgetAllocationMailPort)
    └── BudgetAllocationAuthority.kt        (security authorization enum)
```

### Key Architectural Principles

1. **Domain Isolation:** `domain/budget/` has ZERO dependencies on Spring, JPA, or any infrastructure
2. **Ports & Adapters:** Domain defines port interfaces; application layer implements adapters
3. **Sealed Types:** BudgetAllocation sealed interface prevents external implementations
4. **Dual Models:** Domain models (immutable data classes) vs. JPA entities (application layer)
5. **Event-Driven:** Domain events published on create/update/delete for side effects (emails, notifications)
6. **Separation of Concerns:** Domain services contain business logic; adapters handle persistence

### Data Flow

```
Frontend (React)
      ↓
REST API (Wirespec endpoints)
      ↓
BudgetAllocationController
      ↓
Mappers (API models ↔ Domain models)
      ↓
BudgetAllocationService (domain service)
      ↓
BudgetAllocationPersistencePort (interface)
      ↓
BudgetAllocationPersistenceAdapter (implements port)
      ↓
JPA Repositories (polymorphic queries + specific repositories)
      ↓
Database (JOINED inheritance strategy)
      ↓
Domain Events → Mail Service
```

---

## Data Model Changes

### Domain Layer Models (domain/budget/)

Domain models are **immutable data classes** with NO JPA annotations. These represent pure business concepts:

#### 1. BudgetAllocation (Sealed Interface - Root Aggregate)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocation.kt`

```kotlin
sealed interface BudgetAllocation {
    val id: Long
    val event: Event?    // Null for free-form StudyMoneyBudgetAllocation
    val date: LocalDate
    val description: String?
    val status: ApprovalStatus
}

enum class BudgetAllocationType {
    STUDY,  // Deducts from study hours/money budget
    HACK    // Deducts from hack hours budget
}
```

#### 2. StudyTimeBudgetAllocation (Domain Model)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyTimeBudgetAllocation.kt`

Tracks study time spent by a person, typically from event participation.

```kotlin
data class StudyTimeBudgetAllocation(
    override val id: Long,
    override val event: Event?,
    override val date: LocalDate,
    override val description: String?,
    override val status: ApprovalStatus,
    val person: Person,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double
) : BudgetAllocation
```

#### 3. StudyMoneyBudgetAllocation (Domain Model)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyMoneyBudgetAllocation.kt`

Tracks study money spent by a person, either from events or free-form expenses.

```kotlin
data class StudyMoneyBudgetAllocation(
    override val id: Long,
    override val event: Event?,  // Null for free-form expenses
    override val date: LocalDate,
    override val description: String?,
    override val status: ApprovalStatus,
    val person: Person,
    val amount: Double,
    val files: List<Document>
) : BudgetAllocation
```

#### 4. HackTimeBudgetAllocation (Domain Model)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/HackTimeBudgetAllocation.kt`

Tracks hack time spent by a person from event participation.

```kotlin
data class HackTimeBudgetAllocation(
    override val id: Long,
    override val person: Person,
    override val event: Event?,
    override val date: LocalDate,
    override val description: String?,
    override val status: ApprovalStatus,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double
) : BudgetAllocation
```

#### 5. FlockMoneyBudgetAllocation (Domain Model)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/FlockMoneyBudgetAllocation.kt`

Tracks money allocated to Flock company from events (not assigned to individuals).

```kotlin
data class FlockMoneyBudgetAllocation(
    override val id: Long,
    override val person: Person? = null,  // Always null
    override val event: Event,
    override val date: LocalDate,
    override val description: String?,
    override val status: ApprovalStatus,
    val amount: Double,
) : BudgetAllocation
```

#### 6. DailyTimeAllocation (Value Object)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/DailyTimeAllocation.kt`

```kotlin
data class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double
)
```

### Application Layer Models (workday-application/budget/)

JPA entities mirror domain models with persistence annotations using **JOINED inheritance strategy**:

#### 1. BudgetAllocation (JPA Abstract Entity - Base Class)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocation.kt`

```kotlin
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@EntityListeners(EventEntityListeners::class)
abstract class BudgetAllocation(
    id: Long = 0,
    @ManyToOne open val person: Person? = null,
    @ManyToOne open val event: Event? = null,
    open val date: LocalDate,
    open val description: String? = null,
    @Enumerated(EnumType.STRING)
    open val status: Status
) : AbstractIdEntity(id)
```

**Database Table:** `budget_allocation`
- Columns: `id`, `person_id`, `event_id`, `date`, `description`, `status`

#### 2. DailyTimeAllocation (JPA Embeddable)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/DailyTimeAllocation.kt`

```kotlin
@Embeddable
class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double
)
```

#### 3. StudyTimeBudgetAllocation (JPA Entity)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocation.kt`

```kotlin
@Entity
class StudyTimeBudgetAllocation(
    id: Long = 0,
    person: Person,
    event: Event? = null,
    date: LocalDate,
    description: String? = null,
    status: Status,
    @ElementCollection(fetch = FetchType.EAGER)
    val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf(),
    val totalHours: Double = 0.0
) : BudgetAllocation(id, person, event, date, description, status)
```

**Database Table:** `study_time_budget_allocation`
- Columns: `id` (FK to budget_allocation), `total_hours`
- Join Table: `study_time_budget_allocation_daily_time_allocations` with unique constraint on `(study_time_budget_allocation_id, date)`

#### 4. StudyMoneyBudgetAllocation (JPA Entity)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocation.kt`

```kotlin
@Entity
class StudyMoneyBudgetAllocation(
    id: Long = 0,
    person: Person,
    event: Event? = null,  // Null for free-form expenses
    date: LocalDate,
    description: String? = null,
    status: Status,
    val amount: Double,
    @ElementCollection(fetch = FetchType.EAGER)
    val files: MutableList<Document> = mutableListOf()
) : AbstractEntity(id)
```

**Database Table:** `study_money_budget_allocation`
- Columns: `id` (FK to budget_allocation), `amount`
- Join Table: `study_money_budget_allocation_files`

#### 5. HackTimeBudgetAllocation (JPA Entity)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocation.kt`

```kotlin
@Entity
class HackTimeBudgetAllocation(
    id: Long = 0,
    person: Person,
    event: Event? = null,
    date: LocalDate,
    description: String? = null,
    status: Status,
    @ElementCollection(fetch = FetchType.EAGER)
    val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf(),
    val totalHours: Double = 0.0
) :  AbstractIdEntity(id)
```

**Database Table:** `hack_time_budget_allocation`
- Columns: `id` (FK to budget_allocation), `total_hours`
- Join Table: `hack_time_budget_allocation_daily_time_allocations` with unique constraint on `(hack_time_budget_allocation_id, date)`

#### 6. FlockMoneyBudgetAllocation (JPA Entity)
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/FlockMoneyBudgetAllocation.kt`

```kotlin
@Entity
class FlockMoneyBudgetAllocation(
    id: Long = 0,
    event: Event,
    date: LocalDate,
    description: String? = null,
    status: Status,
    val amount: Double,
) : AbstractIdEntity(id)
```

**Database Table:** `flock_money_budget_allocation`
- Columns: `id` (FK to budget_allocation), `amount`, `allocation_type`

### Modified Entities

#### ContractInternal
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt`

Add fields:
- `val studyHours: Int = 0`
- `val studyMoney: Double = 0.0`

Add helper methods (following existing `totalHackDayHoursInPeriod` pattern):
- `totalStudyHoursInPeriod(period: Period): BigDecimal`
- `totalStudyMoneyInPeriod(period: Period): BigDecimal`

#### Event
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Event.kt`

Add fields:
- `val defaultTimeAllocationType: BudgetAllocationType? = null`
- `@OneToMany val budgetAllocations: MutableList<BudgetAllocation> = mutableListOf()`

**Migration Strategy:** Keep existing `@ManyToMany persons` temporarily for backward compatibility. Create migration script to convert existing events to BudgetAllocation records.

### Domain Services and Ports (domain/budget/)

#### BudgetAllocationService (Domain Service)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationService.kt`

Pure business logic with NO framework dependencies:

```kotlin
class BudgetAllocationService(
    private val budgetAllocationRepository: BudgetAllocationPersistencePort
) {
    fun calculateYearlyBudget(person: Person, year: Int): BudgetSummary
    fun calculateUsedBudget(person: Person, year: Int): BudgetUsage
    fun getBudgetAllocationDetails(personId: UUID, year: Int): BudgetAllocationDetails
    fun updateEventBudgetAllocations(eventCode: String, input: EventBudgetAllocationsInput): List<BudgetAllocation>
    fun createStudyMoneyAllocation(input: StudyMoneyAllocationInput): StudyMoneyBudgetAllocation
    fun validateBudget(person: Person, amount: Double, year: Int): BudgetValidationResult
}
```

#### Persistence Port (Outgoing Interface)
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationPersistencePort.kt`

```kotlin
interface BudgetAllocationPersistencePort {
    // Generic queries (polymorphic)
    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>
    fun findAllByPersonUuid(personId: UUID, year: Int): List<BudgetAllocation>
    fun findById(id: Long): BudgetAllocation?
    fun delete(id: Long): BudgetAllocation?

    // Type-specific creation
    fun createStudyTimeAllocation(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation
    fun createStudyMoneyAllocation(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation
    fun createHackTimeAllocation(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation
    fun createFlockMoneyAllocation(allocation: FlockMoneyBudgetAllocation): FlockMoneyBudgetAllocation

    // Type-specific updates
    fun updateStudyMoneyAllocation(id: Long, allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation?
    fun updateStudyTimeAllocation(id: Long, allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation?
    fun updateHackTimeAllocation(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation?

    // Batch operations
    fun saveAllForEvent(eventCode: String, allocations: List<BudgetAllocation>): List<BudgetAllocation>
    fun deleteAllByEventCode(eventCode: String)
}

interface BudgetAllocationMailPort {
    fun sendUpdate(allocation: BudgetAllocation)
    fun sendNotification(allocation: BudgetAllocation)
}
```

#### Domain Events
**Location:** `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationEvent.kt`

```kotlin
sealed interface BudgetAllocationEvent : Event {
    val entity: BudgetAllocation
}

data class CreateBudgetAllocationEvent(
    override val entity: BudgetAllocation
) : BudgetAllocationEvent

data class UpdateBudgetAllocationEvent(
    override val entity: BudgetAllocation
) : BudgetAllocationEvent

data class DeleteBudgetAllocationEvent(
    override val entity: BudgetAllocation
) : BudgetAllocationEvent
```

---

## Application Layer Implementation (workday-application/budget/)

### Persistence Adapter (Implements Domain Port)

#### BudgetAllocationPersistenceAdapter
**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceAdapter.kt`

```kotlin
@Component
class BudgetAllocationPersistenceAdapter(
    private val budgetAllocationRepository: BudgetAllocationRepository,
    private val studyTimeRepository: StudyTimeBudgetAllocationRepository,
    private val studyMoneyRepository: StudyMoneyBudgetAllocationRepository,
    private val hackTimeRepository: HackTimeBudgetAllocationRepository,
    private val flockMoneyRepository: FlockMoneyBudgetAllocationRepository,
    private val mapper: BudgetAllocationMapper
) : BudgetAllocationPersistencePort {
    // Converts JPA entities ↔ domain models
    // Routes to appropriate repository based on type
}
```

### Repositories (Spring Data JPA)

```kotlin
// Base repository for polymorphic queries
interface BudgetAllocationRepository : JpaRepository<BudgetAllocation, Long> {
    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>
    fun findAllByPersonUuid(personId: UUID): List<BudgetAllocation>
}

// Specific repositories for type-specific operations
interface StudyTimeBudgetAllocationRepository : JpaRepository<StudyTimeBudgetAllocation, Long>
interface StudyMoneyBudgetAllocationRepository : JpaRepository<StudyMoneyBudgetAllocation, Long>
interface HackTimeBudgetAllocationRepository : JpaRepository<HackTimeBudgetAllocation, Long>
interface FlockMoneyBudgetAllocationRepository : JpaRepository<FlockMoneyBudgetAllocation, Long>
```

### Mapper (Domain ↔ JPA Entity Conversion)

**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMapper.kt`

```kotlin
@Component
class BudgetAllocationMapper {
    fun toDomain(entity: community.flock.eco.workday.application.budget.BudgetAllocation):
        community.flock.eco.workday.domain.budget.BudgetAllocation {
        return when (entity) {
            is StudyTimeBudgetAllocation -> toStudyTimeDomain(entity)
            is StudyMoneyBudgetAllocation -> toStudyMoneyDomain(entity)
            is HackTimeBudgetAllocation -> toHackTimeDomain(entity)
            is FlockMoneyBudgetAllocation -> toFlockMoneyDomain(entity)
        }
    }

    fun toEntity(domain: community.flock.eco.workday.domain.budget.BudgetAllocation):
        community.flock.eco.workday.application.budget.BudgetAllocation {
        return when (domain) {
            is community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation -> toStudyTimeEntity(domain)
            is community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation -> toStudyMoneyEntity(domain)
            is community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation -> toHackTimeEntity(domain)
            is community.flock.eco.workday.domain.budget.FlockMoneyBudgetAllocation -> toFlockMoneyEntity(domain)
        }
    }

    // Type-specific conversion methods...
}
```

### Mail Service (Implements Mail Port)

**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMailService.kt`

```kotlin
@Service
class BudgetAllocationMailService(
    private val mailSender: JavaMailSender,
    private val templateEngine: TemplateEngine
) : BudgetAllocationMailPort {
    override fun sendUpdate(allocation: BudgetAllocation) { /* email logic */ }
    override fun sendNotification(allocation: BudgetAllocation) { /* email logic */ }
}
```

### Configuration (Spring Beans)

**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationConfiguration.kt`

```kotlin
@Configuration
class BudgetAllocationConfiguration {
    @Bean
    fun budgetAllocationService(
        budgetAllocationRepository: BudgetAllocationPersistencePort
    ): BudgetAllocationService = BudgetAllocationService(budgetAllocationRepository)
}
```

### Controller (REST API)

**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt`

```kotlin
@RestController
@RequestMapping("/api/budget-allocations")
@PreAuthorize("hasAuthority('BudgetAllocationAuthority.READ')")
class BudgetAllocationController(
    private val budgetAllocationService: BudgetAllocationService,
    private val mapper: BudgetAllocationMapper
) :
    GetBudgetAllocationSummary,
    GetBudgetAllocationDetails,
    UpdateEventBudgetAllocations,
    CreateStudyMoneyAllocation,
    UpdateStudyMoneyAllocation,
    DeleteBudgetAllocation,
    GetBudgetAllocations
{
    // Implements 7 wirespec handler interfaces
}
```

### Authority Enum

**Location:** `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationAuthority.kt`

```kotlin
enum class BudgetAllocationAuthority : Authority {
    READ,   // View budget allocations
    WRITE,  // Create/update/delete budget allocations
    ADMIN   // View all users' budgets, modify event allocations
}
```

### API Endpoints (Wirespec)

#### budget-allocations.ws
**Location:** `workday-application/src/main/wirespec/budget-allocations.ws`

New endpoints:
- `GET /api/budget-allocations?personId={uuid}&year={year}` - Get summary
- `GET /api/budget-allocations/{personId}?year={year}` - Get detailed allocations
- `PUT /api/events/{eventCode}/budget-allocations` - Update event allocations (creates StudyTime/HackTime/StudyMoney/FlockMoney allocations)
- `POST /api/budget-allocations/study-money` - Create free-form study money allocation
- `PUT /api/budget-allocations/{id}` - Update allocation (polymorphic)
- `DELETE /api/budget-allocations/{id}` - Delete allocation
- `GET /api/budget-allocations?personId={uuid}&year={year}&type={type}` - List allocations by type

#### aggregations.ws
**Location:** `workday-application/src/main/wirespec/aggregations.ws`

Extend with:
- `GET /api/aggregations/budget-allocation-report?year={year}` - Dashboard data

## Frontend Implementation

### 1. Budget Allocation Tab (NEW)

**Main Feature:** `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx`

Layout structure:
```
[Year Selector] [Person Selector (admin only)]

┌─ Budget Summary Cards ─┐
│ Hack Hours    │ Study Hours   │ Study Money    │
│ Budget: 120   │ Budget: 40    │ Budget: €5000  │
│ Used: 45      │ Used: 16      │ Used: €1200    │
│ Available: 75 │ Available: 24 │ Available: €3800│
└─────────────────────────────────────────────────┘

┌─ Allocation Details ─────────────────────────────┐
│ [Tabs: Events | Study Money Allocations]        │
│                                                  │
│ Events Tab: Card list of event allocations      │
│ Study Money Tab: List + Add button              │
└──────────────────────────────────────────────────┘
```

**Component Hierarchy:**
```
BudgetAllocationFeature
├── BudgetSummaryCards
│   └── BudgetCard (×3)
└── BudgetAllocationList
    ├── EventAllocationListItem (shows StudyTime/HackTime/StudyMoney/FlockMoney)
    └── StudyMoneyAllocationListItem (free-form allocations)
```

### 2. Dashboard Graphs (EXTEND)

Create three separate horizontal stacked bar charts (following HackDaysPerPersonChart.tsx pattern):
1. **Hack Hours Chart** - contract → used → available
2. **Study Hours Chart** - contract → used → available
3. **Study Money Chart** - contract → used → available

### 3. Events Tab - Budget Allocation UI (MAJOR ENHANCEMENT)

**New Dialog:** `workday-application/src/main/react/features/event/EventBudgetAllocationDialog.tsx`

When saving, creates:
- `StudyTimeBudgetAllocation` or `HackTimeBudgetAllocation` for time tracking
- `StudyMoneyBudgetAllocation` for individual money allocations
- `FlockMoneyBudgetAllocation` for company money allocations

### 4. Contract Form Updates

Add `studyHours` and `studyMoney` fields to ContractFormInternal.

## Implementation Phases

**Strategy:** Start with UX/UI prototype using mocked data to validate design and interactions. Backend implementation only proceeds after UX is approved.

---

### Phase 1: UX Prototype with Mocked Data
**Duration:** 5-7 days
**Goal:** Validate all UX flows and interactions before committing to backend architecture

#### 1.1: Mock Data & Types
**Duration:** 0.5 day

Create TypeScript types and mock data generators:
- `src/main/react/features/budget/mocks/BudgetAllocationMocks.ts`
  - Mock `BudgetSummary` type and data
  - Mock `StudyTimeBudgetAllocation` data
  - Mock `StudyMoneyBudgetAllocation` data
  - Mock `HackTimeBudgetAllocation` data
  - Mock `FlockMoneyBudgetAllocation` data
  - Mock contract data with studyHours/studyMoney
  - Mock events with budget allocations

Example mock:
```typescript
export const mockBudgetSummary = {
  hackHours: { budget: 120, used: 45, available: 75 },
  studyHours: { budget: 40, used: 16, available: 24 },
  studyMoney: { budget: 5000, used: 1200, available: 3800 }
}
```

#### 1.2: Budget Allocation Tab (Core UX)
**Duration:** 2-3 days

Build main budget allocation interface with mocked data:

**Files:**
- `BudgetAllocationFeature.tsx` - Main feature with PersonLayout integration
  - `BudgetSummaryCards.tsx` - Three budget cards (Hack/Study/Money)
- `BudgetCard.tsx` - Reusable card with progress visualization
- `BudgetAllocationList.tsx` - Tabbed interface (Events | Study Money)
- `EventAllocationListItem.tsx` - Read-only card showing event allocations
- `StudyMoneyAllocationListItem.tsx` - Shows free-form money allocations
- `StudyMoneyAllocationDialog.tsx` - Create/edit form with validation

**Key Interactions to Validate:**
- Year selector changes mock data display
- Admin can switch between persons
- Budget cards show visual progress (used vs available)
- Tab switching between Events and Study Money
- Study Money dialog opens/closes correctly
- Form validation shows warnings when over budget
- File upload UI (placeholder)

**All mutations are void** - console.log only, no API calls

#### 1.3: Budget Allocation View - Navigation & Finalization (REVISED)
**Duration:** 0.5 day
**Status:** ✅ COMPLETE

**Architectural Decision:** Event budget allocations should be managed from an **event-centric view** (Events feature), not from the person-centric Budget Allocation view.

**What Was Built:**
- Budget Allocation view is **read-only** for event allocations
- Added navigation links from event allocations to Events page
- Clickable event names + "Open in New" icon button
- Info alert explaining event allocations are managed from Events feature
- Simplified "Add Allocation" button to direct "Add Study Money" action
- Only free-form study money allocations can be created from Budget view

**Files Modified:**
- `BudgetAllocationList.tsx` - Removed event creation menu, added navigation
- `EventAllocationListItem.tsx` - Added clickable event name and icon
- `BudgetAllocationFeature.tsx` - Simplified props and handlers

**Rationale:**
Event allocations involve managing **all participants** for an event, including:
- Time allocations for each person (Study Time or Hack Time)
- Money allocations for each person (Study Money)
- Flock Money allocation (company budget)

This requires an event-centric view with bulk participant management, not a person-by-person approach from the Budget view.

**See:** `workday-application/src/main/react/features/budget/PHASE_1_3_REVISED.md` for detailed explanation.

#### 1.3b: Events Feature - Event-Centric Allocation Management (NEW)
**Duration:** 2-3 days
**Status:** 🔜 TODO

Build event-centric budget allocation management in the Events feature:

**Location:** `workday-application/src/main/react/features/event/`

**Primary Workflow:** From Events page → Select event → Manage all participants and budget

**Files to Create:**
- `EventBudgetAllocationDialog.tsx` - Main dialog container
- `EventBudgetParticipantList.tsx` - List of all participants
- `EventBudgetParticipantRow.tsx` - Per-person allocation row
- `EventBudgetFlockSection.tsx` - Flock company allocation
- `EventBudgetSummaryBanner.tsx` - Live validation (Total vs Allocated)
- `DailyTimeAllocationTable.tsx` - Per-day time tracking table (optional detail view)

**Component Structure:**
```
EventBudgetAllocationDialog
├── EventBudgetSummaryBanner (live total/allocated validation)
├── EventBudgetFlockSection (Flock money allocation)
│   ├── Amount input
│   └── Quick actions: "Assign Remaining to Flock"
└── EventBudgetParticipantList
    └── EventBudgetParticipantRow (×N participants)
        ├── Person name
        ├── Time allocation (with daily breakdown toggle)
        │   ├── Allocation type: Study Time / Hack Time
        │   ├── Total hours input
        │   └── Daily breakdown (collapsible)
        │       └── DailyTimeAllocationTable
        └── Money allocation (Study Money)
            ├── Amount input
            └── File upload
```

**Key Interactions to Validate:**

1. **Dialog Opens with Event Context:**
   - Event name, date range, total budget (if set)
   - List of participants (from existing participants or person selector)
   - Auto-generates time allocations based on event dates
   - Pre-fills allocation type from event's defaultTimeAllocationType

2. **Live Budget Validation:**
   - Summary banner shows: Total Budget vs Allocated (time + money)
   - Updates in real-time as amounts change
   - Warning (not blocking) when over budget

3. **Quick Actions:**
   - "Divide Time Equally" - Distributes hours equally across all participants
   - "Divide Money Equally" - Distributes money budget equally
   - "Assign Remaining to Flock" - Takes remainder and assigns to Flock Money

4. **Per-Person Allocations:**
   - **Time Allocation:**
     - Toggle: Study Time / Hack Time
     - Total hours input (defaults from event duration)
     - Optional: Expand to show daily breakdown table
     - Daily table: Date | Hours | Type (STUDY/HACK)
   - **Money Allocation:**
     - Amount input (€)
     - File upload for receipts/invoices
     - Optional description

5. **Flock Money Allocation:**
   - Amount input
   - Description field
   - Visual distinction (separate section at top or bottom)

6. **Save Behavior:**
   - Creates multiple BudgetAllocation records:
     - StudyTimeBudgetAllocation or HackTimeBudgetAllocation (per person with time)
     - StudyMoneyBudgetAllocation (per person with money)
     - FlockMoneyBudgetAllocation (if company amount > 0)
   - All linked to the same event
   - All mutations log to console (Phase 1 - mocked)

**Key UX Decisions:**

1. **Bulk Management:** All participants visible at once, not nested accordions
2. **Smart Defaults:**
   - Pre-fill hours based on event duration
   - Pre-select allocation type from event default
3. **Progressive Disclosure:**
   - Daily breakdown hidden by default
   - Expand on demand per person
4. **Quick Actions:**
   - Reduce manual calculation
   - Common operations are one-click
5. **Live Feedback:**
   - Running totals visible
   - Validation non-blocking (soft warnings)

**Mock Data Required:**
- Event with participants list
- Budget summary for validation
- Existing allocations (for edit mode)

**Integration Points:**

1. **Events Tab/Page:**
   - Add "Manage Budget" button to event card/detail
   - Opens EventBudgetAllocationDialog with event context

2. **Budget Allocation View:**
   - Event allocations shown as read-only
   - Clicking event name navigates to Events page
   - Navigation implemented in Phase 1.3

**All mutations are void** - console.log the payload structure:
```javascript
console.log('Creating Event Budget Allocations:', {
  eventCode: 'REACT_CONF_2026',
  allocations: [
    { type: 'StudyTime', personId, dailyTimeAllocations, totalHours },
    { type: 'StudyMoney', personId, amount, files },
    { type: 'FlockMoney', amount }
  ]
});
```

**Success Criteria:**
- ✅ Can manage all participants from single dialog
- ✅ Quick actions work correctly
- ✅ Live validation updates
- ✅ Creates correct allocation structure (logged)
- ✅ Works with event defaults
- ✅ File upload UI functional (placeholder)
- ✅ Over-budget scenarios handled with warnings

#### 1.4: Dashboard Budget Charts
**Duration:** 1 day

Create three stacked bar charts with mocked aggregation data:

**Files:**
- `HackHoursBudgetChart.tsx` - Horizontal stacked bar (contract/used/available)
- `StudyHoursBudgetChart.tsx` - Horizontal stacked bar
- `StudyMoneyBudgetChart.tsx` - Horizontal stacked bar

**Key Interactions to Validate:**
- Charts render with mock data for multiple persons
- Dynamic height based on person count
- Color coding: gray (budget), blue (used), light gray (available)
- Tooltips show values on hover
- Year selector changes displayed data

#### 1.5: Contract Form Extension
**Duration:** 0.5 day

Add studyHours and studyMoney fields to ContractFormInternal:

**Modified File:**
- `ContractFormInternal.tsx`

**Key Interactions to Validate:**
- Two new number input fields appear after hackHours
- Form validation accepts numeric values
- Fields are properly labeled

#### 1.6: UX Review & Iteration
**Duration:** 1 day

- Test all flows with different mock scenarios
- Validate accessibility (keyboard navigation, screen readers)
- Check responsive design (different screen sizes)
- Review with stakeholders
- Document UX decisions and any changes needed

**Deliverables:**
- Working UI prototype with mocked data
- Video/screenshots of key flows
- List of UX improvements/changes
- Confirmation that design meets requirements

---

### Phase 2: Backend Foundation (After UX Approval)
**Duration:** 3-4 days

**Only proceed after Phase 1 is approved**

**Domain Layer (domain/budget/):**
- Create `BudgetAllocationType` enum (STUDY, HACK)
- Create `DailyTimeAllocation` value object
- Create `BudgetAllocation` sealed interface
- Create `StudyTimeBudgetAllocation` data class
- Create `StudyMoneyBudgetAllocation` data class
- Create `HackTimeBudgetAllocation` data class
- Create `FlockMoneyBudgetAllocation` data class
- Create `BudgetAllocationPersistencePort` interface
- Create `BudgetAllocationMailPort` interface
- Create `BudgetAllocationEvent` sealed interface
- Create `BudgetAllocationService` with business logic

**Application Layer (workday-application/budget/):**
- Create JPA entities (BudgetAllocation hierarchy with JOINED inheritance)
- Create repositories (base + type-specific)
- Modify ContractInternal and Event entities
- Liquibase changelog for schema
- Migration script

### Phase 3: REST API & Integration
**Duration:** 4-5 days

**Adapters & Infrastructure:**
- Create persistence adapter and mapper
- Create mail service
- Create Spring configuration

**REST API:**
- Define Wirespec contracts
- Create controller
- Add security
- Run `npm run generate`
- Test endpoints

### Phase 4: Frontend-Backend Integration
**Duration:** 2-3 days

- Replace mocked data with API clients
- Wire up all mutations (create/update/delete)
- Error handling and loading states
- Integration testing

### Phase 5: Polish & Testing
**Duration:** 2-3 days

- Edge case testing
- Validation refinement
- Error messages
- Documentation

**Total Estimated Duration:** 4-5 weeks (reduced from 6-7 due to UX-first approach)

## Critical Files Summary

### Domain Layer (domain/budget/)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocation.kt` (sealed interface)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyTimeBudgetAllocation.kt` (data class)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/StudyMoneyBudgetAllocation.kt` (data class)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/HackTimeBudgetAllocation.kt` (data class)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/FlockMoneyBudgetAllocation.kt` (data class)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/DailyTimeAllocation.kt` (value object)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationType.kt` (enum)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationService.kt` (domain service)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationEvent.kt` (sealed interface)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationPersistencePort.kt` (port interface)
- `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationMailPort.kt` (port interface)

### Application Layer (workday-application/budget/)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocation.kt` (JPA abstract entity)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocation.kt` (JPA entity)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocation.kt` (JPA entity)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocation.kt` (JPA entity)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/FlockMoneyBudgetAllocation.kt` (JPA entity)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/DailyTimeAllocation.kt` (JPA embeddable)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationType.kt` (enum)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt` (REST controller)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationConfiguration.kt` (Spring config)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationRepository.kt` (JPA repository - base)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocationRepository.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocationRepository.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocationRepository.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/FlockMoneyBudgetAllocationRepository.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceAdapter.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMapper.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMailService.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationAuthority.kt`

### Modified Existing Files
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt`
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Event.kt`

### API & Database
- `workday-application/src/main/wirespec/budget-allocations.ws`
- `workday-application/src/main/wirespec/aggregations.ws`
- `workday-application/src/main/database/db/changelog/db.changelog-XXX-budget-allocations.yaml`

## Key Architectural Decisions

### 1. Domain-Driven Design (DDD)
- **Two-module architecture:** `domain/` (pure business logic) + `workday-application/` (infrastructure)
- **Complete isolation:** Domain layer has ZERO dependencies on Spring, JPA, or frameworks
- **Testability:** Domain services can be tested without infrastructure
- **Port & adapter pattern:** Domain defines ports (interfaces); application implements adapters

### 2. Data Model Structure - Sealed Interface Pattern
- **Sealed interface:** `BudgetAllocation` prevents external implementations, ensures type safety
- **Four concrete types:** Each allocation type is its own entity (StudyTime, StudyMoney, HackTime, FlockMoney)
- **Polymorphic queries:** Base repository supports querying all types, specific repositories for type-specific operations
- **JOINED inheritance:** JPA strategy allows clean separation and efficient queries
- **Type safety:** Compiler enforces correct usage of each allocation type

### 3. Event-Driven Architecture
- **Domain events:** BudgetAllocationEvent sealed interface for Create/Update/Delete
- **Side effects:** Email notifications triggered via domain events
- **Decoupling:** Mail service implements port, called by domain service

### 4. Time Allocation Design
- **Clean separation from Leave Days:** Event participation tracks budget consumption, not time-off
- **Per-day flexibility:** Each day can have different hours tracked
- **Smart defaults:** Event-level default minimizes per-person configuration

## Key UX Decisions

1. **Progressive Disclosure:** Complex event allocation UI uses nested accordions - show summary, hide details until needed
2. **Smart Defaults:** Event-level default allocation type minimizes per-person data entry
3. **Quick Actions:** Shortcuts for common operations (divide equally, assign to Flock) reduce manual calculation
4. **Live Validation:** Real-time feedback on budget allocation (remaining budget, sum validation)
5. **Soft Warnings:** Budget overdraft shows warning but doesn't block (allows tracking over-budget scenarios)
6. **Visual Clarity:** Stacked bar charts with consistent color scheme (gray=contract, blue=used, light gray=available)
7. **Familiar Patterns:** Budget Allocation Tab follows Leave Days pattern (users already understand this UI)
8. **Clean Separation from Leave Days:** Event time allocations track budget consumption (STUDY/HACK) only, not time-off

## Database Migration Strategy

**JOINED Inheritance Tables:**
- `budget_allocation` (base table with common fields)
- `study_time_budget_allocation` (id FK, total_hours)
- `study_money_budget_allocation` (id FK, amount)
- `hack_time_budget_allocation` (id FK, total_hours)
- `flock_money_budget_allocation` (id FK, amount, allocation_type)

**Migration Script:**
```kotlin
fun migrateExistingEvents() {
    eventRepository.findAll().forEach { event ->
        if (event.budgetAllocations.isEmpty() && event.persons.isNotEmpty()) {
            event.persons.forEach { person ->
                // Create appropriate allocation type based on event type
                val allocation = when (event.type) {
                    EventType.FLOCK_HACK_DAY -> HackTimeBudgetAllocation(...)
                    else -> StudyTimeBudgetAllocation(...)
                }
                event.budgetAllocations.add(allocation)
            }
            eventRepository.save(event)
        }
    }
}
```

## Next Steps After Plan Approval

1. Create Liquibase changelog for JOINED inheritance schema
2. Implement domain layer sealed interface and concrete types
3. Build BudgetAllocationService with polymorphic handling
4. Define Wirespec contracts with union types
5. Begin frontend implementation with Budget Allocation Tab
