# Pitfalls Research: Budget Allocation JPA JOINED Inheritance

**Domain:** JPA JOINED inheritance, Liquibase migrations, polymorphic API responses
**Researched:** 2026-03-02
**Confidence:** HIGH (based on codebase analysis of existing Expense pattern)

## Critical Pitfalls

### Pitfall 1: N+1 Query Explosion with ElementCollection and EAGER Fetching

**What goes wrong:**
ElementCollection with `FetchType.EAGER` on time-based allocation entities (HackTime, StudyTime) will execute separate SELECT queries for each entity's daily allocations. Loading 20 allocations = 1 + 20 queries for main entities + 40 additional queries for two ElementCollection tables = **61 queries**.

**Why it happens:**
The codebase pattern uses `@ElementCollection(fetch = FetchType.EAGER)` everywhere (see `CostExpense.files`, `WorkDay.sheets`). This works for expense files (typically 1-3 files) but daily time allocations have 5-20 items per allocation. Budget tab queries fetch all allocations for person+year, multiplying the problem.

**How to avoid:**
1. **For polymorphic queries** (BudgetAllocationRepository.findAllByPersonUuidAndYear): Use LAZY fetch and accept that type-specific queries will need explicit JOIN FETCH
2. **For type-specific queries** (StudyTimeBudgetAllocationRepository): Add custom @Query with JOIN FETCH:
   ```kotlin
   @Query("SELECT sta FROM StudyTimeBudgetAllocation sta LEFT JOIN FETCH sta.dailyTimeAllocations WHERE sta.id = :id")
   override fun findById(id: Long): StudyTimeBudgetAllocation?
   ```
3. **Critical**: Change JPA entity definition from EAGER to LAZY for dailyTimeAllocations in both HackTime and StudyTime entities
4. **Trade-off**: LAZY means you MUST use JOIN FETCH in custom queries or accept LazyInitializationException

**Warning signs:**
- Hibernate logs showing `SELECT ... FROM hack_time_budget_allocation_daily_time_allocations WHERE hack_time_budget_allocation_id = ?` repeated many times
- Budget tab taking >2 seconds to load with only 10-20 allocations
- Database connection pool exhaustion during peak usage

**Phase to address:** Phase 2, Task 9 (JPA Entities) - catch this BEFORE implementing the entities, not after backend is complete.

---

### Pitfall 2: Liquibase Migration Foreign Key Constraint Ordering

**What goes wrong:**
Creating `hack_time_budget_allocation_daily_time_allocations` element collection table BEFORE creating `hack_time_budget_allocation` child table causes foreign key constraint failure. Liquibase migration fails on first run, leaving database in inconsistent state.

**Why it happens:**
JOINED inheritance requires:
1. Base table (`budget_allocation`)
2. Child tables (`hack_time_budget_allocation`, `study_time_budget_allocation`, `study_money_budget_allocation`)
3. THEN element collection tables referencing child tables

The Expense migration (`db.changelog-002-expenses.yaml`) shows correct ordering: base table (expense) → child tables (cost_expense, travel_expense) → element collections (cost_expense_files).

**How to avoid:**
1. **Strict changeset ordering**:
   ```yaml
   # Changeset 1: Base table
   - id: db.changelog-027-budget-allocations-base
   # Changeset 2-4: Child tables (one per type)
   - id: db.changelog-027-budget-allocations-hack-time
   - id: db.changelog-027-budget-allocations-study-time
   - id: db.changelog-027-budget-allocations-study-money
   # Changeset 5-7: Element collections (one per child table needing it)
   - id: db.changelog-027-budget-allocations-hack-daily
   - id: db.changelog-027-budget-allocations-study-daily
   - id: db.changelog-027-budget-allocations-money-files
   ```
2. **Verify before commit**: Run `liquibase:update` locally and check `databasechangelog` table confirms all changesets executed

**Warning signs:**
- Liquibase error: "Table/View 'HACK_TIME_BUDGET_ALLOCATION' not found"
- `databasechangelog` table shows some changesets succeeded, others failed
- Foreign key constraint errors during migration

**Phase to address:** Phase 2, Task 7 (Liquibase Migration) - validation MUST happen before committing the migration.

---

### Pitfall 3: Type Discriminator Column Missing from Base Table

**What goes wrong:**
JPA JOINED inheritance requires a discriminator column in the base table to identify entity type. Without it, JPA can't determine whether a row represents HackTime, StudyTime, or StudyMoney when querying the base table. Polymorphic queries return incorrect types or throw `ClassCastException`.

**Why it happens:**
The Expense pattern includes `type: ExpenseType` as an explicit field in the base entity AND as a discriminator. Budget allocation design document mentions "type" but the Liquibase migration in the implementation plan shows:
```yaml
- column:
    name: type
    type: VARCHAR(255)
    constraints:
      nullable: false
```
This is correct, BUT the JPA entity must use `@DiscriminatorColumn` annotation.

**How to avoid:**
1. **In Liquibase migration**: Include `type` VARCHAR column in base table (already planned correctly)
2. **In JPA entity**: Add annotation to base class:
   ```kotlin
   @Entity
   @Inheritance(strategy = InheritanceType.JOINED)
   @DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
   abstract class BudgetAllocation(...)
   ```
3. **In child entities**: Add value annotation:
   ```kotlin
   @Entity
   @DiscriminatorValue("HACK_TIME")
   class HackTimeBudgetAllocation(...)
   ```
4. **Verify**: Check Expense.kt in the codebase - it uses `type: ExpenseType` field but does NOT use @DiscriminatorColumn. This means Hibernate infers the discriminator from the DTYPE column (default behavior). Budget allocation MUST follow the same pattern or use explicit discriminator.

**Warning signs:**
- Queries returning all results as base class instead of concrete types
- `when (allocation)` type checking fails because types aren't distinguished
- `ClassCastException` when accessing type-specific fields

**Phase to address:** Phase 2, Task 9 (JPA Entities) - verify discriminator strategy matches Expense pattern.

---

### Pitfall 4: BigDecimal Precision Loss in Domain-to-Entity Mapping

**What goes wrong:**
Domain layer uses `BigDecimal` for study money amounts (correct for financial calculations). API uses `Number` (JavaScript number ≈ double). Entity uses `BigDecimal`. Mapping between layers can lose precision if not careful:
- Domain `BigDecimal(1234.56)` → API `1234.56` (number) → Entity `BigDecimal(1234.5599999999999)`
- Sum of allocations doesn't match budget due to floating point drift

**Why it happens:**
Wirespec uses `Number` type (maps to `Double` in Kotlin, `number` in TypeScript). ContractInternal.studyMoney is `BigDecimal`. When creating an allocation:
```kotlin
// WRONG - implicit conversion introduces precision errors
val amount: BigDecimal = input.amount.toBigDecimal()

// RIGHT - explicit scale preservation
val amount: BigDecimal = BigDecimal.valueOf(input.amount).setScale(2, RoundingMode.HALF_UP)
```

The existing codebase has this issue: Expense.amount is `Double`, not `BigDecimal`. ContractInternal.monthlySalary is `Double`. Budget allocation MUST NOT repeat this mistake for money amounts.

**How to avoid:**
1. **In mapper** (Task 11): Always use `BigDecimal.valueOf(double).setScale(2, RoundingMode.HALF_UP)` when converting API Number to entity BigDecimal
2. **In entity** (Task 9): Use `@Column(precision = 19, scale = 2)` to enforce database precision
3. **In Liquibase** (Task 7): Already correct - `DECIMAL(19,2)` matches precision/scale
4. **In domain service**: Never use `.toDouble()` for calculations - keep BigDecimal throughout
5. **Document**: Add comment in mapper explaining why explicit scale setting is required

**Warning signs:**
- Budget calculations off by 0.01 EUR
- `assertEquals(expected, actual)` fails in tests with tiny differences (0.000001)
- Sum of allocations shows 999.99 when budget is 1000.00

**Phase to address:** Phase 2, Task 11 (Persistence Adapter + Mapper) - must be implemented correctly from the start, hard to fix later.

---

### Pitfall 5: Polymorphic Query Performance with JOINED Inheritance

**What goes wrong:**
Querying the base repository (`BudgetAllocationRepository.findAllByPersonUuidAndYear`) generates a LEFT OUTER JOIN for EVERY child table, even if you only need one type:
```sql
SELECT ba.*, ht.*, st.*, sm.*
FROM budget_allocation ba
LEFT OUTER JOIN hack_time_budget_allocation ht ON ba.id = ht.id
LEFT OUTER JOIN study_time_budget_allocation st ON ba.id = st.id
LEFT OUTER JOIN study_money_budget_allocation sm ON ba.id = sm.id
WHERE ba.person_id = ? AND YEAR(ba.date) = ?
```
This fetches all type-specific columns even when most are NULL. With 100 allocations, you're transferring 3x more data than needed.

**Why it happens:**
JPA JOINED inheritance must join all child tables to determine entity type and populate type-specific fields. This is the fundamental trade-off of JOINED over SINGLE_TABLE or TABLE_PER_CLASS strategies.

**How to avoid:**
1. **Accept the trade-off**: JOINED inheritance chosen for clean polymorphic queries; this is the cost
2. **Type-specific repositories**: When you know the type, use `HackTimeBudgetAllocationRepository` instead of base repository
3. **Projection queries**: For summary views (dashboard), use custom @Query with SELECT specific columns instead of SELECT *:
   ```kotlin
   @Query("SELECT NEW community.flock.eco.workday.application.budget.BudgetSummaryProjection(ba.person.uuid, SUM(CASE WHEN TYPE(ba) = HackTimeBudgetAllocation THEN ba.totalHours ELSE 0 END)) FROM BudgetAllocation ba WHERE ...")
   fun findBudgetSummary(personUuid: UUID, year: Int): BudgetSummaryProjection
   ```
4. **Caching**: Add `@Cacheable` to frequently-accessed queries (person's current year allocations)

**Warning signs:**
- Query explain plan shows 3+ LEFT OUTER JOINs
- Network transfer size disproportionate to displayed data
- Slow queries even with indexes on person_id and date

**Phase to address:** Phase 2, Task 10 (JPA Repositories) - add type-specific repositories alongside base repository. Phase 3 optimization if performance issues observed.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| EAGER fetch on ElementCollection | No LazyInitializationException, simpler code | N+1 queries, poor scalability | NEVER for collections with >5 items |
| Single changeset for all tables | Fewer changesets in db.changelog | Migration fails leave database inconsistent | Never - always split base → children → element collections |
| Double instead of BigDecimal for money | Easier API mapping, less ceremony | Precision loss, rounding errors | Never for financial amounts |
| Skipping discriminator column | Hibernate infers DTYPE column | Unclear behavior, harder to debug | Only if following existing codebase pattern exactly (verify!) |
| Polymorphic queries everywhere | Simpler repository design | Poor performance at scale | Acceptable for <100 entities; use type-specific repos for high-volume |
| No @Query with JOIN FETCH | Spring Data auto-generates queries | N+1 queries with LAZY fetch | Never when you know you'll access lazy collections |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Wirespec Number → BigDecimal | `input.amount.toBigDecimal()` loses precision | `BigDecimal.valueOf(input.amount).setScale(2, RoundingMode.HALF_UP)` |
| ElementCollection with JOINED inheritance | Copying EAGER pattern from Expense | Evaluate cardinality first; use LAZY + JOIN FETCH for >5 items |
| Liquibase validation | Committing before testing migration | Always run `liquibase:update` locally, verify `databasechangelog` table |
| Person reference in mapper | `Person(id = input.personId)` creates detached entity | Use `entityManager.getReference(Person::class.java, personId)` |
| Event code FK | Adding foreign key to Event table | Event is identified by code (String), not FK - nullable eventCode column is correct |
| Type discrimination in frontend | `if (allocation.allocationType === "HACK")` string comparison | Use wirespec-generated enum `BudgetAllocationResponseType.HACK_TIME` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 with EAGER ElementCollection | 40+ queries for 20 allocations | Use LAZY + custom @Query with JOIN FETCH | >10 allocations with >3 daily items each |
| Polymorphic query JOIN explosion | Slow queries despite indexes | Use type-specific repositories when type is known | >50 allocations per query |
| No index on person_id + year | Full table scan on budget tab | Add composite index in Liquibase: `CREATE INDEX idx_allocation_person_year ON budget_allocation(person_id, YEAR(date))` | >200 total allocations |
| Fetching all allocations to calculate summary | Transfer MBs to show 3 numbers | Custom projection query for summaries | >500 allocations |
| BigDecimal calculations in hot path | CPU overhead for currency arithmetic | Consider caching computed budget summaries | Recalculated on every page view |

**Note on current scale:** Flock Workday is likely <100 persons × 3 types × ~5 allocations/year = ~1500 allocations max. Performance traps unlikely in Phase 2, but proper patterns prevent future rewrites.

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Missing @PreAuthorize on mutation endpoints | Any authenticated user can create allocations | Copy Expense pattern: `@PreAuthorize("hasAuthority('BudgetAllocationAuthority.ADMIN')")` on all create/update/delete |
| Reading allocations for other persons without admin check | Privacy violation, employees see others' budgets | Controller: `if (!authentication.isAdmin() && !authentication.isOwnerOf(allocation))` throw 403 |
| eventCode SQL injection | User provides eventCode in query param | Already safe - Spring Data JPA parameterizes queries, but validate eventCode format (alphanumeric + dash) |
| File UUID validation | User uploads file, references someone else's file in allocation | Verify file ownership before associating with allocation |
| Year parameter unbounded | `?year=1000` returns all historical data | Validate year is within reasonable range (current year ± 10) |

**Critical**: Expense pattern shows correct security: READ authority to view, WRITE to create own, ADMIN to manage all. Budget allocations are admin-only mutations (no "create own"), so READ for employees, ADMIN for all mutations.

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Error: "Budget allocation creation failed" | Admin doesn't know why (validation? budget exceeded? duplicate?) | Return specific error codes in API, map to user-friendly messages in frontend |
| Budget summary shows negative available | Admin allocated more than budget, UI breaks | Backend validation: reject allocation if sum > budget; frontend: show warning before submit |
| Date pickers allow future years | Admin creates allocation for 2030, never visible in default view | Constrain date picker to current year ± 1, clear validation error |
| Type mismatch: HACK allocation on CONFERENCE event | Admin confused by type override, allocates wrong type | Frontend: default time allocation type based on event type, show clear label "Overriding event default" |
| No feedback after save | Admin clicks save, doesn't know if it worked | Show success toast, refresh allocation list immediately |
| Optimistic update shows old data | Admin saves, sees stale data, clicks save again → duplicate | Invalidate cache / refetch after mutation completes |

## "Looks Done But Isn't" Checklist

- [ ] **ElementCollection tables created but no foreign keys**: Verify each element collection table has FK constraint to parent entity
- [ ] **Discriminator column exists but no annotation**: Verify @DiscriminatorColumn in base entity or verify DTYPE column created by Hibernate
- [ ] **BigDecimal in entity but precision not set**: Verify @Column(precision=19, scale=2) on amount field
- [ ] **Repository defined but no custom queries**: Base repository with only derived queries → N+1 issues with LAZY fetch
- [ ] **Wirespec contract complete but no input validation**: Verify controller validates required fields, date formats, amount >0, year range
- [ ] **Frontend shows data but mutations fail silently**: Check browser network tab for 403/500, ensure error handling implemented
- [ ] **Migration runs but rollback not tested**: Verify each changeset has <rollback> tag or is automatically rollback-able
- [ ] **Domain events defined but no listeners**: Check if `EventEntityListeners` needs budget allocation event handlers
- [ ] **Authority enum exists but not seeded in user table**: Verify develop profile loads test user with BudgetAllocationAuthority.ADMIN
- [ ] **Type-specific repositories created but not injected**: Verify Spring configuration beans use correct repositories

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| N+1 queries in production | MEDIUM | Add @Query with JOIN FETCH, change EAGER→LAZY, deploy; no data migration |
| Missing foreign key in migration | LOW | Write new changeset adding FK constraint, test rollback, deploy |
| BigDecimal precision errors in data | HIGH | Calculate correct amounts from source data, write data migration script, audit all affected allocations |
| Wrong discriminator strategy | HIGH | Requires new migration with DTYPE column, manual data fixup to populate discriminator values |
| No index on person_id | LOW | Write new changeset with CREATE INDEX, deploy during off-hours |
| Security hole (missing @PreAuthorize) | CRITICAL | Hotfix deploy with annotation, audit logs for unauthorized access |
| Polymorphic queries too slow | MEDIUM | Add type-specific repositories, refactor controller to use them, deploy; no data migration |
| Liquibase migration failed mid-run | MEDIUM | Manually rollback partial changes, fix changeset ordering, drop databasechangelog entries, re-run |

**Pattern observed:** Most pitfalls are LOW-MEDIUM recovery cost EXCEPT data corruption (BigDecimal precision) and architecture mistakes (discriminator strategy). Prevention is 10x cheaper than recovery.

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| N+1 with ElementCollection | Phase 2, Task 9 (JPA Entities) | Check entity has LAZY fetch + Task 10 has custom @Query with JOIN FETCH |
| Liquibase FK ordering | Phase 2, Task 7 (Liquibase) | Run `liquibase:update` locally, verify all changesets succeed |
| Discriminator column | Phase 2, Task 9 (JPA Entities) | Verify Expense pattern: either `type` field OR @DiscriminatorColumn |
| BigDecimal precision | Phase 2, Task 11 (Mapper) | Code review mapper conversions, write unit test asserting scale=2 |
| Polymorphic query performance | Phase 2, Task 10 (Repositories) | Add type-specific repositories alongside base repository |
| Security missing | Phase 2, Task 16 (Controller) | Grep for `@PreAuthorize`, verify all mutations have ADMIN authority |
| No budget exceeded validation | Phase 3, Task 19 (Frontend integration) | Backend validation in service layer, frontend validation in form |
| Date range bugs | Phase 3, Task 19 | Constrain date picker, validate year parameter in controller |
| Error handling incomplete | Phase 3, Task 19 | Test create/update/delete with invalid input, verify error messages |
| Mock data loader missing | Phase 2, Task 22 | Start with `-Pdevelop`, verify budget tab shows data |

## Sources

- **Codebase analysis**: `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/` (Expense pattern)
- **Liquibase migrations**: `db.changelog-002-expenses.yaml` (JOINED inheritance pattern)
- **JPA entities**: `Expense.kt`, `CostExpense.kt`, `TravelExpense.kt` (JOINED, ElementCollection, EAGER fetch patterns)
- **Controller patterns**: `ExpenseController.kt` (wirespec handlers, security, polymorphic response mapping)
- **Design document**: `.planning/PROJECT.md`, `docs/plans/2026-02-28-budget-allocations-design.md`
- **Implementation plan**: `docs/plans/2026-02-28-budget-allocations-implementation.md`
- **Domain knowledge**: JPA JOINED inheritance, Hibernate query optimization, BigDecimal precision handling

---
*Pitfalls research for: Budget Allocation JPA JOINED Inheritance Implementation*
*Researched: 2026-03-02*
*Confidence: HIGH - based on direct codebase analysis of reference implementation (Expense domain)*
