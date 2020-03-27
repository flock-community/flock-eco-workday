# Flock Workday

## Run

```bash
mvn clean spring-boot:run -Pdevelop,frontend -Dspring.profiles.active=local
```

## User

| User                     | Password    | type  |
| ------------------------ | ----------- | ----- |
| tommy@sesam.straat       | tommy       | admin |
| pino@sesam.straat        | pino        | admin |
| ieniemienie@sesam.straat | ieniemienie | admin |
| bert@sesam.straat        | bert        | admin |
| ernie@sesam.straat       | ernie       | user  |

## Linting

Use `ktlint` to lint kotlin files or `eslint` for javascript files

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
