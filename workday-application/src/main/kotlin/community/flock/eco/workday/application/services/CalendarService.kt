package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.dsl.toCalendar
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.repository.LeaveDayRepository
import community.flock.eco.workday.domain.common.Status
import org.springframework.stereotype.Service

@Service
class CalendarService(
    private val leaveDayRepository: LeaveDayRepository,
) {
    fun getCalendar() =
        leaveDayRepository
            .findAllByStatusAndType(Status.APPROVED, LeaveDayType.HOLIDAY)
            .toCalendar()
}
