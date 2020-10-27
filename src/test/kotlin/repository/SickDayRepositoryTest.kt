package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDate
import javax.transaction.Transactional

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class SickDayRepositoryTest {

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var repository: SickdayRepository

    lateinit var person: Person

    @Before
    fun setup() {
        personRepository.save(Person(
            firstname = "Denholm",
            lastname = "Reynholm",
            email = "denholm@reynholm-industries.co.uk",
            position = "Chief Executive Officer",
            number = null,
            user = null
        ))
        person = personRepository.findAll().first()
    }

    private final fun createSickdayAndPersist(): SickDay {
        val from = LocalDate.of(1970, 1, 1)

        val sickDay = SickDay(
            hours = 8.0,
            person = person,
            from = from,
            to = LocalDate.of(1970, 1, 6),
            days = listOf(8.0, 8.0, 8.0, 8.0, 8.0),
            status = Status.REQUESTED
        )

        repository.save(sickDay)

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
                    hours = i * 8.0,
                    person = person,
                    from = from,
                    to = LocalDate.of(1970, 1, i),
                    days = listOf(8.0, 8.0, 8.0, 8.0, 8.0),
                    status = Status.REQUESTED
                )
            )
        }

        val iterator: Iterator<SickDay> = sickDayList.iterator()
        for (sickDay in iterator) {
            repository.save(sickDay)
        }
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(5)

        repository.deleteByCode(res.first().code)
        res = repository.findAll()
        assertThat(res.toSet().size).isEqualTo(4)
    }
}
