package clients

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import config.AppTestConfig
import kotlinx.coroutines.test.runBlockingTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@ActiveProfiles(profiles = ["test"])
class KetoClientTest {

    @Autowired
    lateinit var ketoClient: KetoClientConfiguration.KetoClient
    @Test
    fun `create relation`() = runBlockingTest {

        val body = CreateRelationshipBody(
            namespace = "Flock",
            `object` = "123",
            subject_id = "456"
        )
        val req = CreateRelationship.RequestApplicationJson(body)

        val res = ketoClient.createRelationship(req)

        println(res)

    }
}
