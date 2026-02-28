# Technology Stack

**Analysis Date:** 2026-02-28

## Languages

**Primary:**
- Kotlin 1.9.22 - Backend application code, services, controllers, and domain models
- TypeScript 5.2.2 - Frontend React application

**Secondary:**
- Java 17 - Runtime target for Kotlin compilation, Spring Boot framework requirement

## Runtime

**Environment:**
- JVM - Java 17 (Eclipse Temurin 17-jre in production containers)
- Node.js v18.20.4 (specified in `.nvmrc`)

**Package Manager:**
- Maven 3.x - JVM dependency management and build orchestration
- npm 10.8.2 - Frontend dependency management
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Spring Boot 3.4.13 - Backend web framework and dependency injection
- React 19.0.0 - Frontend UI library
- Spring Cloud GCP 5.12.3 - Google Cloud Platform integration

**UI Components:**
- Material-UI (MUI) 7.0.0 - Component library (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`)
- Formik 2.2.6 with formik-mui 5.0.0-alpha.0 - Form handling and validation
- React Router DOM 5.3.4 - Client-side routing
- Recharts 2.0.3 - Data visualization

**Testing:**
- Jest 29.7.0 - Unit testing framework
- Playwright 1.52.0 - End-to-end testing
- Spring Boot Test - Backend integration testing
- React Testing Library 16.0.0 - Frontend component testing

**Build/Dev:**
- Vite 5.0.10 - Frontend build tool and dev server
- Maven - Backend build tool
- Wirespec 0.17.8 - API contract-first code generation (Kotlin and TypeScript)
- Liquibase 5.0.1 - Database schema migrations
- Jib 3.4.4 - Containerization (builds Docker images without Docker daemon)

**Code Quality:**
- Biome 2.3.10 - Linting and formatting for JavaScript/TypeScript
- Spotless 3.1.0 - Code formatting for Kotlin
- KtLint (via Spotless) - Kotlin style enforcement
- Husky 8.0.3 - Git hooks management
- lint-staged 13.1.2 - Run linters on staged files

## Key Dependencies

**Critical:**
- Wirespec 0.17.8 - Ensures type-safe API contracts between frontend and backend via `.ws` definition files
- Spring Data JPA - ORM layer for database access
- Spring Security OAuth2 Client - Authentication and authorization
- spring-session-jdbc - Distributed session management

**Infrastructure:**
- H2 2.3.232 - Development database (in-memory/file-based)
- PostgreSQL Driver - Production database (via Spring Cloud GCP SQL)
- Google Cloud Storage - Document/file storage service
- Google API Drive v3-rev20251210-2.0.0 - Drive API integration
- Google API Sheets v4-rev20251110-2.0.0 - Sheets API integration
- Mailjet 5.1.1 - Transactional email service
- biweekly 0.6.7 - iCalendar parsing and generation

**Supporting:**
- Jackson (via Wirespec) - JSON serialization
- dayjs 1.11.1 - Date/time manipulation
- kotlinx-coroutines-reactor - Reactive programming support
- styled-components 6.1.0 - CSS-in-JS styling
- sass 1.69.4 - CSS preprocessing
- yup 0.27.0 - Schema validation

## Configuration

**Environment:**
- Profile-based configuration via Spring Boot properties files:
  - `application.properties` - Base configuration
  - `application-develop.properties` - Local development (H2 database, test data)
  - `application-gcp.properties` - Google Cloud Platform deployment
  - `application-docker.properties` - Docker compose environment
  - `application-ci.properties` - Continuous integration
- Key configs required for production (GCP profile):
  - `GOOGLE_APPLICATION_CREDENTIALS` - GCP service account credentials path
  - `GCP_SQL_DATABASE_NAME`, `GCP_SQL_INSTANCE_CONNECTION_NAME` - Database connection
  - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` - Database credentials
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth2 authentication
  - `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE` - Mailjet email service
  - `EXACTONLINE_CLIENT_ID`, `EXACTONLINE_CLIENT_SECRET` - ExactOnline integration
  - `WORKDAY_CALENDAR_TOKEN`, `WORKDAY_BUCKET_DOCUMENTS` - Application-specific config

**Build:**
- `pom.xml` - Parent POM at root, module POMs in `workday-application/`, `workday-core/`, `workday-user/`
- `package.json` - Root-level npm configuration
- `tsconfig.json` - TypeScript compiler configuration with path aliases
- `vite.config.ts` - Frontend build and dev server configuration
- `biome.json` - Linting and formatting rules
- `jest.config.cjs` - Test runner configuration
- `playwright.config.ts` - E2E test configuration

## Platform Requirements

**Development:**
- Java 17 or higher
- Node.js 18.20.4 (enforced via `.nvmrc`)
- Maven 3.x
- Database: H2 (bundled) or PostgreSQL 11+
- Recommended: Google Cloud SDK for local GCP service testing

**Production:**
- Google Cloud Run - Serverless container platform
- Google Cloud SQL - PostgreSQL 11+ managed database
- Google Cloud Storage - File/document storage
- Container Registry: `eu.gcr.io/flock-community/flock-eco-workday`
- Terraform 1.x - Infrastructure as code (configuration in `terraform/` directory)

---

*Stack analysis: 2026-02-28*
