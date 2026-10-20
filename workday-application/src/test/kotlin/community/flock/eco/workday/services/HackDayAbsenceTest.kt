package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.services.AggregationService
import community.flock.eco.workday.application.services.BudgetSummaryService
import community.flock.eco.workday.application.services.HackDayAbsenceReason
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.helpers.CreateHelper
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals

@Transactional
class HackDayAbsenceTest(
    @Autowired val createHelper: CreateHelper,
    @Autowired val budgetSummaryService: BudgetSummaryService,
    @Autowired val aggregationService: AggregationService,
    @Autowired val sickDayService: SickDayService,
    @Autowired val leaveDayService: LeaveDayService,
    @Autowired val eventDayRepository: EventDayRepository,
) : WorkdayIntegrationTest() {
    private val year = 2022
    private val from = LocalDate.of(year, 1, 1)
    private val to = LocalDate.of(year, 12, 31)

    // Monday to Friday; the hack day is on the Wednesday.
    private val weekStart = LocalDate.of(year, 3, 7)
    private val weekEnd = LocalDate.of(year, 3, 11)
    private val hackDay = LocalDate.of(year, 3, 9)

    @Test
    fun `holiday and sickness on a hack day count against the hack budget`() {
        val onHoliday = createHelper.createPersonEntity("On", "Holiday")
        val sick = createHelper.createPersonEntity("Is", "Sick")
        val attended = createHelper.createPersonEntity("Did", "Attend")
        listOf(onHoliday, sick, attended).forEach {
            createHelper.createContractInternal(person = it, from = from, to = to, hackTimeBudget = 160)
        }
        createHelper.createHoliDay(onHoliday, weekStart, weekEnd)
        createHelper.createSickDay(sick, weekStart, weekEnd)
        createHelper.createEvent(
            from = hackDay,
            to = hackDay,
            hours = 8.0,
            days = listOf(8.0),
            persons = listOf(attended.uuid),
            costs = 0.0,
            type = EventType.FLOCK_HACK_DAY,
        )

        val holidaySummary = budgetSummaryService.getSummary(onHoliday.uuid, year)
        assertEquals(8.0, holidaySummary.hackTimeBudget.used.toDouble())
        assertEquals(152.0, holidaySummary.hackTimeBudget.available.toDouble())
        assertEquals(HackDayAbsenceReason.HOLIDAY, holidaySummary.events.single().absence)
        assertEquals(hackDay, holidaySummary.events.single().from)

        val sickSummary = budgetSummaryService.getSummary(sick.uuid, year)
        assertEquals(8.0, sickSummary.hackTimeBudget.used.toDouble())
        assertEquals(HackDayAbsenceReason.SICK, sickSummary.events.single().absence)

        val attendedSummary = budgetSummaryService.getSummary(attended.uuid, year)
        assertEquals(8.0, attendedSummary.hackTimeBudget.used.toDouble())
        assertEquals(null, attendedSummary.events.single().absence)

        val report = aggregationService.hackdayReport(year).associateBy { it.name }
        report.getValue(onHoliday.getFullName()).let {
            assertEquals(0.0, it.usedHours.toDouble())
            assertEquals(8.0, it.holidayOnHackDayHours.toDouble())
            assertEquals(0.0, it.sickOnHackDayHours.toDouble())
        }
        report.getValue(sick.getFullName()).let {
            assertEquals(0.0, it.holidayOnHackDayHours.toDouble())
            assertEquals(8.0, it.sickOnHackDayHours.toDouble())
        }
        report.getValue(attended.getFullName()).let {
            assertEquals(8.0, it.usedHours.toDouble())
            assertEquals(0.0, it.holidayOnHackDayHours.toDouble())
        }

        val details = aggregationService.getHackdayDetailsMe(year, onHoliday)
        assertEquals(8.0, details.holidayOnHackDayHours.toDouble())
        assertEquals(152.0, details.totalHoursRemaining.toDouble())
    }

    @Test
    fun `absence on other event types or without a hack budget costs nothing`() {
        val noBudget = createHelper.createPersonEntity("No", "Budget")
        val conferenceMiss = createHelper.createPersonEntity("Conference", "Miss")
        createHelper.createContractInternal(person = noBudget, from = from, to = to, hackTimeBudget = 0)
        createHelper.createContractInternal(person = conferenceMiss, from = from, to = to, hackTimeBudget = 160)
        createHelper.createHoliDay(noBudget, weekStart, weekEnd)
        createHelper.createHoliDay(conferenceMiss, weekStart, weekEnd)
        createHelper.createEvent(
            from = hackDay,
            to = hackDay,
            persons = emptyList(),
            type = EventType.CONFERENCE,
        )
        createHelper.createEvent(
            from = LocalDate.of(year, 6, 1),
            to = LocalDate.of(year, 6, 1),
            persons = emptyList(),
            type = EventType.FLOCK_HACK_DAY,
        )

        assertEquals(
            0.0,
            budgetSummaryService
                .getSummary(noBudget.uuid, year)
                .hackTimeBudget.used
                .toDouble(),
        )
        assertEquals(
            0.0,
            budgetSummaryService
                .getSummary(conferenceMiss.uuid, year)
                .hackTimeBudget.used
                .toDouble(),
        )
    }

    @Test
    fun `two hack day events on the same date cost a missed day only once`() {
        val sick = createHelper.createPersonEntity("Double", "Booked")
        createHelper.createContractInternal(person = sick, from = from, to = to, hackTimeBudget = 160)
        createHelper.createSickDay(sick, weekStart, weekEnd)
        repeat(2) {
            createHelper.createEvent(
                from = hackDay,
                to = hackDay,
                persons = emptyList(),
                type = EventType.FLOCK_HACK_DAY,
            )
        }

        val summary = budgetSummaryService.getSummary(sick.uuid, year)
        assertEquals(8.0, summary.hackTimeBudget.used.toDouble())
        assertEquals(1, summary.events.size)
    }

    @Test
    fun `reporting sick after signing up drops the sign-up, and going home halfway keeps the hours attended`() {
        val fullDay = createHelper.createPersonEntity("Full", "Day")
        val halfDay = createHelper.createPersonEntity("Half", "Day")
        listOf(fullDay, halfDay).forEach {
            createHelper.createContractInternal(person = it, from = from, to = to, hackTimeBudget = 160)
        }
        val event =
            createHelper.createEvent(
                from = hackDay,
                to = hackDay,
                hours = 8.0,
                days = listOf(8.0),
                persons = listOf(fullDay.uuid, halfDay.uuid),
                costs = 0.0,
                type = EventType.FLOCK_HACK_DAY,
            )

        sickDayService.create(sickForm(fullDay.uuid, 8.0))
        sickDayService.create(sickForm(halfDay.uuid, 4.0))

        val signUps = eventDayRepository.findAllByEventCode(event.code).associateBy { it.person.uuid }
        assertEquals(null, signUps[fullDay.uuid])
        assertEquals(4.0, signUps.getValue(halfDay.uuid).hours)

        budgetSummaryService.getSummary(fullDay.uuid, year).let {
            assertEquals(8.0, it.hackTimeBudget.used.toDouble())
            assertEquals(HackDayAbsenceReason.SICK, it.events.single().absence)
        }
        budgetSummaryService.getSummary(halfDay.uuid, year).let {
            assertEquals(8.0, it.hackTimeBudget.used.toDouble())
            assertEquals(listOf(null, HackDayAbsenceReason.SICK), it.events.map { e -> e.absence })
            assertEquals(listOf(4.0, 4.0), it.events.map { e -> e.hours })
        }

        // Editing the sick day again must not cut the hours a second time.
        val halfDaySick = sickDayService.findAllActiveByPerson(hackDay, hackDay, halfDay.uuid).single()
        sickDayService.update(halfDaySick.code, sickForm(halfDay.uuid, 4.0), isUpdatedByOwner = true)
        assertEquals(mapOf(halfDay.uuid to 4.0), signUpHours(event))
    }

    @Test
    fun `booking holiday after signing up cuts the sign-up`() {
        val fullDay = createHelper.createPersonEntity("Holiday", "Full")
        val halfDay = createHelper.createPersonEntity("Holiday", "Half")
        val leave = createHelper.createPersonEntity("Parental", "Leave")
        val event = signedUpHackDay(fullDay, halfDay, leave)

        val fullDayHoliday = leaveDayService.create(holidayForm(fullDay.uuid, 8.0))
        leaveDayService.create(holidayForm(halfDay.uuid, 4.0))
        leaveDayService.create(holidayForm(leave.uuid, 8.0).copy(type = LeaveDayType.PAID_PARENTAL_LEAVE))

        // Only holiday counts against the hack budget, so other leave leaves the sign-up alone.
        assertEquals(mapOf(halfDay.uuid to 4.0, leave.uuid to 8.0), signUpHours(event))
        budgetSummaryService.getSummary(fullDay.uuid, year).let {
            assertEquals(8.0, it.hackTimeBudget.used.toDouble())
            assertEquals(HackDayAbsenceReason.HOLIDAY, it.events.single().absence)
        }

        // Cancelling the holiday doesn't sign them up again; they do that themselves.
        leaveDayService.deleteByCode(fullDayHoliday.code)
        assertEquals(mapOf(halfDay.uuid to 4.0, leave.uuid to 8.0), signUpHours(event))
    }

    @Test
    fun `an admin adding someone who is already away keeps their hours from counting twice`() {
        val onHoliday = createHelper.createPersonEntity("Added", "OnHoliday")
        val halfSick = createHelper.createPersonEntity("Added", "HalfSick")
        leaveDayService.create(holidayForm(onHoliday.uuid, 8.0))
        sickDayService.create(sickForm(halfSick.uuid, 4.0))

        val event = signedUpHackDay(onHoliday, halfSick)

        assertEquals(mapOf(halfSick.uuid to 4.0), signUpHours(event))
        assertEquals(
            8.0,
            budgetSummaryService
                .getSummary(onHoliday.uuid, year)
                .hackTimeBudget.used
                .toDouble(),
        )
        assertEquals(
            8.0,
            budgetSummaryService
                .getSummary(halfSick.uuid, year)
                .hackTimeBudget.used
                .toDouble(),
        )
    }

    private fun signedUpHackDay(vararg persons: Person): Event {
        persons.forEach { createHelper.createContractInternal(person = it, from = from, to = to, hackTimeBudget = 160) }
        return createHelper.createEvent(
            from = hackDay,
            to = hackDay,
            hours = 8.0,
            days = listOf(8.0),
            persons = persons.map { it.uuid },
            costs = 0.0,
            type = EventType.FLOCK_HACK_DAY,
        )
    }

    private fun signUpHours(event: Event) = eventDayRepository.findAllByEventCode(event.code).associate { it.person.uuid to it.hours }

    private fun sickForm(
        personId: UUID,
        hours: Double,
    ) = SickDayForm(from = hackDay, to = hackDay, days = mutableListOf(hours), hours = hours, personId = personId)

    private fun holidayForm(
        personId: UUID,
        hours: Double,
    ) = LeaveDayForm(description = "", from = hackDay, to = hackDay, days = mutableListOf(hours), hours = hours, personId = personId)
}
