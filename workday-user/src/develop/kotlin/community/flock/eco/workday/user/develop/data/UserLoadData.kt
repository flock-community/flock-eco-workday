package community.flock.eco.workday.user.develop.data

import community.flock.eco.workday.core.data.LoadData
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountPassword
import community.flock.eco.workday.user.repositories.UserAccountRepository
import community.flock.eco.workday.user.repositories.UserRepository
import community.flock.eco.workday.user.services.UserAuthorityService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class UserLoadData(
    val userRepository: UserRepository,
    val userAccountRepository: UserAccountRepository,
    val userAuthorityService: UserAuthorityService,
    val passwordEncoder: PasswordEncoder,
) : LoadData<User> {
    override fun load(n: Int): Iterable<User> {
        val users = (1..n).map { user(it) }.let { userRepository.saveAll(it) }
        users.map { account(it) }.let { userAccountRepository.saveAll(it) }
        return users
    }

    private fun user(int: Int) =
        User(
            name = "name-$int",
            code = int.toString(),
            email = "email-$int@email-$int.xx",
            authorities =
                userAuthorityService.allAuthorities()
                    .map { it.toName() }
                    .toMutableSet(),
        )

    private fun account(user: User) =
        UserAccountPassword(
            user = user,
            secret = passwordEncoder.encode(user.name),
        )
}
