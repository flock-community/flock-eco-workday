package community.flock.eco.workday.repository

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.Application
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.utils.dayFromLocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import javax.persistence.EntityManager
import javax.transaction.Transactional

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureTestDatabase
@ActiveProfiles(profiles = ["test"])
@Transactional
class HoliDayRepositoryTest {

    @Autowired
    private lateinit var repository: HolidayRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    lateinit var persons: List<Person>

    @Before
    fun setup() {

        persons = mutableListOf(
            Person(
                firstname = "",
                lastname = "",
                email = "admin@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null
            ),
            Person(
                firstname = "IT",
                lastname = "",
                email = "admin@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null
            )
        ).apply { personRepository.saveAll(this) }
            .run { this.toList() }
    }

    @After
    fun teardown() {
        personRepository.deleteAll()
    }

    @Test
    fun `should find a Holiday via holidayCode by querying findByCode`() {
        val holiDays: MutableSet<HoliDay> = mutableSetOf()
        persons.forEach { person ->
            holiDays.add(
                createAndPersist(HoliDay(
                    description = "",
                    status = Status.REQUESTED,
                    hours = 42,
                    from = dayFromLocalDate(),
                    to = dayFromLocalDate(1),
                    days = listOf(8),
                    person = person
                ))
            )
        }

        val holidayCode = repository.findAll().first().code
        val res = repository.findByCode(holidayCode).toNullable()

        assertThat(res).isEqualTo(holiDays.first())
    }

    private fun createAndPersist(holiDay: HoliDay): HoliDay {
        repository.save(holiDay)
        return holiDay
    }
}
