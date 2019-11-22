# Flock Workday

## Run

```bash
mvn clean spring-boot:run -Pdevelop -Dspring.profiles.active=local
```

## User

| User                     | Password    |
| ------------------------ | ----------- |
| tommy@sesam.straat       | tommy       |
| pino@sesam.straat        | pino        |
| ieniemienie@sesam.straat | ieniemienie |
| bert@sesam.straat        | bert        |
| ernie@sesam.straat       | ernie       |

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
