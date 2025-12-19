package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.repository.LeaveDayRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.utils.dayFromLocalDate
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

@Transactional
class HoliDayRepositoryTest(
    @Autowired private val repository: LeaveDayRepository,
    @Autowired private val personRepository: PersonRepository,
) : WorkdayIntegrationTest() {
    private val persons: List<Person> =
        mutableListOf(
            Person(
                firstname = "",
                lastname = "",
                email = "admin@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null,
            ),
            Person(
                firstname = "IT",
                lastname = "",
                email = "admin@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null,
            ),
        ).apply { personRepository.saveAll(this) }
            .run { this.toList() }

    @Test
    fun `should find a Holiday via holidayCode by querying findByCode`() {
        val leaveDays: MutableSet<LeaveDay> = mutableSetOf()
        persons.forEach { person ->
            leaveDays.add(
                createAndPersist(
                    LeaveDay(
                        description = "",
                        status = Status.REQUESTED,
                        hours = 42.0,
                        from = dayFromLocalDate(),
                        to = dayFromLocalDate(1),
                        days = listOf(8.0),
                        person = person,
                        type = LeaveDayType.PLUSDAY,
                    ),
                ),
            )
        }

        val holidayCode = repository.findAll().first().code
        val res = repository.findByCode(holidayCode).toNullable()

        assertThat(res).isEqualTo(leaveDays.first())
    }

    private fun createAndPersist(leaveDay: LeaveDay): LeaveDay {
        repository.save(leaveDay)
        return leaveDay
    }
}
