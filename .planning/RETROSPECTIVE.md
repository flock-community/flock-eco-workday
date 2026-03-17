# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Budget Allocations

**Shipped:** 2026-03-17
**Phases:** 9 | **Plans:** 16 | **Commits:** 92

### What Was Built
- Full-stack budget allocation tracking (hack hours, study hours, study money)
- Person-centric Budget Allocation tab with summary cards, allocation list, and StudyMoney CRUD
- Event-centric budget management with smart defaults and diff-based save
- Domain layer following Expense sealed hierarchy pattern with persistence ports
- JOINED inheritance JPA persistence with Liquibase migrations
- REST API with Wirespec contracts and authority-based access control
- Contract form extensions (studyHours, studyMoney fields)
- Dev data loader seeding 12 allocations across 3 persons

### What Worked
- Following the Expense domain pattern reduced architectural decision overhead significantly
- Frontend prototype first (Phase 1-2) gave clear API requirements for backend phases
- Parallel execution of Phases 6 and 7 (both depended on Phase 5, no interdependency)
- Milestone audit caught 14 unsatisfied requirements and documentation gaps before shipping
- Phase 9 (verification gap closure) resolved all audit findings cleanly

### What Was Inefficient
- Phase 9 was created retroactively to close verification gaps — earlier verification per-phase would have avoided this
- ROADMAP.md Phase 8 and 9 plan checkboxes not updated after execution (cosmetic but shows state drift)
- Some SUMMARY.md files missing one_liner frontmatter field, reducing automated extraction capability
- Nyquist validation only fully compliant for 1 of 8 phases — validation discipline inconsistent

### Patterns Established
- Wirespec-first API design: define .ws contracts before implementing controller
- Runtime auth checks (requireWrite/requireRead) for wirespec handler methods (not @PreAuthorize)
- LAZY fetch + JOIN FETCH for element collections to prevent N+1 queries
- Direct fetch client pattern for type-specific API paths (vs NonInternalizingClient for generic CRUD)
- Diff-based save pattern for event allocations (compare loaded vs current, emit create/update/delete)

### Key Lessons
1. Run milestone audit early — the gap closure phase was straightforward but could have been avoided with per-phase verification discipline
2. Wirespec reserved words (like `type`) need backtick escaping — discovered during Phase 5
3. @PreAuthorize doesn't work on wirespec-dispatched suspend methods — use runtime checks instead
4. Frontend prototype phases provide excellent API specification through usage patterns
5. BigDecimal for all monetary values on backend, number on frontend/API boundary — clean separation

### Cost Observations
- Model mix: primarily opus for planning/execution, balanced profile
- Timeline: 16 days (2026-03-02 → 2026-03-17)
- Notable: Phase 5 Plan 02 (controller + integration tests) took longest at 64 min — complex wirespec handler mapping

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 92 | 9 | First milestone — established GSD workflow patterns |

### Cumulative Quality

| Milestone | Requirements | Verified | Audit Score |
|-----------|-------------|----------|-------------|
| v1.0 | 23 | 23/23 | passed (all categories) |

### Top Lessons (Verified Across Milestones)

1. Prototype-first development surfaces API requirements naturally
2. Milestone audits are essential quality gates — catch gaps before shipping
