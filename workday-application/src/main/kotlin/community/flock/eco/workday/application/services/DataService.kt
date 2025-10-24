package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.model.WorkDay
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

data class Data(
    val sickDay: Iterable<SickDay>,
    val leaveDay: Iterable<LeaveDay>,
    val workDay: Iterable<WorkDay>,
    val eventDay: Iterable<Event>,
    val assignment: Iterable<Assignment>,
    val contract: Iterable<Contract>,
)

@Service
class DataService(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val eventService: EventService,
) {
    fun findAllData(
        from: LocalDate,
        to: LocalDate,
    ) = Data(
        sickDay = sickDayService.findAllActive(from, to),
        leaveDay = leaveDayService.findAllActive(from, to),
        workDay = workDayService.findAllActive(from, to),
        eventDay = eventService.findAllActive(from, to),
        assignment = assignmentService.findAllActive(from, to),
        contract = contractService.findAllActive(from, to),
    )

    fun findAllData(
        from: LocalDate,
        to: LocalDate,
        personId: UUID,
    ) = Data(
        sickDay = sickDayService.findAllActiveByPerson(from, to, personId),
        leaveDay = leaveDayService.findAllActiveByPerson(from, to, personId),
        workDay = workDayService.findAllActiveByPerson(from, to, personId),
        eventDay = eventService.findAllActiveByPerson(from, to, personId),
        assignment = assignmentService.findAllActiveByPerson(from, to, personId),
        contract = contractService.findAllActiveByPerson(from, to, personId),
    )
}
