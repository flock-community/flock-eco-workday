package community.flock.eco.feature.user.resolvers

import community.flock.eco.feature.user.services.UserService
import graphql.kickstart.tools.GraphQLQueryResolver
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component
import javax.transaction.Transactional
import community.flock.eco.feature.user.graphql.kotlin.User as UserGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccount as UserAccountGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccountOauth as UserAccountOauthGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccountPassword as UserAccountPasswordGraphql
import community.flock.eco.feature.user.model.User as UserModel
import community.flock.eco.feature.user.model.UserAccount as UserAccountModel
import community.flock.eco.feature.user.model.UserAccountKey as UserAccountKeyModel
import community.flock.eco.feature.user.model.UserAccountOauth as UserAccountOauthModel
import community.flock.eco.feature.user.model.UserAccountPassword as UserAccountPasswordModel

@Component
@ConditionalOnClass(GraphQLQueryResolver::class)
class UserQueryResolver(
    private val userService: UserService,
) : GraphQLQueryResolver {
    fun findUserById(id: String): UserGraphql? =
        userService
            .findByCode(id)
            ?.produce()

    @Transactional
    fun findAllUsers(
        search: String? = "",
        page: Int?,
        size: Int?,
        order: String?,
    ) = PageRequest.of(page ?: 0, size ?: 10)
        .let { pageable ->
            userService
                .findAll(search ?: "", search ?: "", pageable)
                .map { it.produce() }
        }

    fun countUsers() = userService.count()
}

fun UserModel.produce() =
    UserGraphql(
        id = this.code,
        name = this.name,
        email = this.email,
        authorities = this.authorities.toList(),
        accounts = this.accounts.map { it.produce() },
        created = this.created,
    )

fun UserAccountModel.produce(): UserAccountGraphql =
    when (this) {
        is UserAccountPasswordModel ->
            UserAccountPasswordGraphql(
                id = this.id.toString(),
            )
        is UserAccountKeyModel ->
            UserAccountPasswordGraphql(
                id = this.id.toString(),
            )
        is UserAccountOauthModel ->
            UserAccountOauthGraphql(
                id = this.id.toString(),
                provider = this.provider.name,
            )
        else -> error("cannot produce UserAccount")
    }
