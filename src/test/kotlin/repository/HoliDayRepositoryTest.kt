package community.flock.eco.workday.repository

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.HolidayStatus
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.utils.dayFromLocalDate
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDate

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
class HoliDayRepositoryTest {
    @Autowired
    private lateinit var entity: TestEntityManager
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
                user = null,
                dateOfBirth = LocalDate.now()
            ),
            Person(
                firstname = "IT",
                lastname = "",
                email = "admin@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null,
                dateOfBirth = LocalDate.now()
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
                    status = HolidayStatus.REQUESTED,
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
        entity.persist(holiDay)
        entity.flush()
        return holiDay
    }
}
