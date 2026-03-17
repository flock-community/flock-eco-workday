# Phase 5 Context: API Layer

**Phase Goal:** External clients can query and mutate budget allocations via REST API
**Requirements:** API-01, API-02, API-03, API-04, API-05, CTR-02
**Date:** 2026-03-05

## Decisions

### 1. Query Endpoint Shape

**Decision:** Single `GET /api/budget-allocations` endpoint with all-optional query parameters.

**Parameters:**
- `personId: String?` — filter by person UUID
- `year: Integer?` — filter by year (defaults to current year when personId is provided but year is omitted)
- `eventCode: String?` — filter by event code

**Rationale:** Simpler wirespec contract, frontend picks which params to send. Matches Expense pattern of single list endpoint.

### 2. Ownership / Access Control Pattern

**Decision:** Mimic Expense controller ownership pattern exactly.

**Behavior:**
- Non-admin users: `personId` and `eventCode` params are **ignored**. Controller always scopes results to the authenticated user's own allocations (via `authentication().name` lookup).
- Admin users: can use any combination of query params freely.
- `@PreAuthorize("hasAuthority('BudgetAllocationAuthority.READ')")` for GET endpoints.
- `@PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")` for POST/PUT/DELETE endpoints.
- Admin check via `authentication().isAdmin()` using `BudgetAllocationAuthority.ADMIN`.

**Rationale:** Proven pattern in Expense controller (lines 82-84). Non-admins can view their own budget data in the Budget Tab without admin privileges.

### 3. Year Default Behavior

**Decision:** When `personId` is provided but `year` is omitted, default to current year.

**Rationale:** Matches Budget Tab UX where users start viewing current year. Frontend explicitly passes a different year via year selector.

### 4. File Upload Approach

**Decision (inherited from Expense pattern):** File upload/download bypasses wirespec using `@PostMapping`/`@GetMapping` directly with `MultipartFile`.

**Endpoints:**
- `POST /api/budget-allocations/files` — upload file, returns UUID
- `GET /api/budget-allocations/files/{file}/{name}` — download file by UUID

**Rationale:** Wirespec doesn't support multipart/form-data. Expense has the exact same TODO comment about this limitation (ExpenseController.kt line 121).

### 5. Mutation Endpoint Structure

**Decision (from PROJECT.md):** Separate input types per allocation subtype, unified response type with discriminator.

**Wirespec endpoints:**
- `POST /api/budget-allocations/hack-time` — create HackTime allocation
- `PUT /api/budget-allocations/hack-time/{id}` — update HackTime allocation
- `POST /api/budget-allocations/study-time` — create StudyTime allocation
- `PUT /api/budget-allocations/study-time/{id}` — update StudyTime allocation
- `POST /api/budget-allocations/study-money` — create StudyMoney allocation
- `PUT /api/budget-allocations/study-money/{id}` — update StudyMoney allocation
- `DELETE /api/budget-allocations/{id}` — delete any allocation type

**Rationale:** Follows Expense pattern (separate CostExpenseCreate/TravelExpenseCreate endpoints, shared delete).

### 6. Controller Implementation Pattern

**Decision:** Follow Expense controller structure exactly.

**Components:**
- `BudgetAllocationAuthority` enum (READ, WRITE, ADMIN) — mirrors `ExpenseAuthority`
- `BudgetAllocationHandler` interface combining all wirespec handler interfaces
- `BudgetAllocationController` implementing handler + manual file endpoints
- Mapper components for API <-> domain conversion
- Domain services injected (already exist from Phase 3)

### 7. ContractInternal Wirespec Update

**Decision:** Extend existing `contracts.ws` wirespec with `studyHours` and `studyMoney` fields on `ContractInternalForm` and response types.

**Fields:** `studyHours: Integer?`, `studyMoney: Number?`
**Rationale:** CTR-02 requirement. Fields already exist on JPA entity (Phase 4). Wirespec update enables TypeScript types for Phase 8 contract form work.

## Code Context

### Reference Files (Expense pattern to follow)
- Wirespec: `workday-application/src/main/wirespec/expenses.ws`
- Controller: `workday-application/src/main/kotlin/.../expense/ExpenseController.kt`
- Authority: `workday-application/src/main/kotlin/.../expense/ExpenseAuthority.kt`
- Mapper: `workday-application/src/main/kotlin/.../expense/ExpenseMapper.kt`
- File handling: `DocumentStorage` interface + `@PostMapping`/`@GetMapping` bypass

### Budget Allocation Domain (from Phase 3-4)
- Domain model: `domain/src/main/kotlin/.../budget/BudgetAllocation.kt`
- Services: `domain/src/main/kotlin/.../budget/*Service.kt`
- Persistence adapters: `workday-application/src/main/kotlin/.../budget/*PersistenceAdapter.kt`
- Entities: `workday-application/src/main/kotlin/.../budget/*Entity.kt`

### New Files to Create
- `workday-application/src/main/wirespec/budget-allocations.ws`
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationAuthority.kt`
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationController.kt`
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationMapper.kt`
- Update: `workday-application/src/main/wirespec/contracts.ws` (add studyHours/studyMoney)

## Deferred Ideas

None captured during discussion.

---
*Context gathered: 2026-03-05*
