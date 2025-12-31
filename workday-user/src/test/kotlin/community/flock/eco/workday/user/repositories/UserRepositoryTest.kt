package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.UserConfiguration
import community.flock.eco.workday.user.model.User
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
            userRepository
                .findByEmail("user@gmail.com")
                .toNullable()

        assertEquals("User Name", res!!.name)
    }
}
