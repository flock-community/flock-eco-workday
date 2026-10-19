package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.domain.common.Status
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

/**
 * A hack day someone missed because of holiday or sickness still costs them hack budget.
 * Per hack day date the absence counts up to the hours of the hack day itself.
 */
data class HackDayAbsence(
    val event: Event,
    val date: LocalDate,
    val personId: UUID,
    val holidayHours: BigDecimal,
    val sickHours: BigDecimal,
)

fun Iterable<HackDayAbsence>.holidayHours(): BigDecimal = fold(BigDecimal.ZERO) { acc, it -> acc + it.holidayHours }

fun Iterable<HackDayAbsence>.sickHours(): BigDecimal = fold(BigDecimal.ZERO) { acc, it -> acc + it.sickHours }

@Service
class HackDayAbsenceService(
    private val eventService: EventService,
    private val contractService: ContractService,
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
) {
    fun findAllByYear(year: Int): List<HackDayAbsence> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return hackDayAbsences(
            hackDays = eventService.findAllEventsOf(year),
            contracts = contractService.findAllActive(from, to).filterIsInstance<ContractInternal>(),
            leaveDays = leaveDayService.findAllActive(from, to),
            sickDays = sickDayService.findAllActive(from, to),
        )
    }

    fun findAllByYearAndPerson(
        year: Int,
        personId: UUID,
    ): List<HackDayAbsence> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return hackDayAbsences(
            hackDays = eventService.findAllEventsOf(year),
            contracts = contractService.findAllActiveByPerson(from, to, personId).filterIsInstance<ContractInternal>(),
            leaveDays = leaveDayService.findAllActiveByPerson(from, to, personId),
            sickDays = sickDayService.findAllActiveByPerson(from, to, personId),
        )
    }

    /** Codes of the hack days the person was sick on; their attendance is locked. */
    fun findSickHackDayCodes(
        year: Int,
        personId: UUID,
    ): List<String> {
        val sickDays = sickDayService.findAllActiveByPerson(LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31), personId)
        return eventService
            .findAllEventsOf(year)
            .filter { it.isSickOn(sickDays) }
            .map { it.code }
    }

    fun isSickOnHackDay(
        event: Event,
        personId: UUID,
    ): Boolean = event.isSickOn(sickDayService.findAllActiveByPerson(event.from, event.to, personId))
}

private fun Event.isSickOn(sickDays: Iterable<SickDay>): Boolean {
    if (type != EventType.FLOCK_HACK_DAY) return false
    val sickHours = sickDays.filter { it.status != Status.REJECTED }.map { it.hoursPerDay() }
    return hoursPerDay().any { (date, hours) ->
        hours > BigDecimal.ZERO && sickHours.any { (it[date] ?: BigDecimal.ZERO) > BigDecimal.ZERO }
    }
}

internal fun hackDayAbsences(
    hackDays: Iterable<Event>,
    contracts: Iterable<ContractInternal>,
    leaveDays: Iterable<LeaveDay>,
    sickDays: Iterable<SickDay>,
): List<HackDayAbsence> {
    val holidayHoursByPerson =
        leaveDays
            .filter { it.type == LeaveDayType.HOLIDAY && it.status != Status.REJECTED }
            .groupBy({ it.person.uuid }, { it.hoursPerDay() })
    val sickHoursByPerson =
        sickDays
            .filter { it.status != Status.REJECTED }
            .groupBy({ it.person.uuid }, { it.hoursPerDay() })

    // One absence per person per date, even when several hack day events share that date.
    val hackDayDates =
        hackDays
            .filter { it.type == EventType.FLOCK_HACK_DAY }
            .flatMap { event ->
                event
                    .hoursPerDay()
                    .filterValues { it > BigDecimal.ZERO }
                    .map { (date, hours) -> Triple(date, event, hours) }
            }.groupBy { it.first }

    return hackDayDates
        .toSortedMap()
        .flatMap { (date, onDate) ->
            val (_, event, hackHours) = onDate.maxBy { it.third }
            val attendees = onDate.flatMap { (_, e, _) -> e.eventDays.map { it.person.uuid } }.toSet()
            contracts
                .filter { it.hackTimeBudget > 0 && it.covers(date) }
                .map { it.person!!.uuid }
                .distinct()
                .filter { it !in attendees }
                .mapNotNull { personId ->
                    val holiday = holidayHoursByPerson.hoursOn(personId, date).min(hackHours)
                    val sick = sickHoursByPerson.hoursOn(personId, date).min(hackHours - holiday)
                    HackDayAbsence(event, date, personId, holiday, sick)
                        .takeIf { holiday > BigDecimal.ZERO || sick > BigDecimal.ZERO }
                }
        }
}

private fun ContractInternal.covers(date: LocalDate) = !from.isAfter(date) && (to == null || !to!!.isBefore(date))

private fun Map<UUID, List<Map<LocalDate, BigDecimal>>>.hoursOn(
    personId: UUID,
    date: LocalDate,
): BigDecimal = this[personId].orEmpty().fold(BigDecimal.ZERO) { acc, hours -> acc + (hours[date] ?: BigDecimal.ZERO) }
