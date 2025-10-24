package community.flock.eco.feature.user.repositories

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountPassword
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import javax.transaction.Transactional

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
