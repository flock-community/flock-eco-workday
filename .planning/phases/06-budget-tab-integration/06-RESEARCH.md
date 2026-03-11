# Phase 6: Budget Tab Integration - Research

**Researched:** 2026-03-11
**Domain:** React frontend integration (mock-to-API migration), new backend budget summary endpoint
**Confidence:** HIGH

## Summary

Phase 6 connects the existing Phase 1 prototype budget tab components to the real REST API built in Phase 5. The work divides into three areas: (1) a new backend budget summary endpoint with wirespec contract, (2) a frontend `BudgetAllocationClient` following the established client pattern, and (3) refactoring all prototype components to replace mock types/data with wirespec-generated types and real API calls.

The codebase has strong established patterns for all required work. The `ExpenseClient` + `NonInternalizingClient` pattern provides the exact template for the new client. The `ApplicationDrawer` authority-gated navigation and `react-router-dom` v5 `<Route>` in `AuthenticatedApplication` show exactly how to add a new top-level route. The `PersonSelector` component is ready to use with its `embedded` prop. The `ConfirmDialog` from `@workday-core` has the exact `open/onClose/onConfirm/children` API needed for delete confirmation.

**Primary recommendation:** Build backend budget summary endpoint first (wirespec + controller + service), then create `BudgetAllocationClient`, then refactor prototype components to use real types/API, then wire up routing and navigation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Create a `BudgetAllocationClient` in `clients/` directory following ExpenseClient pattern, wrapping wirespec-generated endpoint types
- Delete mock types (`mocks/BudgetAllocationTypes.ts`) and mock data (`mocks/BudgetAllocationMocks.ts`) entirely -- replace all imports with wirespec-generated types from `wirespec/model/`
- Delete `BudgetAllocationDemo.tsx` -- it served its prototype purpose
- New server-side budget summary endpoint: `GET /api/budget-summary?personId=X&year=Y`
- Returns single response with all three budget types: `{ hackHours: {budget, used, available}, studyHours: {budget, used, available}, studyMoney: {budget, used, available} }`
- Backend joins contract data (budget limits) with allocation sums (used amounts), calculates available
- Same ownership/access pattern as allocations: non-admin auto-scoped to own data, admin can query any person
- Requires new wirespec contract, controller endpoint, and service method
- Reuse existing `PersonSelector` dropdown component for admin person selection
- All users can access the Budget tab and view their own budget data
- Non-admin users: no person selector shown, auto-scoped to own data
- Admin users: PersonSelector + year selector shown at top of tab
- Budget tab is a new top-level route (not a tab within person detail page)
- Reuse existing `StudyMoneyAllocationDialog.tsx` from Phase 1 prototype, wired to real API via BudgetAllocationClient
- Only StudyMoney allocations can be created/edited/deleted from the Budget tab (TAB-03)
- HackTime and StudyTime allocations shown read-only with event links (managed via Event dialog in Phase 7)
- File attachments: reuse `DropzoneAreaField` component with `/api/budget-allocations/files` endpoint, same pattern as expenses
- Delete requires confirmation dialog (reuse ConfirmDialog from @workday-core)

### Claude's Discretion
- Loading and error state UX (skeleton cards, spinners, etc.)
- URL state management (whether person/year selection reflects in URL query params)
- Exact layout and spacing of person selector + year selector toolbar
- Error handling patterns (toast notifications, inline errors, etc.)

### Deferred Ideas (OUT OF SCOPE)
- Dashboard with stacked bar charts (DASH-01, DASH-02) -- v2 requirement, but budget summary endpoint built in Phase 6 enables it
- HackTime/StudyTime CRUD from Budget tab -- managed through Event dialog in Phase 7
- Budget utilization warnings (ENH-03) -- v2 enhancement
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TAB-01 | User sees summary cards showing budget/used/available for hack hours, study hours, study money | New wirespec `BudgetSummary` endpoint + backend service joining contract data with allocation sums; `BudgetSummaryCards` component already exists, needs wirespec type swap |
| TAB-02 | User sees allocation list grouped by type with event links | `BudgetAllocationClient.findAll(personId, year)` calling existing `GET /api/budget-allocations` endpoint; `BudgetAllocationList` component refactored to use wirespec `BudgetAllocation` type |
| TAB-03 | Admin can create/edit/delete standalone StudyMoney allocations from the tab | `BudgetAllocationClient.createStudyMoney/deleteById` calling existing `POST /api/budget-allocations/study-money` and `DELETE /api/budget-allocations/{id}`; `StudyMoneyAllocationDialog` wired to client + ConfirmDialog for delete |
| TAB-04 | Year selector filters displayed allocations | Year state in `BudgetAllocationFeature` triggers re-fetch via `useEffect` on year change -- already structured this way in prototype |
| TAB-05 | Admin can switch between persons | `PersonSelector` component (embedded mode) with admin authority check via `useUserMe` hook; triggers re-fetch on personId change |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Purpose | Why Standard |
|---------|---------|--------------|
| React 18 | UI framework | Existing project framework |
| react-router-dom v5 | Routing | Existing project router (`<Route>`, `<Switch>`, `<Redirect>`) |
| MUI v6 | Component library | Existing project UI library (Grid v2 syntax with `size` prop) |
| dayjs | Date formatting | Existing project date library |
| Wirespec | Contract-first API types | Project convention for type-safe frontend-backend contracts |

### Supporting (already in project)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| `@workday-core` | Shared components (ConfirmDialog, ResourceClient, PageableClient) | Delete confirmation, HTTP client utilities |
| `@workday-user` | Auth utilities (UserAuthorityUtil) | Checking `BudgetAllocationAuthority.READ/WRITE/ADMIN` |
| Formik + Yup | Form state (in dialogs) | StudyMoneyAllocationDialog if migrating to Formik (currently uses useState) |

### No New Dependencies Needed
This phase uses exclusively existing project libraries. No `npm install` required.

## Architecture Patterns

### Recommended File Structure
```
workday-application/src/main/
  wirespec/
    budget-allocations.ws          # ADD: BudgetSummary endpoint
  kotlin/.../budget/
    BudgetAllocationController.kt  # ADD: budgetSummary handler method
    BudgetSummaryService.kt        # NEW: joins contract + allocation data
  react/
    clients/
      BudgetAllocationClient.ts    # NEW: API client
    features/budget/
      BudgetAllocationFeature.tsx   # REFACTOR: mock -> real API
      BudgetAllocationList.tsx      # REFACTOR: mock types -> wirespec types
      BudgetSummaryCards.tsx        # REFACTOR: mock types -> wirespec types
      BudgetCard.tsx                # REFACTOR: mock types -> wirespec types
      StudyMoneyAllocationDialog.tsx # REFACTOR: mock types -> wirespec types + API
      EventAllocationListItem.tsx   # REFACTOR: mock types -> wirespec types
      StudyMoneyAllocationListItem.tsx # REFACTOR: mock types -> wirespec types
      index.ts                      # UPDATE: remove mock exports
      mocks/                        # DELETE entirely
      BudgetAllocationDemo.tsx      # DELETE
    application/
      AuthenticatedApplication.tsx  # UPDATE: replace /demo route with /budget-allocations
      ApplicationDrawer.tsx         # UPDATE: add Budget nav item
```

### Pattern 1: Client Class (follow ExpenseClient exactly)
**What:** Typed API client wrapping fetch calls via `NonInternalizingClient` or direct fetch
**When to use:** All API communication
**Example:**
```typescript
// Source: ExpenseClient.ts pattern + wirespec types
import type { BudgetAllocation, StudyMoneyAllocationInput } from '../wirespec/model';

const path = '/api/budget-allocations';

const findAll = (personId?: string, year?: number): Promise<BudgetAllocation[]> =>
  fetch(`${path}?${new URLSearchParams({ ...(personId && { personId }), ...(year && { year: String(year) }) })}`)
    .then(res => res.json());

const createStudyMoney = (input: StudyMoneyAllocationInput): Promise<BudgetAllocation> =>
  fetch(`${path}/study-money`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(input) })
    .then(res => res.json());

const deleteById = (id: string): Promise<void> =>
  fetch(`${path}/${id}`, { method: 'DELETE' }).then(() => undefined);

// Budget summary (new endpoint)
const getSummary = (personId?: string, year?: number): Promise<BudgetSummaryResponse> =>
  fetch(`/api/budget-summary?${new URLSearchParams({ ...(personId && { personId }), ...(year && { year: String(year) }) })}`)
    .then(res => res.json());

export const BudgetAllocationClient = { findAll, createStudyMoney, deleteById, getSummary };
```

### Pattern 2: Authority-Gated Navigation
**What:** Drawer menu items filtered by user authorities
**When to use:** Adding Budget tab to navigation
**Example:**
```typescript
// Source: ApplicationDrawer.tsx pattern
{
  name: 'Budget',
  icon: AccountBalanceWalletIcon,
  url: '/budget-allocations',
  authority: 'BudgetAllocationAuthority.READ',
}
```

### Pattern 3: Admin vs User Rendering
**What:** Check authorities from `useUserMe()` hook to conditionally show admin controls
**When to use:** PersonSelector visibility, write permission for CRUD buttons
**Example:**
```typescript
const [user] = useUserMe();
const isAdmin = user?.authorities?.includes('BudgetAllocationAuthority.ADMIN') ?? false;
const hasWritePermission = user?.authorities?.includes('BudgetAllocationAuthority.WRITE') ?? false;
```

### Pattern 4: Route Registration
**What:** Add route in `AuthenticatedApplication` Switch block
**When to use:** Budget tab as top-level route
**Example:**
```typescript
// Source: AuthenticatedApplication.tsx pattern
<Route path="/budget-allocations" component={BudgetAllocationFeature} />
```

### Anti-Patterns to Avoid
- **Using mock types alongside wirespec types:** Delete all mock types completely. No gradual migration -- replace all at once.
- **Creating separate budget summary TS types manually:** Use wirespec-generated types from the new endpoint.
- **Putting business logic in the client:** Budget calculations (budget - used = available) happen server-side in the summary endpoint.
- **Using NonInternalizingClient for budget client:** The existing budget API endpoints don't follow the generic CRUD pattern that NonInternalizingClient assumes (different paths per type, query params). Use direct fetch with wirespec types instead, similar to how BootstrapClient works.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Delete confirmation | Custom confirmation dialog | `ConfirmDialog` from `@workday-core` | Already has proper open/close/confirm API, used by 8+ features |
| Person dropdown | Custom person selector | `PersonSelector` from `components/selector/` with `embedded` prop | Loads persons automatically, handles display, already tested |
| Auth checking | Custom auth logic | `useUserMe()` hook + `user.authorities.includes()` | Matches existing drawer pattern, automatically loads user data |
| File upload | Custom upload component | `DropzoneAreaField` + `/api/budget-allocations/files` endpoint | Pattern proven in expenses, handles multipart upload |
| HTTP utilities | Custom fetch wrappers | `@workday-core` ResourceClient/PageableClient or direct fetch | Project-standard approach |

## Common Pitfalls

### Pitfall 1: Type Shape Mismatch Between Mock and Wirespec Types
**What goes wrong:** Wirespec `BudgetAllocation` is a flat type with discriminated `type` field and optional detail objects (`hackTimeDetails`, `studyTimeDetails`, `studyMoneyDetails`). Mock types use a TypeScript union with different shapes per subtype (e.g., `StudyMoneyBudgetAllocation` has `amount` directly).
**Why it happens:** The mock types were designed for prototype convenience; wirespec types reflect the actual API response.
**How to avoid:** Map wirespec `BudgetAllocation` to component-friendly shapes in the client or a mapper function. Key differences:
- Wirespec: `allocation.studyMoneyDetails?.amount` vs Mock: `allocation.amount`
- Wirespec: `allocation.type === 'STUDY_MONEY'` (enum) vs Mock: `allocation.type === 'StudyMoney'` (string literal)
- Wirespec: `allocation.date` (single date string) vs Mock: `allocation.dateFrom` + `allocation.dateTo`
- Wirespec: no `personName`, `eventName` fields -- just `personId`, `eventCode`
**Warning signs:** TypeScript compilation errors when components expect mock type shapes

### Pitfall 2: PersonSelector Value is UUID String
**What goes wrong:** `PersonSelector` calls `onChange` with the person's `uuid` string. The `BudgetAllocationClient` expects this UUID for `personId` query param.
**Why it happens:** PersonSelector uses `item.uuid` as the `<MenuItem>` value.
**How to avoid:** Wire PersonSelector `onChange` directly to state that feeds into API calls. The UUID from PersonSelector matches the personId format expected by the backend.

### Pitfall 3: Non-Admin Self-Scoping
**What goes wrong:** Trying to pass `personId` for non-admin users when the backend auto-scopes.
**Why it happens:** The controller's `budgetAllocationAll` method ignores `personId` param for non-admins and uses `authentication().name` to find the person.
**How to avoid:** For non-admin users, call the API without `personId` parameter. The backend will auto-scope. Only pass `personId` when user is admin and has selected a specific person.

### Pitfall 4: Budget Summary Endpoint Needs Contract Access
**What goes wrong:** Budget summary requires reading ContractInternal to get budget limits (hackHours, studyHours, studyMoney), but the budget allocation service doesn't currently have contract access.
**Why it happens:** The budget summary is a new cross-domain query joining contract and allocation data.
**How to avoid:** Create a dedicated `BudgetSummaryService` that depends on both `BudgetAllocationService` (for used amounts) and the contract service (for budget limits). Keep it in the application layer, not domain layer.

### Pitfall 5: react-router-dom v5 Syntax
**What goes wrong:** Using react-router-dom v6 syntax (`<Routes>`, `element={}`) instead of v5 (`<Switch>`, `component={}`, `<Route exact>`).
**Why it happens:** Claude's training data mixes versions.
**How to avoid:** Follow existing `AuthenticatedApplication.tsx` exactly: `<Route path="/budget-allocations" component={BudgetAllocationFeature} />`

### Pitfall 6: Wirespec TypeScript Generation Step
**What goes wrong:** Adding a new wirespec endpoint but forgetting to regenerate TypeScript types.
**Why it happens:** Kotlin types auto-generate on Maven build, but TypeScript requires explicit `npm run generate`.
**How to avoid:** After modifying any `.ws` file, always run `npm run generate` from root before working on frontend code.

## Code Examples

### Wirespec Budget Summary Endpoint
```wirespec
// Source: Pattern from existing budget-allocations.ws
endpoint BudgetSummary GET /api/budget-summary ? { personId: String?, year: Integer32? } -> {
  200 -> BudgetSummaryResponse
}
type BudgetSummaryResponse {
  hackHours: BudgetItem,
  studyHours: BudgetItem,
  studyMoney: BudgetItem
}
type BudgetItem {
  budget: Number,
  used: Number,
  available: Number
}
```

### Backend BudgetSummaryService Pattern
```kotlin
// Source: Based on existing controller pattern + contract access
@Service
class BudgetSummaryService(
    private val budgetAllocationService: BudgetAllocationService,
    private val contractService: ContractService, // existing service
) {
    fun getSummary(personUuid: UUID, year: Int): BudgetSummaryResponse {
        val allocations = budgetAllocationService.findAllByPersonUuid(personUuid, year)
        val contract = contractService.findByPersonUuid(personUuid) // get active contract

        val hackHoursUsed = allocations.filterIsInstance<HackTimeBudgetAllocation>()
            .sumOf { it.dailyAllocations.sumOf { d -> d.hours.toDouble() } }
        val studyHoursUsed = allocations.filterIsInstance<StudyTimeBudgetAllocation>()
            .sumOf { it.dailyAllocations.sumOf { d -> d.hours.toDouble() } }
        val studyMoneyUsed = allocations.filterIsInstance<StudyMoneyBudgetAllocation>()
            .sumOf { it.amount.toDouble() }

        return BudgetSummaryResponse(
            hackHours = BudgetItem(contract.hackHours, hackHoursUsed, contract.hackHours - hackHoursUsed),
            studyHours = BudgetItem(contract.studyHours, studyHoursUsed, contract.studyHours - studyHoursUsed),
            studyMoney = BudgetItem(contract.studyMoney, studyMoneyUsed, contract.studyMoney - studyMoneyUsed),
        )
    }
}
```

### Refactored BudgetAllocationFeature Data Loading
```typescript
// Source: Pattern from existing features + BudgetAllocationClient
useEffect(() => {
  setLoading(true);
  Promise.all([
    BudgetAllocationClient.getSummary(isAdmin ? selectedPersonId : undefined, year),
    BudgetAllocationClient.findAll(isAdmin ? selectedPersonId : undefined, year),
  ]).then(([summary, allocations]) => {
    setSummary(summary);
    setAllocations(allocations);
    setLoading(false);
  }).catch(err => {
    console.error('Failed to load budget data:', err);
    setLoading(false);
  });
}, [year, selectedPersonId, isAdmin]);
```

### Delete with ConfirmDialog
```typescript
// Source: Pattern from EventDialog.tsx + ConfirmDialog API
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';

const [deleteTarget, setDeleteTarget] = useState<BudgetAllocation | null>(null);

const handleDeleteConfirm = async () => {
  if (deleteTarget?.id) {
    await BudgetAllocationClient.deleteById(deleteTarget.id);
    setDeleteTarget(null);
    // Re-fetch allocations
  }
};

<ConfirmDialog
  open={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDeleteConfirm}
>
  Are you sure you want to delete this study money allocation?
</ConfirmDialog>
```

## State of the Art

| Old Approach (Phase 1 Prototype) | Current Approach (Phase 6) | Impact |
|----------------------------------|---------------------------|--------|
| Mock types in `mocks/BudgetAllocationTypes.ts` | Wirespec-generated types in `wirespec/model/` | Type-safe API contract |
| Mock data in `mocks/BudgetAllocationMocks.ts` | Real API via `BudgetAllocationClient` | Live data |
| `BudgetAllocationDemo.tsx` at `/demo` route | `BudgetAllocationFeature` at `/budget-allocations` route | Production integration |
| `isAdmin` prop passed manually | Authority check via `useUserMe()` hook | Real auth |
| Hardcoded person UUID | `BootstrapData.personId` for self, `PersonSelector` for admin | Real person resolution |
| Client-side budget calculation | Server-side `GET /api/budget-summary` endpoint | Accurate, single source of truth |

## Open Questions

1. **Contract Service Access Pattern**
   - What we know: `ContractService` or similar exists for reading contracts. ContractInternal has `studyHours`, `studyMoney` fields (added in Phase 4). The wirespec contracts.ws confirms these fields exist.
   - What's unclear: Exact method signature to find active contract for a person in a given year. May need to filter by date range.
   - Recommendation: Inspect `ContractService` during implementation to find the right query method. If none exists for "active contract in year X", create a simple query.

2. **BootstrapData.personId Availability**
   - What we know: `BootstrapData` has an optional `personId?: string` field. This would be the logged-in user's person UUID.
   - What's unclear: Whether this is always populated for non-admin users. The backend auto-scopes for non-admins, so the frontend may not even need it.
   - Recommendation: For non-admin users, omit `personId` from API calls and let backend auto-scope. Use `BootstrapData.personId` only if needed for display purposes.

3. **File Upload in StudyMoneyAllocationDialog**
   - What we know: The prototype uses a basic `<input type="file">` with chip display. Context decision says to use `DropzoneAreaField`.
   - What's unclear: Whether to migrate the file upload component in this phase or keep the simpler approach and migrate in a follow-up.
   - Recommendation: Use `DropzoneAreaField` if straightforward; otherwise keep the existing simple file input and wire it to `/api/budget-allocations/files` POST endpoint. The upload flow is: POST file -> get UUID -> include in `StudyMoneyAllocationInput.files[]`.

## Validation Architecture

> `workflow.nyquist_validation` not set in config.json -- treating as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (frontend), JUnit 5 + Spring Boot Test (backend) |
| Config file | `jest.config.js` (root), existing Maven test config |
| Quick run command | `npm test -- --watchAll=false` (frontend), `cd workday-application && ../mvnw test` (backend) |
| Full suite command | `npm test -- --watchAll=false && ./mvnw clean test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAB-01 | Budget summary cards show real data | integration (backend) | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | No - Wave 0 |
| TAB-02 | Allocation list populated from API | integration (backend, existing) | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | Yes |
| TAB-03 | StudyMoney CRUD from tab | integration (backend, existing) | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | Yes |
| TAB-04 | Year filter works | integration (backend, existing) | `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest` | Yes |
| TAB-05 | Person switching (admin) | integration (backend) | `cd workday-application && ../mvnw test -Dtest=BudgetSummaryControllerTest` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd workday-application && ../mvnw test -Dtest=BudgetAllocationControllerTest,BudgetSummaryControllerTest -x`
- **Per wave merge:** `./mvnw clean test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `BudgetSummaryControllerTest.kt` -- integration test for new budget summary endpoint (covers TAB-01, TAB-05)
- [ ] Budget summary wirespec endpoint definition in `budget-allocations.ws`
- [ ] `BudgetSummaryService.kt` -- new service joining contract + allocation data

## Sources

### Primary (HIGH confidence)
- Project codebase direct inspection: `ExpenseClient.ts`, `NonInternalizingClient.ts`, `AuthenticatedApplication.tsx`, `ApplicationDrawer.tsx`, `BudgetAllocationController.kt`, `PersonSelector.tsx`, `ConfirmDialog.tsx`, `BootstrapClient.ts`, `UserMeHook.ts`, `StatusHook.ts`
- Wirespec contracts: `budget-allocations.ws`, `contracts.ws`
- Wirespec generated types: `BudgetAllocation.ts`, `StudyMoneyAllocationInput.ts`, `StudyMoneyDetails.ts`, `HackTimeDetails.ts`
- All Phase 1 prototype components in `features/budget/`

### Secondary (MEDIUM confidence)
- Budget summary service design (inferred from existing patterns and CONTEXT.md decisions)

### Tertiary (LOW confidence)
- Contract service method signatures for finding active contract by person+year (needs verification during implementation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new dependencies
- Architecture: HIGH - all patterns directly observed in existing codebase
- Pitfalls: HIGH - type mismatches identified by comparing mock types vs wirespec types
- Budget summary backend: MEDIUM - service design inferred, contract service access needs verification

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable -- all based on project codebase patterns)
