# Budget Allocations for Flock Workday

## What This Is

A budget tracking feature for Flock Workday that lets admins record how hack hours, study hours, and study money budgets are consumed through explicit allocation records. Employees see their budget usage in a read-only Budget Allocation tab; admins manage allocations from both the Events dialog and a dedicated Budget Allocation tab, including standalone study money allocations with file attachments.

## Core Value

Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

## Requirements

### Validated

- ✓ Frontend prototype with mocked data (Budget Allocation tab, summary cards, allocation lists) — Phase 1
- ✓ Event-centric budget management UI prototype (time/money allocation sections per participant) — Phase 1.3
- ✓ Mock types split from mock data for clean wirespec migration — Phase 1.4
- ✓ Production-quality UI design polish — Phase 1.5
- ✓ Domain models: BudgetAllocation sealed hierarchy with HackTime, StudyTime, StudyMoney — v1.0
- ✓ Domain services and persistence ports following the Expense pattern — v1.0
- ✓ Liquibase migrations for budget_allocation tables (JOINED inheritance) and ContractInternal new fields — v1.0
- ✓ JPA entities, repositories, and persistence adapters — v1.0
- ✓ Wirespec API contract for budget allocation CRUD endpoints — v1.0
- ✓ REST controller implementing wirespec handlers with authority-based access control — v1.0
- ✓ ContractInternal entity extended with studyHours and studyMoney fields — v1.0
- ✓ Frontend integration: replace mock data with real API calls — v1.0
- ✓ Event budget management wired to real API with smart defaults — v1.0
- ✓ Contract form updated with studyHours and studyMoney inputs — v1.0
- ✓ Development mock data loader for budget allocations — v1.0

### Active

(None — define next milestone requirements with `/gsd:new-milestone`)

### Out of Scope

- Approval workflow for allocations — allocations are recorded as fact by admins, no approval needed
- FlockMoney tracking — company-level event cost tracking is separate from personal budget tracking
- Real-time notifications — budget consumption doesn't need push notifications
- Mobile-specific UI — web-first, existing Material-UI responsive patterns are sufficient
- Budget carry-over between years — complex policy logic; defer to v2+

## Context

**Shipped v1.0** on 2026-03-17 with 92 commits over 16 days. Full-stack budget allocation feature across 9 phases.

**Codebase:** Flock Workday — Kotlin/Spring Boot backend, React/MUI frontend. Budget allocations follow the Expense domain pattern exactly: sealed interface + persistence port in domain layer, JPA entities with JOINED inheritance + repositories + adapter in application layer, wirespec-generated API types.

**Branch:** `feat/hack-and-study-budget-allocations`

**Budget types:** Three budgets defined on ContractInternal — hackHours (existing), studyHours (new), studyMoney (new). Budget = contract values minus sum of allocations for person/year.

**Allocation types:** HackTimeBudgetAllocation and StudyTimeBudgetAllocation have per-day breakdowns with type override (DailyTimeAllocation embeddable). StudyMoneyBudgetAllocation has amount + files. All allocations are optionally linked to an event.

**Architecture delivered:**
- Domain: sealed BudgetAllocation hierarchy, persistence ports, domain services
- Persistence: JOINED inheritance JPA, Liquibase migrations, lazy fetch + JOIN FETCH
- API: Wirespec contracts, unified response with discriminator, authority-based access control
- Frontend: Budget Allocation tab (summary cards, allocation list, CRUD), Event dialog integration (smart defaults, diff-based save), Contract form fields

## Constraints

- **Tech Stack**: Must follow existing patterns — Kotlin, Spring Boot, JPA/Hibernate, Liquibase, Wirespec, React, TypeScript, Material-UI, Formik
- **Architecture**: Must follow Expense domain pattern (sealed interface + persistence port in domain, JPA + adapter in application)
- **Module Boundaries**: All new code in `workday-application` and `domain` modules only. workday-core and workday-user are frozen.
- **API Pattern**: Wirespec contracts define the API; both Kotlin and TypeScript types are generated from `.ws` files
- **Database**: Liquibase migrations; JOINED inheritance strategy for allocation entity hierarchy

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Follow Expense domain pattern exactly | Proven pattern in this codebase, reduces risk | ✓ Good — pattern worked cleanly across all layers |
| JOINED inheritance for JPA entities | Matches Expense pattern, clean polymorphic queries | ✓ Good — required LAZY fetch + JOIN FETCH for N+1 prevention |
| No approval workflow | Allocations are admin facts, not employee requests | ✓ Good — simplified scope significantly |
| Per-day type override on DailyTimeAllocation | Single event can mix hack/study days | ✓ Good — enables flexible event types |
| Unified wirespec response + separate inputs | Clean API: one response shape, type-specific creation | ✓ Good — type-safe boundaries with clean frontend integration |
| Runtime auth checks instead of @PreAuthorize | @PreAuthorize not intercepted on wirespec suspend methods | ✓ Good — discovered wirespec limitation, runtime checks work reliably |
| Direct fetch client for BudgetAllocationClient | Type-specific API paths, not generic CRUD | ✓ Good — cleaner API surface than NonInternalizingClient |
| Diff-based save for event allocations | Only send create/update/delete for changed allocations | ✓ Good — efficient and correct |

---
*Last updated: 2026-03-17 after v1.0 milestone*
