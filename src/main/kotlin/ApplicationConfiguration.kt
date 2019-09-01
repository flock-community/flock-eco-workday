package community.flock.eco.workday

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.events.CreateUserEvent
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAuthorityService
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.context.event.EventListener
import org.springframework.data.jpa.repository.config.EnableJpaRepositories


@Configuration
@EnableJpaRepositories
@EntityScan
@ComponentScan(basePackages = [
    "community.flock.eco.workday.services",
    "community.flock.eco.workday.controllers"
])
@Import(UserConfiguration::class)
class ApplicationConfiguration(private val userRepository: UserRepository,
                               private val userAuthorityService: UserAuthorityService) {

    @EventListener(CreateUserEvent::class)
    fun handleCreateUserEvent(ev: CreateUserEvent) {
        // Make first user super admin
        val total = userRepository.count()
        if (total == 1L) {
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
