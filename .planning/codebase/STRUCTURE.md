# Codebase Structure

**Analysis Date:** 2026-02-28

## Directory Layout

```
flock-eco-workday/
├── workday-application/       # Main business logic module
│   ├── src/main/
│   │   ├── kotlin/            # Backend application code
│   │   ├── react/             # Frontend application code
│   │   ├── resources/         # Spring Boot config
│   │   ├── wirespec/          # API contract definitions
│   │   └── database/          # Liquibase migrations
│   ├── src/develop/           # Development data fixtures
│   └── src/test/              # Backend tests
├── workday-core/              # Vendored utilities (frozen)
│   └── src/main/
│       ├── kotlin/            # Shared backend utilities
│       └── react/             # Shared React components
├── workday-user/              # Vendored auth module (frozen)
│   └── src/main/
│       ├── kotlin/            # User/auth backend
│       └── react/             # User management UI
├── domain/                    # Empty placeholder module
├── tests/                     # Playwright E2E tests
├── database/                  # Local H2 database files
├── terraform/                 # Infrastructure as code
├── docs/                      # Documentation
├── package.json               # Frontend dependencies (ROOT)
├── tsconfig.json              # TypeScript config (ROOT)
├── vite.config.ts             # Frontend build config (ROOT)
├── pom.xml                    # Parent Maven config
└── .planning/                 # GSD planning artifacts
```

## Directory Purposes

**workday-application/:**
- Purpose: All business logic for Flock Workday
- Contains: REST controllers, services, domain models, repositories, React features, Wirespec contracts
- Key files: `Application.kt` (entry point), `ApplicationConfiguration.kt`

**workday-application/src/main/kotlin/community/flock/eco/workday/application/:**
- Purpose: Backend application code (Kotlin)
- Contains:
  - `controllers/` - REST endpoints
  - `services/` - Business logic
  - `model/` - Domain entities
  - `repository/` - JPA repositories
  - `forms/` - Input DTOs
  - `authorities/` - Security authorities
  - `config/` - Spring configuration
  - `expense/` - Expense feature module
  - `exactonline/` - ExactOnline integration
  - `google/` - Google Drive/Sheets integration
  - `mappers/` - DTO transformations
  - `utils/` - Helpers

**workday-application/src/main/react/:**
- Purpose: Frontend application code (React + TypeScript)
- Contains:
  - `application/` - App shell, layout, routing
  - `features/` - Feature modules (person, expense, contract, etc.)
  - `clients/` - API client wrappers
  - `components/` - Shared components
  - `hooks/` - Custom React hooks
  - `utils/` - Frontend utilities
  - `theme/` - Material-UI theme
  - `wirespec/` - Generated TypeScript types
- Key files: `index.jsx` (entry point), `Application.tsx`

**workday-application/src/main/wirespec/:**
- Purpose: Type-safe API contract definitions
- Contains: `.ws` files defining endpoints and types
- Key files: `persons.ws`, `expenses.ws`, `assignments.ws`, etc.

**workday-application/src/main/resources/:**
- Purpose: Spring Boot configuration
- Contains:
  - `application.properties` - Base config
  - `application-develop.properties` - Dev profile (H2 database)
  - `application-gcp.properties` - Production profile (Cloud SQL)
  - `application-docker.properties` - Docker deployment
  - `application-ci.properties` - CI environment

**workday-application/src/main/database/:**
- Purpose: Database schema management
- Contains: Liquibase changelogs
- Key files: `db/changelog/db.changelog-master.yaml`, versioned change files

**workday-application/src/develop/:**
- Purpose: Development fixtures and test data
- Contains: `kotlin/community/flock/eco/workday/application/mocks/` - Data loading classes
- Used by: `-Pdevelop` Maven profile

**workday-core/:**
- Purpose: Vendored shared utilities (DO NOT modify for business logic)
- Contains:
  - `src/main/kotlin/.../core/` - Base classes, exceptions, events, utilities
  - `src/main/react/` - Shared React components (dialogs, loaders, etc.)
- Key files: `AbstractIdEntity.kt`, `AlignedLoader.tsx`

**workday-user/:**
- Purpose: Vendored auth/user management (DO NOT modify for business logic)
- Contains:
  - `src/main/kotlin/.../user/` - User entities, security, OAuth config
  - `src/main/react/` - User management UI
  - `src/main/database/` - User schema migrations
- Key files: `UserSecurityService.kt`, `UserConfiguration.kt`

**tests/:**
- Purpose: End-to-end Playwright tests
- Contains: Test specs, fixtures, test results
- Run via: `npm run test:e2e`

**database/:**
- Purpose: Local H2 database storage
- Contains: `db.mv.db` (H2 database file)
- Location configured in: `application-develop.properties`

**terraform/:**
- Purpose: Google Cloud Platform infrastructure
- Contains: Terraform configs for GCP deployment

**docs/:**
- Purpose: Project documentation and planning
- Contains: Design docs, migration notes, plans

**Root config files:**
- `package.json` - NPM dependencies and scripts (frontend)
- `tsconfig.json` - TypeScript compiler config
- `vite.config.ts` - Vite build and dev server config
- `pom.xml` - Maven parent config (backend)
- `biome.json` - Code formatter/linter config
- `jest.config.cjs` - Jest test runner config
- `playwright.config.ts` - Playwright E2E test config

## Key File Locations

**Entry Points:**
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/Application.kt`: Spring Boot main
- `workday-application/src/main/react/index.jsx`: React app mount point
- `workday-application/src/main/react/application/Application.tsx`: React root component

**Configuration:**
- `workday-application/src/main/resources/application-develop.properties`: Dev config (H2, port 8080)
- `workday-application/src/main/resources/application-gcp.properties`: Production config (Cloud SQL)
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/config/WebSecurityConfig.kt`: Security config
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/ApplicationConfiguration.kt`: Spring config
- `tsconfig.json`: TypeScript path aliases
- `vite.config.ts`: Dev server proxy, build output

**Core Logic:**
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/PersonService.kt`: Person management
- `workday-application/src/main/kotlin/community/flock/eco/workday/application/controllers/PersonController.kt`: Person API
- `workday-application/src/main/react/features/person/`: Person UI feature
- `workday-application/src/main/react/clients/PersonClient.ts`: Person API client

**Testing:**
- `workday-application/src/test/kotlin/`: Backend unit/integration tests
- `tests/`: Frontend E2E tests (Playwright)
- `jest.config.cjs`: Frontend unit test config

**Database:**
- `workday-application/src/main/database/db/changelog/`: Liquibase migrations
- `database/db.mv.db`: Local H2 database file

## Naming Conventions

**Files:**
- Kotlin: PascalCase with suffix - `PersonService.kt`, `PersonController.kt`, `PersonRepository.kt`
- TypeScript: PascalCase for components - `PersonFeature.tsx`, `Application.tsx`
- TypeScript: PascalCase for types/clients - `PersonClient.ts`
- Wirespec: kebab-case - `persons.ws`, `leave-days.ws`
- Config: kebab-case - `application-develop.properties`, `db.changelog-001-init.yaml`

**Directories:**
- Kotlin packages: lowercase - `controllers`, `services`, `model`
- React features: lowercase - `features/person`, `features/expense`
- Shared components: lowercase - `components/tables`, `components/fields`

**Classes/Types:**
- Controllers: `*Controller` - `PersonController`, `AssignmentController`
- Services: `*Service` - `PersonService`, `ContractService`
- Repositories: `*Repository` - `PersonRepository`, `ContractRepository`
- Models: Entity name - `Person`, `Contract`, `Assignment`
- Forms: `*Form` - `PersonForm`, `ContractForm`
- Authorities: `*Authority` - `PersonAuthority`, `ClientAuthority`

**Variables:**
- Kotlin: camelCase - `personService`, `userRepository`
- TypeScript: camelCase - `personClient`, `useLoginStatus`
- React hooks: `use*` prefix - `useError`, `useLoginStatus`

**Constants:**
- Kotlin: UPPER_SNAKE_CASE - `SWAGGER_WHITELIST`, `EXT_WHITELIST`
- TypeScript: UPPER_SNAKE_CASE - `ISO_8601_DATE`

## Where to Add New Code

**New Feature:**
- Backend:
  - Controller: `workday-application/src/main/kotlin/.../application/controllers/`
  - Service: `workday-application/src/main/kotlin/.../application/services/`
  - Repository: `workday-application/src/main/kotlin/.../application/repository/`
  - Model: `workday-application/src/main/kotlin/.../application/model/`
  - Wirespec: `workday-application/src/main/wirespec/<feature>.ws`
- Frontend:
  - Feature module: `workday-application/src/main/react/features/<feature>/`
  - API client: `workday-application/src/main/react/clients/<Feature>Client.ts`
  - Route: Add to `workday-application/src/main/react/application/AuthenticatedApplication.tsx`
- Database:
  - Migration: `workday-application/src/main/database/db/changelog/db.changelog-<NNN>-<description>.yaml`
  - Update master: Reference in `db.changelog-master.yaml`
- Tests:
  - Backend: `workday-application/src/test/kotlin/`
  - E2E: `tests/<feature>.spec.ts`

**New Component/Module:**
- Backend module (if complex): Create subpackage under `workday-application/src/main/kotlin/.../application/`
  - Example: `expense/` has `ExpenseController.kt`, `ExpenseRepository.kt`, `ExpenseConfiguration.kt`
- Frontend component:
  - Feature-specific: `workday-application/src/main/react/features/<feature>/`
  - Shared: `workday-application/src/main/react/components/<component>/`
  - Shared across modules: `workday-core/src/main/react/components/` (only if truly reusable)

**Utilities:**
- Backend:
  - Application-specific: `workday-application/src/main/kotlin/.../application/utils/`
  - Cross-cutting (RARE): `workday-core/src/main/kotlin/.../core/utils/` (only if needed by multiple modules)
- Frontend:
  - Application-specific: `workday-application/src/main/react/utils/`
  - Shared: `workday-core/src/main/react/` (only if truly reusable)

**Configuration:**
- Spring config class: `workday-application/src/main/kotlin/.../application/config/`
- Properties: Add to `workday-application/src/main/resources/application.properties` or profile-specific files
- TypeScript: `tsconfig.json` (root)
- Vite: `vite.config.ts` (root)

**Authentication/Authorization:**
- Add authority: `workday-application/src/main/kotlin/.../application/authorities/<Feature>Authority.kt`
- Security rules: `workday-application/src/main/kotlin/.../application/config/WebSecurityConfig.kt`
- DO NOT modify `workday-user/` for app-specific auth logic

## Special Directories

**workday-application/target/:**
- Purpose: Maven build output
- Generated: Yes (on `./mvnw compile` or `install`)
- Committed: No
- Contains: Compiled classes, Wirespec-generated Kotlin code, packaged JAR

**workday-application/src/main/react/wirespec/:**
- Purpose: TypeScript types generated from Wirespec
- Generated: Yes (on `npm run generate`)
- Committed: No (ignored via `.gitignore`)
- Contains: Type definitions matching backend contracts

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (on `npm install`)
- Committed: No
- Location: Root directory

**database/:**
- Purpose: Local development database
- Generated: Yes (on first run with `-Pdevelop`)
- Committed: No
- Contains: H2 database file `db.mv.db`

**test-results/:**
- Purpose: Playwright test outputs
- Generated: Yes (on `npm run test:e2e`)
- Committed: No
- Contains: Test reports, screenshots, videos

**.planning/:**
- Purpose: GSD command planning artifacts
- Generated: Yes (by GSD commands)
- Committed: Yes
- Contains: Phase plans, codebase analysis docs

**workday-application/target/classes/static/:**
- Purpose: Production frontend build output
- Generated: Yes (on `npm run build`)
- Committed: No
- Contains: Bundled JS, CSS, assets served by Spring Boot

## Import Path Resolution

**Backend (Kotlin):**
- Application code: `community.flock.eco.workday.application.*`
- Core utilities: `community.flock.eco.workday.core.*`
- User/auth: `community.flock.eco.workday.user.*`
- Wirespec generated: `community.flock.eco.workday.api.*`

**Frontend (TypeScript):**
- Application code: Relative imports from `workday-application/src/main/react/`
- Core components: `@workday-core` or `@workday-core/components/*`
- User components: `@workday-user` or `@workday-user/user/*`
- API types: `../wirespec/*` (generated, local to workday-application)

## Module Build Order

Maven builds in this order (defined in parent `pom.xml`):
1. `workday-core` (no dependencies)
2. `workday-user` (depends on workday-core)
3. `domain` (empty placeholder)
4. `workday-application` (depends on workday-core, workday-user, domain)

If modifying `workday-core` or `workday-user`, rebuild from root: `./mvnw clean install`

## Package Structure Pattern

**Backend (by-feature organization):**
```
community.flock.eco.workday.application/
├── controllers/        # All controllers together
├── services/          # All services together
├── repository/        # All repositories together
├── model/             # All domain entities together
├── forms/             # All input DTOs together
└── expense/           # Exception: expense is self-contained
    ├── ExpenseController.kt
    ├── ExpenseRepository.kt
    └── ExpenseConfiguration.kt
```

**Frontend (by-feature organization):**
```
workday-application/src/main/react/
├── features/
│   ├── person/        # Person feature (all person UI)
│   ├── expense/       # Expense feature (all expense UI)
│   └── contract/      # Contract feature (all contract UI)
├── clients/           # All API clients together
└── components/        # Shared components
```

---

*Structure analysis: 2026-02-28*
