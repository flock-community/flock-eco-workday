package community.flock.eco.feature.user.services

import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.exceptions.UserAccounNewPasswordMatchesOldPasswordException
import community.flock.eco.feature.user.exceptions.UserAccountExistsException
import community.flock.eco.feature.user.exceptions.UserAccountNotFoundForUserCode
import community.flock.eco.feature.user.exceptions.UserAccountNotFoundWrongOldPasswordException
import community.flock.eco.feature.user.forms.UserAccountOauthForm
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.forms.UserKeyForm
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.feature.user.repositories.UserAccountPasswordRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import javax.transaction.Transactional

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserAccountServiceTest(
    @Autowired val userService: UserService,
    @Autowired val userAccountService: UserAccountService,
    @Autowired val userAccountPasswordRepository: UserAccountPasswordRepository,
    @Autowired val passwordEncoder: PasswordEncoder,
) {
    private val passwordForm =
        UserAccountPasswordForm(
            name = "Willem Veelenturf",
            email = "willem.veelenturf@gmail.com",
            password = "123456",
        )

    @Test
    fun `register user with password`() {
        val account = userAccountService.createUserAccountPassword(passwordForm)

        assertNotNull(account.id)
        assertNotNull(account.user.id)
        assertNotNull(account.user.code)

        assertTrue(passwordEncoder.matches(passwordForm.password, account.secret))

        assertEquals(1, userService.findAll().count())
    }

    @Test
    fun `register user with password twice`() {
        userAccountService.createUserAccountPassword(passwordForm.copy())
//        assertFailsWith<UserAccountExistsException> {
//            userAccountService.createUserAccountPassword(passwordForm.copy())
//        }
    }

    @Test
    fun `test register oauth user`() {
        val form =
            UserAccountOauthForm(
                name = passwordForm.name,
                email = passwordForm.email,
                provider = UserAccountOauthProvider.GOOGLE,
                reference = "123123123",
            )
        val account = userAccountService.createUserAccountOauth(form)

        assertNotNull(account.id)
        assertNotNull(account.user.id)
        assertNotNull(account.user.code)

        assertEquals(form.reference, account.reference)
    }

    @Test
    fun `generate reset code for user that doesn't exist`() {
        assertThrows(UserAccountNotFoundForUserCode::class.java) {
            userAccountService.generateResetCodeForUserCode("doesn't exist")
        }
    }

    @Test
    fun `reset password with wrong reset code`() {
        assertNull(userAccountService.resetPasswordWithResetCode("wrong!", "password"))
    }

    @Test
    fun `generate and reset password with reset code`() {
        val userAccount = userAccountService.createUserAccountPassword(passwordForm.copy())
        assertNull(userAccount.resetCode)
        userAccountService.generateResetCodeForUserCode(userAccount.user.code)
        val resetCode = userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)?.resetCode
        assertNotNull(resetCode)
        userAccountService.resetPasswordWithResetCode(resetCode!!, "password")
        val account = userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)!!
        assertNull(account.resetCode)
        assertTrue(passwordEncoder.matches("password", account.secret))
    }

    @Test
    fun `generate new password with old password`() {
        val userAccount = userAccountService.createUserAccountPassword(passwordForm.copy())
        val newPassword = "password"
        assertNotNull(userAccount.secret)

        userAccountService.resetPasswordWithNew(userAccount.user.code, passwordForm.password, newPassword)
        val account = userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)!!
        assertNotNull(account.secret)
        assertTrue(passwordEncoder.matches(newPassword, account.secret))
    }

    @Test
    fun `generate new password with old password non matching old password should throw an exception`() {
        val userAccount = userAccountService.createUserAccountPassword(passwordForm.copy())
        val newPassword = "password"
        assertNotNull(userAccount.secret)

        assertThrows(UserAccountNotFoundWrongOldPasswordException::class.java) {
            userAccountService.resetPasswordWithNew(userAccount.user.code, "randompassword", newPassword)
        }

        val account = userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)!!
        assertNotNull(account.secret)
        assertFalse(passwordEncoder.matches(newPassword, account.secret))
    }

    @Test
    fun `generate new password with old password should not be the same as oldpassword`() {
        val userAccount = userAccountService.createUserAccountPassword(passwordForm.copy())
        val newPassword = passwordForm.password

        assertNotNull(userAccount.secret)

        assertThrows(UserAccounNewPasswordMatchesOldPasswordException::class.java) {
            userAccountService.resetPasswordWithNew(userAccount.user.code, passwordForm.password, newPassword)
            val account = userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)!!
            assertNotNull(account.secret)
            assertTrue(passwordEncoder.matches(newPassword, account.secret))
        }
    }

    @Test
    fun `request reset via email`() {
        assertNull(userAccountService.createUserAccountPassword(passwordForm.copy()).resetCode)
        userAccountService.generateResetCodeForUserEmail(passwordForm.email)
        assertNotNull(userAccountService.findUserAccountPasswordByUserEmail(passwordForm.email)?.resetCode)
    }

    @Test
    fun `create user account password without password`() {
        val user =
            userService.create(
                UserForm(
                    name = "Pino",
                    email = "pino@sesamstreet.xx",
                ),
            )
        userAccountService.createUserAccountPasswordWithoutPassword(user.code)

        val account = userAccountService.findUserAccountPasswordByUserEmail(user.email)

        assertNotNull(account)
    }

    @Test
    fun `create user account password without password create twice`() {
        val user =
            userService.create(
                UserForm(
                    name = "Pino",
                    email = "pino@sesamstreet.xx",
                ),
            )
        userAccountService.createUserAccountPasswordWithoutPassword(user.code)
        assertThrows(UserAccountExistsException::class.java) {
            userAccountService.createUserAccountPasswordWithoutPassword(user.code)
        }
    }

    @Test
    fun `delete user with account password`() {
        val account = userAccountService.createUserAccountPassword(passwordForm.copy())

        userService.delete(account.user.code)

        assertNull(userService.findByCode(account.user.code))
        assertEquals(0, userAccountPasswordRepository.findAll().count())
    }

    @Test
    fun `create account key for user with label`() {
        var label = "1 2 3 my key"
        val account = userAccountService.createUserAccountPassword(passwordForm.copy())
        val accountKey = userAccountService.generateKeyForUserCode(account.user.code, label)
        val foundAccountKey = userAccountService.findUserAccountKeyByKey(accountKey?.key!!)
        assertEquals(label, foundAccountKey?.label)
    }

    @Test
    fun `update account key for user with label`() {
        var label = "1 2 3 my key"
        var newLabel = "Alrighty then"

        val form =
            UserKeyForm(
                label = newLabel,
            )

        val account = userAccountService.createUserAccountPassword(passwordForm.copy())

        val accountKey = userAccountService.generateKeyForUserCode(account.user.code, label)

        userAccountService.updateKey(accountKey?.key!!, form)

        val foundAccountKey = userAccountService.findUserAccountKeyByKey(accountKey.key)

        assertEquals(newLabel, foundAccountKey?.label)
    }
}
