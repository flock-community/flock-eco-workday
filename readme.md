# Flock Workday

## Run

```bash
mvn clean spring-boot:run -Pdevelop -Dspring-boot.run.profiles=local
```

Mark `src/develop/kotlin` as source directory.

Add `develop` to the springboot `application` run configuration active profiles.

```bash
mvn clean install
npm install
```

Run `application` and `run:local`.

## Users

| User                     | Password    | Role  |
| ------------------------ | ----------- | ----- |
| tommy@sesam.straat       | tommy       | user  |
| pino@sesam.straat        | pino        | user  |
| ieniemienie@sesam.straat | ieniemienie | user  |
| bert@sesam.straat        | bert        | admin |
| ernie@sesam.straat       | ernie       | user  |

## Linting

Use `ktlint` to lint kotlin files or `eslint` for javascript files

## Database

- Generate diff file with liquibase
  ```
  mvn clean compile liquibase:update liquibase:diff
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

```bash
# check code style (it's also bound to "mvn verify")
$ mvn antrun:run@ktlint
  src/main/kotlin/Main.kt:10:10: Unused import

# fix code style deviations (runs built-in formatter)
$ mvn antrun:run@ktlint-format

# fix code styles for js files with eslint
$ npm run lint
```

## Generate secrets

Generate secrets to deploy via travis-ci

```
tar cvf secrets.tar ./service-account.json src/main/resources/application-cloud.properties
travis encrypt-file secrets.tar --add
```
