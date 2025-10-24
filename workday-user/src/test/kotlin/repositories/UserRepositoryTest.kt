package community.flock.eco.feature.user.repositories

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.model.User
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
class UserRepositoryTest(
    @Autowired private val userRepository: UserRepository,
) {
    @Test
    fun `save user via repository`() {
        userRepository.save(
            User(
                name = "User Name",
                email = "user@gmail.com",
            ),
        )

        val res =
            userRepository.findByEmail("user@gmail.com")
                .toNullable()

        assertEquals("User Name", res!!.name)
    }
}
