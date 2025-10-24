package community.flock.eco.feature.user.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.forms.UserKeyForm
import community.flock.eco.feature.user.model.UserAccount
import community.flock.eco.feature.user.repositories.UserAccountRepository
import community.flock.eco.feature.user.services.UserAccountService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/user-accounts")
class UserAccountController(
    private val userAccountRepository: UserAccountRepository,
    private val userAccountService: UserAccountService,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllAccounts(
        @RequestParam(defaultValue = "", required = false) search: String,
        page: Pageable,
    ): ResponseEntity<Iterable<UserAccount>> =
        userAccountRepository
            .findAll()
            .toResponse()

    @PutMapping("/reset-password")
    fun resetPasswordWithResetCode(
        @RequestBody form: PasswordResetForm,
    ) = userAccountService
        .resetPasswordWithResetCode(form.resetCode, form.password)
        .toResponse()

    @PutMapping("/new-password")
    @PreAuthorize("isAuthenticated()")
    fun resetPasswordWithNew(
        authentication: Authentication,
        @RequestBody form: NewPasswordForm,
    ) = userAccountService
        .resetPasswordWithNew(authentication.name, form.oldPassword, form.newPassword)
        .toResponse()

    @PostMapping("/generate-key")
    @PreAuthorize("isAuthenticated()")
    fun generateKey(
        authentication: Authentication,
        @RequestBody form: UserKeyForm,
    ) = userAccountService
        .generateKeyForUserCode(authentication.name, form.label)
        .toResponse()

    @PutMapping("/update-key")
    @PreAuthorize("isAuthenticated()")
    fun updateKey(
        authentication: Authentication,
        @RequestParam key: String,
        @RequestBody form: UserKeyForm,
    ) = userAccountService
        .run {
            if (!this.findUserAccountKeyByUserCode(authentication.name).contains(this.findUserAccountKeyByKey(key))) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change this key")
            }
            this
        }
        .updateKey(key, form)
        .toResponse()

    @PostMapping("/revoke-key")
    @PreAuthorize("isAuthenticated()")
    fun revokeAccountKey(
        authentication: Authentication,
        @RequestBody form: KeyRevokeForm,
    ) = userAccountService
        .revokeKeyForUserCode(authentication.name, form.key)
        .toResponse()

    data class NewPasswordForm(
        val oldPassword: String,
        val newPassword: String,
    )

    data class PasswordResetForm(
        val resetCode: String,
        val password: String,
    )

    data class KeyRevokeForm(
        val key: String,
    )
}
