---
phase: 05-api-layer
plan: 02
subsystem: api
tags: [wirespec, spring, kotlin, rest, security, budget-allocation]

# Dependency graph
requires:
  - phase: 05-01
    provides: Wirespec contracts, generated handler interfaces, BudgetAllocationAuthority, Spring DI Configuration
  - phase: 04
    provides: Domain services (BudgetAllocationService, HackTime/StudyTime/StudyMoney services), persistence layer
provides:
  - BudgetAllocationController implementing all 8 wirespec handler methods
  - BudgetAllocationApiMapper with consume/produce functions for all 3 allocation types
  - File upload/download endpoints for budget allocation documents
  - Runtime authorization checks (requireRead/requireWrite) for wirespec-dispatched methods
  - Integration tests covering CRUD, auth scoping, and non-admin 403
affects: [06-budget-tab-integration, 07-event-integration, 08-contract-form]

# Tech tracking
tech-stack:
  added: []
  patterns: [runtime-auth-checks-for-wirespec, transactional-reads-for-lazy-collections]

key-files:
  created:
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationApiMapper.kt
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationController.kt
    - workday-application/src/test/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationControllerTest.kt
  modified:
    - workday-application/src/main/kotlin/community/flock/eco/workday/application/budget/BudgetAllocationPersistenceAdapter.kt

key-decisions:
  - "Runtime auth checks (requireWrite/requireRead) instead of @PreAuthorize for wirespec handler methods -- @PreAuthorize not intercepted on wirespec-dispatched suspend methods"
  - "@Transactional(readOnly=true) on persistence adapter read methods to prevent LazyInitializationException on element collections"

patterns-established:
  - "Wirespec auth pattern: use runtime requireWrite()/requireRead() guards inside handler methods, keep @PreAuthorize only on direct @GetMapping/@PostMapping endpoints"
  - "Lazy collection access: always add @Transactional to persistence adapter methods that map entities with lazy element collections"

requirements-completed: [API-01, API-02, API-03, API-04, API-05]

# Metrics
duration: 64min
completed: 2026-03-06
---

# Phase 5 Plan 2: Controller Implementation Summary

**REST controller with 8 wirespec handlers, API mapper for 3 allocation types, file endpoints, and 7 integration tests with runtime auth guards**

## Performance

- **Duration:** 64 min
- **Started:** 2026-03-06T19:55:32Z
- **Completed:** 2026-03-06T20:59:32Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- BudgetAllocationApiMapper with consume (API-to-domain) and produce (domain-to-API) functions for HackTime, StudyTime, and StudyMoney allocation types
- BudgetAllocationController implementing all 8 wirespec handler interfaces (list, delete, create/update for each type) plus file upload/download
- 7 integration tests: GET by personId+year, GET by eventCode, POST hack-time, POST study-money, DELETE, non-admin 403, non-admin scoped GET
- Runtime authorization checks working correctly with wirespec async dispatch

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BudgetAllocationMapper** - `64bbf98f` (feat)
2. **Task 2: Create BudgetAllocationController with integration tests** - `d1378f3f` (feat)

## Files Created/Modified
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationApiMapper.kt` - Consume/produce mapper for all 3 allocation types
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationController.kt` - REST controller with 8 wirespec handlers + file endpoints
- `workday-application/src/test/kotlin/.../budget/BudgetAllocationControllerTest.kt` - 7 integration tests covering all API requirements
- `workday-application/src/main/kotlin/.../budget/BudgetAllocationPersistenceAdapter.kt` - Added @Transactional(readOnly=true) to read methods

## Decisions Made
- **Runtime auth checks for wirespec methods:** `@PreAuthorize` annotations are not intercepted on wirespec-dispatched suspend handler methods because wirespec registers its own request mappings via `@EnableWirespecController`. Replaced with runtime `requireWrite()`/`requireRead()` guards that throw `ResponseStatusException(FORBIDDEN)`. Direct `@GetMapping`/`@PostMapping` file endpoints retain `@PreAuthorize`.
- **@Transactional on persistence reads:** `dailyTimeAllocations` element collections are lazy-loaded. Added `@Transactional(readOnly=true)` to persistence adapter find methods to keep Hibernate session open during entity-to-domain mapping.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @PreAuthorize not intercepted on wirespec handler methods**
- **Found during:** Task 2 (integration tests)
- **Issue:** `@PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")` on wirespec handler overrides was silently ignored -- user with only READ authority got 200 on POST mutations
- **Fix:** Replaced `@PreAuthorize` with runtime `requireWrite()`/`requireRead()` helper methods that check authorities and throw `ResponseStatusException(HttpStatus.FORBIDDEN)`
- **Files modified:** BudgetAllocationController.kt
- **Verification:** Non-admin 403 test passes
- **Committed in:** d1378f3f

**2. [Rule 1 - Bug] LazyInitializationException on dailyTimeAllocations**
- **Found during:** Task 2 (integration tests)
- **Issue:** GET endpoints threw `LazyInitializationException: failed to lazily initialize a collection of role: HackTimeBudgetAllocationEntity.dailyTimeAllocations` because persistence adapter methods lacked transaction context
- **Fix:** Added `@Transactional(readOnly = true)` to `findAllByPersonUuid`, `findAllByEventCode`, and `findById` methods in `BudgetAllocationPersistenceAdapter`
- **Files modified:** BudgetAllocationPersistenceAdapter.kt
- **Verification:** GET tests pass without lazy init errors
- **Committed in:** d1378f3f

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes required for correct operation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 API layer complete -- all budget allocation REST endpoints operational
- Ready for Phase 6 (Budget Tab Integration) which will connect frontend to these API endpoints
- All API requirements (API-01 through API-05) satisfied and tested

---
*Phase: 05-api-layer*
*Completed: 2026-03-06*
