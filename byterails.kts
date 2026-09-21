// Architecture rules, checked on the compiled classes of every module by byterails
// (https://github.com/flock-community/byterails). Prefixes are relative to the base package
// community.flock.eco.workday, configured on the plugin in the parent pom together with the
// `hexagonal` default rule set, which declares the isolated `domain` package: it may only use the
// language baseline and itself, so no framework or library can leak into the domain model.
//
// byterails is a whitelist: a class may only reference what its package's declaration, the
// enclosing declarations and the root block allow. A build failure names the class, the reference
// and the allows in effect; extend the allow list here when the new dependency is architecturally
// sound, or move the code. Rules marked TODO are existing shortcuts that keep the build green until
// the code is untangled; do not add to them.
byterails {
    allow("kotlin")
    allow("java")
    allow("org.jetbrains.annotations")

    // Wirespec-generated API contract: shared with the frontend, so it knows nothing of the application.
    pkg("api") {
        allow("community.flock.wirespec")
        allow("org.springframework.aot")
        allow("org.springframework.context")
        allow("org.springframework.web")
    }

    // Vendored, frozen modules, declared as a whole. The dependency direction between modules is
    // enforced: core sees only the domain, user sees core and the domain, neither sees the application.
    pkg("core") {
        allow("domain")
        allow("jakarta.mail")
        allow("jakarta.persistence")
        allow("org.springframework.context")
        allow("org.springframework.data")
        allow("org.springframework.http")
        allow("org.springframework.util")
        allow("org.springframework.web")
    }

    pkg("user") {
        allow("core")
        allow("domain")
        allow("com.fasterxml.jackson")
        allow("jakarta.persistence")
        allow("jakarta.servlet")
        allow("jakarta.transaction")
        allow("org.reflections")
        allow("org.springframework.boot")
        allow("org.springframework.context")
        allow("org.springframework.data")
        allow("org.springframework.http")
        allow("org.springframework.security")
        allow("org.springframework.stereotype")
        allow("org.springframework.transaction")
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
        allow("core.events")
        allow("core.model")
        allow("core.services")
        allow("domain")
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
        allow("core.authorities")
        allow("core.utils")
        allow("domain")
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

    // The expense slice: JPA entities, persistence and mail adapters, mappers and the controller
    // around the domain's expense services.
    pkg("application.expense") {
        allow("api")
        allow("application.config")
        allow("application.controllers.UtilKt")
        allow("application.interfaces")
        allow("application.mappers")
        allow("application.model")
        allow("application.services")
        allow("application.utils")
        allow("core.authorities")
        allow("core.events")
        allow("core.utils")
        allow("domain")
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
        allow("domain")
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
        allow("domain")
        allow("org.springframework.http") // TODO: approval checks throw ResponseStatusException
        allow("org.springframework.web")
    }

    // Entity <-> domain conversion, one XxxMapper.kt per model.
    pkg("application.mappers") {
        allow("application.model")
        allow("domain")
        allow("user.mappers")
        allow("user.model")
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
        allow("core.authorities")
        allow("domain")
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
        allow("core.events")
        allow("core.model")
        allow("domain")
        allow("user.model")
        allow("com.fasterxml.jackson")
        allow("jakarta.persistence")
        allow("org.hibernate.annotations")
    }

    // Spring Data repositories over the entities, nothing else.
    pkg("application.repository") {
        allow("application.model")
        allow("domain")
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
        allow("core.utils")
        allow("domain")
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
        allow("domain")
        allow("org.springframework.data")
    }
}
