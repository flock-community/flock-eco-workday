package community.flock.eco.workday.user.services

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.events.UserAccountNewPasswordEvent
import community.flock.eco.workday.user.events.UserAccountPasswordResetEvent
import community.flock.eco.workday.user.events.UserAccountResetCodeGeneratedEvent
import community.flock.eco.workday.user.exceptions.UserAccounNewPasswordMatchesOldPasswordException
import community.flock.eco.workday.user.exceptions.UserAccountExistsException
import community.flock.eco.workday.user.exceptions.UserAccountNotFoundForUserCode
import community.flock.eco.workday.user.exceptions.UserAccountNotFoundForUserEmail
import community.flock.eco.workday.user.exceptions.UserAccountNotFoundWrongOldPasswordException
import community.flock.eco.workday.user.forms.UserAccountForm
import community.flock.eco.workday.user.forms.UserAccountOauthForm
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountKey
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import community.flock.eco.workday.user.model.UserAccountPassword
import community.flock.eco.workday.user.repositories.UserAccountKeyRepository
import community.flock.eco.workday.user.repositories.UserAccountOauthRepository
import community.flock.eco.workday.user.repositories.UserAccountPasswordRepository
import community.flock.eco.workday.user.repositories.UserAccountRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.util.UUID

@Service
@Transactional
class UserAccountService(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder,
    private val userAccountRepository: UserAccountRepository,
    private val userAccountOauthRepository: UserAccountOauthRepository,
    private val userAccountKeyRepository: UserAccountKeyRepository,
    private val userAccountPasswordRepository: UserAccountPasswordRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findUserAccountByUserCode(code: String) = userAccountRepository.findByUserCode(code)

    fun findUserAccountPasswordByUserCode(code: String) = userAccountPasswordRepository.findByUserCode(code).toNullable()

    fun findUserAccountPasswordByUserEmail(email: String) = userAccountPasswordRepository.findByUserEmailIgnoreCase(email).toNullable()

    fun findUserAccountPasswordByResetCode(resetCode: String) = userAccountPasswordRepository.findByResetCode(resetCode).toNullable()

    fun findUserAccountOauthByUserEmail(
        email: String,
        provider: UserAccountOauthProvider,
    ) = userAccountOauthRepository
        .findByUserEmailIgnoreCaseContainingAndProvider(
            email,
            provider,
        ).toNullable()

    fun findUserAccountOauthByReference(reference: String) = userAccountOauthRepository.findByReference(reference).toNullable()

    fun findUserAccountKeyByKey(key: String) = userAccountKeyRepository.findByKey(hashKey(key)).toNullable()

    fun createUserAccountPassword(form: UserAccountPasswordForm): UserAccountPassword =
        findUserAccountPasswordByUserEmail(form.email)
            ?.let { throw UserAccountExistsException(it) }
            .let { form.internalize() }
            .let(userAccountRepository::save)

    fun createUserAccountOauth(form: UserAccountOauthForm): UserAccountOauth =
        findUserAccountOauthByUserEmail(form.email, form.provider)
            ?.let { throw UserAccountExistsException(it) }
            .let { form.internalize() }
            .let(userAccountRepository::save)

    fun createUserAccountPasswordWithoutPassword(userCode: String): UserAccountPassword? =
        findUserAccountPasswordByUserCode(userCode)
            ?.let { throw UserAccountExistsException(it) }
            .let { userService.findByCode(userCode) }
            ?.let { UserAccountPassword(user = it) }
            ?.let(userAccountRepository::save)

    fun generateResetCodeForUserEmail(email: String): String =
        findUserAccountPasswordByUserEmail(email)
            ?.generateResetCode()
            ?.let(userAccountRepository::save)
            ?.also { applicationEventPublisher.publishEvent(UserAccountResetCodeGeneratedEvent(it)) }
            ?.run { resetCode!! }
            ?: throw UserAccountNotFoundForUserEmail(email)

    fun generateResetCodeForUserCode(code: String): String =
        findUserAccountPasswordByUserCode(code)
            ?.generateResetCode()
            ?.let(userAccountRepository::save)
            ?.also { applicationEventPublisher.publishEvent(UserAccountResetCodeGeneratedEvent(it)) }
            ?.run { resetCode!! }
            ?: throw UserAccountNotFoundForUserCode(code)

    fun resetPasswordWithResetCode(
        resetCode: String,
        password: String,
    ) = findUserAccountPasswordByResetCode(resetCode)
        ?.resetPassword(password)
        ?.let(userAccountRepository::save)
        ?.let { applicationEventPublisher.publishEvent(UserAccountPasswordResetEvent(it)) }

    fun resetPasswordWithNew(
        userCode: String,
        oldPassword: String,
        newPassword: String,
    ) = userService
        .findByCode(userCode)
        ?.let { findUserAccountPasswordByUserEmail(it.email) }
        ?.apply {
            if (!passwordEncoder.matches(oldPassword, this.secret)) {
                throw UserAccountNotFoundWrongOldPasswordException()
            }
        }?.apply {
            if (passwordEncoder.matches(newPassword, this.secret)) {
                throw UserAccounNewPasswordMatchesOldPasswordException()
            }
        }?.resetPassword(newPassword)
        ?.let(userAccountRepository::save)
        ?.let { applicationEventPublisher.publishEvent(UserAccountNewPasswordEvent(it)) }

    data class GeneratedKey(
        val id: Long,
        val plainKey: String,
        val label: String?,
    )

    fun generateKeyForUserCode(
        userCode: String,
        label: String?,
    ): GeneratedKey? {
        val plainKey = UUID.randomUUID().toString()
        return userService
            .findByCode(userCode)
            ?.let { user ->
                UserAccountKey(
                    user = user,
                    key = hashKey(plainKey),
                    label = label,
                )
            }?.let { userAccountRepository.save(it) }
            ?.let { GeneratedKey(id = it.id, plainKey = plainKey, label = it.label) }
    }

    private fun UserAccountForm.createUser(): User =
        userService.create(
            UserForm(
                email = email,
                name = name,
                authorities = authorities,
            ),
        )

    fun revokeKeyByIdForUserCode(
        userCode: String,
        keyId: Long,
    ) = userAccountKeyRepository
        .findByUserCode(userCode)
        .find {
            it.id == keyId
        }?.run {
            userAccountRepository.delete(this)
        }

    fun deleteByUserCode(code: String) = userAccountRepository.deleteByUserCode(code)

    private fun UserAccountPasswordForm.internalize() =
        UserAccountPassword(
            user = userService.findByEmail(this.email) ?: this.createUser(),
            secret = passwordEncoder.encode(password),
        )

    private fun UserAccountOauthForm.internalize() =
        UserAccountOauth(
            user = userService.findByEmail(this.email) ?: this.createUser(),
            provider = provider,
            reference = reference,
        )

    private fun UserAccountPassword.generateResetCode() =
        UserAccountPassword(
            id = id,
            user = user,
            secret = null,
            resetCode = UUID.randomUUID().toString(),
        )

    private fun UserAccountPassword.resetPassword(password: String) =
        UserAccountPassword(
            id = id,
            user = user,
            secret = passwordEncoder.encode(password),
            resetCode = null,
        )

    companion object {
        fun hashKey(plainKey: String): String {
            val digest = MessageDigest.getInstance("SHA-256")
            return digest
                .digest(plainKey.toByteArray())
                .joinToString("") { "%02x".format(it) }
        }
    }
}
