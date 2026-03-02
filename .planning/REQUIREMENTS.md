# Requirements: Budget Allocations for Flock Workday

**Defined:** 2026-03-02
**Core Value:** Admins can track and manage budget consumption (hack hours, study hours, study money) per person per year, with clear visibility into what's been used and what remains.

## v1 Requirements

### Domain & Persistence

- [ ] **DOM-01**: System stores BudgetAllocation as sealed hierarchy (HackTime, StudyTime, StudyMoney) with JOINED inheritance
- [ ] **DOM-02**: DailyTimeAllocation tracks per-day hours with type override (STUDY/HACK)
- [ ] **DOM-03**: Liquibase migrations create budget_allocation table hierarchy and element collection tables
- [ ] **DOM-04**: ContractInternal entity extended with studyHours and studyMoney fields

### API

- [ ] **API-01**: Admin can query allocations by person+year via GET endpoint
- [ ] **API-02**: Admin can query allocations by event code via GET endpoint
- [ ] **API-03**: Admin can create/update/delete StudyMoney allocations via REST API
- [ ] **API-04**: Admin can create/update HackTime and StudyTime allocations via REST API
- [ ] **API-05**: Authority-based access control (READ for viewing, ADMIN for mutations)

### Budget Tab (Person-Centric)

- [ ] **TAB-01**: User sees summary cards showing budget/used/available for hack hours, study hours, study money
- [ ] **TAB-02**: User sees allocation list grouped by type with event links
- [ ] **TAB-03**: Admin can create/edit/delete standalone StudyMoney allocations from the tab
- [ ] **TAB-04**: Year selector filters displayed allocations
- [ ] **TAB-05**: Admin can switch between persons

### Event Budget Management

- [ ] **EVT-01**: Event dialog shows budget management section for allocations
- [ ] **EVT-02**: Admin can assign per-participant time allocations with per-day breakdown
- [ ] **EVT-03**: Admin can assign per-participant money allocations
- [ ] **EVT-04**: Smart defaults based on event type (FLOCK_HACK_DAY -> HackTime, CONFERENCE -> StudyTime)
- [ ] **EVT-05**: Event form budget/type changes live-update the budget management sections (single source of truth)
- [ ] **EVT-06**: Budget management section uses progressive disclosure (start simple, expand on demand)

### Contract Form

- [ ] **CTR-01**: Contract form shows studyHours and studyMoney fields for internal contracts
- [ ] **CTR-02**: Wirespec contract updated with new ContractInternal fields

### Development

- [ ] **DEV-01**: Mock data loader seeds budget allocations for development profile

## v2 Requirements

### Dashboard

- **DASH-01**: Horizontal stacked bar charts for hack hours, study hours, study money
- **DASH-02**: Budget vs used vs available per person visualization

### Enhancements

- **ENH-01**: Quick actions in event budget management (distribute equally, clear)
- **ENH-02**: CSV/Excel export of budget allocation data
- **ENH-03**: Budget utilization warnings (approaching limit)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Approval workflow | Allocations are admin-recorded facts, not employee requests |
| FlockMoney tracking | Company-level event costs are separate from personal budgets |
| Budget carry-over | Complex policy logic; defer to v2+ |
| Forecasting/projections | Requires historical data; defer until MVP validated |
| Real-time notifications | Budget consumption doesn't need push notifications |
| Mobile-specific UI | Web-first; existing MUI responsive patterns sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOM-01 | Phase 3 | Pending |
| DOM-02 | Phase 3 | Pending |
| DOM-03 | Phase 4 | Pending |
| DOM-04 | Phase 4 | Pending |
| API-01 | Phase 5 | Pending |
| API-02 | Phase 5 | Pending |
| API-03 | Phase 5 | Pending |
| API-04 | Phase 5 | Pending |
| API-05 | Phase 5 | Pending |
| TAB-01 | Phase 6 | Pending |
| TAB-02 | Phase 6 | Pending |
| TAB-03 | Phase 6 | Pending |
| TAB-04 | Phase 6 | Pending |
| TAB-05 | Phase 6 | Pending |
| EVT-01 | Phase 7 | Pending |
| EVT-02 | Phase 7 | Pending |
| EVT-03 | Phase 7 | Pending |
| EVT-04 | Phase 7 | Pending |
| EVT-05 | Phase 2 | Pending |
| EVT-06 | Phase 2 | Pending |
| CTR-01 | Phase 8 | Pending |
| CTR-02 | Phase 5 | Pending |
| DEV-01 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after revision (added EVT-05, EVT-06, renumbered phases)*
