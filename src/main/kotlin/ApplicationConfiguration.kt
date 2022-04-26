package community.flock.eco.workday

import community.flock.eco.core.authorities.Authority
import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.events.UserCreateEvent
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.authorities.SickdayAuthority
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
class ApplicationConfiguration(
    private val userRepository: UserRepository,
    private val userAuthorityService: UserAuthorityService
) {

    @EventListener(UserCreateEvent::class)
    fun handleCreateUserEvent(ev: UserCreateEvent) {
        // Make first user super admin
        val total = userRepository.count()
        if (total <= 1L) {
            val authorities = userAuthorityService.allAuthorities()
                .map { it.toName() }
                .toSet()
            userRepository.findByCode(ev.entity.code)
                .toNullable()
                ?.let {
                    userRepository.save(it.copy(authorities = authorities))
                }
        } else {
            val authorities = listOf<Authority>(
                HolidayAuthority.READ,
                HolidayAuthority.WRITE,
                SickdayAuthority.READ,
                SickdayAuthority.WRITE
            )
                .map { it.toName() }
                .toSet()
            userRepository.findByCode(ev.entity.code)
                .toNullable()
                ?.let { user ->
                    userRepository.save(user.copy(authorities = authorities))
                }
        }
    }
}
