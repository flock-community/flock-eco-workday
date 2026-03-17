---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 09
current_plan: Not started
status: completed
last_updated: "2026-03-17T08:19:45.801Z"
progress:
  total_phases: 9
  completed_phases: 8
  total_plans: 16
  completed_plans: 16
  percent: 100
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-16
**Current Phase:** 09
**Current Plan:** Not started
**Status:** Milestone complete

## Project Reference

**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

**Current Focus:** All phases complete. Budget allocations feature fully implemented and verified.

## Current Position

**Phase:** 9 of 9 - Verification Gap Closure
**Plan:** 01 of 01 (Phase complete)
**Status:** Project Complete
**Progress:** [██████████] 100%

### Phase 9 Objective
Close all verification gaps: create missing VERIFICATION.md files, fix documentation gaps, fix downloadFile URL bug.

**Success Criteria:**
1. Admin edits internal contract and sees studyHours and studyMoney input fields
2. Admin saves contract with studyHours and studyMoney values and they persist correctly
3. Developer runs app with -Pdevelop and sees budget allocations pre-loaded for test persons
4. Developer can test full budget allocation workflow without manual data entry

**Requirements in Phase:** CTR-01, DEV-01

**Key Implementation (Plan 01):**
- studyHours and studyMoney fields added to ContractFormInternal.tsx (JSX, init, schema)
- LoadContractData updated with studyHours/studyMoney values on internal contracts
- LoadBudgetAllocationData created seeding all 3 allocation types for 3 persons across 2 years

## Performance Metrics

### Velocity
- **Phases completed:** 9 (Phase 1-9 all complete)
- **Requirements completed:** 23 of 23 v1 requirements (EVT-01, EVT-02, EVT-03, EVT-04, EVT-05, EVT-06, DOM-01, DOM-02, DOM-03, DOM-04, CTR-01, CTR-02, DEV-01, API-01, API-02, API-03, API-04, API-05, TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 satisfied)
- **Plans completed:** 16 (02-01, 02-02, 02-03, 03-01, 03-02, 04-01, 04-02, 04-03, 05-01, 05-02, 06-01, 06-02, 06-03, 07-01, 08-01, 09-01) -- all with passing builds
- **Completion rate:** 100% (9/9 phases complete)

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
29. **2026-03-12**: EventBudgetType constant preserves old STUDY/HACK values for event forms, separate from wirespec BudgetAllocationType -- rationale: event forms use different enum values than budget allocation API
30. **2026-03-12**: Deleted EventBudgetAllocationDialog.tsx prototype -- rationale: depended entirely on mock data, Phase 7 will rebuild event integration from scratch

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
| 6. Budget Tab Integration | Complete (3/3 plans) | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 criteria met |
| 7. Event Integration | Complete | EVT-01, EVT-02, EVT-03, EVT-04 | 5 criteria met |
| 8. Contract Form & Dev Data | Complete (1/1 plans) | CTR-01, DEV-01 | 4 criteria met |
| 9. Verification Gap Closure | Complete (1/1 plans) | DOM-01-04, API-01-05, CTR-02, EVT-01-04 | 23/23 requirements verified |

**Overall Progress:** 100% (All 9 phases complete)

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
| Phase 06 P03 | 55 | 2 tasks | 17 files |
| Phase 07 P01 | 5 | 2 tasks | 4 files |
| Phase 08 P01 | 3 | 2 tasks | 3 files |
| Phase 09 P01 | 4 | 2 tasks | 6 files |

## Session Continuity

### Last Session Summary
- Executed Phase 9 Plan 01 (Verification Gap Closure)
- Fixed downloadFile URL bug in BudgetAllocationClient.ts (two-segment path pattern)
- Fixed DOM-03 checkbox in REQUIREMENTS.md
- Added requirements_completed to 03-02-SUMMARY.md frontmatter
- Created VERIFICATION.md for phases 04, 05, 07
- Re-audit confirmed 23/23 v1 requirements satisfied with zero gaps

### Next Session
Project complete. All budget allocation feature work is done and fully verified.

### Context for Next Agent
- All 9 phases complete: budget allocations feature fully implemented, documented, and verified
- 23/23 v1 requirements have formal verification artifacts with concrete evidence
- 7 VERIFICATION.md files across phases 02-08
- Full stack: domain model, persistence, API, budget tab, event integration, contract form, dev data

---
*State initialized: 2026-03-02*
*Last updated: 2026-03-16 (Phase 8 Plan 01 complete, project complete)*
