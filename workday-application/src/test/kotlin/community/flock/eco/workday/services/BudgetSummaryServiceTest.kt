package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.EventDayInput
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.model.BudgetCategory
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.services.BudgetSummaryService
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.helpers.CreateHelper
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals

@Transactional
class BudgetSummaryServiceTest(
    @Autowired val createHelper: CreateHelper,
    @Autowired val budgetSummaryService: BudgetSummaryService,
    @Autowired val eventDayRepository: EventDayRepository,
    @Autowired val eventService: EventService,
) : WorkdayIntegrationTest() {
    private val year = 2022
    private val from = LocalDate.of(year, 1, 1)
    private val to = LocalDate.of(year, 12, 31)

    @Test
    fun `derives used hack hours, training hours and training money from event days by marker`() {
        val person = createHelper.createPersonEntity("Bud", "Get")
        createHelper.createContractInternal(
            person = person,
            from = from,
            to = to,
            hackTimeBudget = 160,
            trainingTimeBudget = 200,
            trainingMoneyBudget = BigDecimal("5000.00"),
        )

        createHelper.createEvent(
            from = LocalDate.of(year, 3, 1),
            to = LocalDate.of(year, 3, 1),
            hours = 8.0,
            days = listOf(8.0),
            persons = listOf(person.uuid),
            costs = 0.0,
            type = EventType.FLOCK_HACK_DAY,
        )
        createHelper.createEvent(
            from = LocalDate.of(year, 4, 1),
            to = LocalDate.of(year, 4, 2),
            hours = 16.0,
            days = listOf(8.0, 8.0),
            persons = listOf(person.uuid),
            costs = 1000.0,
            type = EventType.CONFERENCE,
        )

        val summary = budgetSummaryService.getSummary(person.uuid, year)

        assertEquals(160.0, summary.hackTimeBudget.budget.toDouble())
        assertEquals(8.0, summary.hackTimeBudget.used.toDouble())
        assertEquals(152.0, summary.hackTimeBudget.available.toDouble())

        assertEquals(200.0, summary.trainingTimeBudget.budget.toDouble())
        assertEquals(16.0, summary.trainingTimeBudget.used.toDouble())
        assertEquals(184.0, summary.trainingTimeBudget.available.toDouble())

        assertEquals(5000.0, summary.trainingMoneyBudget.budget.toDouble())
        assertEquals(1000.0, summary.trainingMoneyBudget.used.toDouble())
        assertEquals(4000.0, summary.trainingMoneyBudget.available.toDouble())
    }

    @Test
    fun `lists a per-event breakdown of the person's budget-bearing event days, sorted by date`() {
        val person = createHelper.createPersonEntity("Break", "Down")
        createHelper.createContractInternal(
            person = person,
            from = from,
            to = to,
            hackTimeBudget = 160,
            trainingTimeBudget = 200,
            trainingMoneyBudget = BigDecimal("5000.00"),
        )

        createHelper.createEvent(
            from = LocalDate.of(year, 4, 1),
            to = LocalDate.of(year, 4, 2),
            hours = 16.0,
            days = listOf(8.0, 8.0),
            persons = listOf(person.uuid),
            costs = 1000.0,
            type = EventType.CONFERENCE,
        )
        createHelper.createEvent(
            from = LocalDate.of(year, 3, 1),
            to = LocalDate.of(year, 3, 1),
            hours = 8.0,
            days = listOf(8.0),
            persons = listOf(person.uuid),
            costs = 0.0,
            type = EventType.FLOCK_HACK_DAY,
        )

        val events = budgetSummaryService.getSummary(person.uuid, year).events

        assertEquals(2, events.size)

        val hack = events[0]
        assertEquals(BudgetCategory.HACK, hack.category)
        assertEquals(8.0, hack.hours)

        val training = events[1]
        assertEquals(BudgetCategory.TRAINING, training.category)
        assertEquals(16.0, training.hours)
        assertEquals(BigDecimal("1000.00"), training.cost)
    }

    @Test
    fun `prorates the training money budget per period instead of summing it per contract`() {
        val person = createHelper.createPersonEntity("Pro", "Rate")
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 6, 30),
            trainingMoneyBudget = BigDecimal("5000.00"),
        )
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(year, 7, 1),
            to = LocalDate.of(year, 12, 31),
            trainingMoneyBudget = BigDecimal("5000.00"),
        )

        val summary = budgetSummaryService.getSummary(person.uuid, year)

        assertEquals(5000.0, summary.trainingMoneyBudget.budget.toDouble(), 0.01)
    }

    @Test
    fun `splits a person's conference hours across hack and training budgets`() {
        val person = createHelper.createPersonEntity("Mix", "Split")
        createHelper.createContractInternal(
            person = person,
            from = from,
            to = to,
            hackTimeBudget = 160,
            trainingTimeBudget = 200,
            trainingMoneyBudget = BigDecimal("5000.00"),
        )

        EventForm(
            description = "Conference partly on hack budget",
            from = LocalDate.of(year, 4, 1),
            to = LocalDate.of(year, 4, 1),
            hours = 8.0,
            days = mutableListOf(8.0),
            costs = 1000.0,
            personIds = listOf(person.uuid),
            participants =
                listOf(
                    EventDayInput(person.uuid, hours = 6.0, cost = BigDecimal("1000.00"), budgetCategory = null),
                    EventDayInput(person.uuid, hours = 2.0, cost = null, budgetCategory = BudgetCategory.HACK),
                ),
            type = EventType.CONFERENCE,
        ).run { eventService.create(this) }

        val summary = budgetSummaryService.getSummary(person.uuid, year)

        assertEquals(2.0, summary.hackTimeBudget.used.toDouble())
        assertEquals(6.0, summary.trainingTimeBudget.used.toDouble())
        assertEquals(1000.0, summary.trainingMoneyBudget.used.toDouble())
    }

    @Test
    fun `per-event breakdown labels a split conference's days by their own budget category`() {
        val person = createHelper.createPersonEntity("Mix", "Label")
        createHelper.createContractInternal(
            person = person,
            from = from,
            to = to,
            hackTimeBudget = 160,
            trainingTimeBudget = 200,
            trainingMoneyBudget = BigDecimal("5000.00"),
        )

        EventForm(
            description = "Conference partly on hack budget",
            from = LocalDate.of(year, 4, 1),
            to = LocalDate.of(year, 4, 1),
            hours = 8.0,
            days = mutableListOf(8.0),
            costs = 1000.0,
            personIds = listOf(person.uuid),
            participants =
                listOf(
                    EventDayInput(person.uuid, hours = 6.0, cost = BigDecimal("1000.00"), budgetCategory = null),
                    EventDayInput(person.uuid, hours = 2.0, cost = null, budgetCategory = BudgetCategory.HACK),
                ),
            type = EventType.CONFERENCE,
        ).run { eventService.create(this) }

        val events = budgetSummaryService.getSummary(person.uuid, year).events

        val hack = events.single { it.category == BudgetCategory.HACK }
        assertEquals(2.0, hack.hours)
        assertEquals(null, hack.cost)

        val training = events.single { it.category == BudgetCategory.TRAINING }
        assertEquals(6.0, training.hours)
        assertEquals(BigDecimal("1000.00"), training.cost)
    }

    @Test
    fun `splits event cost evenly to the cent across participants`() {
        val one = createHelper.createPersonEntity("Split", "One")
        val two = createHelper.createPersonEntity("Split", "Two")
        val three = createHelper.createPersonEntity("Split", "Three")

        val event =
            createHelper.createEvent(
                from = LocalDate.of(year, 5, 1),
                to = LocalDate.of(year, 5, 1),
                hours = 8.0,
                days = listOf(8.0),
                persons = listOf(one.uuid, two.uuid, three.uuid),
                costs = 1000.0,
                type = EventType.CONFERENCE,
            )

        val costs =
            eventDayRepository
                .findAllByEventCode(event.code)
                .map { it.cost ?: BigDecimal.ZERO }

        assertEquals(setOf("333.34", "333.33"), costs.map { it.toPlainString() }.toSet())
        assertEquals(BigDecimal("1000.00"), costs.fold(BigDecimal.ZERO) { acc, value -> acc + value })
    }
}
