# External Integrations

**Analysis Date:** 2026-02-28

## APIs & External Services

**Google Cloud Platform:**
- Google Drive API - Document creation and sharing
  - SDK/Client: `google-api-services-drive` v3-rev20251210-2.0.0
  - Auth: Google Cloud credentials (`GOOGLE_APPLICATION_CREDENTIALS`)
  - Implementation: `workday-application/src/main/kotlin/community/flock/eco/workday/application/google/WorkdayGoogleDrive.kt`
  - Scopes: `https://www.googleapis.com/auth/drive`, `https://www.googleapis.com/auth/drive.metadata.readonly`

- Google Sheets API - Spreadsheet generation and data export
  - SDK/Client: `google-api-services-sheets` v4-rev20251110-2.0.0
  - Auth: Google Cloud credentials
  - Implementation: `workday-application/src/main/kotlin/community/flock/eco/workday/application/google/WorkdayGoogleSheets.kt`
  - Template Sheet ID: Configured via `GOOGLE_SHEET_TEMPLATE_ID` (develop default: `16dSJHdp-LphqhpodNPrpDCOJLSJmDEe-NNGiZR0lbqM`)
  - Scopes: `https://www.googleapis.com/auth/spreadsheets`

**Email Services:**
- Mailjet - Transactional email delivery
  - SDK/Client: `mailjet-client` 5.1.1
  - Auth: `MJ_APIKEY_PUBLIC`, `MJ_APIKEY_PRIVATE`
  - Implementation: `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/email/MailjetService.kt`
  - Templates: Reminder (5019452), Update (5019452), Notification (5019452)
  - Recipient: `workday.notifications.recipient=workday@flock.community`

**Business Integration:**
- ExactOnline - Accounting/ERP integration
  - Auth: OAuth2 (`EXACTONLINE_CLIENT_ID`, `EXACTONLINE_CLIENT_SECRET`)
  - Redirect URI: Configurable (`EXACTONLINE_REDIRECT_URI`, default: `http://localhost:3000/api/exactonline/redirect`)
  - Request URI: `https://start.exactonline.nl`
  - Note: Client credentials visible in `application-develop.properties` (development only)

## Data Storage

**Databases:**
- PostgreSQL (Production)
  - Connection: Google Cloud SQL via `spring-cloud-gcp-starter-sql-postgresql`
  - Instance: `GCP_SQL_INSTANCE_CONNECTION_NAME`
  - Database: `GCP_SQL_DATABASE_NAME`
  - Client: Spring Data JPA with Hibernate
  - Schema Management: Liquibase changelogs in `workday-application/src/main/database/db/changelog/`

- H2 (Development)
  - Connection: `jdbc:h2:./database/db;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL`
  - Username: `sa`
  - Password: (empty)
  - Console: Enabled at `/h2` endpoint in develop mode
  - File location: `./database/db` (gitignored)

**File Storage:**
- Google Cloud Storage
  - Client: `com.google.cloud.storage.Storage` via `spring-cloud-gcp-starter-storage`
  - Bucket: Configured via `WORKDAY_BUCKET_DOCUMENTS` (develop default: `flock-eco-workday-documents`)
  - Implementation: `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/GcpDocumentService.kt`
  - Fallback: Local filesystem storage via `LocalDocumentService.kt` (when GCP storage disabled)

**Caching:**
- None - Application relies on database queries and session storage

**Session Storage:**
- JDBC-based sessions via `spring-session-jdbc`
  - Storage: Database tables (managed by Spring Session)
  - Schema: Auto-initialized in develop mode, managed via migrations in production

## Authentication & Identity

**Auth Provider:**
- Google OAuth2 (Production)
  - Implementation: Spring Security OAuth2 Client with OIDC
  - Client ID: `GOOGLE_CLIENT_ID`
  - Client Secret: `GOOGLE_CLIENT_SECRET`
  - Configuration: `workday-user/src/main/kotlin/community/flock/eco/workday/user/services/UserSecurityService.kt`
  - User management: Custom user entity with role-based access control

- Database Authentication (Development)
  - Login mode: `DATABASE` (configured via `flock.eco.workday.login`)
  - Test users loaded from `workday-application/src/develop/kotlin/` (when `-Pdevelop` profile active)

**Ory Stack (Experimental):**
- Ory Oathkeeper integration present in Terraform configuration
  - Domain: `ory.workday.flock.community`
  - Service: `workday-app-ory.tf` and `workday-oathkeeper`
  - Status: Infrastructure defined, integration details in Terraform files

## Monitoring & Observability

**Error Tracking:**
- None - No dedicated error tracking service detected

**Logs:**
- Standard output (stdout) with configurable levels
- Debug logging available for Spring Security: `logging.level.org.springframework.security=DEBUG` (develop mode)
- SQL query logging: `logging.level.org.hibernate.SQL=DEBUG` (optional, commented in config)

**Actuator:**
- Spring Boot Actuator enabled (`spring-boot-starter-actuator`)
- Endpoints available for health checks and metrics

**API Documentation:**
- Swagger UI via SpringDoc OpenAPI 2.1.0
- Generated from Spring controllers and Wirespec definitions

## CI/CD & Deployment

**Hosting:**
- Google Cloud Run
  - Container image: `eu.gcr.io/flock-community/flock-eco-workday`
  - Build: Jib Maven plugin (containerization without Docker daemon)
  - Base image: `eclipse-temurin:17-jre`
  - Infrastructure: Managed via Terraform in `terraform/` directory

**CI Pipeline:**
- GitHub Actions (inferred from presence of secrets management)
- Encrypted secrets: `secrets.tar.enc` (CI credentials and service account keys)

**Local Development:**
- Docker Compose available in `docker-compose.yml`
  - PostgreSQL 11.18-alpine
  - Traefik reverse proxy
  - Application container: `eu.gcr.io/flock-community/flock-eco-workday-develop:latest`

**Infrastructure as Code:**
- Terraform (Google Cloud provider)
  - Project: `flock-community`
  - Resources: Cloud Run services, SQL databases, domain mappings
  - Files: `terraform/*.tf`

## Environment Configuration

**Required env vars (Production/GCP):**
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCP service account JSON
- `GCP_SQL_DATABASE_NAME` - Cloud SQL database name
- `GCP_SQL_INSTANCE_CONNECTION_NAME` - Cloud SQL instance connection string
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `GOOGLE_CLIENT_ID` - OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - OAuth2 client secret
- `MJ_APIKEY_PUBLIC` - Mailjet public API key
- `MJ_APIKEY_PRIVATE` - Mailjet private API key
- `EXACTONLINE_CLIENT_ID` - ExactOnline OAuth client ID
- `EXACTONLINE_CLIENT_SECRET` - ExactOnline OAuth client secret
- `EXACTONLINE_REDIRECT_URI` - ExactOnline OAuth redirect URI
- `EXACTONLINE_REQUEST_URI` - ExactOnline authorization endpoint
- `WORKDAY_CALENDAR_TOKEN` - Calendar API access token
- `WORKDAY_BUCKET_DOCUMENTS` - GCS bucket name for documents
- `GOOGLE_SHEET_TEMPLATE_ID` - Template spreadsheet ID for exports
- `WORKDAY_LOGIN` - Authentication mode (DATABASE or OAuth2)

**Secrets location:**
- Production: Environment variables (injected via Cloud Run)
- CI: Encrypted in `secrets.tar.enc`
- Development: Hardcoded in `application-develop.properties` (non-sensitive defaults)
- Note: No `.env` files detected in repository

## Webhooks & Callbacks

**Incoming:**
- OAuth2 Callbacks:
  - Google OAuth2: Standard Spring Security OAuth2 endpoints at `/oauth2/*`
  - ExactOnline OAuth2: Custom redirect at `/api/exactonline/redirect`
- No other webhook endpoints detected

**Outgoing:**
- None detected - Application does not send webhooks to external services

## Calendar Integration

**iCalendar:**
- Library: biweekly 0.6.7
  - Purpose: Parse and generate iCalendar (.ics) files
  - Service: `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/CalendarService.kt`
  - Token-based access: `flock.eco.workday.calendar.token` (develop default: "sesamstraat")

---

*Integration audit: 2026-02-28*
