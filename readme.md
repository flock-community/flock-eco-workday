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

### ktlint

Use `ktlint` to lint kotlin files or `eslint` for javascript files

```bash
# check code style (it's also bound to "mvn verify")
$> mvn antrun:run@ktlint
  src/main/kotlin/Main.kt:10:10: Unused import

# fix code style deviations (runs built-in formatter)
$> mvn antrun:run@ktlint-format
```

### eslint

```bash
# execute the eslint command
$> npm run eslint
# fix code styles for js files with eslint
$> npm run eslint -- --fix .
```

### markdownlint

```bash
# execute the markdownlint command
$> npm run markdownlint
# fix markdownfiles within the project with the given configuration
$> npm run markdownlint -- --fix --config ./markdownlint.yaml --ignore ./node_modules
```

## Generate secrets

Generate secrets to deploy via travis-ci

```bash
tar cvf secrets.tar ./service-account.json src/main/resources/application-cloud.properties
travis encrypt-file secrets.tar --add
```

## Links and useful resources

- [markdownlint-config-schema](https://github.com/DavidAnson/markdownlint/blob/master/schema/markdownlint-config-schema.json)
