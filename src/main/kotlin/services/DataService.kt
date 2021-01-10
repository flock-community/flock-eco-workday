package community.flock.eco.workday.services

import community.flock.eco.workday.interfaces.filterInRange
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.WorkDay
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

data class Data(
    val sickDay: Iterable<SickDay>,
    val holiDay: Iterable<HoliDay>,
    val workDay: Iterable<WorkDay>,
    val eventDay: Iterable<Event>,
    val assignment: Iterable<Assignment>,
    val contract: Iterable<Contract>
)

@Service
class DataService(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val holiDayService: HoliDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val eventService: EventService
) {

    fun findAllData(from: LocalDate, to: LocalDate) = Data(
        sickDayService.findAllActive(from, to),
        holiDayService.findAllActive(from, to),
        workDayService.findAllActive(from, to),
        eventService.findAllActive(from, to),
        assignmentService.findAllActive(from, to),
        contractService.findAllActive(from, to)
    )

    fun findAllData(personId: UUID) = Data(
        sickDayService.findAllByPersonUuid(personId),
        holiDayService.findAllByPersonUuid(personId),
        workDayService.findAllByPersonUuid(personId),
        eventService.findAllByPersonUuid(personId),
        assignmentService.findAllByPersonUuid(personId),
        contractService.findAllByPersonUuid(personId)
    )
}

fun Data.filterInRange(date: LocalDate): Data = Data(
    sickDay.filterInRange(date),
    holiDay.filterInRange(date),
    workDay.filterInRange(date),
    eventDay.filterInRange(date),
    assignment.filterInRange(date),
    contract.filterInRange(date)
)

