package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class EventServiceTest(
    @Autowired private val eventService: EventService,
    @Autowired private val budgetAllocationService: BudgetAllocationService,
    @Autowired private val studyTimeBudgetAllocationService: StudyTimeBudgetAllocationService,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val eventFrom = LocalDate.of(2026, 1, 15)
    private val eventTo = LocalDate.of(2026, 1, 15)

    private fun createHackDayEvent(personUuid: java.util.UUID) =
        eventService.create(
            EventForm(
                description = "Type swap test",
                from = eventFrom,
                to = eventTo,
                hours = 8.0,
                days = mutableListOf(8.0),
                budget = 200.0,
                personIds = listOf(personUuid),
                type = EventType.FLOCK_HACK_DAY,
                defaultTimeAllocationType = "HACK_TIME",
            ),
        )

    @Test
    fun `typeSwapFromHackToStudyDeletesHackAllocationAndCreatesStudyAllocation`() {
        val person = createHelper.createPerson()
        val event = createHackDayEvent(person.uuid)

        // Precondition: 1 HackTimeBudgetAllocation, 0 StudyTimeBudgetAllocation
        val before = budgetAllocationService.findAllByEventCode(event.code)
        assertEquals(1, before.filterIsInstance<HackTimeBudgetAllocation>().size)
        assertEquals(0, before.filterIsInstance<StudyTimeBudgetAllocation>().size)

        // Update event type to CONFERENCE (Study)
        eventService.update(
            event.code,
            EventForm(
                description = "Type swap test",
                from = eventFrom,
                to = eventTo,
                hours = 8.0,
                days = mutableListOf(8.0),
                budget = 200.0,
                personIds = listOf(person.uuid),
                type = EventType.CONFERENCE,
                defaultTimeAllocationType = "STUDY_TIME",
            ),
        )

        // Assert: 0 HackTimeBudgetAllocation, 1 StudyTimeBudgetAllocation with correct hours
        val after = budgetAllocationService.findAllByEventCode(event.code)
        assertEquals(0, after.filterIsInstance<HackTimeBudgetAllocation>().size)
        val studyAllocations = after.filterIsInstance<StudyTimeBudgetAllocation>()
        assertEquals(1, studyAllocations.size)
        assertEquals(8.0, studyAllocations.first().totalHours)
    }

    @Test
    fun `typeSwapWhenPersonHadBothTimeAllocationsCollapsesToSingleNewType`() {
        val person = createHelper.createPerson()
        val event = createHackDayEvent(person.uuid)

        // Read the hack allocation that was created
        val hackAlloc =
            budgetAllocationService
                .findAllByEventCode(event.code)
                .filterIsInstance<HackTimeBudgetAllocation>()
                .first()

        // Create a second (Study) time allocation directly — simulating the D-03 anomaly
        studyTimeBudgetAllocationService.create(
            StudyTimeBudgetAllocation(
                person = hackAlloc.person,
                eventCode = hackAlloc.eventCode,
                date = hackAlloc.date,
                description = hackAlloc.description,
                dailyTimeAllocations = hackAlloc.dailyTimeAllocations,
                totalHours = hackAlloc.totalHours,
            ),
        )

        // Precondition: 2 time allocations (1 Hack + 1 Study)
        val before = budgetAllocationService.findAllByEventCode(event.code)
        assertEquals(1, before.filterIsInstance<HackTimeBudgetAllocation>().size)
        assertEquals(1, before.filterIsInstance<StudyTimeBudgetAllocation>().size)

        // Update event type to CONFERENCE (Study)
        eventService.update(
            event.code,
            EventForm(
                description = "Type swap test",
                from = eventFrom,
                to = eventTo,
                hours = 8.0,
                days = mutableListOf(8.0),
                budget = 200.0,
                personIds = listOf(person.uuid),
                type = EventType.CONFERENCE,
                defaultTimeAllocationType = "STUDY_TIME",
            ),
        )

        // Assert: 0 HackTimeBudgetAllocation, exactly 1 StudyTimeBudgetAllocation
        val after = budgetAllocationService.findAllByEventCode(event.code)
        assertTrue(after.none { it is HackTimeBudgetAllocation })
        assertEquals(1, after.filterIsInstance<StudyTimeBudgetAllocation>().size)
    }
}
