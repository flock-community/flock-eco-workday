package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Person
import config.AppTestConfig
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.domain.Pageable
import org.springframework.test.context.ActiveProfiles
import javax.transaction.Transactional

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class PersonRepositoryTest(
    @Autowired private val repository: PersonRepository,
) {
    @Test
    fun `should create person without email`() {
        val person =
            Person(
                firstname = "Maurice",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                user = null,
            )

        repository.save(person)
        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }

    @Test
    fun `should create person with email`() {
        val person =
            Person(
                firstname = "Roy",
                lastname = "Trennerman",
                email = "roy@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null,
            )

        repository.save(person)

        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }

    @Test
    fun `should find person by firstname`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "ro")
        assertThat(res1.totalElements).isEqualTo(2)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "rob")
        assertThat(res2.totalElements).isEqualTo(1)

        val res3 = repository.findAllByFullName(Pageable.unpaged(), "ba")
        assertThat(res3.totalElements).isEqualTo(0)

        val res4 = repository.findAllByFullName(Pageable.unpaged(), "ROB")
        assertThat(res4.totalElements).isEqualTo(1)
    }

    @Test
    fun `should find person by lastname`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "j")
        assertThat(res1.totalElements).isEqualTo(2)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "jansen")
        assertThat(res2.totalElements).isEqualTo(1)

        val res3 = repository.findAllByFullName(Pageable.unpaged(), "ba")
        assertThat(res3.totalElements).isEqualTo(0)

        val res4 = repository.findAllByFullName(Pageable.unpaged(), "JANSEN")
        assertThat(res4.totalElements).isEqualTo(1)
    }

    @Test
    fun `should find person by full name`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "rob ja")
        assertThat(res1.totalElements).isEqualTo(1)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "roy jansen")
        assertThat(res2.totalElements).isEqualTo(0)
    }
}
