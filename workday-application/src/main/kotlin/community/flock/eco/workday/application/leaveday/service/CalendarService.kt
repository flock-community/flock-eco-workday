package community.flock.eco.workday.application.leaveday.service

import community.flock.eco.workday.application.leaveday.model.LeaveDayType
import community.flock.eco.workday.application.leaveday.persistence.LeaveDayRepository
import community.flock.eco.workday.domain.common.Status
import org.springframework.stereotype.Service

@Service
class CalendarService(
    private val leaveDayRepository: LeaveDayRepository,
) {
    fun getCalendar() =
        leaveDayRepository
            .findAllByStatusInAndType(listOf(Status.APPROVED, Status.DONE), LeaveDayType.HOLIDAY)
            .toCalendar()
}
