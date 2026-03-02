---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: Phase 2 (Event Budget Flow Redesign)
current_plan: 02 of 02
status: executing
last_updated: "2026-03-02T13:35:45.113Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 100
---

# Project State: Budget Allocations for Flock Workday

**Last Updated:** 2026-03-02
**Current Phase:** Phase 2 (Event Budget Flow Redesign)
**Current Plan:** 02 of 02
**Status:** In progress

## Project Reference

**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

**Current Focus:** Completing frontend prototype by redesigning the end-to-end flow of creating/editing an event with budget allocations. This addresses disconnected flow, cluttered UI, and duplicate logic issues in the current prototype.

## Current Position

**Phase:** 2 of 8 - Event Budget Flow Redesign
**Plan:** 02 of 02 (Plan 01 complete)
**Status:** In progress
**Progress:** [██████████] 100%

### Phase 2 Objective
Event form and budget management sections work as a cohesive, intuitive single flow.

**Success Criteria:**
1. Admin changes event form costs/defaultTimeAllocationType and budget sections immediately reflect those changes (single source of truth)
2. Budget management section starts in simple mode (basic form) and expands progressively on demand
3. EventForm fields (costs, defaultTimeAllocationType) are the canonical source for budget defaults, not duplicated logic
4. Admin experiences a natural flow: define event basics -> manage participant budgets, without feeling like two disconnected UIs

**Requirements in Phase:** EVT-05, EVT-06

**Key Problems Addressed:**
- EventForm fields don't propagate to budget sections (disconnected flow)
- Too cluttered UI (needs progressive disclosure)
- Missing integration between form fields and budget sections
- Duplicate logic in EventBudgetAllocationDialog

**Files to Modify:**
- EventForm.tsx
- EventBudgetManagementDialog.tsx
- EventTimeAllocationSection.tsx
- EventMoneyAllocationSection.tsx
- EventBudgetAllocationDialog.tsx

## Performance Metrics

### Velocity
- **Phases completed:** 1 (Phase 1: Frontend Prototype foundation)
- **Requirements completed:** 0 of 23 v1 requirements (Phase 1 not counted in v1, Phase 2 pending)
- **Plans completed:** 0
- **Completion rate:** 12.5% (1/8 phases complete)

### Quality
- **Build status:** Unknown (Phase 2 not started)
- **Test coverage:** Unknown (Phase 2 not started)
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

### Active Todos
- [x] Generate Phase 2 plan (event budget flow redesign) — Complete
- [x] Execute Phase 2 Plan 01 (lift Formik state) — Complete
- [x] Execute Phase 2 Plan 02 (progressive disclosure) — Complete
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
| 2. Event Budget Flow Redesign | Not started | EVT-05, EVT-06 | 4 criteria |
| 3. Domain Layer | Not started | DOM-01, DOM-02 | 4 criteria |
| 4. Persistence & Contract | Not started | DOM-03, DOM-04 | 4 criteria |
| 5. API Layer | Not started | API-01, API-02, API-03, API-04, API-05, CTR-02 | 6 criteria |
| 6. Budget Tab Integration | Not started | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 criteria |
| 7. Event Integration | Not started | EVT-01, EVT-02, EVT-03, EVT-04 | 4 criteria |
| 8. Contract Form & Dev Data | Not started | CTR-01, DEV-01 | 4 criteria |

**Overall Progress:** 12.5% (Phase 1 complete, 7 phases remaining)
| Phase 02 P01 | 7 | 2 tasks | 3 files |
| Phase 02-event-budget-flow-redesign P02 | 3 | 1 tasks | 2 files |

## Session Continuity

### Last Session Summary
- Executed Phase 2 Plan 02: Progressive Disclosure for Budget Management
- Implemented three-level progressive disclosure (summary banner -> sections -> per-participant details)
- Budget section defaults to collapsed with summary banner showing allocation totals
- Added unsaved changes visual indicator (8px dot on banner)
- Guidance note appears when no defaultTimeAllocationType set
- Created 02-02-SUMMARY.md documenting implementation (1 task, 1 commit, 3 minutes)
- EVT-06 satisfied: budget management now starts simple and expands on demand
- Phase 2 complete: both EVT-05 and EVT-06 requirements satisfied

### Next Session
Start with: `/gsd:plan-phase 03`

Phase 2 (Event Budget Flow Redesign) is complete. Next phase: Domain Layer implementation.

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
