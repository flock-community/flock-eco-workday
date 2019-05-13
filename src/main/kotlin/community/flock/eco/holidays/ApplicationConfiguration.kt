package community.flock.eco.holidays

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.*
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.web.context.WebApplicationContext



@Configuration
@EnableJpaRepositories
@EntityScan
@ComponentScan(basePackages = [
    "community.flock.eco.holidays.services",
    "community.flock.eco.holidays.controllers"
])
@Import(UserConfiguration::class)
class ApplicationConfiguration(private val userRepository: UserRepository){

}