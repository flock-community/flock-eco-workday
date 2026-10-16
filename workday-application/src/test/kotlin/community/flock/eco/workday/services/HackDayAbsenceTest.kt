package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.services.AggregationService
import community.flock.eco.workday.application.services.BudgetSummaryService
import community.flock.eco.workday.application.services.HackDayAbsenceReason
import community.flock.eco.workday.helpers.CreateHelper
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals

@Transactional
class HackDayAbsenceTest(
    @Autowired val createHelper: CreateHelper,
    @Autowired val budgetSummaryService: BudgetSummaryService,
    @Autowired val aggregationService: AggregationService,
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
        // Took the week off but came to the hack day anyway: only the attendance counts.
        createHelper.createHoliDay(attended, weekStart, weekEnd)
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
}
