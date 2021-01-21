package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import javax.transaction.Transactional

@SpringBootTest(classes = [ApplicationConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class PersonRepositoryTest(
    @Autowired private val repository: PersonRepository
) {

    @Test
    fun `should create person without email`() {
        val person = Person(
            firstname = "Maurice",
            lastname = "Moss",
            email = "",
            position = "",
            number = null,
            user = null
        )

        repository.save(person)
        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }

    @Test
    fun `should create person with email`() {
        val person = Person(
            firstname = "Roy",
            lastname = "Trennerman",
            email = "roy@reynholm-industries.co.uk",
            position = "",
            number = null,
            user = null
        )

        repository.save(person)

        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }
}
