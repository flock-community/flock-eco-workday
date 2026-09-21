// Architecture rules, checked on the compiled classes of every module by byterails
// (https://github.com/flock-community/byterails). Prefixes are relative to the base package
// community.flock.eco.workday; the slices are named in the parent pom.
//
// byterails is a whitelist: a class may only reference what its package's declaration, the
// enclosing declarations and the root block allow. A build failure names the class, the reference
// and the allows in effect; extend the allow list here when the new dependency is architecturally
// sound, or move the code. Rules marked TODO are existing shortcuts that keep the build green until
// the code is untangled; do not add to them.

/**
 * The hexagonal rule for a domain package: isolated from everything but the language baseline
 * (what byterails' `hexagonal` rule set allows) and the shared kernel and domains it names. Nothing
 * in the baseline talks to the outside world, so no framework, library or adapter can leak in.
 */
fun PackageBuilder.domain(vararg uses: String) {
    isolated()
    allow("kotlin")
    allow("org.jetbrains.annotations")
    allow("java.lang")
    allow("java.util")
    allow("java.time")
    allow("java.math")
    allow("java.text")
    uses.forEach { allow(it) }
}

byterails {
    allow("kotlin")
    allow("java")
    allow("org.jetbrains.annotations")

    // The shared kernel of the domain: approval status, documents, pages, periods and the event
    // publisher port. As isolated as a slice's domain.
    pkg("common") { domain() }

    // Every slice has a domain package (<slice>.domain) that is isolated: language baseline, the
    // shared kernel and the domains of the reference slices it needs. The reference slices (user,
    // person, client, project, assignment) never depend on the slices that record work against them.
    pkg("user.domain") { domain() }
    pkg("person.domain") { domain("common", "user.domain") }
    pkg("client.domain") { domain() }
    pkg("project.domain") { domain() }
    pkg("assignment.domain") { domain("common", "person.domain", "client.domain", "project.domain") }
    pkg("contract.domain") { domain("common", "person.domain") }
    pkg("workday.domain") { domain("common", "assignment.domain") }
    pkg("leaveday.domain") { domain("common", "person.domain") }
    pkg("sickday.domain") { domain("common", "person.domain") }
    pkg("event.domain") { domain("common", "person.domain") }
    pkg("laptop.domain") { domain("common", "person.domain") }
    pkg("expense.domain") { domain("common", "person.domain") }

    // What every slice shares besides its domain: the slice root holds wiring and, in the vendored
    // user slice, the application and infrastructure code declared below. Slices see each other's
    // domain and nothing else.
    slice {
        exported("domain")
        allow("common")
        allow("core")
        allow("org.springframework.boot")
        allow("org.springframework.context")
        allow("org.springframework.data")
        allow("org.springframework.security")
        allow("org.springframework.stereotype")
    }

    // The vendored user module is the user slice's application and infrastructure code, frozen.
    pkg("user.authorities")
    pkg("user.controllers") {
        allow("user.exceptions")
        allow("org.springframework.http")
        allow("org.springframework.web")
    }
    pkg("user.events") {
        allow("user.domain")
        allow("user.model")
    }
    pkg("user.exceptions") {
        allow("user.model")
    }
    pkg("user.filters") {
        allow("user.model")
        allow("user.services")
        allow("jakarta.servlet")
        allow("org.springframework.web")
    }
    pkg("user.forms") {
        allow("user.model")
    }
    pkg("user.mappers") {
        allow("user.domain")
        allow("user.model")
    }
    pkg("user.model") {
        allow("com.fasterxml.jackson")
        allow("jakarta.persistence")
    }
    pkg("user.repositories") {
        allow("user.model")
    }
    pkg("user.services") {
        allow("user.events")
        allow("user.exceptions")
        allow("user.forms")
        allow("user.model")
        allow("user.repositories")
        allow("jakarta.transaction")
        allow("org.reflections")
        allow("org.springframework.transaction")
    }

    // Wirespec-generated API contract: shared with the frontend, so it knows nothing of the application.
    pkg("api") {
        allow("community.flock.wirespec")
        allow("org.springframework.aot")
        allow("org.springframework.context")
        allow("org.springframework.web")
    }

    // Vendored, frozen: base entities, events and utilities. Sees the shared kernel and nothing else of ours.
    pkg("core") {
        allow("common")
        allow("jakarta.mail")
        allow("jakarta.persistence")
        allow("org.springframework.context")
        allow("org.springframework.data")
        allow("org.springframework.http")
        allow("org.springframework.util")
        allow("org.springframework.web")
    }

    // The application. Classes directly in this package are the entry point and its wiring, which
    // may reach every layer; the rules below are inherited by every layer.
    pkg("application") {
        allow("user.UserConfiguration")
        allow("community.flock.wirespec.integration.spring.kotlin.configuration.EnableWirespecController")
        allow("org.springframework.data.jpa.repository.config.EnableJpaRepositories")
        allow("org.slf4j")
        allow("org.springframework.beans")
        allow("org.springframework.boot")
        allow("org.springframework.context")
        allow("org.springframework.stereotype")
    }

    pkg("application.authorities") {
        allow("core.authorities")
    }

    // Spring, security, mail and Google wiring.
    pkg("application.config") {
        allow("application.google")
        allow("common")
        allow("core.events")
        allow("core.model")
        allow("core.services")
        allow("user.exceptions")
        allow("user.filters")
        allow("user.forms")
        allow("user.model")
        allow("user.services")
        allow("com.fasterxml.jackson")
        allow("com.google.api")
        allow("com.mailjet.client")
        allow("community.flock.wirespec")
        allow("jakarta.mail")
        allow("jakarta.servlet")
        allow("org.springdoc")
        allow("org.springframework.core")
        allow("org.springframework.dao")
        allow("org.springframework.http")
        allow("org.springframework.security")
        allow("org.springframework.web")
    }

    // HTTP in, services and forms out. Controllers never touch a repository or JPA.
    pkg("application.controllers") {
        allow("api")
        allow("application.authorities")
        allow("application.config.properties")
        allow("application.dsl")
        allow("application.expense")
        allow("application.forms")
        allow("application.google")
        allow("application.interfaces")
        allow("application.model")
        allow("application.services")
        allow("application.utils")
        allow("common")
        allow("core.authorities")
        allow("core.utils")
        allow("expense.domain")
        allow("person.domain")
        allow("user.domain")
        allow("user.exceptions")
        allow("user.forms")
        allow("user.model")
        allow("user.repositories") // TODO: controllers should go through user.services
        allow("user.services")
        allow("com.fasterxml.jackson")
        allow("community.flock.wirespec")
        allow("org.springframework.data")
        allow("org.springframework.http")
        allow("org.springframework.security")
        allow("org.springframework.web")
    }

    // iCalendar rendering; the only place that talks to biweekly.
    pkg("application.dsl") {
        allow("application.model")
        exclusive("biweekly")
    }

    // The expense slice's adapters, still in the application module: JPA entities, persistence and
    // mail adapters, mappers and the controller around the expense domain services.
    pkg("application.expense") {
        allow("api")
        allow("application.config")
        allow("application.controllers.UtilKt")
        allow("application.interfaces")
        allow("application.mappers")
        allow("application.model")
        allow("application.services")
        allow("application.utils")
        allow("common")
        allow("core.authorities")
        allow("core.events")
        allow("core.utils")
        allow("expense.domain")
        allow("person.domain")
        allow("jakarta.persistence")
        allow("org.json")
        allow("org.springframework.data")
        allow("org.springframework.http")
        allow("org.springframework.security")
        allow("org.springframework.transaction")
        allow("org.springframework.web")
    }

    // Request payloads and their validation.
    pkg("application.forms") {
        allow("application.interfaces")
        allow("application.model")
        allow("common")
        allow("person.domain")
        allow("com.fasterxml.jackson")
    }

    // Google Drive and Sheets integration.
    pkg("application.google") {
        allow("application.model")
        allow("application.utils")
        allow("user.model")
        allow("user.services")
        allow("com.google.api")
        allow("com.google.auth")
        allow("org.springframework.security")
    }

    // Period and hours traits shared by the JPA entities.
    pkg("application.interfaces") {
        allow("application.mappers")
        allow("application.model")
        allow("application.services") // TODO: FromToPeriod lives in services
        allow("application.utils")
        allow("common")
        allow("org.springframework.http") // TODO: approval checks throw ResponseStatusException
        allow("org.springframework.web")
    }

    // Entity <-> domain conversion, one XxxMapper.kt per model.
    pkg("application.mappers") {
        allow("application.model")
        allow("assignment.domain")
        allow("client.domain")
        allow("common")
        allow("contract.domain")
        allow("event.domain")
        allow("laptop.domain")
        allow("leaveday.domain")
        allow("person.domain")
        allow("project.domain")
        allow("sickday.domain")
        allow("user.domain")
        allow("user.mappers")
        allow("user.model")
        allow("workday.domain")
        naming { endsWith("MapperKt") }
    }

    // Liquibase custom changes; the only place that talks to Liquibase.
    pkg("application.migrations") {
        exclusive("liquibase")
    }

    // Development fixtures, compiled with the develop profile.
    pkg("application.mocks") {
        allow("application.authorities")
        allow("application.expense")
        allow("application.forms")
        allow("application.mappers")
        allow("application.model")
        allow("application.repository")
        allow("application.services")
        allow("application.utils")
        allow("common")
        allow("core.authorities")
        allow("expense.domain")
        allow("person.domain")
        allow("user.forms")
        allow("user.model")
        allow("user.repositories")
        allow("user.services")
    }

    // JPA entities.
    pkg("application.model") {
        allow("application.interfaces")
        allow("application.services.AggregationServiceKt") // TODO: Day counts working days through the aggregation service
        allow("application.services.FromToPeriod") // TODO: FromToPeriod lives in services
        allow("application.utils")
        allow("common")
        allow("core.events")
        allow("core.model")
        allow("user.model")
        allow("com.fasterxml.jackson")
        allow("jakarta.persistence")
        allow("org.hibernate.annotations")
    }

    // Spring Data repositories over the entities, nothing else.
    pkg("application.repository") {
        allow("application.model")
        allow("common")
        allow("org.springframework.data")
        naming { endsWith("Repository") }
    }

    // Business logic over repositories, entities and forms; storage and mail integrations.
    pkg("application.services") {
        allow("application.ApplicationConstants")
        allow("application.authorities")
        allow("application.config")
        allow("application.dsl")
        allow("application.forms")
        allow("application.interfaces")
        allow("application.mappers")
        allow("application.model")
        allow("application.repository")
        allow("application.utils")
        allow("common")
        allow("core.utils")
        allow("person.domain")
        allow("user.model")
        allow("user.repositories")
        allow("com.google.cloud")
        allow("com.mailjet.client")
        allow("jakarta.persistence")
        allow("jakarta.transaction")
        allow("org.json")
        allow("org.springframework.data")
        allow("org.springframework.transaction")
    }

    pkg("application.utils") {
        allow("application.interfaces")
        allow("application.model")
        allow("application.services") // TODO: DateUtils counts working days through the aggregation service
        allow("common")
        allow("org.springframework.data")
    }
}
