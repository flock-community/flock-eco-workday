# Feature Research: Budget Allocation Tracking

**Domain:** Employee Budget Allocation Tracking for Training/Development
**Researched:** 2026-03-02
**Confidence:** MEDIUM (Based on training data about enterprise budget tracking systems and analysis of existing codebase patterns)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users expect in any budget allocation tracking system. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Budget Definition per Person/Year** | Core requirement - users need to know their annual budget | LOW | Already partially exists via ContractInternal with hackHours field; extending with studyHours and studyMoney |
| **Record Allocations** | Users need to track consumption against budget | MEDIUM | Three allocation types: HackTime, StudyTime, StudyMoney with daily breakdowns |
| **View Remaining Budget** | Users need real-time visibility of available budget | LOW | Simple calculation: budget minus sum of allocations |
| **Budget Summary Dashboard** | Quick overview of budget status is expected in any tracking system | LOW | Summary cards showing budget/used/available per type |
| **Allocation History** | Users expect to see what was allocated and when | LOW | List view of allocations with date, amount, description |
| **Link to Events** | In workforce management, allocations are typically tied to events (conferences, hack days) | MEDIUM | Optional eventCode field allows linking allocations to specific events |
| **File Attachments** | Users need to attach receipts/invoices for money allocations | MEDIUM | Document upload for StudyMoney allocations (approval trail) |
| **Year-over-Year Tracking** | Budgets reset annually; users need year selector | LOW | Year selector with budget calculations scoped to selected year |
| **Admin vs Employee Permissions** | Standard RBAC - employees read-only, admins can create/edit | LOW | Authority-based access control (READ, WRITE, ADMIN) |
| **Date Range Support** | Allocations span multiple days (conferences, training courses) | MEDIUM | Daily breakdown with per-day type override capability |

### Differentiators (Competitive Advantage)

Features that set the product apart from basic budget tracking. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Event-Centric Budget Management** | Manage all participant allocations from event dialog instead of person-by-person | HIGH | Admin assigns budget to multiple participants at once from event creation/edit flow |
| **Per-Day Type Override** | Single event can mix hack/study days (e.g., Monday=study, Tuesday=hack) | MEDIUM | DailyTimeAllocation has explicit type field; rare but valuable flexibility |
| **Smart Budget Defaults** | System suggests allocation type based on event type (FLOCK_HACK_DAY → HackTime, CONFERENCE → StudyTime) | LOW | Frontend hint; backend always stores explicit allocations |
| **Multi-Budget Type Support** | Track time (hack hours, study hours) AND money in unified interface | MEDIUM | Most systems track only money or only time; tracking both with different units is rare |
| **Standalone Money Allocations** | StudyMoney allocations can exist without an event (books, subscriptions, self-study) | LOW | Optional eventCode field; person-centric budget tab allows direct creation |
| **Budget Consumption Visualization** | Horizontal stacked bar charts showing budget vs used vs available per person | MEDIUM | Dashboard charts with color coding for at-risk budgets |
| **Quick Actions** | Distribute equally, bulk assign, pattern-based defaults | MEDIUM | Time-savers for admins managing multiple participants |
| **Integrated Expense Tracking** | Budget allocations follow same pattern as existing expense approval workflow | MEDIUM | Leverages existing Expense domain pattern for consistency |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in this context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Approval Workflow for Allocations** | Seems logical - employee requests, admin approves | Allocations are admin-recorded facts, not employee requests; adds unnecessary complexity | Admin-only creation; allocations are truth, not proposals |
| **Real-Time Notifications** | "Notify when budget is low" | Budget consumption happens gradually; notifications create noise without urgency | Dashboard with visual indicators; admin checks periodically |
| **Budget Carry-Over** | "Unused budget rolls to next year" | Complex business logic; policy varies by company; creates year-boundary edge cases | Keep budgets year-scoped; let business decide policy outside system |
| **Budget Forecasting** | "Predict future consumption" | Insufficient historical data in MVP; complex ML; high effort, low value | Simple reporting; let users extrapolate manually |
| **FlockMoney Tracking** | "Track company-level event costs" | Conflates personal budget tracking with company expense tracking; different use case | Out of scope - personal budgets only; company expenses tracked separately |
| **Mobile-Specific UI** | "Need mobile app for budget tracking" | Budget management is admin desk work; read-only views work fine with responsive web | Existing Material-UI responsive patterns sufficient |
| **Detailed Audit Logging** | "Track every field change" | Over-engineered for this use case; standard database timestamps sufficient | EventEntityListeners provide basic audit trail via domain events |
| **Budget Templates** | "Copy last year's budgets" | Every employee's contract defines their budget; templates duplicate contract logic | ContractInternal defines budget; no need for separate templates |

## Feature Dependencies

```
ContractInternal (studyHours, studyMoney)
    └──requires──> Budget Allocation Domain Models
                       └──requires──> Budget Allocation Persistence
                                         └──requires──> Budget Allocation API

Budget Allocation Tab (read-only)
    └──requires──> Budget Allocation API
    └──enhances──> Event Budget Management (links to events)

Event Budget Management
    └──requires──> Budget Allocation API
    └──requires──> Event Management (existing)
    └──requires──> Person Management (existing)

Dashboard Budget Charts
    └──requires──> Budget Allocation API
    └──enhances──> Dashboard Feature (existing)

Study Money Standalone Allocations
    ──enhances──> Budget Allocation Tab (admin can create non-event allocations)

File Attachments
    └──requires──> Document/File Upload Infrastructure (existing in Expense domain)
```

### Dependency Notes

- **ContractInternal requires Budget Allocation Domain Models:** Budget definitions on contracts drive the budget calculations
- **Event Budget Management enhances Budget Allocation Tab:** Event allocations are read-only in budget tab; clicking links to event
- **File Attachments reuses existing infrastructure:** Document upload pattern from Expense domain applies directly
- **Dashboard Budget Charts standalone:** Charts can be added independently of other features
- **Per-day type override requires daily breakdown:** Can't override type without per-day granularity

## MVP Definition

### Launch With (v1 - Phase 2 Backend + Phase 3 Integration)

Minimum viable product - what's needed to validate the concept.

- [x] **Budget definition on ContractInternal** - Essential foundation; already 50% done (hackHours exists, adding studyHours/studyMoney)
- [x] **Budget allocation domain models** - Core business logic following Expense pattern
- [ ] **Budget allocation persistence** - JPA entities, repositories, adapters (JOINED inheritance)
- [ ] **Budget allocation API** - Wirespec contracts, REST controller with authority-based access control
- [ ] **Budget allocation tab (read-only for employees, admin can create StudyMoney)** - Primary UI for viewing budget status
- [ ] **Event budget management section** - Admin assigns budgets to participants from event dialog
- [ ] **Summary cards** - Budget/used/available per type (hack hours, study hours, study money)
- [ ] **Allocation list** - View all allocations grouped by type with event links
- [ ] **Year selector** - Switch between years; budget scoped to selected year
- [ ] **File attachments for StudyMoney** - Receipt upload for audit trail
- [ ] **Daily time breakdown with type override** - Per-day allocation detail for time-based budgets

### Add After Validation (v1.x - Future Enhancement Phases)

Features to add once core is working and validated with users.

- [ ] **Dashboard budget charts** - Horizontal stacked bar charts (budget vs used vs available per person)
- [ ] **Quick actions** - Distribute equally, bulk assign, clear all
- [ ] **Budget consumption warnings** - Visual indicators when approaching or exceeding budget (color coding)
- [ ] **Person selector for admins** - Admin can view/manage budgets for any person
- [ ] **Smart defaults refinement** - Learn from event patterns to improve default type suggestions
- [ ] **Export/reporting** - CSV export of allocations for external analysis
- [ ] **Budget history comparison** - Compare year-over-year usage patterns
- [ ] **Bulk allocation creation** - Create multiple allocations at once (e.g., recurring monthly expenses)

### Future Consideration (v2+ - Only if Validated Need)

Features to defer until product-market fit is established and clear demand exists.

- [ ] **Budget forecasting** - Predict future consumption based on historical patterns (requires ML/analytics)
- [ ] **Approval workflow** - If business rules change to require employee-initiated requests
- [ ] **Budget carry-over** - Roll unused budget to next year (complex policy logic)
- [ ] **Real-time notifications** - Alert users when budget thresholds crossed
- [ ] **Budget templates** - Pre-defined allocation patterns (low value, contracts already define budgets)
- [ ] **Mobile-optimized UI** - Native mobile app or mobile-first responsive design
- [ ] **Multi-currency support** - If organization expands internationally
- [ ] **Budget amendments** - Mid-year budget adjustments with approval workflow

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Budget definition (ContractInternal) | HIGH | LOW (mostly done) | P1 |
| Budget allocation API + persistence | HIGH | MEDIUM | P1 |
| Budget allocation tab (read UI) | HIGH | LOW | P1 |
| Event budget management | HIGH | HIGH | P1 |
| Summary cards | HIGH | LOW | P1 |
| Allocation list | HIGH | LOW | P1 |
| Year selector | HIGH | LOW | P1 |
| File attachments (StudyMoney) | MEDIUM | MEDIUM | P1 |
| Daily breakdown with type override | MEDIUM | MEDIUM | P1 |
| Dashboard charts | MEDIUM | MEDIUM | P2 |
| Quick actions (distribute equally) | MEDIUM | LOW | P2 |
| Budget warnings (color coding) | MEDIUM | LOW | P2 |
| Person selector (admin) | HIGH | LOW | P2 |
| Smart defaults refinement | LOW | MEDIUM | P2 |
| Export/reporting (CSV) | MEDIUM | LOW | P2 |
| Budget history comparison | LOW | MEDIUM | P3 |
| Bulk allocation creation | LOW | MEDIUM | P3 |
| Budget forecasting | LOW | HIGH | P3 |
| Approval workflow | LOW | HIGH | P3 |
| Budget carry-over | LOW | HIGH | P3 |
| Real-time notifications | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (MVP)
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Generic Budget Software | HR Management Systems | Our Approach |
|---------|-------------------------|----------------------|--------------|
| Budget definition | Annual amounts per category | Per-employee training budget | Per-employee, multi-type (hack hours, study hours, study money) via ContractInternal |
| Allocation recording | Manual entry by finance | Request/approval workflow | Admin-recorded facts tied to events; no approval needed |
| Event linkage | Not supported | Rarely supported | Core feature - allocations linked to events; event-centric management |
| Time + Money tracking | Money only | Usually money only | Both time (hack hours, study hours) AND money with different units |
| Daily breakdown | Not supported | Date range only | Per-day breakdown with type override (unique flexibility) |
| User interface | Finance-focused, complex | Employee portal + admin | Event-centric (admin) + person-centric (employee); integrated with workforce management |
| File attachments | Always required | Often optional | Required for money allocations, not for time allocations |
| Permissions | Role-based | Request/approve roles | Read-only for employees, admin-only mutations |

## Complexity Analysis

### Low Complexity (1-3 days)
- Summary cards UI
- Allocation list UI
- Year selector
- Budget calculation logic (budget minus allocations)
- Person selector for admins
- Color coding for budget warnings
- Quick action buttons (UI only)
- CSV export

### Medium Complexity (3-7 days)
- Budget allocation domain models
- Budget allocation persistence (JPA + adapters)
- File attachment handling (reusing existing Document pattern)
- Daily time breakdown with type override
- Dashboard charts (visualization)
- Smart defaults logic
- Quick actions backend implementation
- Year-over-year comparison

### High Complexity (7-14 days)
- Event budget management integration (complex UI + API coordination)
- Budget allocation API (wirespec contracts + controller)
- Bulk allocation creation (complex validation)
- Approval workflow (if ever implemented)
- Budget carry-over logic
- Budget forecasting (analytics/ML)

## Technical Dependencies

### Existing Infrastructure to Leverage
- **Expense domain pattern** - Sealed interface + persistence port architecture proven and documented
- **Document upload** - File attachment infrastructure exists in Expense domain
- **EventEntityListeners** - Audit trail mechanism via domain events
- **Wirespec** - Type-safe API contract generation for TypeScript + Kotlin
- **Authority-based access control** - RBAC pattern with @PreAuthorize annotations
- **Material-UI responsive patterns** - No mobile-specific UI needed

### New Infrastructure Needed
- **BudgetAllocation entity hierarchy** - JOINED inheritance strategy for three allocation types
- **Liquibase migrations** - New tables for budget allocations + ContractInternal fields
- **Wirespec contracts** - Unified response type with optional detail fields, separate input types
- **Budget calculation service** - Domain logic for computing available budget per person/year

## Sources

**Confidence Level: MEDIUM**

Primary sources:
- Existing codebase analysis (Expense domain, Event management, Contract management)
- Design documents: `/docs/plans/2026-02-28-budget-allocations-design.md`, `/docs/plans/2026-02-28-budget-allocations-implementation.md`
- Training data about enterprise budget tracking systems (general patterns, not specific to 2026)

Limitations:
- No web search or Context7 access available during research
- Relied on training data about budget tracking systems (knowledge cutoff January 2025)
- Feature categorization based on general enterprise software patterns, not verified against current market offerings

**Note:** Anti-features and differentiators reflect design decisions already made in the design doc (e.g., no approval workflow, event-centric management, per-day type override). These have been validated against the existing codebase architecture.

---
*Feature research for: Budget Allocation Tracking in Flock Workday*
*Researched: 2026-03-02*
