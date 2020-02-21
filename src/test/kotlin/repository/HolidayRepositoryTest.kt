package community.flock.eco.workday.repository

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.model.Holiday
import community.flock.eco.workday.model.HolidayStatus
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.utils.convertDayOff
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

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
class HolidayRepositoryTest {
    @Autowired
    private lateinit var entity: TestEntityManager
    @Autowired
    private lateinit var repository: HolidayRepository
    @Autowired
    private lateinit var periodRepository: PeriodRepository
    @Autowired
    private lateinit var personRepository: PersonRepository

    lateinit var periods: List<Period>
    lateinit var persons: List<Person>

    @Before
    fun setup() {
        periods = mutableListOf(
            Period(
                from = dayFromLocalDate(),
                to = dayFromLocalDate(1),
                days = convertDayOff(listOf(8), dayFromLocalDate())
            ),
            Period(
                from = dayFromLocalDate(),
                to = dayFromLocalDate(2),
                days = convertDayOff(listOf(8, 8), dayFromLocalDate())
            )
        ).apply { periodRepository.saveAll(this) }
            .run { this.toList() }

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
        periodRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Test
    fun `should find a Holiday via holidayCode by querying findByCode`() {
        val holidays: MutableSet<Holiday> = mutableSetOf()
        persons.forEachIndexed { idx, person ->
            holidays.add(
                createAndPersist(Holiday(
                    description = "",
                    status = HolidayStatus.REQUESTED,
                    hours = 42,
                    period = periods[idx],
                    person = person
                ))
            )
        }

        val holidayCode = repository.findAll().first().code
        val res = repository.findByCode(holidayCode).toNullable()

        assertThat(res).isEqualTo(holidays.first())
    }

    @Test
    fun `should delete a Holiday via holidayCode by querying deleteByCode`() {
//        val holiday = createAndPersist(Holiday(
//            description = "",
//            status = HolidayStatus.REQUESTED,
//            hours = 42,
//            period = period,
//            user = user
//        ))
//
//        val holidayCode = repository.findAll().first().code
//        repository.deleteByCode(holidayCode)
//        val res = repository.findAll()
//
//        assertThat(res).isEmpty()
    }

    @Test
    fun `should find a Holiday via userCode by querying findAllByUserCode`() {
//        val secondaryUser = User(
//            name = ""
//        )
//
//        val holiday = createAndPersist(Holiday(
//            description = "",
//            status = HolidayStatus.REQUESTED,
//            hours = 42,
//            period = period,
//            user = user
//        ))
//
//        val holidays = repository.findAllByUserCode(user.code)
    }

    // *-- utility functions --*
    /**
     * persists and flushes the Holiday, thus stores it in database
     * @param holiday the holiday which should be persisted into the database
     * @return holiday the holiday persisted into the database
     */
    private fun createAndPersist(holiday: Holiday): Holiday {
        entity.persist(holiday)
        entity.flush()
        return holiday
    }
}
