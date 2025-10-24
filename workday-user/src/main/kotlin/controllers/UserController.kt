package community.flock.eco.feature.user.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.exceptions.UserCannotRemoveOwnAccount
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccount
import community.flock.eco.feature.user.model.UserAccountKey
import community.flock.eco.feature.user.model.UserAccountOauth
import community.flock.eco.feature.user.model.UserAccountPassword
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserService
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import community.flock.eco.feature.user.graphql.kotlin.User as UserGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccount as UserAccountGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccountKey as UserAccountKeyGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccountOauth as UserAccountOauthGraphql
import community.flock.eco.feature.user.graphql.kotlin.UserAccountPassword as UserAccountPasswordGraphql

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val userAccountService: UserAccountService,
) {
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    fun findMeUser(authentication: Authentication) =
        userService
            .read(authentication.name)
            ?.toGraphql()
            .toResponse()

    @GetMapping("/me/accounts")
    @PreAuthorize("isAuthenticated()")
    fun findMeUserAccounts(authentication: Authentication) =
        userAccountService
            .findUserAccountByUserCode(authentication.name)
            .toList()
            .map { it.toGraphql() }
            .toResponse()

    @GetMapping
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllUsers(
        @RequestParam(defaultValue = "", required = false) search: String,
        page: Pageable,
    ) = userRepository
        .findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(search, search, page)
        .map { it.toGraphql() }
        .toResponse()

    @PostMapping("search")
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllUsersByCodes(
        @RequestBody(required = false) codes: Set<String>,
    ) = userRepository.findAllByCodeIn(codes)
        .toList()
        .map { it.toGraphql() }
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun createUser(
        @RequestBody form: UserForm,
    ) = userService
        .create(form)
        .toGraphql()
        .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findUserById(
        @PathVariable code: String,
    ) = userService
        .read(code)
        ?.toGraphql()
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun updateUser(
        @PathVariable code: String,
        @RequestBody form: UserForm,
    ) = userService
        .update(code, form)
        ?.toGraphql()
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun deleteUser(
        @PathVariable code: String,
        principal: Principal?,
    ): ResponseEntity<Unit> {
        if (principal?.name == code) throw UserCannotRemoveOwnAccount()
        return userService
            .delete(code)
            .toResponse()
    }

    @PutMapping("/{code}/reset-password")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun generateUserResetCodeForUserCode(
        @PathVariable code: String,
    ) = userAccountService
        .generateResetCodeForUserCode(code)
        .let { Unit }
        .toResponse()

    @PutMapping("/reset-password")
    fun generateUserResetCode(
        @RequestBody form: RequestPasswordReset,
    ) = userAccountService
        .generateResetCodeForUserEmail(form.email)
        .let { Unit }
        .toResponse()

    data class RequestPasswordReset(
        val email: String,
    )
}

private fun User.toGraphql(): UserGraphql {
    return UserGraphql(
        id = this.code,
        name = this.name,
        email = this.email,
        authorities = this.authorities.toList(),
        accounts = this.accounts.map { it.toGraphql() },
        created = this.created,
    )
}

private fun UserAccount.toGraphql(): UserAccountGraphql {
    return when (this) {
        is UserAccountPassword -> UserAccountPasswordGraphql(id = id.toString())
        is UserAccountOauth -> UserAccountOauthGraphql(id = id.toString(), provider = provider.name)
        is UserAccountKey -> UserAccountKeyGraphql(id = id.toString(), key = key)
        else -> error("Cannot map UserAccount")
    }
}
