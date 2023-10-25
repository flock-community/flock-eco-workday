package community.flock.eco.workday

import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.workday.config.MailjetClientConfig
import community.flock.eco.workday.config.properties.PropertyConfig
import community.flock.eco.workday.exactonline.ExactonlineConfiguration
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.web.servlet.config.annotation.EnableWebMvc

@Configuration
@EnableJpaRepositories
//@EnableWebMvc
@EntityScan
@ComponentScan(
    basePackages = [
        "community.flock.eco.workday.clients",
        "community.flock.eco.workday.services",
        "community.flock.eco.workday.controllers",
        "community.flock.eco.workday.mappers",
        "community.flock.eco.workday.google",
        "community.flock.eco.workday.authentication",
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
