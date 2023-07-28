package community.flock.eco.workday.services

import community.flock.eco.workday.dsl.toCalendar
import community.flock.eco.workday.model.HolidayType.HOLIDAY
import community.flock.eco.workday.model.Status.APPROVED
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.stereotype.Service

@Service
class CalendarService(
    private val holidayRepository: HolidayRepository
) {
    fun getCalendar() =
        holidayRepository
            .findAllByStatusAndType(APPROVED, HOLIDAY)
            .toCalendar()
}
