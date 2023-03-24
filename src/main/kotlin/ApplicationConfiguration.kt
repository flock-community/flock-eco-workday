package community.flock.eco.workday

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.events.UserCreateEvent
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.workday.config.MailjetClientConfig
import community.flock.eco.workday.config.properties.PropertyConfig
import community.flock.eco.workday.exactonline.ExactonlineConfiguration
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.context.event.EventListener
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableJpaRepositories
@EntityScan
@ComponentScan(
    basePackages = [
        "community.flock.eco.workday.services",
        "community.flock.eco.workday.controllers",
        "community.flock.eco.workday.mappers"
    ]
)
@Import(
    UserConfiguration::class,
    ExactonlineConfiguration::class,
    ApplicationConstants::class,
    PropertyConfig::class,
    MailjetClientConfig::class
)
class ApplicationConfiguration
