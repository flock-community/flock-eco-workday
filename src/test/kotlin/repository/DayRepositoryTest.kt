package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import org.junit.jupiter.api.Test
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import javax.transaction.Transactional

@SpringBootTest(classes = [Application::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class DayRepositoryTest {
    @Test
    fun `empty dummy test`() {
    }
}
