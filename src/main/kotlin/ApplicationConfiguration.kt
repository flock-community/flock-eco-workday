package community.flock.eco.workday

import community.flock.eco.feature.user.UserConfiguration
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.data.jpa.repository.config.EnableJpaRepositories


@Configuration
@EnableJpaRepositories
@EntityScan
@ComponentScan(basePackages = [
    "community.flock.eco.workday.services",
    "community.flock.eco.workday.controllers"
])
@Import(UserConfiguration::class)
class ApplicationConfiguration() {

}
