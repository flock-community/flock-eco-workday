# Architecture

**Analysis Date:** 2026-02-28

## Pattern Overview

**Overall:** Modular Spring Boot application with React SPA frontend

**Key Characteristics:**
- Multi-module Maven project with vendored dependencies
- Type-safe API contracts via Wirespec
- Backend: Spring Boot (Kotlin) + JPA + Spring Security
- Frontend: React + Material-UI + React Router
- Clear separation between business logic (workday-application) and vendored utilities (workday-core, workday-user)

## Layers

**Presentation Layer (Frontend):**
- Purpose: React-based SPA providing UI for workforce management
- Location: `workday-application/src/main/react/`
- Contains: React components, feature modules, API clients, routing
- Depends on: Backend REST API, shared components from `@workday-core` and `@workday-user`
- Used by: End users (browser)
- Pattern: Feature-based organization with shared components

**API Layer (Controllers):**
- Purpose: HTTP endpoints exposing backend functionality
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/controllers/`
- Contains: REST controllers annotated with `@RestController`, Wirespec-generated endpoints
- Depends on: Service layer, Spring Security, Wirespec integration
- Used by: Frontend clients, external integrations
- Pattern: RESTful with `/api/*` prefix, method-level security annotations

**Service Layer:**
- Purpose: Business logic and orchestration
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/`
- Contains: Service classes annotated with `@Service`, business rules, data transformations
- Depends on: Repository layer, external services (email, storage), domain models
- Used by: Controllers
- Pattern: Transactional services with constructor-based dependency injection

**Domain Layer:**
- Purpose: Core business entities and value objects
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/`
- Contains: JPA entities, enums, domain objects
- Depends on: JPA annotations, vendored core utilities
- Used by: Services, repositories, controllers
- Pattern: Rich domain models with JPA mapping

**Data Access Layer (Repositories):**
- Purpose: Database operations and query abstraction
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/repository/`
- Contains: Spring Data JPA repositories extending `JpaRepository`
- Depends on: Domain models, Spring Data JPA
- Used by: Services
- Pattern: Interface-based repositories with query methods and `@Query` annotations

**Vendored Utility Modules:**

**workday-core:**
- Purpose: Shared cross-cutting utilities (frozen module, no business logic)
- Location: `workday-core/src/main/kotlin/community/flock/eco/workday/core/`
- Contains: Base classes, utilities, exceptions, events, React component library
- Depends on: Spring Boot, React (frontend)
- Used by: workday-application
- Pattern: Foundation layer with stable interfaces

**workday-user:**
- Purpose: Authentication and user management (frozen module, no business logic)
- Location: `workday-user/src/main/kotlin/community/flock/eco/workday/user/`
- Contains: User entities, security config, OAuth/password authentication, user management UI
- Depends on: workday-core, Spring Security
- Used by: workday-application
- Pattern: Self-contained auth subsystem

## Data Flow

**User Request Flow:**

1. Browser sends request to React app at `localhost:3000` (Vite dev server)
2. React Router matches route and renders feature component
3. Feature component calls API client (e.g., `PersonClient.findAll()`)
4. API client sends HTTP request to backend at `/api/*` (proxied to `:8080` in dev)
5. Spring Security intercepts request, validates authentication
6. Controller receives request, validates via `@PreAuthorize` annotations
7. Controller delegates to Service layer
8. Service executes business logic, calls Repository
9. Repository queries database (H2 in dev, PostgreSQL in production)
10. Service transforms domain entities using mappers/forms
11. Controller serializes response (via Wirespec or Jackson)
12. API client receives response, transforms dates using `internalize()`
13. React component updates state and re-renders UI

**Wirespec Type-Safe Flow:**

1. Developer defines API contract in `.ws` files at `workday-application/src/main/wirespec/`
2. `npm run generate` generates TypeScript types to `workday-application/src/main/react/wirespec/`
3. Maven build generates Kotlin types to `target/generated-sources/`
4. Controllers implement Wirespec endpoints with type-safe request/response
5. Frontend consumes generated TypeScript types for compile-time safety

**State Management:**
- No global state library (Redux/MobX)
- React hooks for local state
- `StatusHook` stores login status and current person context
- Context passed via HTTP headers (`Context-Person-Id`)

## Key Abstractions

**Person:**
- Purpose: Represents workforce member (employee/contractor)
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Person.kt`
- Pattern: JPA entity with UUID as external identifier, linked to User for authentication

**Contract:**
- Purpose: Represents employment agreement
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Contract.kt`, `ContractInternal.kt`, `ContractExternal.kt`, `ContractManagement.kt`
- Pattern: Abstract base class with type-specific subclasses (inheritance hierarchy)

**Assignment:**
- Purpose: Links Person to Client/Project with time period
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/Assignment.kt`
- Pattern: Association entity with temporal validity

**Day (WorkDay, LeaveDay, SickDay):**
- Purpose: Time tracking for different activity types
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/WorkDay.kt`
- Pattern: Type-specific entities sharing common time-tracking fields

**Expense:**
- Purpose: Represents reimbursable costs
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/`
- Pattern: Separate subpackage with dedicated configuration

**Form Objects:**
- Purpose: Input DTOs for API operations
- Examples: `workday-application/src/main/kotlin/community/flock/eco/workday/application/forms/PersonForm.kt`
- Pattern: Data transfer objects separate from domain entities

**User vs Person:**
- User: Authentication identity (in `workday-user`)
- Person: Business entity representing workforce member
- Relationship: Person optionally references User (one-to-one)

## Entry Points

**Frontend Entry Point:**
- Location: `workday-application/src/main/react/index.jsx`
- Triggers: Browser loads page
- Responsibilities: Mounts React app, sets up global fetch interceptor for context headers

**Backend Entry Point:**
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/Application.kt`
- Triggers: Maven/Spring Boot run
- Responsibilities: Bootstraps Spring context, enables web security, imports configurations

**Application Configuration:**
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/ApplicationConfiguration.kt`
- Triggers: Spring context initialization
- Responsibilities: Component scanning, JPA setup, imports UserConfiguration and ExpenseConfiguration

**Security Configuration:**
- Location: `workday-application/src/main/kotlin/community/flock/eco/workday/application/config/WebSecurityConfig.kt`
- Triggers: Spring Security initialization
- Responsibilities: Configures authentication (TEST/DATABASE/GOOGLE based on property), authorizes endpoints

**Development Data Loading:**
- Location: `workday-application/src/develop/kotlin/community/flock/eco/workday/application/mocks/LoadData.kt`
- Triggers: Application startup with `-Pdevelop` profile
- Responsibilities: Seeds test data for local development

## Error Handling

**Strategy:** Layered exception handling with HTTP status mapping

**Patterns:**
- Controllers use `ResponseEntity.toResponse()` extension to handle Optional → 404
- Spring Security throws `ResponseStatusException` for authorization failures
- Service layer throws domain exceptions (vendored from `workday-core/exceptions`)
- Frontend `ErrorBoundary` catches React errors
- Frontend `ErrorHook` manages error notification stack

**Authorization:**
- Method-level: `@PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")`
- Authorities defined in `workday-application/src/main/kotlin/community/flock/eco/workday/application/authorities/`
- User authorities checked via `UserAuthorityUtil.setAuthorities()` in frontend

## Cross-Cutting Concerns

**Logging:** Spring Boot default logging (configurable via `application.properties`)

**Validation:**
- Backend: Form objects with validation annotations
- Frontend: Formik + Yup schemas

**Authentication:**
- Three modes: TEST (auto-login), DATABASE (username/password), GOOGLE (OAuth2)
- Configured via `flock.eco.workday.login` property
- Managed by `UserSecurityService` in `workday-user` module

**Authorization:**
- Spring Security method security enabled
- Authority-based access control
- Authorities: `PersonAuthority.ADMIN`, `ClientAuthority.READ`, etc.

**Database Migration:**
- Liquibase changelogs in `workday-application/src/main/database/db/changelog/`
- Versioned schema changes (e.g., `db.changelog-001-init.yaml`)
- Generated diffs via `liquibase:diff` Maven goal

**Session Management:**
- JDBC-based sessions (`spring-session-jdbc`)
- Session table: `spring_session` (created by Spring Session)

**Frontend Build:**
- Development: Vite dev server on port 3000, proxies `/api` to `:8080`
- Production: `npm run build` outputs to `workday-application/target/classes/static/`
- Spring Boot serves static assets from classpath

**TypeScript Path Aliases:**
- `@workday-core` → `workday-core/src/main/react/`
- `@workday-user` → `workday-user/src/main/react/`
- Configured in `tsconfig.json` and `vite.config.ts`

**API Contract Generation:**
- Wirespec contracts in `workday-application/src/main/wirespec/*.ws`
- TypeScript: `npm run generate`
- Kotlin: Auto-generated during Maven build to `target/generated-sources/`

---

*Architecture analysis: 2026-02-28*
