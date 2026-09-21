# CLAUDE.md

This file provides AI-specific guidance when working with the Flock Workday codebase. For comprehensive documentation, build commands, and setup instructions, see `readme.md`.

## Project Context

**Flock Workday** is a standalone workforce management application. Recently migrated from being a dependent sub-project of flock-eco to a fully independent multi-module Maven project.

**Key architectural decision**: All dependencies from flock-eco have been vendored into `workday-core` and `workday-user` modules for complete independence.

## Module Architecture

```
domain/                 # Domain model, <slice>/domain per slice plus common, no frameworks or libraries
workday-core/           # Vendored utilities (DO NOT add business logic here)
workday-user/           # Vendored auth/user management (DO NOT add business logic here)
workday-application/    # ALL business logic goes here
```

**Important**: `workday-core` and `workday-user` are frozen vendored modules. New features always go in `workday-application`.

### Architecture rules (byterails)
- The application is cut into slices, named on the byterails plugin in the parent `pom.xml`: assignment, client, contract, event, expense, laptop, leaveday, person, project, sickday, user, workday. A slice is a package under `community.flock.eco.workday`; its domain model lives in `community.flock.eco.workday.<slice>.domain` in the `domain` module, the shared kernel (approval status, documents, pages, periods, ports) in `community.flock.eco.workday.common`.
- `byterails.kts` at the repository root is the whitelist of what every package may reference; [byterails](https://github.com/flock-community/byterails) checks it on the compiled classes of every module in the `process-classes` phase (so `./mvnw package` and CI run it) and fails the build on a violation. The report of each module is in `target/byterails/violations.json`.
- Every `<slice>.domain` and `common` is isolated: plain Kotlin referencing only `kotlin`, `java.lang`, `java.util`, `java.time`, `java.math`, `java.text`, `common` and the domains of the reference slices it names (user, person, client, project, assignment). No JPA, Spring, Jackson or any other library, and never a slice that records work (workday, leaveday, sickday, event, expense, laptop, contract).
- Inside `workday-application` the layering is enforced: controllers never touch a repository or JPA, repositories see only the entities, mappers only entities and the domains, only `migrations` talks to Liquibase. JPA entities stay in `application/model` (expense entities in `application/expense`); `application/mappers` converts them with `toDomain()`.
- When the build fails on a new reference, add an `allow` to `byterails.kts` only if the dependency fits the layering; otherwise move the code. Never extend the `// TODO` allows (existing shortcuts) and never put a library allow at the `application` root unless every layer may use it. A new slice is a `<slice>` in the pom plus its `pkg("<slice>.domain") { domain(...) }` in the rules file.

## Key Conventions & Patterns

### Package Structure
- `community.flock.eco.workday.core.*` - Core utilities (vendored, avoid modifying)
- `community.flock.eco.workday.user.*` - User/auth (vendored, avoid modifying)
- `community.flock.eco.workday.*` - Application code (this is where work happens)

### API Pattern: Wirespec
- Contract definitions: `workday-application/src/main/wirespec/*.ws`
- After modifying `.ws` files, run: `npm run generate` (TypeScript) and rebuild (Kotlin auto-generates)
- Wirespec ensures type safety between frontend and backend

### Frontend Import Aliases
- `@workday-core` → `workday-core/src/main/react/*`
- `@workday-user` → `workday-user/src/main/react/*`
- Use these aliases, not relative paths like `../../../`

### Development Profile
- Always use `-Pdevelop` profile for local development
- Loads test data from `workday-application/src/develop/kotlin`
- Uses H2 database at `./database/db`
- Test users available (see `readme.md` for credentials)

## Important Gotchas

### Frontend Configuration Location
- `package.json`, `tsconfig.json`, `webpack.config.js` are at **ROOT**, not in workday-application
- Run all npm commands from root: `npm start`, `npm test`, etc.
- This is required for TypeScript to resolve modules across all three Maven modules

### Build Order Matters
- Modules build in order: workday-core → workday-user → workday-application
- If you modify workday-core or workday-user, rebuild from root: `./mvnw clean install`

### Database Migrations
- Liquibase changelogs in `workday-application/src/main/database/`
- When entities change: `cd workday-application && ../mvnw clean compile liquibase:update liquibase:diff`
- User-related migrations exist in workday-user (vendored, don't modify)

## Finding Things

### Backend Code
- Controllers/Services: `workday-application/src/main/kotlin/community/flock/eco/workday/`
- Domain models: `domain/src/main/kotlin/community/flock/eco/workday/<slice>/domain/` (assignment, client, contract, event, expense, laptop, leaveday, person, project, sickday, user, workday); shared kernel in `domain/src/main/kotlin/community/flock/eco/workday/common/`
- JPA entities: `workday-application/src/main/kotlin/community/flock/eco/workday/application/model/` (expense entities live in `application/expense/`)
- Security config: `workday-user/src/main/kotlin/.../config/`

### Frontend Code
- Application UI: `workday-application/src/main/react/`
- Shared components: `workday-core/src/main/react/components/`
- User management UI: `workday-user/src/main/react/user/`

### Configuration
- Dev config: `workday-application/src/main/resources/application-develop.properties`
- Cloud config: `workday-application/src/main/resources/application-cloud.properties`

## Testing Context

### Playwright Tests
- Location: `tests/` directory (project root)
- Results: `test-results/` directory
- **Important**: Always use Playwright MCP to debug tests. Do not write debug tests manually.
- Always check `test-results/` for latest test status before modifying tests

### Jest Tests
- Run from root: `npm test`
- Uses same TypeScript path mappings as application

## Current Work Status

Currently working on: Creating Playwright tests for user with admin role.

## Quick Reference

For detailed commands, see `readme.md`. Most common:
- Build all: `./mvnw clean install` (from root)
- Run backend: `cd workday-application && ../mvnw spring-boot:run -Pdevelop`
- Run frontend: `npm start` (from root)
- Generate API types: `npm run generate` (from root)

## Migration Notes

This codebase was recently restructured (see `planning.md` for full details):
- **Old**: Inherited from flock-eco-parent and flock-eco-application-parent POMs
- **New**: Fully standalone with vendored dependencies
- **Result**: No external flock-eco dependencies; all code self-contained

When you see references to `flock.eco.core` or `flock.eco.feature.user` in old documentation, these are now `workday-core` and `workday-user`.