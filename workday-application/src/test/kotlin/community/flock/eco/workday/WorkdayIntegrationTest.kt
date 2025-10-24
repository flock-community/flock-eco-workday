package community.flock.eco.workday

import community.flock.eco.workday.application.Application
import community.flock.eco.workday.config.AppTestConfig
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
import community.flock.eco.workday.helpers.OrganisationHelper
import org.junit.jupiter.api.AfterEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.repository.CrudRepository
import org.springframework.test.context.ActiveProfiles

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
class WorkdayIntegrationTest() {
    @Autowired
    lateinit var repos: List<CrudRepository<*, *>>

    @AfterEach
    fun resetDb() {
        repeat(3) {
            repos.forEach { repo ->
                try {
                    repo.deleteAll()
                } catch (e: Exception) {
                    println("Failed to delete all records for repository: ${repo.javaClass.simpleName}")
                    e.printStackTrace()
                }
            }
        }
    }
}
