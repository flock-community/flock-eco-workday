package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import javax.transaction.Transactional

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class DayRepositoryTest {
    @Test
    fun `empty dummy test`() {
    }
}
