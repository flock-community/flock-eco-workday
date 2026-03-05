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

**Phase:** 4 of 8 - Persistence & Contract
**Plan:** 03 of 03
**Status:** Complete (All plans finished)
**Progress:** [██████████] 100%

### Phase 4 Objective
Application can store and retrieve budget allocations from database with JOINED inheritance and contract study budget fields.

**Success Criteria:**
1. Database schema includes budget_allocation hierarchy with JOINED inheritance (base + child + element collection tables)
2. Developer can run Liquibase migrations locally without FK constraint failures
3. ContractInternal entity persists studyHours and studyMoney fields with correct types (BigDecimal)
4. JPA repositories can save and retrieve all three allocation types with lazy-loaded daily breakdowns

**Requirements in Phase:** DOM-03, DOM-04

**Key Implementation:**
- Liquibase changelog-027 creates budget_allocation hierarchy with JOINED inheritance
- JPA entities map to database schema with @Inheritance(strategy = InheritanceType.JOINED)
- @ElementCollection for daily_time_allocations with LAZY fetch + explicit JOIN FETCH queries
- ContractInternal extended with studyHours (Int) and studyMoney (BigDecimal) via changelog-028
- Spring Data JPA repositories with domain-entity mappers implementing persistence ports

## Performance Metrics

### Velocity
- **Phases completed:** 4 (Phase 1: Frontend Prototype, Phase 2: Event Budget Flow Redesign, Phase 3: Domain Layer, Phase 4: Persistence & Contract)
- **Requirements completed:** 6 of 23 v1 requirements (EVT-05, EVT-06, DOM-01, DOM-02, DOM-03, DOM-04 satisfied)
- **Plans completed:** 8 (02-01, 02-02, 02-03, 03-01, 03-02, 04-01, 04-02, 04-03)
- **Completion rate:** 50% (4/8 phases complete)

### Quality
- **Build status:** Pass (workday-application compiles cleanly with all tests passing)
- **Test coverage:** Domain layer + persistence layer integration tests (all passing)
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
18. **2026-03-05**: Use BigDecimal for studyMoney field to ensure monetary precision without floating-point errors
19. **2026-03-05**: Use explicit column name 'study_money_budget' (not 'study_money') via @Column annotation per user decision
20. **2026-03-05**: Default values of 0 and BigDecimal.ZERO for backward compatibility with existing contracts

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
| 5. API Layer | Not started | API-01, API-02, API-03, API-04, API-05, CTR-02 | 6 criteria |
| 6. Budget Tab Integration | Not started | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 criteria |
| 7. Event Integration | Not started | EVT-01, EVT-02, EVT-03, EVT-04 | 4 criteria |
| 8. Contract Form & Dev Data | Not started | CTR-01, DEV-01 | 4 criteria |

**Overall Progress:** 50% (Phases 1-4 complete, 4 phases remaining)

| Plan | Duration (min) | Tasks | Files |
|------|----------------|-------|-------|
| Phase 02 P01 | 7 | 2 tasks | 3 files |
| Phase 02 P02 | 3 | 1 tasks | 2 files |
| Phase 02 P03 | 3 | 2 tasks | 2 files |
| Phase 03 P01 | 1 | 2 tasks | 7 files |
| Phase 03 P02 | 4 | 2 tasks | 6 files |
| Phase 04 P03 | 8 | 3 tasks | 8 files |

## Session Continuity

### Last Session Summary
- Executed Phase 4 Plan 03: Contract Internal Study Budget Fields
- Created Liquibase changelog-028 adding study_hours and study_money_budget columns to contract_internal
- Extended ContractInternal entity with studyHours (Int) and studyMoney (BigDecimal) fields
- Extended ContractInternalForm with matching fields for API input
- Updated ContractService.internalize to map new fields
- Created ContractInternalPersistenceTest with 4 integration tests (all passing)
- Auto-fixed blocking issues from parallel Plan 04-01 (EventForm parameter rename)
- Created 04-03-SUMMARY.md documenting implementation (3 tasks, 3 commits, 485 seconds)
- Phase 4 complete (all plans finished)

### Next Session
Execute Phase 5 (API Layer) to create Wirespec contracts and REST endpoints for budget allocations.

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
