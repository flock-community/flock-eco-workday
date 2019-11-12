package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager

@DataJpaTest
class PersonRepositoryTests @Autowired constructor(
        /* if added here error is raised:
        *  java.lang.Exception: Test class should have exactly one public zero-argument constructor
        *  I do not understand since the official guide of spring kotlin does add variables here.
        */
    val entity: TestEntityManager,
    val personRepository: PersonRepository
) {
    @Test
    fun `s`() {
        val p1 = Person(firstname = "Hello", lastname = "World", email = "")
        entity.persist(p1)
        entity.flush()
        val res = personRepository.findAll()
        println(res)
        assertThat(res).isEqualTo(p1)
//        assertEquals(expected = p1, actual = res, message = "meh!")
    }
}
