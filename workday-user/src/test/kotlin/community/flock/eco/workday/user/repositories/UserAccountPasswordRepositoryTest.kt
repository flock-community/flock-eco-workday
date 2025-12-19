package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.UserConfiguration
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountPassword
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserAccountPasswordRepositoryTest(
    @Autowired private val userRepository: UserRepository,
    @Autowired private val userAccountPasswordRepository: UserAccountPasswordRepository,
) {
    @Test
    fun `save user via repository`() {
        val user =
            User(
                name = "User Name",
                email = "user@gmail.com",
            ).save()

        val account =
            UserAccountPassword(
                user = user,
                secret = "123456",
            )
        userAccountPasswordRepository.save(account)

        val res1 = userAccountPasswordRepository.findByUserEmailIgnoreCase("USER@gmail.com").toNullable()
        assertEquals("User Name", res1?.user?.name)

        val res2 = userAccountPasswordRepository.findByUserEmailIgnoreCase("user@Gmail.com").toNullable()
        assertEquals("User Name", res2?.user?.name)
    }

    fun User.save() = userRepository.save(this)
}
