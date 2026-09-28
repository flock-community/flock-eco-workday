# CLAUDE.md

This file provides AI-specific guidance when working with the Flock Workday codebase. For comprehensive documentation, build commands, and setup instructions, see `readme.md`.

## Project Context

**Flock Workday** is a standalone workforce management application. Recently migrated from being a dependent sub-project of flock-eco to a fully independent multi-module Maven project.

**Key architectural decision**: All dependencies from flock-eco have been vendored into `workday-core` and `workday-user` modules for complete independence.

## Module Architecture

```
workday-core/           # Vendored utilities (DO NOT add business logic here)
workday-user/           # Vendored auth/user management (DO NOT add business logic here)
workday-application/    # ALL business logic goes here
```

**Important**: `workday-core` and `workday-user` are frozen vendored modules. New features always go in `workday-application`.

## Key Conventions & Patterns

### Package Structure
- `community.flock.eco.workday.core.*` - Core utilities (vendored, avoid modifying)
- `community.flock.eco.workday.user.*` - User/auth (vendored, avoid modifying)
- `community.flock.eco.workday.*` - Application code (this is where work happens)

### Architecture Rules (byterails)
- `workday-application` is checked on bytecode by byterails in `process-classes`, so every `./mvnw compile|test|package` enforces it
- Rules: `byterails.kts` at the root plus the `kotlin` and `hexagonal` default rule sets on the plugin in `workday-application/pom.xml`
- `community.flock.eco.workday.domain` is isolated: only `kotlin`, `java.lang`, `java.util`, `java.time`, `java.math`, `java.text` and the domain itself. No Spring, JPA, `workday-core` or `workday-user` types in the domain; adapters in `application` bridge them (e.g. `application.utils.PageMappers`, `ApplicationEventPublisherConfiguration`)
- The domain has one package per functional slice: `common`, `user`, `person`, `client`, `project`, `assignment`, `contract`, `workday`, `leaveday`, `sickday`, `event`, `expense`, `laptop`, `budget`, `todo`. Each is declared in `byterails.kts` with the slices it may use; a slice cannot reach any other. A new slice is a new `slice("name", ...)` line there
- Domain classes are plain data classes mapped from the JPA entities by `toDomain()` extensions in `application.mappers` (one file per slice); `aggregation` stays an application read model
- `-Dbyterails.reportOnly=true` lists violations without failing; `-Dbyterails.skip=true` skips the check

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
- Domain models: Look in domain-specific packages (e.g., `assignment/`, `expense/`, `person/`)
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