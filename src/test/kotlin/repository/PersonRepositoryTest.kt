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
    fun `s`() {
        val p1 = Person(firstname = "Hello", lastname = "World", email = "")
        entity.persist(p1)
        val res = repository.findAll()
        entity.flush()
        assertThat(res.first()).isEqualTo(p1)
//        assertEquals(expected = p1, actual = res, message = "meh!")
    }
}
