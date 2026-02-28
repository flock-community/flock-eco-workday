# Budget Allocations - Design

## Problem

People with internal contracts have yearly budgets for hack hours, study hours, and study money. There is no way to track how much of these budgets has been used or what remains.

## Solution

Track budget consumption through explicit allocation records. Budget = contract values minus sum of allocations for that person/year.

## Budget Types

Three budgets defined on `ContractInternal`:

| Budget | Field | Unit |
|--------|-------|------|
| Hack Hours | `hackHours: Int` (exists) | hours/year |
| Study Hours | `studyHours: Int` (new) | hours/year |
| Study Money | `studyMoney: BigDecimal` (new) | EUR/year |

## Allocation Types

Three allocation types (sealed interface with JOINED inheritance, following Expense pattern):

| Type | Key Fields | Created From |
|------|-----------|-------------|
| HackTimeBudgetAllocation | person, event, date, totalHours, dailyAllocations[] | Event (admin) |
| StudyTimeBudgetAllocation | person, event, date, totalHours, dailyAllocations[] | Event (admin) |
| StudyMoneyBudgetAllocation | person, event?, date, amount (BigDecimal), description, files[] | Event (admin) or standalone (admin) |

### DailyTimeAllocation (Embeddable)

Per-day breakdown with type override capability:

- `date: LocalDate`
- `hours: Double`
- `type: BudgetAllocationType` (STUDY or HACK)

This allows a single event to have days allocated as different types (e.g., Monday=study, Tuesday=hack).

### Design Decisions

- **No approval workflow.** Allocations are recorded as fact by admins.
- **No FlockMoney type.** Tracking company-level event costs is out of scope.
- **BigDecimal for money** on the backend; number on frontend/API.
- **Per-day type override** on daily allocations allows maximum flexibility.

## Frontend Views

### 1. Budget Allocation Tab (person-centric, read-mostly)

- Summary cards: hackHours, studyHours, studyMoney (budget/used/available)
- List of allocations grouped by type
- Event allocations are **read-only** with links to the event
- Admins can create/edit/delete standalone StudyMoney allocations
- Year selector; admin can switch between persons

### 2. Event Dialog (event-centric, where allocation management happens)

- Expandable budget management section (only for existing events)
- Admin assigns per-person time allocations with per-day breakdown and type override
- Admin assigns per-person money allocations
- Smart defaults based on event type:
  - FLOCK_HACK_DAY defaults to HackTime
  - CONFERENCE/other defaults to StudyTime
- These are frontend hints only; backend always stores explicit allocations
- Quick actions: divide equally, etc.

### 3. Dashboard (overview charts)

- Three horizontal stacked bar charts (hack hours, study hours, study money)
- Shows budget vs used vs available per person

## Architecture

Follows the Expense pattern: domain sealed interface + persistence port in domain layer, JPA entities + adapter + repositories in application layer.

### Domain Layer (`domain/.../budget/`)

```
BudgetAllocation.kt              - Sealed interface (root aggregate)
HackTimeBudgetAllocation.kt      - Domain data class
StudyTimeBudgetAllocation.kt     - Domain data class
StudyMoneyBudgetAllocation.kt    - Domain data class
DailyTimeAllocation.kt           - Value object
BudgetAllocationPersistencePort.kt - Outgoing port interface
BudgetAllocationService.kt       - Domain service (business logic)
```

### Application Layer (`workday-application/.../budget/`)

```
BudgetAllocation.kt              - Abstract JPA entity (JOINED inheritance)
HackTimeBudgetAllocation.kt      - JPA entity
StudyTimeBudgetAllocation.kt     - JPA entity
StudyMoneyBudgetAllocation.kt    - JPA entity
DailyTimeAllocation.kt           - JPA Embeddable
BudgetAllocationRepository.kt    - Base JPA repository (polymorphic queries)
HackTimeBudgetAllocationRepository.kt
StudyTimeBudgetAllocationRepository.kt
StudyMoneyBudgetAllocationRepository.kt
BudgetAllocationPersistenceAdapter.kt - Single adapter, injects all repos
BudgetAllocationMapper.kt        - Domain <-> entity + API conversions
BudgetAllocationController.kt    - REST controller (wirespec handlers)
BudgetAllocationAuthority.kt     - READ, WRITE, ADMIN
```

### Key Patterns

- **Single persistence adapter** implementing the domain port, injecting multiple JPA repositories (one per table)
- **Wirespec contract** with unified response type + optional detail fields, separate input types per allocation
- **Authority-based access control** with admin-only mutations

## Modified Existing Entities

### ContractInternal

Add fields:
- `studyHours: Int = 0`
- `studyMoney: BigDecimal = BigDecimal.ZERO`

## Phases

### Phase 1: Frontend Prototype (mocked data) - Mostly complete

Budget tab, event dialog budget section, dashboard charts, contract form changes. All mocked.

### Phase 2: Backend + API

Domain models, persistence port, JPA entities, repositories, adapter, wirespec contracts, controller, mapper, ContractInternal changes, Liquibase migration.

### Phase 3: Integration + Polish

Replace mocks with API calls, wire up mutations, error handling, loading states, edge case testing.