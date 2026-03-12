# Roadmap: Budget Allocations for Flock Workday

**Project:** Budget Allocation Tracking
**Created:** 2026-03-02
**Status:** Active
**Current Phase:** Phase 6

## Project Overview

Adding budget tracking capability to Flock Workday for hack hours, study hours, and study money. Phase 1 (frontend prototype with mocked data) is complete. Phase 2 completes the frontend prototype work by redesigning the event budget flow. Phases 3-8 cover backend implementation and frontend integration.

## Phases

- [x] **Phase 1: Frontend Prototype** - Frontend UI with mocked data (COMPLETE)
- [x] **Phase 2: Event Budget Flow Redesign** - Redesign end-to-end event budget allocation flow (frontend-only)
- [x] **Phase 3: Domain Layer** - Business entities and persistence contracts
- [x] **Phase 4: Persistence & Contract** - Database schema and contract extensions
- [x] **Phase 5: API Layer** - REST endpoints with type-safe contracts
- [ ] **Phase 6: Budget Tab Integration** - Connect person-centric UI to real API
- [ ] **Phase 7: Event Integration** - Connect event-centric budget management to real API
- [ ] **Phase 8: Contract Form & Dev Data** - Contract form updates and mock data loader

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Frontend Prototype | N/A | Complete | 2026-03-02 |
| 2. Event Budget Flow Redesign | 3/3 | Complete | 2026-03-02 |
| 3. Domain Layer | 2/2 | Complete | 2026-03-03 |
| 4. Persistence & Contract | 3/3 | Complete | 2026-03-05 |
| 5. API Layer | 2/2 | Complete | 2026-03-06 |
| 6. Budget Tab Integration | 1/3 | In progress | - |
| 7. Event Integration | 0/? | Not started | - |
| 8. Contract Form & Dev Data | 0/? | Not started | - |

## Phase Details

### Phase 1: Frontend Prototype
**Goal**: Users can see and interact with budget allocation UI using mocked data
**Depends on**: Nothing (first phase)
**Requirements**: (Complete - not tracked in v1 requirements)
**Success Criteria** (what must be TRUE):
  1. User can view budget allocation tab with summary cards showing budget/used/available
  2. User can see allocation lists grouped by type (hack time, study time, study money)
  3. Admin can open event dialog with budget management section showing per-participant allocation forms
  4. User can interact with year selector to filter allocations
  5. UI matches production quality standards with polished Material-UI components
**Plans**: N/A (already complete)
**Status**: Complete (15 commits on feat/hack-and-study-budget-allocations branch)

### Phase 2: Event Budget Flow Redesign
**Goal**: Event form and budget management sections work as a cohesive, intuitive single flow
**Depends on**: Phase 1 (prototype UI exists)
**Requirements**: EVT-05, EVT-06
**Success Criteria** (what must be TRUE):
  1. Admin changes event form costs/defaultTimeAllocationType and budget sections immediately reflect those changes (single source of truth)
  2. Budget management section starts in simple mode (basic form) and expands progressively on demand
  3. EventForm fields (costs, defaultTimeAllocationType) are the canonical source for budget defaults, not duplicated logic
  4. Admin experiences a natural flow: define event basics -> manage participant budgets, without feeling like two disconnected UIs
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md -- Lift Formik state to EventDialog, wire budget section to form values, single save, dirty tracking, unsaved changes warning (EVT-05)
- [x] 02-02-PLAN.md -- Progressive disclosure with collapsed summary banner, expand-on-click, per-participant row expansion, guidance notes (EVT-06)
- [x] 02-03-PLAN.md -- Gap closure: fix participant removal sync, conditional section rendering, remove STUDY fallback (EVT-05, EVT-06)
**Status**: Complete
**Files**: EventDialog.tsx, EventForm.tsx, EventBudgetManagementDialog.tsx, EventBudgetSummaryBanner.tsx

### Phase 3: Domain Layer
**Goal**: Core business logic exists with zero infrastructure dependencies
**Depends on**: Nothing (can be built in isolation)
**Requirements**: DOM-01, DOM-02
**Success Criteria** (what must be TRUE):
  1. Developer can instantiate BudgetAllocation sealed types (HackTime, StudyTime, StudyMoney) with type-safe constructors
  2. Developer can call DailyTimeAllocation with per-day type override (STUDY/HACK) for mixed-type events
  3. Developer can invoke domain services through persistence port interfaces without database dependency
  4. Developer can run domain layer tests without Spring context or database
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md -- Domain entities (sealed hierarchy, value objects, persistence ports) (DOM-01, DOM-02)
- [x] 03-02-PLAN.md -- Domain services, events, and unit tests (DOM-01, DOM-02)

### Phase 4: Persistence & Contract
**Goal**: Application can store and retrieve budget allocations from database
**Depends on**: Phase 3 (domain types must exist)
**Requirements**: DOM-03, DOM-04
**Success Criteria** (what must be TRUE):
  1. Database schema includes budget_allocation hierarchy with JOINED inheritance (base + child + element collection tables)
  2. Developer can run Liquibase migrations locally without FK constraint failures
  3. ContractInternal entity persists studyHours and studyMoney fields with correct types (BigDecimal)
  4. JPA repositories can save and retrieve all three allocation types with lazy-loaded daily breakdowns
**Plans**: 3 plans
Plans:
- [x] 04-01-PLAN.md -- Liquibase migrations and JPA entity classes for BudgetAllocation JOINED inheritance hierarchy (DOM-03)
- [x] 04-02-PLAN.md -- Repositories, domain-entity mappers, persistence adapters, and integration tests (DOM-03)
- [x] 04-03-PLAN.md -- ContractInternal studyHours/studyMoney fields with Liquibase migration (DOM-04)

### Phase 5: API Layer
**Goal**: External clients can query and mutate budget allocations via REST API
**Depends on**: Phase 4 (persistence layer must exist)
**Requirements**: API-01, API-02, API-03, API-04, API-05, CTR-02
**Success Criteria** (what must be TRUE):
  1. Admin can GET /budget-allocations?personId=X&year=Y and receive unified allocation response with type discriminator
  2. Admin can GET /budget-allocations?eventCode=ABC and receive all event-linked allocations
  3. Admin can POST/PUT/DELETE study money allocations with file attachments
  4. Admin can POST/PUT hack time and study time allocations with daily breakdowns
  5. Non-admin user receives 403 Forbidden when attempting mutations (authority-based access control enforced)
  6. Wirespec generates TypeScript types matching Kotlin controller signatures (ContractInternal with new fields included)
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md -- Wirespec contracts (budget-allocations.ws + contracts.ws update), code generation, Authority enum, Spring Configuration (CTR-02, API-05)
- [x] 05-02-PLAN.md -- BudgetAllocationMapper, BudgetAllocationController with file endpoints, integration tests (API-01, API-02, API-03, API-04, API-05)

### Phase 6: Budget Tab Integration
**Goal**: Users see real budget data in the Budget Allocation tab
**Depends on**: Phase 5 (API must exist)
**Requirements**: TAB-01, TAB-02, TAB-03, TAB-04, TAB-05
**Success Criteria** (what must be TRUE):
  1. User opens Budget Allocation tab and sees summary cards with real budget/used/available calculated from API data
  2. User sees allocation list populated from API with event links that navigate to real event records
  3. Admin can create/edit/delete standalone StudyMoney allocations and changes persist to database
  4. User changes year selector and allocation list updates with filtered data from API
  5. Admin switches between persons using person selector and tab displays correct budget data
**Plans**: 3 plans
Plans:
- [ ] 06-01-PLAN.md -- Backend budget summary endpoint: wirespec contract, BudgetSummaryService, controller handler, integration tests (TAB-01, TAB-05)
- [ ] 06-02-PLAN.md -- Frontend client + component refactoring: BudgetAllocationClient, wirespec type migration, routing, navigation (TAB-02, TAB-04, TAB-05)
- [ ] 06-03-PLAN.md -- StudyMoney CRUD wiring, delete confirmation dialog, mock/demo cleanup (TAB-03)

### Phase 7: Event Integration
**Goal**: Admins manage budget allocations from event dialog with real persistence
**Depends on**: Phase 5 (API must exist), Phase 2 (redesigned event UI exists)
**Requirements**: EVT-01, EVT-02, EVT-03, EVT-04
**Success Criteria** (what must be TRUE):
  1. Admin opens event dialog and sees budget management section with per-participant allocation forms
  2. Admin assigns time allocations with per-day breakdown and data persists on save
  3. Admin assigns money allocations to participants and data persists on save
  4. Admin creates FLOCK_HACK_DAY event and form pre-fills with HackTime allocation type (smart defaults based on event type)
  5. Event form changes (costs, allocation type) immediately update budget management sections (Phase 2 redesign wired to real API)
**Plans**: TBD

### Phase 8: Contract Form & Dev Data
**Goal**: Contract management includes budget fields and dev environment has test data
**Depends on**: Phase 4 (ContractInternal fields must exist), Phase 5 (API must exist)
**Requirements**: CTR-01, DEV-01
**Success Criteria** (what must be TRUE):
  1. Admin edits internal contract and sees studyHours and studyMoney input fields in contract form
  2. Admin saves contract with studyHours=100 and studyMoney=2500.00 and values persist correctly
  3. Developer runs application with -Pdevelop profile and sees budget allocations pre-loaded for test persons
  4. Developer can test full budget allocation workflow without manual data entry
**Plans**: TBD

## Coverage Matrix

| Phase | Requirements | Count |
|-------|--------------|-------|
| 2 - Event Budget Flow Redesign | EVT-05, EVT-06 | 2 |
| 3 - Domain Layer | DOM-01, DOM-02 | 2 |
| 4 - Persistence & Contract | DOM-03, DOM-04 | 2 |
| 5 - API Layer | API-01, API-02, API-03, API-04, API-05, CTR-02 | 6 |
| 6 - Budget Tab Integration | TAB-01, TAB-02, TAB-03, TAB-04, TAB-05 | 5 |
| 7 - Event Integration | EVT-01, EVT-02, EVT-03, EVT-04 | 4 |
| 8 - Contract Form & Dev Data | CTR-01, DEV-01 | 2 |
| **Total** | | **23** |

All 23 v1 requirements mapped. No orphans.

## Notes

- Phase 1 complete (15 commits with frontend prototype)
- Phase 2 completes frontend prototype work by redesigning event budget flow (Phase 1.6 from implementation doc)
- Phase 2 is frontend-only, no backend dependencies
- Phase 3 starts at domain layer following hexagonal architecture (zero infrastructure dependencies)
- Phase 4 addresses N+1 query pitfall with LAZY fetch + JOIN FETCH pattern
- Phase 5 implements Wirespec unified response type with discriminator
- Phases 6 and 7 can execute in parallel (both depend on Phase 5, no interdependency)
- Phase 7 wires Phase 2's redesigned event UI to real API
- Phase 8 executes last (requires contract entity changes from Phase 4 and API from Phase 5)

---
*Last updated: 2026-03-11 (Phase 6 planned with 3 plans in 2 waves)*
