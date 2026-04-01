# Phase 13: Budget Calculation Tests - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

SpringBootTests proving backend budget calculations are correct: remaining budget equals contract value minus sum of allocations, scoped by type (hack hours, study hours, study money) and year. This is the final phase of v1.1 E2E Tests milestone.

</domain>

<decisions>
## Implementation Decisions

### Test scope
- Existing `BudgetSummaryControllerTest` already tests basic budget calculation (contract with hackHours=100, studyHours=80, studyMoney=2500, then allocations of 8h hack, 4h study, 500 money)
- Existing `BudgetAllocationPersistenceTest` already tests year filtering via `findAllByPersonUuidAndYear`
- Phase 13 should verify gaps in existing tests against CALC-01/02/03 requirements, then add only what's missing
- If existing tests already fully cover requirements, mark them as passing and document the mapping

### Test granularity
- Use MockMvc controller integration tests (matches existing `BudgetSummaryControllerTest` pattern)
- Extend `WorkdayIntegrationTest` base class with `@ActiveProfiles("test")`
- Use `CreateHelper` for test data setup (persons, contracts, allocations)

### Specific scenarios needed (per requirement)
- **CALC-01**: Multiple allocations of same type sum correctly (e.g., two hack time allocations, verify remaining = budget - sum of both)
- **CALC-02**: Creating study hours allocation does NOT affect hack hour budget or study money budget (type independence)
- **CALC-03**: Allocation in year 2025 is excluded from 2026 budget summary; allocation in 2026 is included

### Claude's Discretion
- Whether to add tests to existing `BudgetSummaryControllerTest` or create a new test class
- Exact test method naming conventions
- Whether additional edge cases are needed beyond the three requirements

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Budget calculation service
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetSummaryService.kt` — Core calculation: available = budget - used, per type
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationRepository.kt` — Year-scoped query: `YEAR(ba.date) = :year`

### Existing tests (check for gaps before writing new ones)
- `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetSummaryControllerTest.kt` — Existing budget summary tests
- `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceTest.kt` — Existing persistence + year filtering tests
- `workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationControllerTest.kt` — Existing CRUD endpoint tests

### Test infrastructure
- `workday-application/src/test/kotlin/community/flock/eco/workday/WorkdayIntegrationTest.kt` — Base test class with SpringBootTest config
- `workday-application/src/test/kotlin/community/flock/eco/workday/helpers/CreateHelper.kt` — Test data factories (createPerson, createContractInternal, etc.)

### Domain models
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationEntity.kt` — JPA entity hierarchy (joined inheritance)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CreateHelper.createContractInternal()` — Creates contract with hackHours, studyHours, studyMoney params (defaults: hackHours=160, studyHours=0, studyMoney=0)
- `CreateHelper.createPerson()` / `createPersonEntity()` — Creates test persons with optional userCode
- `CreateHelper.createUser()` — Creates users with authority sets
- `HackTimeBudgetAllocationService`, `StudyTimeBudgetAllocationService`, `StudyMoneyBudgetAllocationService` — Domain services for creating allocations in tests

### Established Patterns
- Tests extend `WorkdayIntegrationTest` (SpringBootTest with RANDOM_PORT, test profile, AutoConfigureMockMvc)
- Test data created in `@BeforeEach` or companion object `@BeforeAll`
- MockMvc GET requests with `SecurityMockMvcRequestPostProcessors.user()` for auth
- JSON assertions via `jsonPath("$.hackHours.available")` pattern
- Authority sets: `adminAuthorities` includes `BudgetAllocationAuthority.ADMIN`, `userAuthorities` includes `BudgetAllocationAuthority.READ`

### Integration Points
- `GET /api/budget-summary?personId={uuid}&year={year}` — The endpoint under test
- Response shape: `{ hackHours: { budget, used, available }, studyHours: { budget, used, available }, studyMoney: { budget, used, available } }`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard SpringBootTest patterns apply. Key insight: existing tests may already cover requirements. Verify first, then fill gaps only.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-budget-calculation-tests*
*Context gathered: 2026-03-22*
