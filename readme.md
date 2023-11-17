# Flock Workday

## Prerequisite

You need to download and install the `gcloud cli`. After installing the cli run the following command to create
Application Default Credentials (ADC):
```bash
gcloud auth application-default login
```

## Get started

Run the Workday app, with the backend and frontend bundled together:

```bash
./mvnw clean compile spring-boot:run \
  -Dspring-boot.run.profiles=develop \
  -P develop \
  -P frontend
```

Run a full build of backend and frontend, and build a Docker 🐳 image

```bash
./mvnw clean install jib:dockerBuild\
  -P develop \
  -P frontend \
  -Djib.container.environment=SPRING_PROFILES_ACTIVE=develop \
  --file pom.xml
```

### Backend tips

- ℹ️ Mark `src/develop/kotlin` as source directory, if not done automatically by your IDE.
- ℹ️ Add `develop` to the springboot `application` run configuration active profiles. (
  Find [`🔗Application.kt`](src/main/kotlin/Application.kt), run the app one time, and adjust the config)
- ℹ️ The `com.github.eirslett` dependency is used to package the frontend together with the backend, but this only
  happens if the `frontend` profile is active (`-P` flag).
  - Example: `./mvnw clean install -P frontend`)

### Frontend tips

- ℹ️ Workday makes use of [nvm](https://github.com/nvm-sh/nvm) and an [`🔗.nvmrc`](./.nvmrc) to define the Node version.
  By running `nvm use`, you activate the configured Node version.
- ℹ️ To run the frontend independently, run `npm install` and then `npm start`.
  - A webpack devServer is used to proxy api calls towards the backend, which is expected to run on port 8080. See
    the [`🔗webpack.config.js`](./webpack.config.js) for more details.

## Users

| User                     | Password    | Role  |
| ------------------------ | ----------- | ----- |
| tommy@sesam.straat       | tommy       | user  |
| pino@sesam.straat        | pino        | user  |
| ieniemienie@sesam.straat | ieniemienie | user  |
| bert@sesam.straat        | bert        | admin |
| ernie@sesam.straat       | ernie       | user  |

## Linting

Use `ktlint` to lint kotlin files

```bash
# check code style (it's also bound to "mvn verify")
./mvnw antrun:run@ktlint
```

```bash
# fix code style deviations (runs built-in formatter)
./mvnw antrun:run@ktlint-format
```

Use `prettier` for javascript/typescript files

```bash
# fix code styles for js files with eslint
npm run lint format
```

[Install the prettier plugin in your IDE](https://prettier.io/docs/en/editors.html) to get the most out of prettier.

## Database

- Generate diff file with liquibase
  ```bash
  ./mvnw clean compile liquibase:update liquibase:diff
  ```
- Rename `db.changelog-diff.yaml` to `db.changelog-#.yaml`
- Add the new changelog file to the `db.changelog-master.yaml`
  ```yaml
  databaseChangeLog:
    - include:
        - file: db.changelog-1.yaml
          relativeToChangelogFile: true
        - file: db.changelog-#.yaml
          relativeToChangelogFile: true
  ```

## Integration with Ory (authentication and authorization)

See also [Identity access management](./docs/identity-access-management.md) for the prerequisites and more detailed
information

It is possible to run workday locally, integrating with the Ory stack (Kratos, Oathkeeper, Keto) for identity access and
permission management using the docker compose file.

```bash
# Yolo, TL;DR
# Start everything authentication/authorization related
docker compose up -d

# Alternatively, start the spring app through IDE, with profile develop-kratos active
./mvnw clean compile spring-boot:run \
  -Dspring-boot.run.profiles=develop,develop-kratos \
  -P develop \
  -P frontend

# Go
open http://workday.flock.local:8081
```

### Development info regarding the Ory stack

See [Authentication and Authorization](./docs/authentication-and-authorization.md)

#### View database locally
It is possible to view the `SCHEMA` and `VALUES` that are in the database on you local environment. When the backend is running you can
connect to a console. In the `/resources/application-develop.properties` you can find the settings:

```bash
spring.h2.console.enabled=true
spring.h2.console.path=/h2
```

Connect via the browser to the `localhost:8080/h2`. Fill the `spring.datasource.url` as the `JDBC URL` and press 'Connect'.

## Generate secrets (deprecated?)

Generate secrets to deploy via travis-ci

```bash
tar cvf secrets.tar ./service-account.json src/main/resources/application-cloud.properties
travis encrypt-file secrets.tar --add
```
