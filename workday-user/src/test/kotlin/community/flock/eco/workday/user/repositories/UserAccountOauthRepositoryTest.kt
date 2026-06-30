package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.UserConfiguration
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThatExceptionOfType
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserAccountOauthRepositoryTest(
    @Autowired private val userRepository: UserRepository,
    @Autowired private val userAccountOauthRepository: UserAccountOauthRepository,
) {
    @Test
    fun `a second coupling with the same provider and reference is rejected`() {
        val user = userRepository.save(User(name = "Sjors", email = "sjors@flock.community"))
        userAccountOauthRepository.saveAndFlush(
            UserAccountOauth(user = user, reference = "sub-sjors", provider = UserAccountOauthProvider.KRATOS),
        )

        assertThatExceptionOfType(DataIntegrityViolationException::class.java).isThrownBy {
            userAccountOauthRepository.saveAndFlush(
                UserAccountOauth(user = user, reference = "sub-sjors", provider = UserAccountOauthProvider.KRATOS),
            )
        }
    }
}
