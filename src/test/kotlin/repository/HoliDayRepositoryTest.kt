package community.flock.eco.workday.repository

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.utils.dayFromLocalDate
import config.AppTestConfig
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import javax.transaction.Transactional

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class HoliDayRepositoryTest(
    @Autowired private val repository: HolidayRepository,
    @Autowired private val personRepository: PersonRepository
) {

    private val persons: List<Person> = mutableListOf(
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

    @Test
    fun `should find a Holiday via holidayCode by querying findByCode`() {
        val holiDays: MutableSet<HoliDay> = mutableSetOf()
        persons.forEach { person ->
            holiDays.add(
                createAndPersist(
                    HoliDay(
                        description = "",
                        status = Status.REQUESTED,
                        hours = 42.0,
                        from = dayFromLocalDate(),
                        to = dayFromLocalDate(1),
                        days = listOf(8.0),
                        person = person,
                        type = HolidayType.PLUSDAY
                    )
                )
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
