# Phase 8 Context: Contract Form & Dev Data

**Phase Goal:** Contract management includes budget fields and dev environment has test data
**Requirements:** CTR-01, DEV-01
**Created:** 2026-03-13

## Prior Decisions Applied

- studyHours (Int, default 0) and studyMoney (BigDecimal, default ZERO) already on ContractInternal entity (Phase 4, Decision #19-21)
- Wirespec ContractInternalForm and ContractInternal types already include studyHours and studyMoney (Phase 5)
- Column name is `study_money_budget` (Decision #20)
- ContractFormInternal.tsx has hackHours field — studyHours/studyMoney follow same pattern

## Decisions

### 1. Contract Form Field Placement (CTR-01)

**Decision:** Follow the existing hackHours pattern exactly.

- Add studyHours and studyMoney fields to ContractFormInternal.tsx
- Place them in the same grid section as hackHours (budget-related fields grouped together)
- Use same field component types (number inputs via formik-mui)
- studyMoney should use a number input (same as monthlySalary pattern)
- No conditional visibility — fields always shown on internal contract form
- No special formatting needed beyond what the existing field patterns provide

### 2. Dev Data Loader: Coverage & Variety (DEV-01)

**Decision:** Both event-linked and standalone allocations for 2-3 persons with varied data.

#### Person Coverage
- **Person A (full coverage):** All 3 allocation types (HackTime, StudyTime, StudyMoney) across current + prior year
  - Prior year: high consumption (~80%+ budget used) to test near-limit display
  - Current year: partial consumption to test normal state
- **Person B (partial):** HackTime only (event-linked), tests single-type view
- **Person C (standalone only):** StudyMoney standalone allocation (no event link), tests standalone CRUD flow

#### Event Linking
- Depend on LoadEventData's existing events (hack days, conferences)
- LoadBudgetAllocationData must run after LoadEventData (ordering dependency)
- Some allocations reference event codes, others are standalone

#### Year Range
- Current year + prior year data
- Tests year selector filtering in budget tab

### 3. Contract Data Updates

**Decision:** Modify LoadContractData directly.

- Add studyHours and studyMoney values to ContractInternal constructors in LoadContractData
- Sets meaningful budget values so budget summary shows non-zero budgets
- Single source of truth for dev contract data (no post-processing step)
- Example values: studyHours=100-200, studyMoney=2000-5000 (varied per person)

## Code Context

### Files to Modify
- `workday-application/src/main/react/features/contract/ContractFormInternal.tsx` — add studyHours/studyMoney fields
- `workday-application/src/develop/kotlin/.../mocks/LoadContractData.kt` — add studyHours/studyMoney to constructors

### Files to Create
- `workday-application/src/develop/kotlin/.../mocks/LoadBudgetAllocationData.kt` — new dev data loader

### Key Dependencies
- `LoadPersonData` — provides test persons
- `LoadEventData` — provides events to link allocations to
- `LoadContractData` — provides contracts (modified to include budget fields)
- `BudgetAllocationRepository` (or type-specific repos) — for persisting seed data
- `DailyTimeAllocationEmbeddable` — for time allocation daily breakdowns

### Patterns to Follow
- Dev data loader: `@Component` + `@ConditionalOnProperty` + `loadData.load { }` (see LoadExpensesData)
- Contract form fields: same grid/formik-mui pattern as hackHours in ContractFormInternal.tsx
- Entity construction: direct constructor calls + repository.save() (see LoadContractData pattern)

## Deferred Ideas

None — Phase 8 is the final phase.

---
*Context captured: 2026-03-13*