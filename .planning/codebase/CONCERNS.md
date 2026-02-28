# Codebase Concerns

**Analysis Date:** 2026-02-28

## Tech Debt

**Wirespec Migration - File Upload Endpoints:**
- Issue: File upload/download endpoints not converted to Wirespec, still using manual Spring annotations
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/expense/ExpenseController.kt:121-146`
- Impact: Type safety gap between frontend and backend for file operations; manual maintenance required
- Fix approach: Requires Wirespec to support `multipart/form-data` content-type and raw byte arrays, or frontend to send base64-encoded data

**Material-UI JSS to Styled Components Migration:**
- Issue: Automated codemod left TODO comments indicating incomplete migration from JSS styling to styled-components
- Files:
  - `workday-application/src/main/react/application/ApplicationLayout.tsx:28`
  - `workday-application/src/main/react/application/ApplicationMenuItem.tsx:18`
  - `workday-application/src/main/react/features/expense/ExpenseList.tsx:26`
  - `workday-application/src/main/react/features/sickday/SickDayList.tsx:21`
  - `workday-application/src/main/react/features/workday/WorkDayDialog.tsx:27`
  - `workday-application/src/main/react/features/workday/WorkDayList.tsx:27`
  - `workday-application/src/main/react/features/holiday/LeaveDayList.tsx:25`
  - `workday-application/src/main/react/features/event/EventList.tsx:22`
  - `workday-application/src/main/react/features/contract/ContractDialog.tsx:26`
  - `workday-application/src/main/react/features/assignments/AssignmentList.tsx:21`
  - `workday-application/src/main/react/components/holiday-card/HolidayCard.tsx:17`
  - `workday-application/src/main/react/components/missing-hours-card/MissingHoursDetailDialog.tsx:32`
  - `workday-application/src/main/react/components/quick-links/QuickLinks.tsx:20`
  - `workday-application/src/main/react/components/hackday-card/HackdayCard.tsx:23`
  - `workday-application/src/main/react/features/report/Assignment/AssignmentReportTableRow.tsx:20`
  - `workday-application/src/main/react/features/report/Assignment/NonProductiveHours.tsx:15`
- Impact: Potential styling inconsistencies; components may have Fragment roots replaced by divs affecting DOM structure
- Fix approach: Manually review each component to ensure proper tag usage and remove TODO comments once verified

**Deprecated Expense API Methods:**
- Issue: Dual pagination methods exist with naming inconsistency (`findAllByPersonId` vs `findAllByPersonIdNEW`)
- Files:
  - `workday-application/src/main/react/clients/ExpenseClient.ts:65-96`
- Impact: Confusion about which method to use; both methods maintained in parallel
- Fix approach: Complete migration to `findAllByPersonIdNEW`, rename to `findAllByPersonId`, remove old implementation (tracked in WRK-176)

**Pageable Interface Duplication:**
- Issue: Local `Pageable` interface defined instead of using shared one from PageableClient
- Files:
  - `workday-application/src/main/react/utils/InternalizingClient.ts:8-13`
  - `workday-application/src/main/react/utils/NonInternalizingClient.ts:8-13`
- Impact: Type inconsistencies if shared interface changes
- Fix approach: Import and use `Pageable` from `@workday-core/PageableClient`

**Unused Event Publishers:**
- Issue: DeleteExpenseEvent published but has no listeners
- Files:
  - `domain/src/main/kotlin/community/flock/eco/workday/domain/expense/ExpenseService.kt:45-47`
- Impact: Dead code; unnecessary performance overhead
- Fix approach: Remove event publishing or implement listeners if needed

**Deprecated Kotlin Functions:**
- Issue: Old approval status validation functions marked deprecated but still present
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/interfaces/Approve.kt:19-23`
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/controllers/Util.kt:17-19`
- Impact: Risk of using wrong function; maintenance overhead
- Fix approach: Remove deprecated functions after confirming no usages remain

**UserAccount Sealed Class Migration:**
- Issue: TODO to convert UserAccount from sealed class to sealed interface
- Files:
  - `domain/src/main/kotlin/community/flock/eco/workday/domain/user/UserAccount.kt:5`
- Impact: Modern Kotlin pattern not used; potential for better type safety
- Fix approach: Migrate to sealed interface pattern when safe to do so

**TypeScript Type Gaps:**
- Issue: `any` types used instead of proper types
- Files:
  - `workday-application/src/main/react/clients/PersonClient.ts:64` (lastActiveAt marked FIXME)
  - `workday-application/src/main/react/clients/PersonClient.ts:67` (user marked FIXME)
  - `workday-application/src/main/react/clients/EventClient.ts:115` (Rating type TODO)
- Impact: Loss of type safety; runtime errors possible
- Fix approach: Define proper TypeScript interfaces for these fields

**Wirespec Type Exposure:**
- Issue: Wirespec-generated types not properly exposed, requiring manual type definitions
- Files:
  - `workday-application/src/main/react/clients/ExpenseClient.ts:11`
- Impact: Type duplication; types can drift from generated ones
- Fix approach: Fix Wirespec type exports or improve import paths

## Known Bugs

**Contract Cost Rounding Issue:**
- Symptoms: Incorrect total cost calculation for internal contracts in specific date ranges
- Files:
  - `workday-application/src/test/kotlin/community/flock/eco/workday/model/ContractInternalTest.kt:114-128`
- Trigger: Calculating costs for 2-day period (test expects 200.0 from 3100.0 monthly)
- Workaround: Test commented with TODO; issue known but not resolved

**Null Date Range Handling:**
- Symptoms: `dateRange` function will fail when `to` parameter is null
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/utils/DateUtils.kt:13-18`
- Trigger: Calling `dateRange(from, null)` when calculating ranges for open-ended contracts
- Workaround: Callers must handle null before calling function
- Fix approach: Add null check and throw meaningful exception or handle gracefully

**Report Date Range Issue:**
- Symptoms: Defined ranges may not work correctly in assignment reports
- Files:
  - `workday-application/src/main/react/features/report/Assignment/AssignmentReport.tsx:9`
- Trigger: Unknown - marked with "CHECK ME and the differences.. Something seems off"
- Workaround: Unknown

## Security Considerations

**Google Cloud Storage Integration:**
- Risk: Expense file uploads go to GCP Storage; test isolation compromised
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/GcpDocumentService.kt`
  - `tests/workday.spec.ts:50-51`
- Current mitigation:
  - Service uses `@ConditionalOnProperty` to disable in dev mode
  - LocalDocumentService available as alternative
  - Tests skip file upload scenarios
- Recommendations:
  - Mock GCP storage in E2E tests
  - Ensure test environments never hit production storage
  - Validate storage bucket permissions regularly

**Database Directory in Git:**
- Risk: H2 database files created in `./database/db` during development
- Files:
  - `.gitignore:61` (database directory ignored)
- Current mitigation: Directory properly ignored in `.gitignore`
- Recommendations: Ensure developers don't accidentally commit database files

**Secrets File Handling:**
- Risk: Google credentials and secrets files must not be committed
- Files:
  - `.gitignore:41` (`secrets.yml`)
  - `.gitignore:55` (`gha-creds-*.json`)
- Current mitigation: Specific patterns excluded in `.gitignore`
- Recommendations: Regular audit of repository for accidentally committed credentials

**Authentication Type Safety:**
- Risk: Inconsistent type usage for user authentication fields
- Files:
  - `workday-application/src/main/react/clients/PersonClient.ts:67` (`user: any`)
- Current mitigation: Server-side authorization checks in controllers
- Recommendations: Add proper TypeScript types to prevent auth field misuse

## Performance Bottlenecks

**Large Aggregation Service:**
- Problem: AggregationService is 823 lines, handles complex calculations across multiple data sources
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/services/AggregationService.kt`
- Cause: Aggregates contracts, work days, leave days, sick days, events for reporting
- Improvement path:
  - Cache aggregation results
  - Consider breaking into domain-specific aggregators
  - Add database-level aggregations for common queries

**Generated Wirespec Client Size:**
- Problem: Generated TypeScript client is 933 lines
- Files:
  - `workday-application/src/main/react/wirespec/client.ts`
- Cause: All API types and endpoints in single generated file
- Improvement path: Configure Wirespec to generate modular client code if supported

**Null Date Range Calculation:**
- Problem: Open-ended contracts (no end date) require special handling in date range calculations
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/utils/DateUtils.kt:13-18`
- Cause: ChronoUnit.between() requires non-null end date
- Improvement path: Add optimized path for open ranges using LocalDate.MAX or current date

## Fragile Areas

**Approval Status Transitions:**
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/interfaces/Approve.kt:25-59`
- Why fragile: Complex validation logic mixing current/new status checks with admin permissions
- Safe modification:
  - Add test coverage for all valid/invalid state transitions
  - Extract validation into pure functions
  - Document state machine explicitly
- Test coverage: Not verified but used by expense, leave day, and sick day controllers

**Vendored Modules (workday-core, workday-user):**
- Files:
  - `workday-core/src/main/` (29 files)
  - `workday-user/src/main/` (64 files)
- Why fragile: Frozen dependencies vendored from flock-eco; no upstream updates
- Safe modification:
  - DO NOT modify - add new code to `workday-application` instead
  - Bugs in vendored code require careful isolated fixes
  - Document any emergency patches
- Test coverage: Unknown (legacy code)

**Google Sheets Export:**
- Files:
  - `workday-application/src/main/kotlin/community/flock/eco/workday/application/google/WorkdayGoogleSheets.kt:95`
- Why fragile: Returns null without error handling in some cases
- Safe modification: Add null checks when calling this service
- Test coverage: Gaps in E2E tests (file upload skipped)

**Multi-Module TypeScript Build:**
- Files:
  - Root `package.json`, `tsconfig.json`, `webpack.config.js`
- Why fragile: TypeScript must resolve modules across 3 Maven modules; path aliases critical
- Safe modification:
  - Never change module structure without updating all build configs
  - Test both dev and production builds after changes
  - Verify `@workday-core` and `@workday-user` aliases work
- Test coverage: Build tested via CI but import resolution not explicitly tested

**Liquibase Migration Order:**
- Files:
  - `workday-application/src/main/database/db/changelog/` (27+ migration files)
- Why fragile: Sequential numbered migrations; conflicts likely in parallel development
- Safe modification:
  - Always use next sequential number
  - Test migration on clean database
  - Never edit existing migrations after merge
- Test coverage: Migrations run on app startup in develop mode

## Scaling Limits

**H2 In-Memory Database:**
- Current capacity: Development only; file-based database in `./database/db`
- Limit: Not suitable for production; limited by available memory
- Scaling path: Use PostgreSQL or similar RDBMS for production (cloud profile likely configured)

**File Storage Bucket:**
- Current capacity: Google Cloud Storage bucket (bucket name configured per environment)
- Limit: Depends on GCP quota
- Scaling path: Monitor bucket size; consider lifecycle policies for old expense files

**Wirespec Generation:**
- Current capacity: Manual trigger via `npm run generate` after `.ws` file changes
- Limit: Developer must remember to regenerate; easy to forget
- Scaling path: Add git pre-commit hook or build step to auto-generate and verify sync

## Dependencies at Risk

**Google APIs:**
- Risk: Tightly coupled to Google Drive, Sheets, and Cloud Storage APIs
- Impact:
  - File storage requires GCP account
  - Export features depend on Google Sheets API
  - Breaking API changes impact core functionality
- Migration plan:
  - Abstract storage behind `DocumentStorage` interface (already done)
  - Consider S3-compatible storage as alternative
  - Make Google integrations optional features

**Vendored Dependencies (flock-eco):**
- Risk: No upstream updates from flock-eco-parent project
- Impact: Security patches and bug fixes in original libraries not received
- Migration plan:
  - Maintain awareness of flock-eco project updates
  - Selectively backport critical fixes to vendored modules
  - Long-term: eliminate vendored code by replacing with workday-specific implementations

**H2 Database:**
- Risk: Development-only database; production uses different engine
- Impact: Schema differences between H2 and production DB may cause bugs
- Migration plan: Use PostgreSQL or MySQL for local development to match production

## Missing Critical Features

**E2E Test File Upload Coverage:**
- Problem: File upload tests skipped due to GCP integration
- Blocks: Confidence in expense and work day file upload flows
- Files:
  - `tests/workday.spec.ts:50-51`
  - `tests/workday.spec.ts:65-66`

**Proper Error Boundaries:**
- Problem: Frontend uses simple null checks but lacks comprehensive error boundaries
- Blocks: Graceful degradation when components fail

## Test Coverage Gaps

**PersonController Authorization Tests:**
- What's not tested: 403 Forbidden responses for non-admin users attempting unauthorized operations
- Files:
  - `workday-application/src/test/kotlin/community/flock/eco/workday/controllers/PersonControllerTest.kt:308-334`
- Risk: Authorization vulnerabilities undetected
- Priority: High - security-critical functionality

**WorkDay Model Tests:**
- What's not tested: WorkDay domain logic
- Files:
  - `workday-application/src/test/kotlin/community/flock/eco/workday/model/WorkDayTest.kt:8`
- Risk: Business logic bugs in work day calculations
- Priority: Medium - core feature but covered by integration tests

**Service Contract Type Handling:**
- What's not tested: SERVICE contract type in OrganisationHelper
- Files:
  - `workday-application/src/test/kotlin/community/flock/eco/workday/helpers/OrganisationHelper.kt:23`
- Risk: Runtime errors if SERVICE contracts used
- Priority: Low - may be unsupported contract type

**E2E Test Data Isolation:**
- What's not tested: Clean test runs with fresh data
- Files:
  - `tests/workday.spec.ts:65` ("TODO: Need to create a clean user first, this fails on subsequent runs")
- Risk: Flaky tests; false negatives
- Priority: Medium - reduces test confidence

**Assignment Report Edge Cases:**
- What's not tested: Date range handling variations
- Files:
  - `workday-application/src/main/react/features/report/Assignment/AssignmentReport.tsx:9`
- Risk: Incorrect reports generated
- Priority: Medium - impacts business metrics

---

*Concerns audit: 2026-02-28*
