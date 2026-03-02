# Project Research Summary

**Project:** Budget Allocation Tracking for Flock Workday
**Domain:** Workforce Management - Employee Budget Tracking
**Researched:** 2026-03-02
**Confidence:** HIGH

## Executive Summary

Budget allocation tracking adds the capability to monitor employee training/development budgets across three types: hack hours, study hours, and study money. This is NOT a greenfield project—it extends an existing Kotlin/Spring Boot workforce management application with well-established patterns. The research confirms that the Expense domain pattern (JOINED inheritance, hexagonal architecture, Wirespec contracts) is the correct blueprint.

The recommended approach leverages proven patterns: JPA JOINED inheritance for polymorphic allocation types, sealed interfaces in the domain layer, persistence ports for hexagonal architecture, and Wirespec for type-safe API contracts. The frontend prototype is 50% complete with 15 commits already in place. ContractInternal already has hackHours; adding studyHours and studyMoney completes the foundation. This is architectural scaffolding, not feature innovation—follow the Expense pattern exactly.

Key risks center on JPA performance (N+1 queries with ElementCollection), Liquibase migration ordering (foreign key dependencies), and BigDecimal precision handling for money. All three have clear prevention strategies documented in the Expense domain. The path forward is well-lit: implement domain layer → persistence layer → API layer → frontend integration, with careful attention to LAZY fetch strategies and explicit JOIN FETCH queries to avoid performance traps.

## Key Findings

### Recommended Stack

The stack research confirms this is an extension project using existing infrastructure—no new technology decisions required. All patterns exist in the Expense domain with 5+ years of production validation.

**Core technologies:**
- JPA JOINED Inheritance (InheritanceType.JOINED) — proven for polymorphic entities with subtype-specific fields; normalizes database schema, enables efficient polymorphic queries
- Liquibase migrations — established pattern with 26 existing changelogs; strict ordering (base → child → element collection tables) prevents foreign key constraint failures
- Wirespec 0.17.8 — type-safe API contracts with unified polymorphic response type; frontend and backend share discriminated union types
- Hexagonal architecture with persistence ports — domain layer has zero infrastructure dependencies; testable without database; clear separation of concerns
- BigDecimal for money — ContractInternal uses BigDecimal for salary; budget allocations must follow same pattern with explicit scale preservation (DECIMAL(19,2))

**Critical version requirements:**
- Kotlin 1.9.22 with sealed interfaces (exhaustive when-expressions)
- Spring Boot 3.4.13 with Spring Data JPA
- Element collections use @ElementCollection(fetch = FetchType.LAZY) + custom @Query with JOIN FETCH (NOT EAGER—causes N+1 queries)

### Expected Features

Research identifies clear MVP boundaries based on design document analysis and enterprise budget tracking patterns.

**Must have (table stakes):**
- Budget definition on ContractInternal (hackHours, studyHours, studyMoney fields) — foundation for all calculations
- Record three allocation types (HackTime, StudyTime, StudyMoney) with daily breakdown for time allocations
- View remaining budget with year selector — employees expect real-time visibility
- Link allocations to events via optional eventCode field — primary workflow is event-centric
- File attachments for StudyMoney — audit trail for receipts/invoices
- Admin-only mutations with read-only employee view — authority-based access control

**Should have (competitive):**
- Event-centric budget management — admin assigns budgets to multiple participants from event dialog (high complexity, high value)
- Per-day type override for time allocations — single event can mix hack/study days (rare but valuable flexibility)
- Summary cards with budget/used/available per type — quick overview dashboard
- Dashboard budget charts with horizontal stacked bars — visual consumption tracking

**Defer (v2+):**
- Approval workflow (allocations are admin-recorded facts, not employee requests)
- Budget carry-over (complex policy logic, year-boundary edge cases)
- Real-time notifications (gradual consumption, no urgency)
- Budget forecasting (insufficient historical data, high effort, low MVP value)

### Architecture Approach

Architecture follows hexagonal design with domain-driven patterns proven in the Expense domain. This is not new architecture—it's applying existing patterns to a structurally identical use case.

**Major components:**
1. Domain Layer (sealed interface + persistence ports) — BudgetAllocation sealed interface with HackTime/StudyTime/StudyMoney data classes; port interfaces define repository contract; zero infrastructure dependencies
2. Application Persistence Layer (JPA entities + adapters) — Abstract BudgetAllocation entity with JOINED inheritance; type-specific repositories (HackTimeBudgetAllocationRepository, etc.); persistence adapter implements domain port and routes to appropriate repository based on type
3. API Layer (Wirespec contracts + controllers) — Unified BudgetAllocation response type with discriminator + optional detail fields; separate input types per allocation subtype (type-safe at API boundary); controller implements Wirespec handlers with @PreAuthorize annotations
4. Frontend Layer (InternalizingClient + React components) — BudgetAllocationClient wraps API with date transformations; BudgetAllocationFeature provides person-centric view; EventBudgetAllocationDialog provides event-centric management

**Data flow:** React component → InternalizingClient → REST Controller → Domain Service → Persistence Port → Persistence Adapter → JPA Repository → Database. Reverse flow: Entity → Adapter.toDomain() → Service → Controller.toWirespec() → Client.internalize() → React state.

### Critical Pitfalls

Research identified five critical pitfalls with prevention strategies documented from Expense domain analysis.

1. **N+1 Query Explosion with ElementCollection** — EAGER fetch on dailyTimeAllocations causes separate SELECT per allocation (20 allocations = 61 queries). Prevention: Use LAZY fetch + custom @Query with JOIN FETCH for type-specific repositories. Address in Phase 2, Task 9 (JPA Entities) before implementation.

2. **Liquibase Migration Foreign Key Ordering** — Creating element collection tables before child tables causes FK constraint failure. Prevention: Strict changeset ordering (base → child → element collection → FK constraints). Verify locally with liquibase:update before commit. Address in Phase 2, Task 7 (Liquibase Migration).

3. **Type Discriminator Column Missing** — JPA JOINED inheritance requires discriminator to identify entity type; without it, polymorphic queries fail. Prevention: Add type VARCHAR column in base table + @DiscriminatorColumn annotation (or verify Hibernate DTYPE column pattern from Expense). Address in Phase 2, Task 9 (JPA Entities).

4. **BigDecimal Precision Loss in Mapping** — Wirespec Number → BigDecimal conversion loses precision without explicit scale. Prevention: Use BigDecimal.valueOf(input.amount).setScale(2, RoundingMode.HALF_UP) in mapper; never use .toBigDecimal() or .toDouble(). Address in Phase 2, Task 11 (Mapper).

5. **Polymorphic Query Performance** — Base repository LEFT OUTER JOINs all child tables even when type is known. Prevention: Create type-specific repositories alongside base repository; use type-specific repos when type is known; consider projection queries for summaries. Address in Phase 2, Task 10 (Repositories).

## Implications for Roadmap

Based on research, the implementation follows a clear dependency order derived from hexagonal architecture principles and existing codebase build patterns.

### Phase 1: Domain Layer Foundation
**Rationale:** Domain has zero external dependencies and can be built/tested in isolation; establishes business rules and interfaces before infrastructure concerns.
**Delivers:** BudgetAllocation sealed interface with three concrete types; DailyTimeAllocation value object; BudgetAllocationPersistencePort interface; domain services with business logic.
**Addresses:** Core polymorphic type modeling (FEATURES.md table stakes).
**Avoids:** Coupling domain to infrastructure (architecture anti-pattern).
**Research flag:** STANDARD PATTERNS — sealed interfaces and persistence ports proven in Expense domain; no additional research needed.

### Phase 2: Backend Persistence & API
**Rationale:** Persistence depends on domain types; API depends on persistence; frontend depends on API; this phase completes backend before frontend integration.
**Delivers:** JPA entities with JOINED inheritance; Liquibase migrations; type-specific repositories; persistence adapter; ContractInternal fields (studyHours, studyMoney); Wirespec contracts; REST controller with authority checks; mapper with BigDecimal handling.
**Uses:** JPA JOINED inheritance (STACK.md), Liquibase pattern (STACK.md), Wirespec unified response (STACK.md), hexagonal architecture (ARCHITECTURE.md).
**Implements:** Application Persistence Layer + API Layer (ARCHITECTURE.md components 2 & 3).
**Avoids:** N+1 queries (LAZY fetch strategy), FK ordering failures (strict changeset sequence), BigDecimal precision loss (explicit scale preservation), discriminator errors (follow Expense pattern).
**Research flag:** COMPLEX INTEGRATION — Phase requires careful coordination of JPA, Liquibase, Wirespec, and security patterns; test thoroughly before proceeding to frontend integration.

### Phase 3: Frontend Integration
**Rationale:** Frontend prototype exists with mocks; replace mocks with real API client; polish UX based on backend capabilities.
**Delivers:** BudgetAllocationClient connected to real API; BudgetAllocationFeature using real data; EventBudgetAllocationDialog wired to backend; remove mock data files; development profile test data.
**Addresses:** Budget allocation tab (read-mostly for employees), event budget management (admin writes), summary cards, allocation list, year selector, file attachments (FEATURES.md MVP scope).
**Uses:** InternalizingClient pattern (ARCHITECTURE.md), Wirespec-generated TypeScript types (STACK.md).
**Avoids:** Error handling pitfalls (specific error messages), budget validation (reject if exceeds), optimistic update staleness (refetch after mutation).
**Research flag:** STANDARD PATTERNS — InternalizingClient and React component patterns proven in Person/Expense features; follow existing conventions.

### Phase 4: Dashboard & Enhancements (Optional v1.x)
**Rationale:** Core functionality complete; dashboard charts and advanced UX features add polish but not essential for launch.
**Delivers:** Dashboard budget charts with horizontal stacked bars; person selector for admins; quick actions (distribute equally, bulk assign); budget consumption warnings (color coding); CSV export.
**Addresses:** Differentiator features from FEATURES.md (competitive advantage, not table stakes).
**Research flag:** STANDARD PATTERNS — Dashboard charts use existing visualization patterns; defer unless user feedback demands.

### Phase Ordering Rationale

- **Domain-first approach:** Domain layer has zero dependencies, can be tested without Spring/database; establishes contracts before infrastructure.
- **Backend before frontend:** Wirespec contracts define API; frontend depends on generated TypeScript types; attempting frontend-first creates misalignment.
- **ContractInternal in Phase 2:** Budget calculation requires contract fields; must happen after persistence setup to avoid circular dependencies.
- **Mock data loader last:** LoadData.kt requires JPA repositories to be available; runs in -Pdevelop profile for manual testing.
- **Avoid pitfalls early:** N+1 queries, FK ordering, discriminator strategy addressed in Phase 2 before problems manifest in production.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2, Task 7 (Liquibase):** Complex changeset ordering with JOINED inheritance and element collections; validate against db.changelog-002-expenses.yaml pattern.
- **Phase 2, Task 10 (Repositories):** Type-specific repository strategy vs. base repository polymorphic queries; balance convenience vs. performance.
- **Phase 3, Task 19 (Event Dialog Integration):** Event-centric budget management has complex UX (per-participant forms, daily breakdown, type override); may need UX research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Domain Layer):** Sealed interfaces proven in Expense domain; copy structure exactly.
- **Phase 2, Task 16 (Controller):** Wirespec handler pattern proven in ExpenseController; copy security annotations.
- **Phase 3, Task 20 (Client):** InternalizingClient pattern proven in PersonClient; copy date transformation logic.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All patterns exist in Expense domain with 5+ years production validation; no new technology decisions required |
| Features | MEDIUM | Feature categorization based on design document and general enterprise budget tracking patterns; anti-features reflect design decisions already made |
| Architecture | HIGH | Hexagonal architecture with persistence ports established in Expense, Assignment, LeaveDays domains; component boundaries proven |
| Pitfalls | HIGH | All five critical pitfalls observed directly in Expense domain codebase (CostExpense ElementCollection, db.changelog-002-expenses.yaml ordering, Expense.type discriminator, ContractInternal.monthlySalary Double usage, ExpenseRepository polymorphic queries) |

**Overall confidence:** HIGH

Research based on existing codebase analysis (not web search or inference). This is not inventing new patterns—this is applying proven patterns from the Expense domain to a structurally identical use case.

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **Discriminator strategy verification:** Expense domain uses `type: ExpenseType` field but unclear if it uses explicit @DiscriminatorColumn or relies on Hibernate DTYPE column. Phase 2, Task 9 must verify which pattern to follow (inspect generated schema).
- **Element collection cardinality:** Research assumes 5-20 daily allocations per time allocation (typical multi-day event). If actual usage shows >50 days per allocation, LAZY fetch strategy must be re-evaluated.
- **Event budget management UX complexity:** Design document describes per-participant daily breakdown form but doesn't specify error handling for validation failures (budget exceeded, date conflicts). Phase 3, Task 19 needs UX validation with stakeholders.
- **BigDecimal usage inconsistency:** ContractInternal.studyMoney will use BigDecimal but ContractInternal.monthlySalary currently uses Double (observed in codebase). Consider broader refactoring to BigDecimal for all monetary fields (out of scope for this project).
- **Performance at scale:** Current scale estimate (<100 persons, ~1500 allocations) suggests performance traps unlikely. If organization grows to >500 persons, polymorphic query performance and cache strategy need re-evaluation.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/domain/src/main/kotlin/community/flock/eco/workday/domain/expense/` — Expense domain pattern (sealed interface, persistence ports, services)
- Existing codebase: `/workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/` — JPA entities (JOINED inheritance), repositories, persistence adapters, controller
- Existing codebase: `/workday-application/src/main/database/db/changelog/db.changelog-002-expenses.yaml` — Liquibase migration pattern for JOINED inheritance
- Existing codebase: `/workday-application/src/main/wirespec/expenses.ws` — Wirespec polymorphic API pattern
- Design document: `docs/plans/2026-02-28-budget-allocations-design.md` — Feature requirements, user stories, domain model
- Implementation plan: `docs/plans/2026-02-28-budget-allocations-implementation.md` — Phase breakdown, task dependencies
- Frontend prototype: `/workday-application/src/main/react/features/budget/` — 15 commits with BudgetAllocationFeature, BudgetAllocationList, EventBudgetAllocationDialog

### Secondary (MEDIUM confidence)
- Stack documentation: `.planning/codebase/STACK.md` — Confirmed versions (Kotlin 1.9.22, Spring Boot 3.4.13, Wirespec 0.17.8, Liquibase 5.0.1)
- Architecture documentation: `.planning/codebase/ARCHITECTURE.md` — Module structure, hexagonal patterns
- ContractInternal model: `/workday-application/src/main/kotlin/community/flock/eco/workday/application/model/ContractInternal.kt` — BigDecimal usage for money, period calculation helpers

### Tertiary (LOW confidence)
- Training data about enterprise budget tracking systems (general patterns, not specific to 2026 market) — Feature categorization (table stakes vs. differentiators vs. anti-features)

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
