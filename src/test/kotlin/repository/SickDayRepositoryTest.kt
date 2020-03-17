package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
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
class SickDayRepositoryTest {
    @Autowired
    private lateinit var entity: TestEntityManager
    @Autowired
    private lateinit var personRepository: PersonRepository
    @Autowired
    private lateinit var repository: SickdayRepository

    lateinit var person: Person

    @Before
    fun setup() {
        entity.persist(Person(
            firstname = "Denholm",
            lastname = "Reynholm",
            email = "denholm@reynholm-industries.co.uk",
            position = "Chief Executive Officer",
            number = null,
            user = null,
            dateOfBirth = LocalDate.now()
        ))
        entity.flush()
        person = personRepository.findAll().first()
    }

    private final fun createSickdayAndPersist(): SickDay {
        val from = LocalDate.of(1970, 1, 1)

        val sickDay = SickDay(
            hours = 8,
            person = person,
            from = from,
            to = LocalDate.of(1970, 1, 6),
            days = listOf(8, 8, 8, 8, 8)
        )

        entity.persist(sickDay)
        entity.flush()

        return sickDay
    }

    @Test
    fun `expect sickDays to be created for a person`() {
        var res: MutableIterable<SickDay> = repository.findAll()
        assertThat(res.toSet().isEmpty()).isTrue()

        val sickDay = createSickdayAndPersist()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(sickDay)

        val sickDayTwo = createSickdayAndPersist()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(2)
        assertThat(res.first()).isNotEqualTo(sickDayTwo)
        assertThat(res.last()).isNotEqualTo(sickDay)
        assertThat(res.last()).isEqualTo(sickDayTwo)
    }

    @Test
    fun `should delete sickDay from repository`() {
        var res: MutableIterable<SickDay>
        val sickDayList: MutableList<SickDay> = mutableListOf()
        val from = LocalDate.of(1970, 1, 1)

        for (i in 1..5) {

            sickDayList.add(
                SickDay(
                    hours = i * 8,
                    person = person,
                    from = from,
                    to = LocalDate.of(1970, 1, i),
                    days = listOf(8, 8, 8, 8, 8)
                )
            )
        }

        val iterator: Iterator<SickDay> = sickDayList.iterator()
        for (sickDay in iterator) {
            entity.persist(sickDay)
        }
        entity.flush()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(5)

        repository.deleteByCode(res.first().code)
        res = repository.findAll()
        assertThat(res.toSet().size).isEqualTo(4)
    }
}
