package community.flock.eco.workday.user.controllers

import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.user.exceptions.UserCannotRemoveOwnAccount
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccount
import community.flock.eco.workday.user.model.UserAccountKey
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountPassword
import community.flock.eco.workday.user.repositories.UserRepository
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserService
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
            ?.produce()
            .toResponse()

    @GetMapping("/me/accounts")
    @PreAuthorize("isAuthenticated()")
    fun findMeUserAccounts(authentication: Authentication) =
        userAccountService
            .findUserAccountByUserCode(authentication.name)
            .toList()
            .map { it.produce() }
            .toResponse()

    @GetMapping
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllUsers(
        @RequestParam(defaultValue = "", required = false) search: String,
        page: Pageable,
    ) = userRepository
        .findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(search, search, page)
        .map { it.produce() }
        .toResponse()

    @PostMapping("search")
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllUsersByCodes(
        @RequestBody(required = false) codes: Set<String>,
    ) = userRepository
        .findAllByCodeIn(codes)
        .toList()
        .map { it.produce() }
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun createUser(
        @RequestBody form: UserForm,
    ) = userService
        .create(form)
        .produce()
        .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findUserById(
        @PathVariable code: String,
    ) = userService
        .read(code)
        ?.produce()
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun updateUser(
        @PathVariable code: String,
        @RequestBody form: UserForm,
    ) = userService
        .update(code, form)
        ?.produce()
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

private fun User.produce(): UserResponse =
    UserResponse(
        id = code,
        name = name,
        email = email,
        authorities = authorities.toList(),
        accounts = accounts.map { it.produce() },
        created = created,
    )

private fun UserAccount.produce(): UserAccountResponse =
    when (this) {
        is UserAccountPassword -> UserAccountPasswordResponse(id = id.toString(), created = created)
        is UserAccountOauth -> UserAccountOauthResponse(id = id.toString(), created = created, provider = provider.name)
        is UserAccountKey -> UserAccountKeyResponse(id = id.toString(), created = created, label = label)
        else -> error("Cannot map UserAccount")
    }
