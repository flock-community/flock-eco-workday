package community.flock.eco.workday.services

import community.flock.eco.workday.dsl.toCalendar
import community.flock.eco.workday.model.LeaveDayType.HOLIDAY
import community.flock.eco.workday.model.Status.APPROVED
import community.flock.eco.workday.repository.LeaveDayRepository
import org.springframework.stereotype.Service

@Service
class CalendarService(
    private val leaveDayRepository: LeaveDayRepository
) {
    fun getCalendar() =
        leaveDayRepository
            .findAllByStatusAndType(APPROVED, HOLIDAY)
            .toCalendar()
}
