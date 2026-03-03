---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 03
current_plan: Not started
status: completed
last_updated: "2026-03-03T10:51:28.714Z"
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-03
**Current Phase:** 03
**Current Plan:** Not started
**Status:** Milestone complete

## Project Reference

**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

**Current Focus:** Completing frontend prototype by redesigning the end-to-end flow of creating/editing an event with budget allocations. This addresses disconnected flow, cluttered UI, and duplicate logic issues in the current prototype.

## Current Position

**Phase:** 3 of 8 - Domain Layer
**Plan:** 02 of 02
**Status:** Complete (All plans finished)
**Progress:** [██████████] 100%

### Phase 3 Objective
Create complete domain layer (types, ports, services, events) for BudgetAllocation following hexagonal architecture pattern.

**Success Criteria:**
1. BudgetAllocation sealed type hierarchy with 3 concrete implementations (HackTime, StudyTime, StudyMoney)
2. Persistence port interfaces (1 polymorphic + 3 type-specific) define all data access contracts
3. Domain services delegate to ports and publish events (Create/Update/Delete)
4. Domain layer compiles with zero infrastructure dependencies and passes unit tests without Spring/DB

**Requirements in Phase:** DOM-01, DOM-02

**Key Implementation:**
- Sealed interface BudgetAllocation with Long id for JOINED inheritance
- DailyTimeAllocation value object with per-day type override (BudgetAllocationType)
- BigDecimal for StudyMoneyBudgetAllocation amount (monetary precision)
- Polymorphic queries vs type-specific mutations pattern
- Domain events for cross-cutting concerns

## Performance Metrics

### Velocity
- **Phases completed:** 3 (Phase 1: Frontend Prototype, Phase 2: Event Budget Flow Redesign, Phase 3: Domain Layer)
- **Requirements completed:** 4 of 23 v1 requirements (EVT-05, EVT-06, DOM-01, DOM-02 satisfied)
- **Plans completed:** 5 (02-01, 02-02, 02-03, 03-01, 03-02)
- **Completion rate:** 38% (3/8 phases complete)

### Quality
- **Build status:** Pass (domain module compiles cleanly with 7 passing tests)
- **Test coverage:** Domain layer fully tested without Spring/DB dependencies
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
| 4. Persistence & Contract | Not started | DOM-03, DOM-04 | 4 criteria |
| 5. API Layer | Not started | API-01, API-02, API-03, API-04, API-05, CTR-02 | 6 criteria |
| 6. Budget Tab Integration | Not started | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 criteria |
| 7. Event Integration | Not started | EVT-01, EVT-02, EVT-03, EVT-04 | 4 criteria |
| 8. Contract Form & Dev Data | Not started | CTR-01, DEV-01 | 4 criteria |

**Overall Progress:** 38% (Phases 1-3 complete, 5 phases remaining)

| Plan | Duration (min) | Tasks | Files |
|------|----------------|-------|-------|
| Phase 02 P01 | 7 | 2 tasks | 3 files |
| Phase 02 P02 | 3 | 1 tasks | 2 files |
| Phase 02 P03 | 3 | 2 tasks | 2 files |
| Phase 03 P01 | 1 | 2 tasks | 7 files |
| Phase 03 P02 | 4 | 2 tasks | 6 files |
| Phase 03 P02 | 232 | 2 tasks | 6 files |

## Session Continuity

### Last Session Summary
- Executed Phase 3 Plan 02: Domain Services, Events, and Tests
- Created BudgetAllocationEvent sealed interface with Create/Update/Delete variants
- Created 4 domain services (1 polymorphic + 3 type-specific) delegating to persistence ports
- All services publish domain events on create/update/delete operations
- Created BudgetAllocationTest with 7 unit tests using manual test doubles
- All tests pass without Spring context or database dependencies
- Added JUnit 5 dependencies to domain module for test infrastructure
- Created 03-02-SUMMARY.md documenting implementation (2 tasks, 2 commits, 232 seconds)
- Phase 3 complete (all plans finished)

### Next Session
Execute Phase 4 (Persistence & Contract Layer) to implement JPA adapters and Wirespec contracts.

### Context for Next Agent
- Phase 1 (frontend prototype foundation) complete with 15 commits on feat/hack-and-study-budget-allocations branch
- Phase 2 is frontend-only work (no backend dependencies) addressing UX issues in event budget flow
- Implementation plan at docs/plans/2026-02-28-budget-allocations-implementation.md has detailed context for Phase 2
- Backend work starts in Phase 3 (domain layer)
- Research identified Expense domain as exact pattern to follow for backend phases
- Critical pitfalls documented: N+1 queries (LAZY fetch), FK ordering (Liquibase), BigDecimal precision, discriminator strategy
- All work happens in `workday-application` module (workday-core and workday-user are frozen)

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-02 (revised: Phase 2 now current, Phase 1 not fully complete)*
