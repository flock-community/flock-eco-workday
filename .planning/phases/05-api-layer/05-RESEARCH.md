# Phase 5: API Layer - Research

**Researched:** 2026-03-05
**Domain:** Wirespec REST API, Spring Security, Kotlin controller patterns
**Confidence:** HIGH

## Summary

Phase 5 creates the REST API layer for budget allocations, following the established Expense controller pattern exactly. The work involves three distinct areas: (1) creating a new `budget-allocations.ws` wirespec file defining endpoints and types, (2) implementing `BudgetAllocationController` with wirespec handler interface, authority-based access control, and file upload endpoints, (3) updating the existing `contracts.ws` wirespec to add `studyHours` and `studyMoney` fields to `ContractInternalForm` and `ContractInternal` types.

The codebase has a proven pattern in the Expense domain that serves as an exact template. Wirespec generates both Kotlin handler interfaces (`community.flock.eco.workday.api.endpoint.*`) and TypeScript types. The controller implements a combined handler interface and uses `@PreAuthorize` with authority strings. File upload/download bypasses wirespec with manual `@PostMapping`/`@GetMapping` endpoints due to wirespec's lack of multipart support.

**Primary recommendation:** Follow the Expense controller pattern line-by-line. The budget domain services already exist from Phase 3-4; this phase wires them to HTTP endpoints via wirespec-generated handler interfaces and a Spring `@Configuration` class for bean wiring.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
1. **Query Endpoint Shape:** Single `GET /api/budget-allocations` endpoint with all-optional query parameters (`personId: String?`, `year: Integer?`, `eventCode: String?`). Year defaults to current year when personId is provided but year is omitted.
2. **Ownership / Access Control Pattern:** Mimic Expense controller ownership pattern exactly. Non-admin users: `personId` and `eventCode` params are ignored, controller scopes results to authenticated user's own allocations. Admin users: can use any combination of query params freely. `@PreAuthorize` with `BudgetAllocationAuthority.READ`/`.WRITE`.
3. **File Upload Approach:** File upload/download bypasses wirespec using `@PostMapping`/`@GetMapping` directly with `MultipartFile`. Endpoints: `POST /api/budget-allocations/files` and `GET /api/budget-allocations/files/{file}/{name}`.
4. **Mutation Endpoint Structure:** Separate input types per allocation subtype, unified response type with discriminator. Subtype-specific POST/PUT endpoints, shared DELETE.
5. **Controller Implementation Pattern:** Follow Expense controller structure exactly. `BudgetAllocationAuthority` enum, `BudgetAllocationHandler` interface combining wirespec handlers, `BudgetAllocationController` implementing handler + manual file endpoints.
6. **ContractInternal Wirespec Update:** Extend existing `contracts.ws` with `studyHours: Integer32?` and `studyMoney: Number?` on both `ContractInternalForm` and `ContractInternal` types.

### Claude's Discretion
None captured -- all decisions were locked.

### Deferred Ideas (OUT OF SCOPE)
None captured during discussion.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | Admin can query allocations by person+year via GET endpoint | Single GET endpoint with optional personId/year params, year defaults to current year. Uses `BudgetAllocationService.findAllByPersonUuid()` |
| API-02 | Admin can query allocations by event code via GET endpoint | Same GET endpoint with optional eventCode param. Uses `BudgetAllocationService.findAllByEventCode()` |
| API-03 | Admin can create/update/delete StudyMoney allocations via REST API | Separate POST/PUT endpoints for study-money with file list support, shared DELETE. Uses `StudyMoneyBudgetAllocationService` |
| API-04 | Admin can create/update HackTime and StudyTime allocations via REST API | Separate POST/PUT endpoints for hack-time and study-time with daily breakdowns. Uses `HackTimeBudgetAllocationService` and `StudyTimeBudgetAllocationService` |
| API-05 | Authority-based access control (READ for viewing, ADMIN for mutations) | `BudgetAllocationAuthority` enum with READ/WRITE/ADMIN, `@PreAuthorize` annotations, non-admin scoping via PersonService lookup |
| CTR-02 | Wirespec contract updated with new ContractInternal fields | Add `studyHours: Integer32?` and `studyMoney: Number?` to `ContractInternalForm` and `ContractInternal` types in `contracts.ws` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Wirespec | 0.17.8 (`@flock/wirespec`) | API contract definition + code generation | Project's contract-first API pattern; generates Kotlin handlers + TypeScript types |
| Spring Boot | (project version) | REST controller, security, DI | Project standard |
| Spring Security | (project version) | `@PreAuthorize` method-level security | Project standard for authority-based access control |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `DocumentStorage` | (internal interface) | File upload/download for StudyMoney attachments | Multipart file endpoints that bypass wirespec |
| `PersonService` | (internal service) | Resolve user code to person UUID for non-admin scoping | Controller GET endpoint non-admin path |

## Architecture Patterns

### Recommended Project Structure
```
workday-application/src/main/
├── wirespec/
│   ├── budget-allocations.ws          # NEW: budget allocation API contract
│   └── contracts.ws                    # MODIFY: add studyHours/studyMoney fields
├── kotlin/.../budget/
│   ├── BudgetAllocationAuthority.kt   # NEW: READ, WRITE, ADMIN enum
│   ├── BudgetAllocationController.kt  # NEW: wirespec handler + file endpoints
│   ├── BudgetAllocationMapper.kt      # NEW: API <-> domain mapping
│   └── BudgetAllocationConfiguration.kt # NEW: Spring bean wiring for domain services
└── react/wirespec/                     # AUTO-GENERATED: TypeScript types after npm run generate
```

### Pattern 1: Wirespec Handler Interface
**What:** Define a combined handler interface that extends all individual wirespec-generated endpoint handlers
**When to use:** Every wirespec-based controller
**Example:**
```kotlin
// Source: ExpenseController.kt lines 51-58
interface BudgetAllocationHandler :
    BudgetAllocationAll.Handler,
    BudgetAllocationDeleteById.Handler,
    HackTimeAllocationCreate.Handler,
    HackTimeAllocationUpdate.Handler,
    StudyTimeAllocationCreate.Handler,
    StudyTimeAllocationUpdate.Handler,
    StudyMoneyAllocationCreate.Handler,
    StudyMoneyAllocationUpdate.Handler
```

### Pattern 2: Admin-Scoped Query with Non-Admin Fallback
**What:** Admin users can query freely; non-admin users are silently scoped to their own data
**When to use:** GET endpoints where both admin and regular users need access
**Critical detail:** The budget domain port only has `findAllByPersonUuid(uuid, year)` -- there is no `findAllByPersonUserCode` like Expense has. The controller must resolve user code to person UUID via `PersonService.findByUserCode()`.
**Example:**
```kotlin
// Adapted from ExpenseController.kt lines 82-84
// Budget domain requires UUID, not user code -- so resolve first
val currentYear = LocalDate.now().year
when {
    authentication().isAdmin() -> {
        when {
            request.queries.eventCode != null ->
                budgetAllocationService.findAllByEventCode(request.queries.eventCode)
            request.queries.personId != null -> {
                val personUuid = UUID.fromString(request.queries.personId)
                val year = request.queries.year ?: currentYear
                budgetAllocationService.findAllByPersonUuid(personUuid, year)
            }
            else -> emptyList()
        }
    }
    else -> {
        val person = personService.findByUserCode(authentication().name)
            ?: error("Cannot find person for current user")
        val year = request.queries.year ?: currentYear
        budgetAllocationService.findAllByPersonUuid(person.uuid, year)
    }
}
```

### Pattern 3: Authority Enum
**What:** Enum implementing `Authority` interface with `toName()` method
**When to use:** Every domain requiring access control
**Example:**
```kotlin
// Source: ExpenseAuthority.kt
package community.flock.eco.workday.application.budget

import community.flock.eco.workday.core.authorities.Authority

enum class BudgetAllocationAuthority : Authority {
    READ,
    WRITE,
    ADMIN,
}
```

### Pattern 4: Spring Configuration for Domain Services
**What:** `@Configuration` class that creates domain service beans, injecting persistence adapters
**When to use:** Wiring domain services (which are plain Kotlin classes, not Spring components) to Spring DI
**Example:**
```kotlin
// Source: ExpenseConfiguration.kt
@Configuration
class BudgetAllocationConfiguration {
    @Bean
    fun budgetAllocationService(
        repository: BudgetAllocationPersistenceAdapter,
        applicationEventPublisher: ApplicationEventPublisher,
    ) = BudgetAllocationService(
        budgetAllocationRepository = repository,
        applicationEventPublisher = applicationEventPublisher,
    )
    // ... similar for HackTime, StudyTime, StudyMoney services
}
```

### Pattern 5: Unified Response Type with Discriminator
**What:** Single wirespec response type with a `type` discriminator field and optional subtype-specific detail objects
**When to use:** Polymorphic domain models exposed via API
**Example:**
```
// Wirespec pattern from expenses.ws
type BudgetAllocation {
  id: Integer?,
  personId: String,
  eventCode: String?,
  date: String,
  description: String?,
  type: BudgetAllocationType,
  hackTimeDetails: HackTimeDetails?,
  studyTimeDetails: StudyTimeDetails?,
  studyMoneyDetails: StudyMoneyDetails?
}
```

### Pattern 6: File Upload Bypass
**What:** Manual `@PostMapping`/`@GetMapping` endpoints for file upload/download, outside wirespec
**When to use:** Multipart file operations (wirespec does not support `multipart/form-data`)
**Example:**
```kotlin
// Source: ExpenseController.kt lines 139-146
@PostMapping("/api/budget-allocations/files")
@PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")
fun postFiles(@RequestParam("file") file: MultipartFile): ResponseEntity<UUID> =
    documentService.storeDocument(file.bytes).toResponse()
```

### Anti-Patterns to Avoid
- **Don't add `findAllByPersonUserCode` to domain port:** The budget domain port uses UUID-based lookups. Resolve user code to UUID in the controller via `PersonService`, don't modify the domain layer.
- **Don't use `@RequestMapping` class-level annotation for wirespec controllers:** Wirespec generates full path in each endpoint; class-level mapping would create path conflicts.
- **Don't forget `suspend` keyword:** Wirespec handler methods are `suspend fun` -- missing this causes compilation failures.
- **Don't use `Long` id in wirespec:** Wirespec doesn't have a `Long` type. Use `Integer` (maps to Kotlin `Long`) or `String` (convert in controller). Check which wirespec type maps to Kotlin Long.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API type generation | Manual DTO classes | Wirespec `.ws` file + `npm run generate` | Type-safe contract between frontend and backend |
| File storage | Custom file handling | `DocumentStorage` interface (already exists) | Handles GCP and local storage transparently |
| Authority check | Manual role checking | `@PreAuthorize` + `Authority` enum | Spring Security integration, consistent with codebase |
| Person UUID resolution | Direct repository query | `PersonService.findByUserCode()` | Already exists, handles null cases |
| Media type detection | Custom MIME mapping | `MimeMappings.DEFAULT` + `MediaType.parseMediaType()` | Standard Spring pattern used in ExpenseController |

## Common Pitfalls

### Pitfall 1: Wirespec Type Naming Conflicts
**What goes wrong:** Wirespec-generated Kotlin types (e.g., `BudgetAllocation`) conflict with domain model class names
**Why it happens:** Both wirespec API models and domain models use the same natural names
**How to avoid:** Use type aliases in imports, exactly as ExpenseController does:
```kotlin
import community.flock.eco.workday.api.model.BudgetAllocation as BudgetAllocationApi
```
**Warning signs:** Compilation errors about ambiguous references

### Pitfall 2: Missing `suspend` on Handler Methods
**What goes wrong:** Compilation fails because wirespec generates `suspend fun` signatures
**Why it happens:** Kotlin controller methods are normally not suspending
**How to avoid:** Always mark wirespec handler overrides as `suspend`
**Warning signs:** "Function 'X' overrides nothing" compilation error

### Pitfall 3: Non-Admin User Code to UUID Resolution
**What goes wrong:** Non-admin GET requests fail because domain service requires UUID but controller has user code
**Why it happens:** Budget domain port only has `findAllByPersonUuid`, unlike Expense which has `findAllByPersonUserCode`
**How to avoid:** Inject `PersonService`, resolve user code to person entity, extract UUID. Handle null case (person not found).
**Warning signs:** NullPointerException or "Cannot find person" errors for non-admin users

### Pitfall 4: BigDecimal Precision in Wirespec Number Mapping
**What goes wrong:** StudyMoney `amount` field loses precision during API conversion
**Why it happens:** Wirespec `Number` type maps to Kotlin `Double` or similar, but domain uses `BigDecimal`
**How to avoid:** Use `BigDecimal(input.amount.toString())` in mapper, never `input.amount.toBigDecimal()`
**Warning signs:** Rounding errors in monetary values

### Pitfall 5: Forgetting to Run Both Wirespec Generators
**What goes wrong:** TypeScript types don't match Kotlin types, or Kotlin handler interfaces don't exist
**Why it happens:** Kotlin wirespec code is generated during Maven build; TypeScript requires separate `npm run generate`
**How to avoid:** After modifying `.ws` files: (1) rebuild Maven: `./mvnw clean install`, (2) run `npm run generate` from root
**Warning signs:** Missing imports for `community.flock.eco.workday.api.endpoint.*`

### Pitfall 6: Year Default Logic Location
**What goes wrong:** Year default behavior is implemented in the wrong layer
**Why it happens:** Temptation to add defaults in domain service or wirespec
**How to avoid:** Implement year default (`?: LocalDate.now().year`) in the controller only, keeping domain service pure
**Warning signs:** Domain service behaving differently depending on caller

### Pitfall 7: ContractInternal Wirespec vs Form Mismatch
**What goes wrong:** Adding fields to wirespec `ContractInternalForm` but not updating the Kotlin `ContractInternalForm` data class, or vice versa
**Why it happens:** The contract controller uses a separate Kotlin form class (not wirespec-generated) -- see `workday-application/src/main/kotlin/.../forms/ContractInternalForm.kt`
**How to avoid:** The Kotlin `ContractInternalForm` already has `studyHours` and `studyMoney` fields (added in Phase 4). Only the wirespec types need updating. The `ContractService` already passes these fields through. Verify the wirespec types match the Kotlin form.
**Warning signs:** Fields appear in TypeScript but not in API responses, or vice versa

## Code Examples

### Wirespec Budget Allocations Contract
```wirespec
// budget-allocations.ws - following expenses.ws pattern

endpoint BudgetAllocationAll GET /api/budget-allocations ? {
  personId: String?,
  year: Integer32?,
  eventCode: String?
} -> {
  200 -> BudgetAllocation[]
}

endpoint BudgetAllocationDeleteById DELETE /api/budget-allocations/{id: String} -> {
  204 -> Unit
  404 -> Error
}

endpoint HackTimeAllocationCreate POST HackTimeAllocationInput /api/budget-allocations/hack-time -> {
  200 -> BudgetAllocation
  500 -> Error
}

endpoint HackTimeAllocationUpdate PUT HackTimeAllocationInput /api/budget-allocations/hack-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}

endpoint StudyTimeAllocationCreate POST StudyTimeAllocationInput /api/budget-allocations/study-time -> {
  200 -> BudgetAllocation
  500 -> Error
}

endpoint StudyTimeAllocationUpdate PUT StudyTimeAllocationInput /api/budget-allocations/study-time/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}

endpoint StudyMoneyAllocationCreate POST StudyMoneyAllocationInput /api/budget-allocations/study-money -> {
  200 -> BudgetAllocation
  500 -> Error
}

endpoint StudyMoneyAllocationUpdate PUT StudyMoneyAllocationInput /api/budget-allocations/study-money/{id: String} -> {
  200 -> BudgetAllocation
  500 -> Error
}

type BudgetAllocation {
  id: String?,
  personId: String,
  eventCode: String?,
  date: String,
  description: String?,
  type: BudgetAllocationType,
  hackTimeDetails: HackTimeDetails?,
  studyTimeDetails: StudyTimeDetails?,
  studyMoneyDetails: StudyMoneyDetails?
}

enum BudgetAllocationType {
  HACK_TIME, STUDY_TIME, STUDY_MONEY
}

type HackTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}

type StudyTimeDetails {
  totalHours: Number,
  dailyAllocations: DailyTimeAllocationItem[]
}

type StudyMoneyDetails {
  amount: Number,
  files: BudgetAllocationFile[]
}

type DailyTimeAllocationItem {
  date: String,
  hours: Number,
  type: DailyAllocationType
}

enum DailyAllocationType {
  STUDY, HACK
}

type BudgetAllocationFile {
  name: String,
  file: UUID
}

type HackTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}

type StudyTimeAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  dailyAllocations: DailyTimeAllocationItem[]
}

type StudyMoneyAllocationInput {
  personId: UUID,
  eventCode: String?,
  date: String,
  description: String?,
  amount: Number,
  files: BudgetAllocationFile[]
}
```

### ContractInternal Wirespec Update
```wirespec
// contracts.ws - add to ContractInternalForm and ContractInternal types
type ContractInternalForm {
  personId: String?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  from: String?,
  to: String?,
  holidayHours: Integer32?,
  hackHours: Integer32?,
  billable: Boolean?,
  studyHours: Integer32?,    // NEW
  studyMoney: Number?        // NEW
}
type ContractInternal {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractInternalType?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  holidayHours: Integer32?,
  hackHours: Integer32?,
  billable: Boolean?,
  studyHours: Integer32?,    // NEW
  studyMoney: Number?        // NEW
}
```

### Domain-to-API Mapper (produce pattern)
```kotlin
// Source: adapted from ExpenseController.kt lines 205-219
private fun HackTimeBudgetAllocation.produce(): BudgetAllocationApi =
    BudgetAllocationApi(
        id = id.toString(),
        personId = person.uuid.toString(),
        eventCode = eventCode,
        date = date.toString(),
        description = description,
        type = BudgetAllocationTypeApi.HACK_TIME,
        hackTimeDetails = HackTimeDetails(
            totalHours = totalHours,
            dailyAllocations = dailyTimeAllocations.map { it.produce() },
        ),
        studyTimeDetails = null,
        studyMoneyDetails = null,
    )

private fun DailyTimeAllocation.produce(): DailyTimeAllocationItem =
    DailyTimeAllocationItem(
        date = date.toString(),
        hours = hours,
        type = when (type) {
            BudgetAllocationType.STUDY -> DailyAllocationType.STUDY
            BudgetAllocationType.HACK -> DailyAllocationType.HACK
        },
    )
```

### API-to-Domain Mapper (consume pattern)
```kotlin
// Source: adapted from ExpenseMapper.kt
@Component
class BudgetAllocationMapper(
    private val personService: PersonService,
) {
    fun consumeHackTime(input: HackTimeAllocationInput, id: Long? = null): HackTimeBudgetAllocation =
        HackTimeBudgetAllocation(
            id = id ?: 0,
            person = personService.findByUuid(UUID.fromString(input.personId.value))
                ?.toDomain()
                ?: error("Cannot find person"),
            eventCode = input.eventCode,
            date = LocalDate.parse(input.date),
            description = input.description,
            dailyTimeAllocations = input.dailyAllocations.map { it.consume() },
            totalHours = input.dailyAllocations.sumOf { it.hours },
        )
    // ... similar for StudyTime, StudyMoney
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `@RequestMapping` controllers (ContractController) | Wirespec-generated handler interfaces (ExpenseController) | Recent migration | New controllers MUST use wirespec pattern |
| `Principal` parameter for auth | `SecurityContextHolder.getContext().authentication` | ExpenseController pattern | Budget controller should use `authentication()` helper, not `Principal` |

**Important:** The ContractController still uses the old manual `@RequestMapping` pattern (not wirespec handlers). The budget allocation controller should follow the newer ExpenseController wirespec handler pattern instead.

## Open Questions

1. **Wirespec `Integer` vs `Integer32` for Long id**
   - What we know: Domain uses `Long` for budget allocation id. Wirespec has `Integer` and `Integer32` types. Expense uses `String` for ids.
   - What's unclear: Exact Kotlin type mapping for wirespec `Integer` vs `Integer32`. Using `String` for id and converting in controller (like Expense) is safest.
   - Recommendation: Use `String` for id in wirespec (consistent with Expense pattern), convert to/from `Long` in controller.

2. **PersonService dependency -- application model vs domain model**
   - What we know: `PersonService.findByUserCode()` returns `Person` from `community.flock.eco.workday.application.model` (application entity). `PersonService.findByUuid()` also returns application model Person. The mapper needs domain `Person`.
   - What's unclear: Exact conversion path from application `Person` to domain `Person`.
   - Recommendation: Use `.toDomain()` extension function (already exists per `ExpenseMapper` imports: `community.flock.eco.workday.application.mappers.toDomain`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | JUnit 5 + Spring Boot Test |
| Config file | Standard Maven Surefire plugin |
| Quick run command | `cd workday-application && ../mvnw test -pl . -Dtest=BudgetAllocationControllerTest -Pdevelop` |
| Full suite command | `./mvnw test -Pdevelop` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | GET /budget-allocations?personId=X&year=Y returns allocations | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testGetByPersonAndYear -Pdevelop` | No - Wave 0 |
| API-02 | GET /budget-allocations?eventCode=ABC returns event allocations | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testGetByEventCode -Pdevelop` | No - Wave 0 |
| API-03 | POST/PUT/DELETE study money allocations | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testStudyMoneyCrud -Pdevelop` | No - Wave 0 |
| API-04 | POST/PUT hack time and study time allocations | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testTimeAllocationCrud -Pdevelop` | No - Wave 0 |
| API-05 | Non-admin receives 403 on mutations | integration | `../mvnw test -pl workday-application -Dtest=BudgetAllocationControllerTest#testNonAdminForbidden -Pdevelop` | No - Wave 0 |
| CTR-02 | Wirespec generates TS types with studyHours/studyMoney | build verification | `npm run generate && test -f workday-application/src/main/react/wirespec/contracts.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd workday-application && ../mvnw test -pl . -Dtest=BudgetAllocationControllerTest -Pdevelop`
- **Per wave merge:** `./mvnw test -Pdevelop`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `workday-application/src/test/kotlin/.../budget/BudgetAllocationControllerTest.kt` -- covers API-01 through API-05
- [ ] Wirespec build verification -- covers CTR-02

## Sources

### Primary (HIGH confidence)
- `workday-application/src/main/wirespec/expenses.ws` - wirespec contract pattern
- `workday-application/src/main/kotlin/.../expense/ExpenseController.kt` - controller pattern, auth, handlers
- `workday-application/src/main/kotlin/.../expense/ExpenseAuthority.kt` - authority enum pattern
- `workday-application/src/main/kotlin/.../expense/ExpenseMapper.kt` - API<->domain mapping
- `workday-application/src/main/kotlin/.../expense/ExpenseConfiguration.kt` - Spring bean wiring
- `workday-application/src/main/wirespec/contracts.ws` - current ContractInternal types
- `workday-application/src/main/kotlin/.../forms/ContractInternalForm.kt` - Kotlin form (already has studyHours/studyMoney)
- `domain/src/main/kotlin/.../budget/BudgetAllocation.kt` - domain model
- `domain/src/main/kotlin/.../budget/*Service.kt` - domain services
- `domain/src/main/kotlin/.../budget/BudgetAllocationPersistencePort.kt` - persistence port interface
- `workday-application/src/main/kotlin/.../controllers/Util.kt` - `isAssociatedWith`, `produce` UUID helper
- `workday-application/src/main/kotlin/.../services/DocumentStorage.kt` - file upload interface
- `workday-application/src/main/kotlin/.../services/PersonService.kt` - person lookup by user code

### Secondary (MEDIUM confidence)
- `package.json` - wirespec version 0.17.8, `npm run generate` command

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all patterns verified from existing codebase
- Architecture: HIGH - exact template exists in Expense domain
- Pitfalls: HIGH - identified from actual code differences between Expense and Budget domains (e.g., missing `findAllByPersonUserCode`)

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable codebase patterns)
