package community.flock.eco.workday.user.controllers

import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.model.UserAccount
import community.flock.eco.workday.user.repositories.UserRepository
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserRegisterController(
    private val passwordEncoder: PasswordEncoder,
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val userAccountService: UserAccountService,
) {
    @PostMapping("/register")
    fun register(
        @RequestBody form: UserAccountPasswordForm,
    ): ResponseEntity<UserAccount> =
        userAccountService
            .createUserAccountPassword(form)
            .toResponse()
}
