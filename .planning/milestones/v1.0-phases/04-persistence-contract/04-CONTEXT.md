# Phase 4: Persistence & Contract - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the database schema and JPA persistence layer for budget allocations, and extend ContractInternal with study budget fields. This phase delivers: Liquibase migrations, JPA entity classes mapping domain types, Spring Data repositories, persistence adapter implementing domain ports, and ContractInternal field additions. No API or frontend work.

</domain>

<decisions>
## Implementation Decisions

### ContractInternal Budget Fields
- studyHours: `Int` (matches existing hackHours pattern — whole hours per year)
- studyMoney: `BigDecimal` (monetary precision for Euro amounts)
- Column name for money: `study_money_budget` (explicit budget naming, not just `study_money`)
- hackHours stays as `Int` — no migration in this phase
- Default values for existing contracts: 0 for both fields (not NULL — zero means "no budget allocated yet")

### Allocation-Event Lifecycle
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

</decisions>

<specifics>
## Specific Ideas

- "In contract it can be Int. However for the money, budgetAllocations should be BigDecimal" — studyHours Int on contract is fine, but the allocation entities themselves use BigDecimal for monetary amounts
- Column naming should be explicit about budget semantics (study_money_budget) to distinguish from allocation amounts

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Contract.kt`: JOINED inheritance pattern to follow for BudgetAllocation entities
- `CostExpense.kt`: `@ElementCollection(fetch = FetchType.EAGER)` for Document files — pattern for StudyMoney file persistence (but use LAZY per prior decision)
- `Document.kt` (application model): `@Embeddable` with name + file UUID — reuse for StudyMoney files
- `ContractRepository.kt`: Repository pattern with findByCode, findAllByPersonUuid, deleteByCode
- `ExpensePersistenceAdapter.kt`: Adapter pattern implementing domain port with injected JPA repositories
- `db.changelog-025-contract-internal-hackdays.yaml`: Migration pattern for adding columns to contract_internal

### Established Patterns
- No `CascadeType` annotations anywhere — all deletions are manual via repository methods
- `@ElementCollection` for embedded value collections (Documents on CostExpense)
- `@Inheritance(strategy = InheritanceType.JOINED)` for entity hierarchies (Contract)
- `AbstractCodeEntity` as base class with auto-generated Long id and unique String code
- Constructor-based DI in adapters: `class Adapter(private val repository: Repository)`
- `@Transactional` on service/adapter methods

### Integration Points
- Domain `BudgetAllocationPersistencePort`: Interface to implement with JPA adapter
- Domain `BudgetAllocation` sealed interface: Map to JPA entity hierarchy
- Domain `DailyTimeAllocation`: Map to `@ElementCollection` on time allocation entities
- Domain `Document`: Map to `@Embeddable` on StudyMoney entity
- `ContractInternal.kt`: Add studyHours and studyMoney fields
- `ContractInternalForm.kt`: Add matching form fields
- Liquibase master changelog: Add new changelog file(s) after 026

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-persistence-contract*
*Context gathered: 2026-03-05*
