package community.flock.eco.workday.controllers

import community.flock.eco.workday.Application
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@ActiveProfiles(profiles = ["test"])
class HolidayControllerTest {
    @Test
    fun `empty dummy test`() {}
}
