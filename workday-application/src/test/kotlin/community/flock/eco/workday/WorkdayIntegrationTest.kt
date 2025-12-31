package community.flock.eco.workday

import community.flock.eco.workday.application.Application
import community.flock.eco.workday.config.AppTestConfig
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import community.flock.eco.workday.helpers.OrganisationHelper
import community.flock.eco.workday.utils.CleanupDbService
import org.junit.jupiter.api.AfterEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.transaction.TestTransaction

@ActiveProfiles("test")
@AutoConfigureDataJpa
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@AutoConfigureWebClient
@Import(CreateHelper::class, DataHelper::class, OrganisationHelper::class)
@SpringBootTest(
    classes = [Application::class, AppTestConfig::class],
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
)
class WorkdayIntegrationTest {
    @Autowired
    private lateinit var cleanupDbService: CleanupDbService

    @AfterEach
    fun resetDb() {
        // End current test transaction
        if (TestTransaction.isActive()) {
            TestTransaction.flagForCommit()
            TestTransaction.end()
        }

        // Cleanup database
        cleanupDbService.cleanup()
    }
}
