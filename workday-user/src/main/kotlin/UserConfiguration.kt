package community.flock.eco.feature.user

import community.flock.eco.core.configurations.GraphqlConfiguration
import community.flock.eco.feature.user.controllers.UserAccountController
import community.flock.eco.feature.user.controllers.UserAuthorityController
import community.flock.eco.feature.user.controllers.UserController
import community.flock.eco.feature.user.controllers.UserControllerAdvice
import community.flock.eco.feature.user.controllers.UserGroupController
import community.flock.eco.feature.user.controllers.UserStatusController
import community.flock.eco.feature.user.filters.UserKeyTokenFilter
import community.flock.eco.feature.user.graphql.kotlin.User
import community.flock.eco.feature.user.graphql.kotlin.UserAccount
import community.flock.eco.feature.user.graphql.kotlin.UserAccountKey
import community.flock.eco.feature.user.graphql.kotlin.UserAccountOauth
import community.flock.eco.feature.user.graphql.kotlin.UserAccountPassword
import community.flock.eco.feature.user.resolvers.UserQueryResolver
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserGroupService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.feature.user.services.UserService
import graphql.kickstart.tools.SchemaParserDictionary
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
    GraphqlConfiguration::class,
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
    UserQueryResolver::class,
    UserKeyTokenFilter::class,
)
class UserConfiguration {
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun schemaParserDictionary(): SchemaParserDictionary {
        return SchemaParserDictionary()
            .add(User::class.java)
            .add(UserAccount::class.java)
            .add(UserAccountPassword::class.java)
            .add(UserAccountOauth::class.java)
            .add(UserAccountKey::class.java)
    }
}
