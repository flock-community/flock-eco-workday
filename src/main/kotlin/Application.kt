package community.flock.eco.workday

import community.flock.eco.cloud.stub.StubCloudConfiguration
import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.events.CreateUserEvent
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.fundraising.config.WebMvcConfig
import community.flock.eco.fundraising.config.WebSecurityConfig
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.context.event.EventListener


@Configuration
@SpringBootApplication(exclude = arrayOf(
        RepositoryRestMvcAutoConfiguration::class
))
@Import(ApplicationConfiguration::class,
        WebMvcConfig::class,
        WebSecurityConfig::class,
        StubCloudConfiguration::class)
class Application(
        val userRepository: UserRepository,
        val userAuthorityService: UserAuthorityService) : SpringBootServletInitializer() {

    @EventListener(CreateUserEvent::class)
    fun handleCreateUserEvent(ev: CreateUserEvent) {
        // Make first user super admin
        val total = userRepository.count()
        if (total == 0L) {
            val authorities = userAuthorityService.allAuthorities()
                    .map { it.toName() }
                    .toSet()
            userRepository.findByCode(ev.entity.code)
                    .toNullable()
                    ?.let {
                        userRepository.save(it.copy(authorities = authorities))
                    }
        }
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}



