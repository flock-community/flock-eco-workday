package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import community.flock.eco.workday.model.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
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
class PersonRepositoryTest {

    @Autowired
    private lateinit var repository: PersonRepository

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

        val res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(person)
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

        val res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(person)
    }

}
