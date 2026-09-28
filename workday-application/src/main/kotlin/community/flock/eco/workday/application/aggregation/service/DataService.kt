package community.flock.eco.workday.application.aggregation.service

import community.flock.eco.workday.application.assignment.model.Assignment
import community.flock.eco.workday.application.assignment.service.AssignmentService
import community.flock.eco.workday.application.contract.model.Contract
import community.flock.eco.workday.application.contract.service.ContractService
import community.flock.eco.workday.application.event.model.EventDay
import community.flock.eco.workday.application.event.service.EventDayService
import community.flock.eco.workday.application.leaveday.model.LeaveDay
import community.flock.eco.workday.application.leaveday.service.LeaveDayService
import community.flock.eco.workday.application.sickday.model.SickDay
import community.flock.eco.workday.application.sickday.service.SickDayService
import community.flock.eco.workday.application.workday.model.WorkDay
import community.flock.eco.workday.application.workday.service.WorkDayService
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

data class Data(
    val sickDay: Iterable<SickDay>,
    val leaveDay: Iterable<LeaveDay>,
    val workDay: Iterable<WorkDay>,
    val eventDay: Iterable<EventDay>,
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
    private val eventDayService: EventDayService,
) {
    fun findAllData(
        from: LocalDate,
        to: LocalDate,
    ) = Data(
        sickDay = sickDayService.findAllActive(from, to),
        leaveDay = leaveDayService.findAllActive(from, to),
        workDay = workDayService.findAllActive(from, to),
        eventDay = eventDayService.findAllActive(from, to),
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
        eventDay = eventDayService.findAllActiveByPerson(from, to, personId),
        assignment = assignmentService.findAllActiveByPerson(from, to, personId),
        contract = contractService.findAllActiveByPerson(from, to, personId),
    )
}
