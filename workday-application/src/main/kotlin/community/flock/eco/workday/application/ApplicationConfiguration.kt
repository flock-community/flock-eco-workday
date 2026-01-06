package community.flock.eco.workday.application

import community.flock.eco.workday.application.config.GoogleDriveConfiguration
import community.flock.eco.workday.application.config.MailjetClientConfig
import community.flock.eco.workday.application.config.cloud.StubCloudConfiguration
import community.flock.eco.workday.application.config.properties.PropertyConfig
import community.flock.eco.workday.application.exactonline.ExactonlineConfiguration
import community.flock.eco.workday.user.UserConfiguration
import community.flock.wirespec.integration.spring.kotlin.configuration.EnableWirespecController
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableJpaRepositories
@EntityScan
@ComponentScan
@EnableWirespecController
@Import(
    UserConfiguration::class,
    ExactonlineConfiguration::class,
    ApplicationConstants::class,
    PropertyConfig::class,
    MailjetClientConfig::class,
    GoogleDriveConfiguration::class,
    StubCloudConfiguration::class,
)
class ApplicationConfiguration
