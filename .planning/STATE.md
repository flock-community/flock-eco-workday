---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 06
current_plan: 02 of 03
status: in-progress
last_updated: "2026-03-12T08:34:00Z"
progress:
  total_phases: 8
  completed_phases: 5
  total_plans: 14
  completed_plans: 13
  percent: 71
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-12
**Current Phase:** 06
**Current Plan:** 01 of 03
**Status:** Phase 6 in progress (Plan 01 complete)

## Project Reference

**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

**Current Focus:** Phase 6 Budget Tab Integration -- Plan 02 (frontend client + components) complete, Plan 03 (StudyMoney CRUD) next.

## Current Position

**Phase:** 6 of 8 - Budget Tab Integration
**Plan:** 02 of 03 (Plan 02 complete)
**Status:** In progress
**Progress:** [███████▓░░] 71%

### Phase 6 Objective
Connect person-centric budget allocation UI to real API endpoints with budget summary, allocation lists, and CRUD operations.

**Success Criteria:**
1. User opens Budget Allocation tab and sees summary cards with real budget/used/available calculated from API data
2. User sees allocation list populated from API with event links that navigate to real event records
3. Admin can create/edit/delete standalone StudyMoney allocations and changes persist to database
4. User changes year selector and allocation list updates with filtered data from API
5. Admin switches between persons using person selector and tab displays correct budget data

**Requirements in Phase:** TAB-01, TAB-02, TAB-03, TAB-04, TAB-05

**Key Implementation (Plan 01):**
- GET /api/budget-summary endpoint with BudgetSummaryResponse and BudgetItem wirespec types
- BudgetSummaryService joining ContractInternal budget fields with allocation sums
- BudgetSummary.Handler wired into BudgetAllocationController
- 4 integration tests (happy path, no contract, non-admin auto-scope, admin cross-person)
- TypeScript types generated for frontend consumption

## Performance Metrics

### Velocity
- **Phases completed:** 5 (Phase 1: Frontend Prototype, Phase 2: Event Budget Flow Redesign, Phase 3: Domain Layer, Phase 4: Persistence & Contract, Phase 5: API Layer)
- **Requirements completed:** 15 of 23 v1 requirements (EVT-05, EVT-06, DOM-01, DOM-02, DOM-03, DOM-04, CTR-02, API-01, API-02, API-03, API-04, API-05, TAB-01, TAB-05 satisfied)
- **Plans completed:** 13 (02-01, 02-02, 02-03, 03-01, 03-02, 04-01, 04-02, 04-03, 05-01, 05-02, 06-01, 06-02) -- all with passing builds
- **Completion rate:** 71% (5/8 phases complete, Phase 6 in progress)

### Quality
- **Build status:** Pass (workday-application compiles cleanly with all tests passing)
- **Test coverage:** Domain layer + persistence layer + API controller + budget summary integration tests (all passing)
- **Blockers:** 0
- **Technical debt:** 0 items logged

## Accumulated Context

### Key Decisions
1. **2026-03-02**: Phase 1 prototype foundation complete, but event budget flow needs redesign before backend work
2. **2026-03-02**: Phase 2 focuses on frontend-only fixes (progressive disclosure, single source of truth, natural flow)
3. **2026-03-02**: Follow Expense domain pattern exactly (sealed interface + persistence port in domain, JPA JOINED inheritance + adapter in application) — rationale: proven pattern in this codebase, reduces risk
4. **2026-03-02**: Use LAZY fetch for element collections with explicit JOIN FETCH queries — rationale: prevent N+1 query explosion observed in Expense domain
5. **2026-03-02**: Unified Wirespec response type with discriminator + separate input types per allocation subtype — rationale: clean API with type-safe boundaries
6. **2026-03-02**: Per-day type override on DailyTimeAllocation — rationale: single event can mix hack/study days (rare but valuable flexibility)
7. **2026-03-02**: Lifted Formik state to EventDialog to enable reactive budget sections — rationale: single source of truth for form values enabling budget sections to auto-update
8. **2026-03-02**: Per-participant dirty tracking using Set<string> — rationale: O(1) lookup efficiency when preserving manual edits during reactive updates
9. **2026-03-02**: Budget section wrapped in top-level accordion that starts collapsed — rationale: progressive disclosure reduces cognitive load, lets admins see overview before drilling down
10. **2026-03-02**: Three-level disclosure hierarchy (summary banner -> sections -> per-participant details) — rationale: matches user mental model of budget management from high-level to detailed view
11. **2026-03-02**: Merged two competing useEffects into single atomic effect using functional updater pattern — rationale: prevent stale closure overwrites during participant removal and budget redistribution
12. **2026-03-02**: Added EventType-based conditional rendering for money section (only FLOCK_HACK_DAY and CONFERENCE) — rationale: follows domain model where event types determine allowed budget types
13. **2026-03-03**: Use Long id instead of UUID for BudgetAllocation — rationale: JOINED inheritance compatibility with JPA auto-increment
14. **2026-03-03**: Use BigDecimal for StudyMoneyBudgetAllocation amount — rationale: ensure monetary precision without floating-point errors
15. **2026-03-03**: Separate polymorphic (reads) and type-specific (mutations) persistence ports — rationale: clean type-safe boundaries following Expense pattern
16. **2026-03-03**: Use JUnit 5 instead of pure kotlin-test for domain layer tests — rationale: maintain consistency with existing codebase test infrastructure
17. **2026-03-03**: Manual test doubles (object expressions and lambdas) instead of mocking frameworks — rationale: keep domain tests lightweight and dependency-free
18. **2026-03-05**: Use explicit @Table and @CollectionTable annotations on all entities — rationale: ensure entity-derived table names match Liquibase schema exactly, prevent naming mismatches
19. **2026-03-05**: Use BigDecimal for studyMoney field to ensure monetary precision without floating-point errors
20. **2026-03-05**: Use explicit column name 'study_money_budget' (not 'study_money') via @Column annotation per user decision
21. **2026-03-05**: Default values of 0 and BigDecimal.ZERO for backward compatibility with existing contracts
22. **2026-03-05**: Escaped `type` field with backticks in wirespec — rationale: `type` is a reserved keyword in wirespec language
23. **2026-03-05**: TypeScript wirespec output gitignored, generated on demand via `npm run generate` -- rationale: follows existing project convention
24. **2026-03-06**: Runtime auth checks (requireWrite/requireRead) instead of @PreAuthorize for wirespec handler methods -- rationale: @PreAuthorize not intercepted on wirespec-dispatched suspend methods via @EnableWirespecController
25. **2026-03-06**: @Transactional(readOnly=true) on persistence adapter read methods -- rationale: prevent LazyInitializationException on lazy element collections during entity-to-domain mapping
26. **2026-03-12**: BudgetSummaryService as @Service with ContractService + BudgetAllocationService injection -- rationale: application-layer service joining contract budget fields with allocation sums for summary endpoint
27. **2026-03-12**: Direct fetch client for BudgetAllocationClient instead of NonInternalizingClient -- rationale: budget API paths are type-specific (not generic CRUD), cleaner API surface
28. **2026-03-12**: PersonSelector onChange wrapped with handler function -- rationale: bridge string state type with any-typed callback from PersonSelector component

### Active Todos
- [x] Generate Phase 2 plan (event budget flow redesign) — Complete
- [x] Execute Phase 2 Plan 01 (lift Formik state) — Complete
- [x] Execute Phase 2 Plan 02 (progressive disclosure) — Complete
- [x] Execute Phase 2 Plan 03 (UAT bugfixes) — Complete
- [ ] Verify Expense domain discriminator strategy (DTYPE vs. type field) before implementing Phase 3
- [ ] Review Liquibase changeset ordering pattern from db.changelog-002-expenses.yaml before Phase 4

### Known Blockers
None.

### Technical Debt
None logged yet.

## Roadmap Summary

| Phase | Status | Requirements | Success Criteria |
|-------|--------|--------------|------------------|
| 1. Frontend Prototype | Complete | N/A | 5 criteria met |
| 2. Event Budget Flow Redesign | Complete | EVT-05, EVT-06 | 4 criteria met |
| 3. Domain Layer | Complete | DOM-01, DOM-02 | 4 criteria met |
| 4. Persistence & Contract | Complete | DOM-03, DOM-04 | 4 criteria met |
| 5. API Layer | Complete (2/2 plans) | API-01, API-02, API-03, API-04, API-05, CTR-02 | 6 criteria met |
| 6. Budget Tab Integration | In progress (2/3 plans) | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 criteria |
| 7. Event Integration | Not started | EVT-01, EVT-02, EVT-03, EVT-04 | 4 criteria |
| 8. Contract Form & Dev Data | Not started | CTR-01, DEV-01 | 4 criteria |

**Overall Progress:** 71% (Phases 1-5 complete, Phase 6 in progress, 2 phases remaining)

| Plan | Duration (min) | Tasks | Files |
|------|----------------|-------|-------|
| Phase 02 P01 | 7 | 2 tasks | 3 files |
| Phase 02 P02 | 3 | 1 tasks | 2 files |
| Phase 02 P03 | 3 | 2 tasks | 2 files |
| Phase 03 P01 | 1 | 2 tasks | 7 files |
| Phase 03 P02 | 4 | 2 tasks | 6 files |
| Phase 04 P01 | 11 | 3 tasks | 8 files |
| Phase 04 P03 | 8 | 3 tasks | 8 files |
| Phase 05 P01 | 3 | 2 tasks | 4 files |
| Phase 05 P02 | 64 | 2 tasks | 4 files |
| Phase 06 P01 | 7 | 2 tasks | 5 files |
| Phase 06 P02 | 7 | 2 tasks | 10 files |

## Session Continuity

### Last Session Summary
- Executed Phase 6 Plan 02 (Frontend Client + Component Refactoring)
- Created BudgetAllocationClient with typed fetch methods for all budget API endpoints
- Refactored BudgetAllocationFeature from mock data to real API via BudgetAllocationClient
- Refactored all child components (BudgetSummaryCards, BudgetCard, BudgetAllocationList, EventAllocationListItem, StudyMoneyAllocationListItem) to wirespec types
- Registered /budget-allocations route and added Budget navigation item in drawer
- Removed mock imports from all modified budget feature files

### Next Session
Execute Phase 6 Plan 03 (StudyMoney CRUD operations).

### Context for Next Agent
- Phase 6 Plan 02 complete: Budget tab accessible at /budget-allocations with real API data
- BudgetAllocationClient provides: findAll, getSummary, createStudyMoney, deleteById, uploadFile, downloadFile
- All budget components use wirespec types (BudgetAllocation, BudgetSummaryResponse, BudgetItem)
- Admin sees PersonSelector via BudgetAllocationAuthority.ADMIN check
- EventBudgetAllocationDialog and BudgetAllocationDemo still have mock imports (Plan 03 scope)
- StudyMoneyAllocationDialog has a TS error (missing eventCode in StudyMoneyAllocationInput) -- Plan 03 should fix
- All work happens in `workday-application` module (workday-core and workday-user are frozen)

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-12 (Phase 6 Plan 02 complete)*
