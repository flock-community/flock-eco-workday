# Budget Allocations for Flock Workday

## What This Is

A budget tracking feature for Flock Workday that lets admins record how hack hours, study hours, and study money budgets are consumed through explicit allocation records. Employees see their budget usage in a read-only Budget Allocation tab; admins manage allocations from the Events feature and can create standalone study money allocations.

## Core Value

Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

## Requirements

### Validated

- ✓ Frontend prototype with mocked data (Budget Allocation tab, summary cards, allocation lists) — Phase 1
- ✓ Event-centric budget management UI prototype (time/money allocation sections per participant) — Phase 1.3
- ✓ Mock types split from mock data for clean wirespec migration — Phase 1.4
- ✓ Production-quality UI design polish — Phase 1.5

### Active

- [ ] Domain models: BudgetAllocation sealed interface with HackTime, StudyTime, StudyMoney concrete types
- [ ] Domain services and persistence ports following the Expense pattern
- [ ] Liquibase migrations for budget_allocation tables (JOINED inheritance) and ContractInternal new fields
- [ ] JPA entities, repositories, and persistence adapters
- [ ] Wirespec API contract for budget allocation CRUD endpoints
- [ ] REST controller implementing wirespec handlers with authority-based access control
- [ ] ContractInternal entity extended with studyHours and studyMoney fields
- [ ] Frontend integration: replace mock data with real API calls
- [ ] Event budget management wired to real API
- [ ] Contract form updated with studyHours and studyMoney inputs
- [ ] Development mock data loader for budget allocations

### Out of Scope

- Approval workflow for allocations — allocations are recorded as fact by admins, no approval needed
- FlockMoney tracking — company-level event cost tracking is separate from personal budget tracking
- Real-time notifications — budget consumption doesn't need push notifications
- Mobile-specific UI — web-first, existing Material-UI responsive patterns are sufficient

## Context

**Existing codebase:** Flock Workday is a mature workforce management app (Kotlin/Spring Boot backend, React/MUI frontend). The Expense domain provides the exact architectural pattern to follow: sealed interface + persistence port in domain layer, JPA entities with JOINED inheritance + repositories + adapter in application layer, wirespec-generated API types.

**Current branch:** `feat/hack-and-study-budget-allocations` with 15 commits completing all frontend prototype work (Phases 1 through 1.5). No backend code exists yet.

**Budget types:** Three budgets defined on ContractInternal — hackHours (existing field), studyHours (new), studyMoney (new). Budget = contract values minus sum of allocations for person/year.

**Allocation types:** HackTimeBudgetAllocation and StudyTimeBudgetAllocation have per-day breakdowns with type override (DailyTimeAllocation embeddable). StudyMoneyBudgetAllocation has amount + files. All allocations are optionally linked to an event.

**Design decisions already made:**
- No approval workflow (allocations are admin-recorded facts)
- BigDecimal for money on backend, number on frontend/API
- Per-day type override on DailyTimeAllocation for maximum flexibility
- Single persistence adapter injecting multiple JPA repositories
- Wirespec unified response type with optional detail fields, separate input types per allocation

## Constraints

- **Tech Stack**: Must follow existing patterns — Kotlin, Spring Boot, JPA/Hibernate, Liquibase, Wirespec, React, TypeScript, Material-UI, Formik
- **Architecture**: Must follow Expense domain pattern (sealed interface + persistence port in domain, JPA + adapter in application)
- **Module Boundaries**: All new code in `workday-application` and `domain` modules only. workday-core and workday-user are frozen.
- **API Pattern**: Wirespec contracts define the API; both Kotlin and TypeScript types are generated from `.ws` files
- **Database**: Liquibase migrations; JOINED inheritance strategy for allocation entity hierarchy

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Follow Expense domain pattern exactly | Proven pattern in this codebase, reduces risk | — Pending |
| JOINED inheritance for JPA entities | Matches Expense pattern, clean polymorphic queries | — Pending |
| No approval workflow | Allocations are admin facts, not employee requests | — Pending |
| Per-day type override on DailyTimeAllocation | Single event can mix hack/study days | — Pending |
| Unified wirespec response + separate inputs | Clean API: one response shape, type-specific creation | — Pending |

---
*Last updated: 2026-03-02 after initialization*
