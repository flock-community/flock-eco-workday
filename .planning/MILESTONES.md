# Milestones

## v1.0 Budget Allocations (Shipped: 2026-03-17)

**Phases completed:** 8 phases, 16 plans, 8 tasks

**Key accomplishments:**
- Redesigned event budget flow with progressive disclosure and single source of truth
- Built domain layer with sealed BudgetAllocation hierarchy (HackTime, StudyTime, StudyMoney) and persistence ports
- Implemented JOINED inheritance JPA persistence with Liquibase migrations and ContractInternal extensions
- Created REST API with Wirespec contracts and authority-based access control
- Connected Budget Allocation tab to real API with summary cards and full CRUD
- Wired event dialog budget management to real API with smart defaults and diff-based save

**Stats:** 92 commits, 16 days (2026-03-02 → 2026-03-17), 23/23 requirements satisfied

---

