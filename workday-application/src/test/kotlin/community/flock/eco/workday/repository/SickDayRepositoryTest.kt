package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.application.repository.SickdayRepository
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate

@Transactional
class SickDayRepositoryTest(
    @Autowired private val personRepository: PersonRepository,
    @Autowired private val repository: SickdayRepository,
) : WorkdayIntegrationTest() {
    init {
        personRepository.save(
            Person(
                firstname = "Denholm",
                lastname = "Reynholm",
                email = "denholm@reynholm-industries.co.uk",
                position = "Chief Executive Officer",
                number = null,
                user = null,
            ),
        )
    }

    private final fun createSickdayAndPersist(): SickDay {
        val person: Person = personRepository.findAll().first()
        val from = LocalDate.of(1970, 1, 1)

        val sickDay =
            SickDay(
                hours = 8.0,
                person = person,
                from = from,
                to = LocalDate.of(1970, 1, 6),
                days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
                status = Status.REQUESTED,
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
        val person: Person = personRepository.findAll().first()
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
                    days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
                    status = Status.REQUESTED,
                ),
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
