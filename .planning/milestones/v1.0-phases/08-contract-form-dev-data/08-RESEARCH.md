# Phase 8: Contract Form & Dev Data - Research

**Researched:** 2026-03-13
**Domain:** React form fields (formik-mui), Spring dev data loaders, JPA entity seeding
**Confidence:** HIGH

## Summary

Phase 8 is the final phase of the budget allocations feature. It has two independent concerns: (1) adding studyHours and studyMoney input fields to the internal contract form in React, and (2) creating a dev data loader that seeds budget allocation entities for the development profile.

Both tasks are straightforward pattern-following exercises. The contract form already has a hackHours field using the exact same formik-mui `TextField` + `number` type pattern that studyHours and studyMoney need. The dev data loader follows the established `@Component` + `@ConditionalOnProperty` + `loadData.load {}` pattern used by all other loaders (LoadExpensesData, LoadEventData, etc.).

The wirespec contract types already include studyHours and studyMoney fields (confirmed in contracts.ws lines 81-82 and 96-97), and the ContractInternal JPA entity already has these fields with defaults (studyHours: Int = 0, studyMoney: BigDecimal = BigDecimal.ZERO). The backend round-trip is already working -- this phase only adds the frontend form fields and dev seed data.

**Primary recommendation:** Implement as a single plan with two independent tasks (contract form fields + dev data loader) since they share no code dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
1. **Contract Form Field Placement (CTR-01):** Follow the existing hackHours pattern exactly. Add studyHours and studyMoney fields to ContractFormInternal.tsx. Place them in the same grid section as hackHours (budget-related fields grouped together). Use same field component types (number inputs via formik-mui). studyMoney should use a number input (same as monthlySalary pattern). No conditional visibility. No special formatting.

2. **Dev Data Loader: Coverage & Variety (DEV-01):** Both event-linked and standalone allocations for 2-3 persons with varied data.
   - Person A (full coverage): All 3 allocation types across current + prior year, prior year ~80% consumed, current year partial
   - Person B (partial): HackTime only (event-linked)
   - Person C (standalone only): StudyMoney standalone allocation
   - Depend on LoadEventData's existing events
   - LoadBudgetAllocationData must run after LoadEventData
   - Current year + prior year data

3. **Contract Data Updates:** Modify LoadContractData directly. Add studyHours and studyMoney values to ContractInternal constructors. Example values: studyHours=100-200, studyMoney=2000-5000.

### Claude's Discretion
None specified -- all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)
None -- Phase 8 is the final phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CTR-01 | Contract form shows studyHours and studyMoney fields for internal contracts | Exact pattern identified in ContractFormInternal.tsx: hackHours field at lines 58-73 uses `Field` with `type="number"`, `component={TextField}` from formik-mui. Init values at lines 79-87, schema at lines 89-97. Add studyHours and studyMoney following identical pattern. |
| DEV-01 | Mock data loader seeds budget allocations for development profile | LoadExpensesData.kt provides exact pattern: `@Component` + `@ConditionalOnProperty` + `loadData.load {}`. Entity constructors for HackTimeBudgetAllocationEntity, StudyTimeBudgetAllocationEntity, StudyMoneyBudgetAllocationEntity fully documented. Type-specific repositories available for direct save. |
</phase_requirements>

## Architecture Patterns

### Pattern 1: Formik-MUI Number Field (Contract Form)
**What:** Add form fields to ContractFormInternal using formik-mui TextField with type="number"
**When to use:** Adding numeric input fields to existing Formik forms

The existing hackHours field is the exact template:

```tsx
// Source: ContractFormInternal.tsx lines 58-73
<Grid size={{ xs: 12 }}>
  <Field
    name="hackHours"
    type="number"
    label="Hack hours"
    fullWidth
    component={TextField}
  />
</Grid>
```

Three places must be updated in ContractFormInternal.tsx:
1. **Form JSX** (lines 20-76): Add two new `<Grid>` + `<Field>` blocks after hackHours
2. **Init object** (lines 79-87): Add `studyHours: value.studyHours` and `studyMoney: value.studyMoney`
3. **Yup schema** (lines 89-97): Add `studyHours: number().required().default(0)` and `studyMoney: number().required().default(0)`

**Important:** The form ID is `INTERNAL_CONTRACT_FORM_ID = 'internal-contract-form'`. The ContractDialog submits via `form={type.toLowerCase()-contract-form}` which resolves to `internal-contract-form`. The handleSubmit in ContractDialog spreads all form values into the body (lines 53-65), so new fields are automatically included in API calls.

### Pattern 2: Dev Data Loader
**What:** Spring component that seeds data when the develop profile is active
**When to use:** Creating test data for the -Pdevelop run configuration

```kotlin
// Source: LoadExpensesData.kt - canonical pattern
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadBudgetAllocationData(
    // inject dependencies
    private val loadPersonData: LoadPersonData,
    private val loadEventData: LoadEventData,
    private val loadContractData: LoadContractData,
    private val hackTimeRepo: HackTimeBudgetAllocationRepository,
    private val studyTimeRepo: StudyTimeBudgetAllocationRepository,
    private val studyMoneyRepo: StudyMoneyBudgetAllocationRepository,
    loadData: LoadData,
) {
    val data: MutableList<BudgetAllocationEntity> = mutableListOf()

    init {
        loadData.load {
            // create entities and save via repositories
        }
    }
}
```

### Pattern 3: Entity Construction for Budget Allocations
**What:** Direct constructor calls for the three allocation entity subtypes

**HackTimeBudgetAllocationEntity:**
```kotlin
HackTimeBudgetAllocationEntity(
    person = person,
    eventCode = event.code,  // or null for standalone
    date = LocalDate.of(year, month, day),
    description = "Hack day allocation",
    totalHours = 8.0,
    dailyTimeAllocations = mutableListOf(
        DailyTimeAllocationEmbeddable(
            date = LocalDate.of(year, month, day),
            hours = 8.0,
            type = BudgetAllocationType.HACK,
        )
    ),
)
```

**StudyTimeBudgetAllocationEntity:**
```kotlin
StudyTimeBudgetAllocationEntity(
    person = person,
    eventCode = event.code,  // or null
    date = LocalDate.of(year, month, day),
    description = "Conference study time",
    totalHours = 24.0,
    dailyTimeAllocations = mutableListOf(
        DailyTimeAllocationEmbeddable(
            date = LocalDate.of(year, month, day),
            hours = 8.0,
            type = BudgetAllocationType.STUDY,
        ),
        // ... more days
    ),
)
```

**StudyMoneyBudgetAllocationEntity:**
```kotlin
StudyMoneyBudgetAllocationEntity(
    person = person,
    eventCode = null,  // standalone
    date = LocalDate.of(year, month, day),
    description = "Online course subscription",
    amount = BigDecimal("500.00"),
    files = mutableListOf(),
)
```

### Anti-Patterns to Avoid
- **Using domain services instead of repositories for dev data:** LoadExpensesData uses domain services, but budget allocation entities can be saved directly via type-specific repositories (simpler, no auth checks needed in dev loader).
- **Forgetting dailyTimeAllocations on time-based entities:** HackTime and StudyTime require the dailyTimeAllocations list to be populated -- these are not optional. Without them, the UI and summary calculations will show 0 hours even though totalHours is set.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field rendering | Custom input components | formik-mui `TextField` via `<Field component={TextField}>` | Existing pattern, handles validation display, MUI styling |
| Form validation | Manual validation logic | Yup schema with `.required().default()` | Already used for all other fields in same form |
| Dev data ordering | Manual Spring bean ordering | Spring's dependency injection ordering (constructor injection of LoadEventData/LoadPersonData) | Spring resolves init order from constructor deps automatically |

## Common Pitfalls

### Pitfall 1: Missing Init Values in Form
**What goes wrong:** New fields show empty/undefined instead of values when editing existing contracts
**Why it happens:** The `init` object in ContractFormInternal.tsx manually maps `value.X` to form fields. If you add form fields but forget to add them to the init object, editing existing contracts shows blank fields.
**How to avoid:** Update all three locations: JSX, init object, and Yup schema.
**Warning signs:** Fields work for new contracts (schema defaults kick in) but show blank when editing existing ones.

### Pitfall 2: studyMoney Type Mismatch
**What goes wrong:** studyMoney is BigDecimal on the backend but the form sends a JavaScript number
**Why it happens:** Yup `number()` type produces a JS number, which serializes as a JSON number
**How to avoid:** This is actually fine -- the backend Jackson deserializer handles number-to-BigDecimal conversion. The wirespec type is `Number?` which maps to Double/Number on the Kotlin side, and the ContractInternalForm likely converts to BigDecimal. No special handling needed.

### Pitfall 3: Dev Data Loader Ordering
**What goes wrong:** LoadBudgetAllocationData runs before LoadEventData, causing null event references
**Why it happens:** Spring creates beans in undefined order unless there are explicit dependencies
**How to avoid:** Inject LoadEventData and LoadContractData as constructor parameters. Spring will initialize those beans first. This is the same pattern used by LoadExpensesData (injects LoadPersonData).

### Pitfall 4: Lazy Collection Access in Dev Loader
**What goes wrong:** LazyInitializationException when reading dailyTimeAllocations outside a transaction
**Why it happens:** ElementCollection with FetchType.LAZY needs an active session
**How to avoid:** In the dev data loader, you are CREATING entities (not reading), so lazy fetch is not an issue. Just construct entities with populated dailyTimeAllocations lists and save them.

## Code Examples

### ContractFormInternal.tsx - Fields to Add (after hackHours block)

```tsx
// studyHours field - follows hackHours pattern exactly
<Grid size={{ xs: 12 }}>
  <Field
    name="studyHours"
    type="number"
    label="Study hours"
    fullWidth
    component={TextField}
  />
</Grid>
// studyMoney field - follows monthlySalary pattern
<Grid size={{ xs: 12 }}>
  <Field
    name="studyMoney"
    type="number"
    label="Study money"
    fullWidth
    component={TextField}
  />
</Grid>
```

### ContractFormInternal.tsx - Init Object Addition

```tsx
const init = value && {
  // ... existing fields ...
  hackHours: value.hackHours,
  studyHours: value.studyHours,
  studyMoney: value.studyMoney,
};
```

### ContractFormInternal.tsx - Schema Addition

```tsx
const schema = object({
  // ... existing fields ...
  hackHours: number().required().default(160),
  studyHours: number().required().default(0),
  studyMoney: number().required().default(0),
});
```

### LoadContractData.kt - Modified ContractInternal Constructors

```kotlin
// ieniemienie - internal contract
ContractInternal(
    person = loadPersonData.findPersonByUserEmail(email),
    hoursPerWeek = 32,
    monthlySalary = 6000.0,
    holidayHours = 192,
    hackHours = 160,
    studyHours = 200,
    studyMoney = BigDecimal("5000.00"),
    from = from,
    to = to,
)

// pino - internal contract
ContractInternal(
    person = loadPersonData.findPersonByUserEmail(email),
    hoursPerWeek = 32,
    monthlySalary = 6000.0,
    holidayHours = 192,
    hackHours = 160,
    studyHours = 100,
    studyMoney = BigDecimal("2500.00"),
    from = from,
    to = to,
)
```

### Key Entity References for Dev Data

**Test persons with internal contracts (from LoadContractData):**
- `ieniemienie@sesam.straat` - INTERNAL contract, from now-8mo to now+8mo (Person A - full coverage)
- `pino@sesam.straat` - INTERNAL contract, from now-12mo to now+4mo (Person B or C)

**Test persons with external contracts (no budget fields):**
- `tommy@sesam.straat`, `bert@sesam.straat`, `ernie@sesam.straat` - EXTERNAL contracts

**Available events from LoadEventData:**
- 20 hack days (`FLOCK_HACK_DAY`) spread across all months, all persons
- 1 conference (`CONFERENCE`) in May, first 2 persons only
- 3 community days (`FLOCK_COMMUNITY_DAY`), all persons

**Repositories for direct save:**
- `HackTimeBudgetAllocationRepository` (CrudRepository)
- `StudyTimeBudgetAllocationRepository` (CrudRepository)
- `StudyMoneyBudgetAllocationRepository` (CrudRepository)

## Open Questions

None -- all decisions are locked and patterns are well-established in the codebase.

## Sources

### Primary (HIGH confidence)
- `ContractFormInternal.tsx` - Read directly, exact field pattern documented
- `ContractDialog.tsx` - Read directly, form submission flow confirmed
- `LoadExpensesData.kt` - Read directly, dev data loader pattern confirmed
- `LoadContractData.kt` - Read directly, ContractInternal constructor confirmed
- `LoadEventData.kt` - Read directly, available events and event codes confirmed
- `LoadPersonData.kt` - Read directly, person lookup methods confirmed
- `ContractInternal.kt` - Read directly, studyHours/studyMoney fields confirmed with defaults
- `BudgetAllocationEntity.kt` + subtypes - Read directly, all constructor signatures documented
- `BudgetAllocationRepository.kt` - Read directly, type-specific repos confirmed
- `DailyTimeAllocationEmbeddable.kt` - Read directly, constructor confirmed
- `contracts.ws` lines 81-82, 96-97 - Wirespec already includes studyHours/studyMoney
- `BudgetAllocationType.kt` - Enum values: STUDY, HACK

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use in the codebase (formik-mui, yup, Spring Boot)
- Architecture: HIGH - Both tasks follow exact existing patterns with direct code examples
- Pitfalls: HIGH - Identified from direct code inspection, no speculative risks

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable patterns, no external dependencies)
