package community.flock.eco.workday.user

import community.flock.eco.workday.user.controllers.UserAccountController
import community.flock.eco.workday.user.controllers.UserAuthorityController
import community.flock.eco.workday.user.controllers.UserController
import community.flock.eco.workday.user.controllers.UserControllerAdvice
import community.flock.eco.workday.user.controllers.UserGroupController
import community.flock.eco.workday.user.controllers.UserStatusController
import community.flock.eco.workday.user.filters.UserKeyTokenFilter
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserAuthorityService
import community.flock.eco.workday.user.services.UserGroupService
import community.flock.eco.workday.user.services.UserSecurityService
import community.flock.eco.workday.user.services.UserService
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
@EnableJpaRepositories
@EntityScan
@EnableConfigurationProperties(UserProperties::class)
@Import(
    UserControllerAdvice::class,
    UserController::class,
    UserGroupController::class,
    UserGroupService::class,
    UserAuthorityController::class,
    UserAccountController::class,
    UserStatusController::class,
    UserService::class,
    UserAccountService::class,
    UserAuthorityService::class,
    UserSecurityService::class,
    UserKeyTokenFilter::class,
)
class UserConfiguration {
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
}
