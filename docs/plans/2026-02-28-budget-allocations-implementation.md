/gs# Budget Allocations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track hack hours, study hours, and study money budget consumption through explicit allocation records, with admin management from the Events feature and read-only visibility in a Budget Allocation tab.

**Architecture:** Follows the Expense domain pattern. Sealed interface + persistence port in `domain/` layer. JPA entities with JOINED inheritance + repositories + single persistence adapter in `workday-application/` layer. Wirespec-generated API types. React frontend with mocked data (Phase 1 already mostly complete).

**Tech Stack:** Kotlin, Spring Boot, JPA/Hibernate (JOINED inheritance), Liquibase, Wirespec, React, TypeScript, Material-UI, Formik

**Reference Pattern:** `domain/.../expense/` and `workday-application/.../expense/` - follow these files exactly for conventions.

---

## Phase 1.4: Code Cleanup

Housekeeping before design polish and backend work. Reduce noise and prepare for wirespec type replacement.

### Task A: Split BudgetAllocationMocks.ts into types and data

**Files:**
- Create: `workday-application/src/main/react/features/budget/mocks/BudgetAllocationTypes.ts`
- Modify: `workday-application/src/main/react/features/budget/mocks/BudgetAllocationMocks.ts`

**Step 1: Extract types into BudgetAllocationTypes.ts**

Move all type definitions, interfaces, and enums from `BudgetAllocationMocks.ts` into a new `BudgetAllocationTypes.ts`:
- `BudgetAllocationType` enum
- `DailyTimeAllocation` interface
- `BudgetAllocationBase` interface
- `StudyTimeBudgetAllocation`, `StudyMoneyBudgetAllocation`, `HackTimeBudgetAllocation` interfaces
- `BudgetAllocation` union type
- `Document` interface
- `BudgetItem`, `BudgetSummary`, `BudgetAllocationDetails` interfaces
- `ContractInternal` interface
- `Event` interface

**Step 2: Update BudgetAllocationMocks.ts**

Import all types from `BudgetAllocationTypes.ts`. Only mock data constants and utility functions remain.

**Step 3: Update all imports across the codebase**

Find all files importing from `BudgetAllocationMocks` and update to import types from `BudgetAllocationTypes` instead. Types come from the types file; mock data comes from the mocks file.

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add workday-application/src/main/react/features/budget/mocks/
git commit -m "refactor(budget): split mock types from mock data for cleaner wirespec migration"
```

**Why:** In Phase 3, wirespec-generated types will replace `BudgetAllocationTypes.ts` with a single import path change. Mock data stays untouched until it's removed.

---

### Task B: Remove commented-out JSX blocks

**Files:**
- Modify: `workday-application/src/main/react/features/budget/EventAllocationListItem.tsx`
- Modify: `workday-application/src/main/react/features/budget/StudyMoneyAllocationListItem.tsx`

**Step 1: Remove dead commented-out JSX**

Delete all `{/* ... */}` blocks that contain earlier design iterations (50+ lines in each file). These are not TODOs or intentional stubs - they are leftover prototype experiments.

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add workday-application/src/main/react/features/budget/EventAllocationListItem.tsx
git add workday-application/src/main/react/features/budget/StudyMoneyAllocationListItem.tsx
git commit -m "chore(budget): remove dead commented-out JSX from allocation list items"
```

---

## Phase 1.5: Frontend Design Polish

Phase 1 (frontend prototype with mocks) is complete, including cleanup of FlockMoney, ApprovalStatus, and DailyTimeAllocation type field. Before building the backend, review and polish the UI design using the `frontend-design` skill.

> **For Claude:** REQUIRED SKILL: Use `frontend-design` skill for this phase.

**Goal:** Review all budget allocation UI surfaces and elevate them from prototype quality to production-grade, distinctive design. Focus on the three main views:

### View 1: Budget Allocation Tab (person-centric)
- **File:** `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx`
- **Supporting:** `EventAllocationListItem.tsx`, `StudyMoneyAllocationListItem.tsx`, `StudyMoneyAllocationDialog.tsx`, `EventBudgetAllocationDialog.tsx`
- Summary cards (hack hours, study hours, study money) showing budget/used/available
- Allocation list grouped by type with event links
- Year selector, person selector (admin)
- StudyMoney create/edit dialog

### View 2: Event Dialog Budget Management Section
- **File:** `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx`
- **Supporting:** `EventMoneyAllocationSection.tsx`, `EventTimeAllocationSection.tsx`, `EventBudgetParticipantRow.tsx`
- Collapsible time/money allocation accordions
- Per-participant allocation with per-day breakdown and type override
- Quick actions (distribute equally, clear)

### View 3: Dashboard Budget Charts
- **File:** `workday-application/src/main/react/features/dashboard/DashboardFeature.tsx`
- Horizontal stacked bar charts for hack hours, study hours, study money
- Budget vs used vs available per person

### Design Considerations
- Must feel cohesive with the existing Flock Workday application (Material-UI based)
- Data-dense views that need to be scannable at a glance
- Admin-focused: clarity and efficiency over flashiness
- Consistent with existing patterns in the expense and contract features

---

## Phase 1.6: Event Budget Flow Redesign

**Goal:** Redesign the end-to-end flow of creating/editing an event with budget allocations. The Event form's general section (budget amount, default time allocation type) should drive the budget management sections. Currently these are disconnected and the budget management UI is too cluttered.

> **For Claude:** Before implementing, deep-dive into the full event creation/mutation flow. Understand how EventForm fields (costs, defaultTimeAllocationType) connect to EventBudgetManagementSection, EventBudgetAllocationDialog, EventTimeAllocationSection, and EventMoneyAllocationSection.

### Problems to Solve
1. **Disconnected flow**: Changes to event budget/default type in EventForm don't propagate to the budget management sections
2. **Too cluttered**: EventBudgetManagementSection shows too many controls at once - needs progressive disclosure
3. **Missing integration**: EventForm's `costs` and `defaultTimeAllocationType` fields should be the single source of truth for the budget sections
4. **Simplify EventBudgetAllocationDialog**: The person-centric dialog (from Budget tab) duplicates logic that should come from the event

### Files to Review
- `workday-application/src/main/react/features/event/EventForm.tsx` - General section with budget/type fields
- `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx` - Accordion sections
- `workday-application/src/main/react/features/event/EventTimeAllocationSection.tsx` - Per-participant time
- `workday-application/src/main/react/features/event/EventMoneyAllocationSection.tsx` - Per-participant money
- `workday-application/src/main/react/features/budget/EventBudgetAllocationDialog.tsx` - Person-centric dialog

### Design Considerations
- Event form budget/type changes should live-update the budget management sections
- Progressive disclosure: start simple, expand on demand
- Reduce cognitive load - fewer visible controls, smarter defaults
- Consider whether EventBudgetAllocationDialog is still needed or can be replaced by navigating to the event

---

## Phase 2: Backend + API

Phase 1 (frontend prototype with mocks) is complete. Phase 1.5 (design polish) can run in parallel. This section covers Phase 2 (backend) and Phase 3 (integration).

---

### Task 1: Domain Models - BudgetAllocationType Enum

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationType.kt`

**Step 1: Create the enum**

```kotlin
package community.flock.eco.workday.domain.budget

enum class BudgetAllocationType {
    STUDY,
    HACK,
}
```

**Step 2: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationType.kt
git commit -m "feat(budget): add BudgetAllocationType enum"
```

---

### Task 2: Domain Models - DailyTimeAllocation Value Object

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/DailyTimeAllocation.kt`

**Step 1: Create the value object**

```kotlin
package community.flock.eco.workday.domain.budget

import java.time.LocalDate

data class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    val type: BudgetAllocationType,
)
```

**Step 2: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/DailyTimeAllocation.kt
git commit -m "feat(budget): add DailyTimeAllocation value object"
```

---

### Task 3: Domain Models - BudgetAllocation Sealed Interface + Concrete Types

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocation.kt`

**Reference:** `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/Expense.kt` - sealed interface pattern. Note: unlike Expense, BudgetAllocation does NOT use ApprovalStatus (no approval workflow).

**Step 1: Create the sealed interface and concrete types**

```kotlin
package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.person.Person
import java.math.BigDecimal
import java.time.LocalDate

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

**Step 2: Verify it compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl domain -q`

**Step 3: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocation.kt
git commit -m "feat(budget): add BudgetAllocation sealed interface with concrete types"
```

**Note:** Check if `domain/` has a `Person` domain type. If not, use the person identifier (UUID or internalId) instead of a full Person reference. Adjust based on what exists in `domain/src/main/kotlin/community/flock/eco/workday/domain/person/`.

---

### Task 4: Domain - BudgetAllocationPersistencePort

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationPersistencePort.kt`

**Reference:** `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/ExpensePersistencePort.kt` and `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/CostExpensePersistencePort.kt`

**Step 1: Create the persistence port**

```kotlin
package community.flock.eco.workday.domain.budget

import java.util.UUID

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

interface HackTimeBudgetAllocationPersistencePort {
    fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation
    fun findById(id: Long): HackTimeBudgetAllocation?
    fun updateIfExists(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation?
}

interface StudyTimeBudgetAllocationPersistencePort {
    fun create(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation
    fun findById(id: Long): StudyTimeBudgetAllocation?
    fun updateIfExists(id: Long, allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation?
}
```

**Step 2: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationPersistencePort.kt
git commit -m "feat(budget): add BudgetAllocation persistence ports"
```

---

### Task 5: Domain - BudgetAllocationService

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationService.kt`

**Reference:** `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/ExpenseService.kt` and `CostExpenseService.kt`

**Step 1: Create the domain service**

```kotlin
package community.flock.eco.workday.domain.budget

import java.util.UUID

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

class HackTimeBudgetAllocationService(
    private val repository: HackTimeBudgetAllocationPersistencePort,
) {
    fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation =
        repository.create(allocation)

    fun update(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation? =
        repository.updateIfExists(id, allocation)
}

class StudyTimeBudgetAllocationService(
    private val repository: StudyTimeBudgetAllocationPersistencePort,
) {
    fun create(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation =
        repository.create(allocation)

    fun update(id: Long, allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation? =
        repository.updateIfExists(id, allocation)
}
```

**Step 2: Verify domain module compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl domain -q`

**Step 3: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationService.kt
git commit -m "feat(budget): add BudgetAllocation domain services"
```

---

### Task 6: Domain - BudgetAllocationEvent

**Files:**
- Create: `domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationEvent.kt`

**Reference:** `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/ExpenseEvent.kt`

**Step 1: Create domain events**

```kotlin
package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.Event

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

**Step 2: Commit**

```bash
git add domain/src/main/kotlin/community/flock/eco/workday/domain/budget/BudgetAllocationEvent.kt
git commit -m "feat(budget): add BudgetAllocation domain events"
```

---

### Task 7: Liquibase Migration - Budget Allocation Tables

**Files:**
- Create: `workday-application/src/main/database/db/changelog/db.changelog-027-budget-allocations.yaml`
- Modify: `workday-application/src/main/database/db/changelog/db.changelog-master.yaml`

**Reference:** `db.changelog-002-expenses.yaml` for JOINED inheritance table pattern.

**Step 1: Create the changelog**

Next changelog number is 027. Creates:
- `budget_allocation` base table (JOINED inheritance root)
- `hack_time_budget_allocation` joined table
- `study_time_budget_allocation` joined table
- `study_money_budget_allocation` joined table
- `hack_time_budget_allocation_daily_time_allocations` element collection table
- `study_time_budget_allocation_daily_time_allocations` element collection table
- `study_money_budget_allocation_files` element collection table
- Foreign key constraints

```yaml
databaseChangeLog:
  - changeSet:
      id: db.changelog-027-budget-allocations-base
      author: jvandis
      changes:
        - createTable:
            tableName: budget_allocation
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
                    primaryKeyName: budget_allocationPK
                    nullable: false
              - column:
                  name: person_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: event_code
                  type: VARCHAR(255)
              - column:
                  name: date
                  type: DATE
                  constraints:
                    nullable: false
              - column:
                  name: description
                  type: VARCHAR(255)
              - column:
                  name: type
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: budget_allocation
            baseColumnNames: person_id
            referencedTableName: person
            referencedColumnNames: id
            constraintName: FK_budget_allocation_person

  - changeSet:
      id: db.changelog-027-budget-allocations-hack-time
      author: jvandis
      changes:
        - createTable:
            tableName: hack_time_budget_allocation
            columns:
              - column:
                  name: id
                  type: BIGINT
                  constraints:
                    primaryKey: true
                    primaryKeyName: hack_time_budget_allocationPK
                    nullable: false
              - column:
                  name: total_hours
                  type: DOUBLE
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: hack_time_budget_allocation
            baseColumnNames: id
            referencedTableName: budget_allocation
            referencedColumnNames: id
            constraintName: FK_hack_time_budget_allocation

  - changeSet:
      id: db.changelog-027-budget-allocations-study-time
      author: jvandis
      changes:
        - createTable:
            tableName: study_time_budget_allocation
            columns:
              - column:
                  name: id
                  type: BIGINT
                  constraints:
                    primaryKey: true
                    primaryKeyName: study_time_budget_allocationPK
                    nullable: false
              - column:
                  name: total_hours
                  type: DOUBLE
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: study_time_budget_allocation
            baseColumnNames: id
            referencedTableName: budget_allocation
            referencedColumnNames: id
            constraintName: FK_study_time_budget_allocation

  - changeSet:
      id: db.changelog-027-budget-allocations-study-money
      author: jvandis
      changes:
        - createTable:
            tableName: study_money_budget_allocation
            columns:
              - column:
                  name: id
                  type: BIGINT
                  constraints:
                    primaryKey: true
                    primaryKeyName: study_money_budget_allocationPK
                    nullable: false
              - column:
                  name: amount
                  type: DECIMAL(19,2)
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: study_money_budget_allocation
            baseColumnNames: id
            referencedTableName: budget_allocation
            referencedColumnNames: id
            constraintName: FK_study_money_budget_allocation

  - changeSet:
      id: db.changelog-027-budget-allocations-hack-daily
      author: jvandis
      changes:
        - createTable:
            tableName: hack_time_budget_allocation_daily_time_allocations
            columns:
              - column:
                  name: hack_time_budget_allocation_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: date
                  type: DATE
                  constraints:
                    nullable: false
              - column:
                  name: hours
                  type: DOUBLE
                  constraints:
                    nullable: false
              - column:
                  name: type
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: hack_time_budget_allocation_daily_time_allocations
            baseColumnNames: hack_time_budget_allocation_id
            referencedTableName: hack_time_budget_allocation
            referencedColumnNames: id
            constraintName: FK_hack_time_daily_allocations

  - changeSet:
      id: db.changelog-027-budget-allocations-study-daily
      author: jvandis
      changes:
        - createTable:
            tableName: study_time_budget_allocation_daily_time_allocations
            columns:
              - column:
                  name: study_time_budget_allocation_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: date
                  type: DATE
                  constraints:
                    nullable: false
              - column:
                  name: hours
                  type: DOUBLE
                  constraints:
                    nullable: false
              - column:
                  name: type
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: study_time_budget_allocation_daily_time_allocations
            baseColumnNames: study_time_budget_allocation_id
            referencedTableName: study_time_budget_allocation
            referencedColumnNames: id
            constraintName: FK_study_time_daily_allocations

  - changeSet:
      id: db.changelog-027-budget-allocations-money-files
      author: jvandis
      changes:
        - createTable:
            tableName: study_money_budget_allocation_files
            columns:
              - column:
                  name: study_money_budget_allocation_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: file
                  type: UUID
              - column:
                  name: name
                  type: VARCHAR(255)
        - addForeignKeyConstraint:
            baseTableName: study_money_budget_allocation_files
            baseColumnNames: study_money_budget_allocation_id
            referencedTableName: study_money_budget_allocation
            referencedColumnNames: id
            constraintName: FK_study_money_files
```

**Step 2: Add to changelog-master.yaml**

Add at the end of `db.changelog-master.yaml`:

```yaml
  - include:
      file: db.changelog-027-budget-allocations.yaml
      relativeToChangelogFile: true
```

**Step 3: Commit**

```bash
git add workday-application/src/main/database/db/changelog/db.changelog-027-budget-allocations.yaml
git add workday-application/src/main/database/db/changelog/db.changelog-master.yaml
git commit -m "feat(budget): add Liquibase migration for budget allocation tables"
```

---

### Task 8: Liquibase Migration - ContractInternal New Fields

**Files:**
- Create: `workday-application/src/main/database/db/changelog/db.changelog-028-contract-internal-study-budget.yaml`
- Modify: `workday-application/src/main/database/db/changelog/db.changelog-master.yaml`

**Reference:** `db.changelog-025-contract-internal-hackdays.yaml`

**Step 1: Create the changelog**

```yaml
databaseChangeLog:
  - changeSet:
      id: db.changelog-028-contract-internal-study-budget
      author: jvandis
      changes:
        - addColumn:
            tableName: contract_internal
            columns:
              - column:
                  name: study_hours
                  type: integer
                  defaultValue: "0"
              - column:
                  name: study_money
                  type: DECIMAL(19,2)
                  defaultValueNumeric: "0.00"
```

**Step 2: Add to changelog-master.yaml**

```yaml
  - include:
      file: db.changelog-028-contract-internal-study-budget.yaml
      relativeToChangelogFile: true
```

**Step 3: Commit**

```bash
git add workday-application/src/main/database/db/changelog/db.changelog-028-contract-internal-study-budget.yaml
git add workday-application/src/main/database/db/changelog/db.changelog-master.yaml
git commit -m "feat(budget): add studyHours and studyMoney to contract_internal"
```

---

### Task 9: JPA Entities - BudgetAllocation Hierarchy

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationType.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/DailyTimeAllocation.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocation.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocation.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocation.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocation.kt`

**Reference:** `workday-application/.../expense/Expense.kt`, `CostExpense.kt`, `TravelExpense.kt` for JPA entity patterns.

**Step 1: Create BudgetAllocationType enum**

```kotlin
package community.flock.eco.workday.application.budget

enum class BudgetAllocationType {
    STUDY,
    HACK,
}
```

**Step 2: Create DailyTimeAllocation embeddable**

```kotlin
package community.flock.eco.workday.application.budget

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

**Step 3: Create abstract BudgetAllocation entity**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractIdEntity
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.ManyToOne
import java.time.LocalDate

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
    open val type: BudgetAllocationType,
) : AbstractIdEntity(id)
```

**Step 4: Create HackTimeBudgetAllocation entity**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import java.time.LocalDate

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

**Step 5: Create StudyTimeBudgetAllocation entity**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import java.time.LocalDate

@Entity
@EntityListeners(EventEntityListeners::class)
class StudyTimeBudgetAllocation(
    id: Long = 0,
    person: Person,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    val dailyTimeAllocations: MutableList<DailyTimeAllocation> = mutableListOf(),
    val totalHours: Double = 0.0,
) : BudgetAllocation(id, person, eventCode, date, description, BudgetAllocationType.STUDY)
```

**Step 6: Create StudyMoneyBudgetAllocation entity**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.Document
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@EntityListeners(EventEntityListeners::class)
class StudyMoneyBudgetAllocation(
    id: Long = 0,
    person: Person,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    val amount: BigDecimal = BigDecimal.ZERO,
    @ElementCollection(fetch = FetchType.EAGER)
    val files: MutableList<Document> = mutableListOf(),
) : BudgetAllocation(id, person, eventCode, date, description, BudgetAllocationType.STUDY)
```

**Step 7: Verify it compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl workday-application -q`

**Step 8: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/
git commit -m "feat(budget): add JPA entities for budget allocation hierarchy"
```

**Notes:**
- Check what base entity class is used. Expense uses UUID `id`, but the design uses `Long id`. Look at `AbstractIdEntity` vs `AbstractCodeEntity` in `workday-core` to pick the right base class.
- Check what `Document` class the JPA entity uses (likely `community.flock.eco.workday.core.model.Document` with `@Embeddable`). It may differ from the domain `Document`.

---

### Task 10: JPA Repositories

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationRepository.kt`

**Reference:** `workday-application/.../expense/ExpenseRepository.kt`

**Step 1: Create repositories**

```kotlin
package community.flock.eco.workday.application.budget

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BudgetAllocationRepository : JpaRepository<BudgetAllocation, Long> {
    fun findAllByPersonUuid(personUuid: UUID): List<BudgetAllocation>

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>

    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.person.uuid = :personUuid AND YEAR(ba.date) = :year")
    fun findAllByPersonUuidAndYear(personUuid: UUID, year: Int): List<BudgetAllocation>
}

@Repository
interface HackTimeBudgetAllocationRepository : CrudRepository<HackTimeBudgetAllocation, Long>

@Repository
interface StudyTimeBudgetAllocationRepository : CrudRepository<StudyTimeBudgetAllocation, Long>

@Repository
interface StudyMoneyBudgetAllocationRepository : CrudRepository<StudyMoneyBudgetAllocation, Long>
```

**Step 2: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationRepository.kt
git commit -m "feat(budget): add JPA repositories for budget allocations"
```

---

### Task 11: Persistence Adapter + Mapper

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationMapper.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceAdapter.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyMoneyBudgetAllocationPersistenceAdapter.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/HackTimeBudgetAllocationPersistenceAdapter.kt`
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/StudyTimeBudgetAllocationPersistenceAdapter.kt`

**Reference:** `workday-application/.../expense/ExpensePersistenceAdapter.kt`, `CostExpensePersistenceAdapter.kt`, `ExpenseMapper.kt`

**Step 1: Create mapper (entity <-> domain)**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.person.toDomain
import community.flock.eco.workday.domain.budget.BudgetAllocationType as DomainAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation as DomainDailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation as DomainHackTime
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation as DomainStudyMoney
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation as DomainStudyTime
import community.flock.eco.workday.domain.budget.BudgetAllocation as DomainBudgetAllocation
import community.flock.eco.workday.domain.common.Document as DomainDocument

// Entity -> Domain
fun BudgetAllocation.toBudgetAllocationDomain(): DomainBudgetAllocation =
    when (this) {
        is HackTimeBudgetAllocation -> toDomain()
        is StudyTimeBudgetAllocation -> toDomain()
        is StudyMoneyBudgetAllocation -> toDomain()
        else -> error("Unsupported budget allocation type")
    }

fun HackTimeBudgetAllocation.toDomain() = DomainHackTime(
    id = id,
    person = person.toDomain(),
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
    totalHours = totalHours,
)

fun StudyTimeBudgetAllocation.toDomain() = DomainStudyTime(
    id = id,
    person = person.toDomain(),
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toDomain() },
    totalHours = totalHours,
)

fun StudyMoneyBudgetAllocation.toDomain() = DomainStudyMoney(
    id = id,
    person = person.toDomain(),
    eventCode = eventCode,
    date = date,
    description = description,
    amount = amount,
    files = files.map { DomainDocument(name = it.name, file = it.file) },
)

fun DailyTimeAllocation.toDomain() = DomainDailyTimeAllocation(
    date = date,
    hours = hours,
    type = when (type) {
        BudgetAllocationType.STUDY -> DomainAllocationType.STUDY
        BudgetAllocationType.HACK -> DomainAllocationType.HACK
    },
)

// Domain -> Entity
fun DomainHackTime.toEntity(personReference: Person) = HackTimeBudgetAllocation(
    id = id,
    person = personReference,
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toEntity() }.toMutableList(),
    totalHours = totalHours,
)

fun DomainStudyTime.toEntity(personReference: Person) = StudyTimeBudgetAllocation(
    id = id,
    person = personReference,
    eventCode = eventCode,
    date = date,
    description = description,
    dailyTimeAllocations = dailyTimeAllocations.map { it.toEntity() }.toMutableList(),
    totalHours = totalHours,
)

fun DomainStudyMoney.toEntity(personReference: Person) = StudyMoneyBudgetAllocation(
    id = id,
    person = personReference,
    eventCode = eventCode,
    date = date,
    description = description,
    amount = amount,
    files = files.map { community.flock.eco.workday.core.model.Document(name = it.name, file = it.file) }.toMutableList(),
)

fun DomainDailyTimeAllocation.toEntity() = DailyTimeAllocation(
    date = date,
    hours = hours,
    type = when (type) {
        DomainAllocationType.STUDY -> BudgetAllocationType.STUDY
        DomainAllocationType.HACK -> BudgetAllocationType.HACK
    },
)
```

**Step 2: Create BudgetAllocationPersistenceAdapter (base - polymorphic queries)**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.BudgetAllocationPersistencePort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import community.flock.eco.workday.application.budget.BudgetAllocation as BudgetAllocationEntity

@Component
class BudgetAllocationPersistenceAdapter(
    private val budgetAllocationRepository: BudgetAllocationRepository,
) : BudgetAllocationPersistencePort {
    override fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation> =
        budgetAllocationRepository
            .findAllByPersonUuidAndYear(personUuid, year)
            .map { it.toBudgetAllocationDomain() }

    override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
        budgetAllocationRepository
            .findAllByEventCode(eventCode)
            .map { it.toBudgetAllocationDomain() }

    override fun findById(id: Long): BudgetAllocation? =
        budgetAllocationRepository
            .findByIdOrNull(id)
            ?.toBudgetAllocationDomain()

    @Transactional
    override fun delete(id: Long): BudgetAllocation? =
        budgetAllocationRepository
            .findByIdOrNull(id)
            ?.run {
                val allocation = toBudgetAllocationDomain()
                budgetAllocationRepository.delete(this)
                allocation
            }
}
```

**Step 3: Create type-specific persistence adapters**

Follow the `CostExpensePersistenceAdapter.kt` pattern for each:
- `StudyMoneyBudgetAllocationPersistenceAdapter` implements `StudyMoneyBudgetAllocationPersistencePort`
- `HackTimeBudgetAllocationPersistenceAdapter` implements `HackTimeBudgetAllocationPersistencePort`
- `StudyTimeBudgetAllocationPersistenceAdapter` implements `StudyTimeBudgetAllocationPersistencePort`

Each adapter injects its specific repository + `EntityManager` for person references.

**Step 4: Verify it compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl workday-application -q`

**Step 5: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/
git commit -m "feat(budget): add persistence adapters and mappers"
```

**Notes:**
- Check how `Person.toDomain()` works by looking at `workday-application/.../person/` for the extension function. The import `community.flock.eco.workday.application.person.toDomain` should exist.
- Check the `Document` entity class in `workday-core` to verify the correct import for JPA entities.

---

### Task 12: Spring Configuration

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationConfiguration.kt`

**Reference:** `workday-application/.../expense/ExpenseConfiguration.kt`

**Step 1: Create configuration**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BudgetAllocationConfiguration {
    @Bean
    fun budgetAllocationService(
        budgetAllocationPersistenceAdapter: BudgetAllocationPersistenceAdapter,
    ) = BudgetAllocationService(
        budgetAllocationRepository = budgetAllocationPersistenceAdapter,
    )

    @Bean
    fun studyMoneyBudgetAllocationService(
        adapter: StudyMoneyBudgetAllocationPersistenceAdapter,
    ) = StudyMoneyBudgetAllocationService(
        repository = adapter,
    )

    @Bean
    fun hackTimeBudgetAllocationService(
        adapter: HackTimeBudgetAllocationPersistenceAdapter,
    ) = HackTimeBudgetAllocationService(
        repository = adapter,
    )

    @Bean
    fun studyTimeBudgetAllocationService(
        adapter: StudyTimeBudgetAllocationPersistenceAdapter,
    ) = StudyTimeBudgetAllocationService(
        repository = adapter,
    )
}
```

**Step 2: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationConfiguration.kt
git commit -m "feat(budget): add Spring configuration for budget allocation services"
```

---

### Task 13: Authority Enum

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationAuthority.kt`

**Reference:** `workday-application/.../expense/ExpenseAuthority.kt`

**Step 1: Create authority enum**

```kotlin
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.core.authorities.Authority

enum class BudgetAllocationAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
```

**Step 2: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationAuthority.kt
git commit -m "feat(budget): add BudgetAllocationAuthority enum"
```

---

### Task 14: Modify ContractInternal Entity

**Files:**
- Modify: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt`

**Step 1: Add studyHours and studyMoney fields**

Add two fields to the `ContractInternal` constructor after `hackHours`:

```kotlin
val studyHours: Int = 0,
val studyMoney: BigDecimal = BigDecimal.ZERO,
```

**Step 2: Add helper methods**

Add after `totalHackDayHoursInPeriod`:

```kotlin
fun totalStudyHoursInPeriod(period: Period): BigDecimal =
    this
        .toDateRangeInPeriod(period)
        .sumOf { this.studyHours }
        .toBigDecimal()
        .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)

fun totalStudyMoneyInPeriod(period: Period): BigDecimal =
    this
        .toDateRangeInPeriod(period)
        .sumOf { this.studyMoney.toDouble() }
        .toBigDecimal()
        .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)
```

**Step 3: Verify it compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl workday-application -q`

**Step 4: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt
git commit -m "feat(budget): add studyHours and studyMoney to ContractInternal"
```

---

### Task 15: Wirespec Contract

**Files:**
- Create: `workday-application/src/main/wirespec/budget-allocations.ws`

**Reference:** `workday-application/src/main/wirespec/expenses.ws`

**Step 1: Create wirespec definition**

```wirespec
endpoint BudgetAllocationsByPerson GET /api/budget-allocations ? { personId: UUID, year: Integer32 } -> {
    200 -> BudgetAllocationResponse[]
}

endpoint BudgetAllocationsByEvent GET /api/budget-allocations/event/{eventCode: String} -> {
    200 -> BudgetAllocationResponse[]
}

endpoint BudgetAllocationById GET /api/budget-allocations/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    404 -> Error
}

endpoint StudyMoneyBudgetAllocationCreate POST StudyMoneyBudgetAllocationInput /api/budget-allocations/study-money -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint StudyMoneyBudgetAllocationUpdate PUT StudyMoneyBudgetAllocationInput /api/budget-allocations/study-money/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint HackTimeBudgetAllocationCreate POST HackTimeBudgetAllocationInput /api/budget-allocations/hack-time -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint HackTimeBudgetAllocationUpdate PUT HackTimeBudgetAllocationInput /api/budget-allocations/hack-time/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint StudyTimeBudgetAllocationCreate POST StudyTimeBudgetAllocationInput /api/budget-allocations/study-time -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint StudyTimeBudgetAllocationUpdate PUT StudyTimeBudgetAllocationInput /api/budget-allocations/study-time/{id: Integer64} -> {
    200 -> BudgetAllocationResponse
    500 -> Error
}

endpoint BudgetAllocationDelete DELETE /api/budget-allocations/{id: Integer64} -> {
    204 -> Unit
    404 -> Error
}

type BudgetAllocationResponse {
    id: Integer64,
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    allocationType: BudgetAllocationResponseType,
    hackTimeDetails: HackTimeDetails?,
    studyTimeDetails: StudyTimeDetails?,
    studyMoneyDetails: StudyMoneyDetails?
}

enum BudgetAllocationResponseType {
    HACK_TIME, STUDY_TIME, STUDY_MONEY
}

type HackTimeDetails {
    totalHours: Number,
    dailyAllocations: DailyTimeAllocationResponse[]
}

type StudyTimeDetails {
    totalHours: Number,
    dailyAllocations: DailyTimeAllocationResponse[]
}

type StudyMoneyDetails {
    amount: Number,
    files: BudgetAllocationFile[]
}

type DailyTimeAllocationResponse {
    date: String,
    hours: Number,
    type: DailyAllocationType
}

enum DailyAllocationType {
    STUDY, HACK
}

type BudgetAllocationFile {
    name: String,
    file: UUID
}

type StudyMoneyBudgetAllocationInput {
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    amount: Number,
    files: BudgetAllocationFileInput[]
}

type HackTimeBudgetAllocationInput {
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    totalHours: Number,
    dailyAllocations: DailyTimeAllocationInput[]
}

type StudyTimeBudgetAllocationInput {
    personId: UUID,
    eventCode: String?,
    date: String,
    description: String?,
    totalHours: Number,
    dailyAllocations: DailyTimeAllocationInput[]
}

type DailyTimeAllocationInput {
    date: String,
    hours: Number,
    type: DailyAllocationType
}

type BudgetAllocationFileInput {
    name: String,
    file: UUID
}
```

**Step 2: Generate TypeScript types**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && npm run generate`

**Step 3: Verify generated types exist**

Check that TypeScript types were generated in the expected output location.

**Step 4: Commit**

```bash
git add workday-application/src/main/wirespec/budget-allocations.ws
git add -A  # Include generated files
git commit -m "feat(budget): add wirespec contract for budget allocations API"
```

---

### Task 16: Controller

**Files:**
- Create: `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt`

**Reference:** `workday-application/.../expense/ExpenseController.kt`

**Step 1: Create controller implementing wirespec handlers**

The controller implements the handler interfaces generated from the wirespec. Each endpoint method maps between wirespec types and domain types using the mapper.

Key patterns from `ExpenseController`:
- Uses `@PreAuthorize` for security
- Implements wirespec `Handler` interfaces
- Uses `suspend` functions
- Maps domain objects to response types via extension functions

**Step 2: Rebuild to ensure wirespec handlers are generated**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl workday-application -q`

**Step 3: Implement the controller**

Create the controller implementing all wirespec handler interfaces. Follow the exact pattern from `ExpenseController` - implement each handler's method, inject the domain services and mappers, use `@PreAuthorize` annotations.

**Step 4: Verify it compiles**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw compile -pl workday-application -q`

**Step 5: Commit**

```bash
git add workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt
git commit -m "feat(budget): add REST controller for budget allocations"
```

---

### Task 17: Verify Full Build

**Step 1: Clean build all modules**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday && ./mvnw clean install -DskipTests`

Expected: BUILD SUCCESS

**Step 2: Run with develop profile to test**

Run: `cd /Users/julius.van.dis/IdeaProjects/Flock/flock-eco-workday/workday-application && ../mvnw spring-boot:run -Pdevelop`

Verify the application starts without errors and Liquibase migrations run successfully.

**Step 3: Commit any fixes**

If there were compilation issues or fixes needed, commit them.

---

### Task 18: Update ContractInternal Wirespec + Form

**Files:**
- Modify: `workday-application/src/main/wirespec/contracts.ws` - Add `studyHours` and `studyMoney` fields to `ContractInternalForm` and `ContractInternal` types
- Modify relevant Kotlin form/mapper code for ContractInternal

**Step 1: Check current contracts.ws**

Read `workday-application/src/main/wirespec/contracts.ws` and find the `ContractInternal` and `ContractInternalForm` types.

**Step 2: Add fields**

Add `studyHours: Integer32` and `studyMoney: Number` to both the form input and response types.

**Step 3: Regenerate and rebuild**

Run: `npm run generate && ./mvnw compile -pl workday-application -q`

**Step 4: Update Kotlin form/mapper**

Update the ContractInternal form handling to include the new fields.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(budget): add studyHours and studyMoney to ContractInternal API"
```

---

## Phase 3: Frontend Integration

### Task 19: Replace Budget Allocation Mocks with API Client

**Files:**
- Create: `workday-application/src/main/react/features/budget/BudgetAllocationClient.ts`
- Modify: `workday-application/src/main/react/features/budget/BudgetAllocationFeature.tsx`
- Modify: `workday-application/src/main/react/features/budget/BudgetAllocationList.tsx`

**Step 1: Create API client**

Create a client that calls the wirespec-generated API endpoints. Follow the pattern of existing API clients in the codebase (check `workday-application/src/main/react/` for examples).

**Step 2: Replace mock data in BudgetAllocationFeature**

Replace `mockBudgetSummary` and mock allocation lists with real API calls using `useEffect` and `useState`.

**Step 3: Wire up StudyMoneyAllocationDialog**

Replace console.log mutations with actual API calls (create/update/delete).

**Step 4: Verify in browser**

Run frontend (`npm start`) and backend (`mvnw spring-boot:run -Pdevelop`). Navigate to Budget Allocation tab and verify data loads.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(budget): replace mocked data with real API in Budget Allocation tab"
```

---

### Task 20: Wire Up Event Budget Management

**Files:**
- Modify: `workday-application/src/main/react/features/event/EventBudgetManagementDialog.tsx`
- Modify: `workday-application/src/main/react/features/event/EventMoneyAllocationSection.tsx`
- Modify: `workday-application/src/main/react/features/event/EventTimeAllocationSection.tsx`

**Step 1: Replace console.log with API calls**

Wire up the save/update actions in the event budget management dialog to call the real budget allocation API endpoints.

**Step 2: Load existing allocations**

When opening the budget management section for an event, fetch existing allocations using `GET /api/budget-allocations/event/{eventCode}`.

**Step 3: Verify in browser**

Create an event, add participants, manage budget allocations. Verify allocations persist across page reloads.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(budget): wire up event budget management to real API"
```

---

### Task 21: Update Contract Form

**Files:**
- Modify: `workday-application/src/main/react/features/contract/ContractFormInternal.tsx` (or equivalent)

**Step 1: Add studyHours and studyMoney fields**

Add number inputs for `studyHours` and `studyMoney` after the existing `hackHours` field.

**Step 2: Verify in browser**

Edit an internal contract and verify the new fields appear and save correctly.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(budget): add studyHours and studyMoney to contract form"
```

---

### Task 22: Mock Data Loader (Development Profile)

**Files:**
- Create or modify: `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadBudgetAllocationData.kt`

**Step 1: Create mock data loader**

Follow existing mock data loaders (like `LoadEventData.kt`). Create sample budget allocations for test users so the development environment has data to display.

**Step 2: Verify with develop profile**

Start with `-Pdevelop` and verify mock allocations appear in the Budget Allocation tab.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(budget): add mock budget allocation data for development"
```

---

### Task 23: Final Verification

**Step 1: Clean build**

Run: `./mvnw clean install`

**Step 2: Run all tests**

Run: `./mvnw test && npm test`

**Step 3: Manual testing checklist**

- [ ] Budget Allocation tab shows summary cards with correct totals
- [ ] Budget Allocation tab lists event allocations (read-only)
- [ ] Budget Allocation tab allows admin to create study money allocation
- [ ] Event dialog shows budget management section for existing events
- [ ] Event budget management creates time allocations per participant
- [ ] Event budget management creates money allocations per participant
- [ ] Per-day breakdown with type override works
- [ ] Smart defaults based on event type work
- [ ] ContractInternal form shows studyHours and studyMoney
- [ ] Year selector changes displayed data

**Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix(budget): address issues found during final verification"
```
