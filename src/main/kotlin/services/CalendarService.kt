package community.flock.eco.workday.services

import community.flock.eco.workday.dsl.calendar
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.stereotype.Service
import java.time.Period

@Service
class CalendarService(
    private val holidayRepository: HolidayRepository
) {

    fun getCalendar(): String = buildCalendar().write()

    private fun buildCalendar() =
        calendar {
            holidayRepository.findAll().map { holiDay ->
                event {
                    uuid = holiDay.code
                    startDate = holiDay.from
                    durationInDays = holiDay.durationInDays
                    summary = "Vakantie ${holiDay.person.getFullName()} (${holiDay.durationInDays} dagen)"
                }
            }
        }

    private val HoliDay.durationInDays get() = Period.between(from, to).days + 1
}
