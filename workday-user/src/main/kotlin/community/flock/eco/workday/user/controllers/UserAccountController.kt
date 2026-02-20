package community.flock.eco.workday.user.controllers

import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.user.forms.UserKeyForm
import community.flock.eco.workday.user.model.UserAccount
import community.flock.eco.workday.user.repositories.UserAccountRepository
import community.flock.eco.workday.user.services.UserAccountService
import org.springframework.data.domain.Pageable
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
    ): ResponseEntity<List<UserAccount>> =
        userAccountRepository
            .findAll(page)
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
        ?.let {
            GenerateKeyResponse(
                id = it.id.toString(),
                key = it.plainKey,
                label = it.label,
            )
        }.toResponse()

    @PostMapping("/revoke-key")
    @PreAuthorize("isAuthenticated()")
    fun revokeAccountKey(
        authentication: Authentication,
        @RequestBody form: KeyRevokeForm,
    ) = userAccountService
        .revokeKeyByIdForUserCode(authentication.name, form.id)
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
        val id: Long,
    )

    data class GenerateKeyResponse(
        val id: String,
        val key: String,
        val label: String?,
    )
}
