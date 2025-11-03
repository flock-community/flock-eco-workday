# Flock Workday

## Prerequisite

You need to download and install the `gcloud cli`. After installing the cli run the following command to create
Application Default Credentials (ADC):
```bash
gcloud auth application-default login
```

## Run

```bash
./mvnw clean compile spring-boot:run -Dspring-boot.run.profiles=develop -Pdevelop
```

Mark `src/develop/kotlin` as source directory.

Add `develop` to the springboot `application` run configuration active profiles.

```bash
./mvnw clean install
npm install
```

Run `application` and `npm start`. Make sure you're using the correct node version. If you have nvm installed,
run `nvm use` to set node to the version defined in .nvmrc

### Run with docker locally

Make sure to build the application with develop profile, and optionally with the frontend profile

```bash
./mvnw package -DskipTests -Pdevelop -Pfrontend
```

Then run a docker container. Be sure to include the GOOGLE_APPLICATION_CREDENTIALS to also use the Google Worksheet
integration. Alternatively, you can disable the google feature with the `flock.eco.workday.google.enabled=false`
property

```bash
 docker run --rm -it -p 8080:8080 \
    -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/keys/application_default_credentials.json \
    -v $HOME/.config/gcloud/application_default_credentials.json:/tmp/keys/application_default_credentials.json:ro \
    -e spring.profiles.active=develop \
    eu.gcr.io/flock-community/flock-eco-workday:latest
```


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

```bash
# check code style (it's also bound to "mvn verify")
$ ./mvnw ktlint:check
  src/main/kotlin/Main.kt:10:10: Unused import

# fix code style deviations (runs built-in formatter)
$ ./mvnw ktlint:format

# fix code styles for js files with eslint
$ npm run lint
```

#### View database locally
It is possible to view the `SCHEMA` and `VALUES` that are in the database on you local environment. When the backend is running you can
connect to a console. In the `/resources/application-develop.properties` you can find the settings:

```bash
spring.h2.console.enabled=true
spring.h2.console.path=/h2
```

Connect via the browser to the `localhost:8080/h2`. Fill the `spring.datasource.url` as the `JDBC URL` and press 'Connect'.


## Generate secrets

Generate secrets to deploy via travis-ci

```
tar cvf secrets.tar ./service-account.json src/main/resources/application-cloud.properties
travis encrypt-file secrets.tar --add
```
