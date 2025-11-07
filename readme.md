# Flock Workday

A standalone workday/workforce management application for managing people, contracts, assignments, work hours, expenses, and invoicing.

## Project Structure

This project is structured as a **standalone multi-module Maven project**. The modules are:

```
flock-eco-workday/
├── pom.xml                    # Parent aggregator POM (no parent inheritance)
├── workday-core/              # Core utilities, base entities (vendored from flock-eco-core)
├── workday-user/              # Authentication, authorization, user management (vendored from flock-eco-feature-user)
└── workday-application/       # Main application code with all business logic
    ├── src/main/kotlin/       # Application code
    ├── src/main/react/        # Frontend React application
    ├── src/main/wirespec/     # API contract definitions
    ├── src/main/database/     # Liquibase migrations
    └── src/develop/kotlin/    # Development fixtures and test data
```

### Module Responsibilities

- **workday-core**: Provides base utilities, common domain models, security configurations, and shared client utilities. Vendored from flock-eco-core for independence.
- **workday-user**: Handles authentication, authorization, user management, and security. Vendored from flock-eco-feature-user for independence.
- **workday-application**: Contains all business logic for workday management including people, contracts, assignments, projects, expenses, invoices, and integrations.

## Prerequisites

### Required
- **Java 17** or higher
- **Maven 3.6+**
- **Node.js** (version specified in `.nvmrc`)
- **Google Cloud CLI** (gcloud) - Required for Google integrations

### Google Cloud Setup

Download and install the `gcloud cli`. After installing, create Application Default Credentials (ADC):

```bash
gcloud auth application-default login
```

### Node Version

If you have nvm installed, use the project's specified Node version:

```bash
nvm use
```

## Building the Project

### Full Build (All Modules)

Build all modules from the root directory:

```bash
./mvnw clean install
```

This will build all three modules in order: `workday-core` → `workday-user` → `workday-application`.

### Build with Frontend

To include the frontend build:

```bash
./mvnw clean package -Pfrontend
```

## Development Setup

### Initial Setup

1. **Clone the repository**
2. **Install Maven dependencies**:
   ```bash
   ./mvnw clean install
   ```
3. **Install Node dependencies** (from root, where package.json is located):
   ```bash
   npm install
   ```

### Running the Application

#### Backend (Spring Boot)

Run from the `workday-application` directory with the `develop` profile for test data:

```bash
cd workday-application
../mvnw spring-boot:run -Pdevelop -Dspring-boot.run.profiles=develop
```

Or from your IDE:
- Mark `workday-application/src/develop/kotlin` as a source directory
- Add `develop` to the Spring Boot run configuration active profiles
- Run the main application class

The backend will start on `http://localhost:8080`

#### Frontend (React with Webpack Dev Server)

Run from the **root directory** (where package.json is located):

```bash
npm start
```

The frontend dev server will start on `http://localhost:3000` with hot-reload enabled and will proxy API calls to the backend on port 8080.

### Frontend Scripts

All frontend scripts should be run from the **root directory**:

```bash
npm start              # Start webpack dev server
npm run build          # Production build
npm test               # Run Jest tests
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Run Prettier
npm run storybook      # Start Storybook for component development
```

## Testing

### Backend Tests

```bash
# Run all tests
./mvnw test

# Run tests for specific module
cd workday-user
../mvnw test
```

### Frontend Tests

```bash
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
```

### Playwright E2E Tests

Playwright tests are located in the `tests/` directory. Check `test-results/` for the latest test status.

```bash
# Run Playwright tests (if configured)
npx playwright test
```

## Database

The application uses H2 database in development mode with Liquibase for migrations. On production it uses CloudSQL
Postgres


### Generating Database Migrations

When you modify JPA entities, generate a Liquibase diff file:

```bash
cd workday-application
../mvnw clean compile liquibase:update liquibase:diff
```

Then:
1. Rename `db.changelog-diff.yaml` to `db.changelog-#.yaml` (increment the number)
2. Add the new changelog to `db.changelog-master.yaml`:
   ```yaml
   databaseChangeLog:
     - include:
         - file: db.changelog-1.yaml
           relativeToChangelogFile: true
         - file: db.changelog-#.yaml
           relativeToChangelogFile: true
   ```

### Viewing Database Locally

When running with the `develop` profile, the H2 console is available at `http://localhost:8080/h2`.

Connection settings (from `application-develop.properties`):
- JDBC URL: `jdbc:h2:./database/db`
- Username: `sa`
- Password: (empty)

## Code Quality

### Kotlin Linting (ktlint)

```bash
# Check code style
./mvnw ktlint:check

# Auto-fix code style issues
./mvnw ktlint:format
```

### Frontend Linting (ESLint)

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

## Docker

### Building Docker Image

Build the application with develop profile and optionally frontend:

```bash
./mvnw clean package -DskipTests -Pdevelop -Pfrontend
```

Then build the Docker image:

```bash
./mvnw jib:dockerBuild
```

### Running with Docker Locally

```bash
docker run --rm -it -p 8080:8080 \
    -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/keys/application_default_credentials.json \
    -v $HOME/.config/gcloud/application_default_credentials.json:/tmp/keys/application_default_credentials.json:ro \
    -e spring.profiles.active=develop \
    eu.gcr.io/flock-community/flock-eco-workday:latest
```

To disable Google integration, add: `-e flock.eco.workday.google.enabled=false`

## Development Users

When running with the `develop` profile, the following test users are available:

| Email                    | Password    | Role  |
| ------------------------ | ----------- | ----- |
| tommy@sesam.straat       | tommy       | user  |
| pino@sesam.straat        | pino        | user  |
| ieniemienie@sesam.straat | ieniemienie | user  |
| bert@sesam.straat        | bert        | admin |
| ernie@sesam.straat       | ernie       | user  |

## API Documentation

The application uses [**Wirespec**](https://wirespec.io/) for API contract definitions. Wirespec files are located in
`workday-application/src/main/wirespec/`.

To regenerate API types:

```bash
npm run generate      # Generates TypeScript types from Wirespec
```

The Maven build automatically generates Kotlin types during compilation.

## Deployment

The project uses **Jib** for containerization and can be deployed to Google Cloud Platform (App Engine) or any container runtime.

### Generate Secrets (for CI/CD)

```bash
tar cvf secrets.tar ./service-account.json src/main/resources/application-cloud.properties
travis encrypt-file secrets.tar --add
```

## Integrations

The application integrates with:

- **Google APIs**: Drive, Sheets (for reporting and document management)
- **ExactOnline**: Accounting and invoicing
- **Mailjet**: Email notifications

Integration configurations are managed in `application-cloud.properties` and can be disabled with feature flags.

## Technology Stack

### Backend
- Kotlin 1.9.22
- Spring Boot 2.6.2
- Spring Security with OAuth2
- JPA/Hibernate
- Liquibase for database migrations
- Wirespec for API contracts

### Frontend
- React 16.14
- TypeScript
- Material-UI v4
- Formik for forms
- Webpack 4
- Jest for testing
- Storybook for component development

## Migration Notes

This project was recently migrated from being dependent on the `flock-eco` parent repository to a fully standalone multi-module project. All necessary code from `flock-eco-core` and `flock-eco-feature-user` has been vendored into `workday-core` and `workday-user` respectively.

For detailed migration information, see the `MIGRATION.md` guide (if available).

## Troubleshooting

### "Module not found" errors in frontend
Make sure you've run `npm install` from the **root directory** where `package.json` is located.

### TypeScript path resolution issues
Ensure your IDE is configured to use the `tsconfig.json` at the root level. The project uses TypeScript path aliases (`@workday-core`, `@workday-user`) for cleaner imports.

### Backend compilation errors
Make sure all modules are built in order. Run `./mvnw clean install` from the root to rebuild all modules.

### Database migration errors
Check that your Liquibase changelog files are properly referenced in `db.changelog-master.yaml`.

## Support

For issues, questions, or contributions, please contact the Flock development team or create an issue in the project repository.