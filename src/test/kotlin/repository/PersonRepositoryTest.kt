package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.model.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
class PersonRepositoryTest {
    @Autowired
    private lateinit var entity: TestEntityManager

    @Autowired
    private lateinit var repository: PersonRepository

    @Test
    fun `should create person without email`() {
        val person = createPersonAndPersist(
                Person(
                    firstname = "Maurice",
                    lastname = "Moss",
                    email = "",
                    position = "",
                    number = null,
                    user = null
                )
        )

        val res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(person)
    }

    @Test
    fun `should create person with email`() {
        val person = createPersonAndPersist(
                Person(
                    firstname = "Roy",
                    lastname = "Trennerman",
                    email = "roy@reynholm-industries.co.uk",
                    position = "",
                    number = null,
                    user = null
                )
        )

        val res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(person)
    }

    private final fun createPersonAndPersist(person: Person): Person {
        entity.persist(person)
        entity.flush()
        return person
    }
}
