package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.application.model.BudgetCategory
import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractService
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Laptop
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.common.Document
import community.flock.eco.workday.common.Status
import community.flock.eco.workday.model.aPerson
import community.flock.eco.workday.model.aWorkDay
import community.flock.eco.workday.model.anAssignment
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull
import community.flock.eco.workday.contract.domain.ContractInternal as ContractInternalDomain
import community.flock.eco.workday.contract.domain.ContractService as ContractServiceDomain
import community.flock.eco.workday.event.domain.BudgetCategory as BudgetCategoryDomain
import community.flock.eco.workday.event.domain.EventType as EventTypeDomain
import community.flock.eco.workday.leaveday.domain.LeaveDayType as LeaveDayTypeDomain

class DomainMapperTest {
    private val from = LocalDate.of(2024, 3, 4)
    private val to = LocalDate.of(2024, 3, 8)

    @Test
    fun `a work day maps with its assignment, client, person, status and sheets`() {
        val entity = aWorkDay(anAssignment(person = aPerson()))

        val workDay = entity.toDomain()

        assertEquals(entity.id, workDay.internalId)
        assertEquals(entity.code, workDay.code)
        assertEquals(entity.hours, workDay.hours)
        assertEquals(ApprovalStatus.REQUESTED, workDay.status)
        assertEquals(entity.assignment.code, workDay.assignment.code)
        assertEquals("DHL", workDay.assignment.client.name)
        assertEquals(entity.assignment.person.uuid, workDay.assignment.person.uuid)
        assertNull(workDay.assignment.project)
        assertEquals(listOf(Document("some-sheet", UUID.fromString("51b23e2e-bb80-45d3-aac5-f764aa7b2fc3"))), workDay.sheets)
    }

    @Test
    fun `a contract maps to the domain type of its kind`() {
        val internal =
            ContractInternal(
                id = 7,
                code = "internal",
                person = aPerson(),
                from = from,
                to = null,
                monthlySalary = 4000.0,
                hoursPerWeek = 36,
                holidayHours = 180,
                hackTimeBudget = 90,
                trainingTimeBudget = 40,
                trainingMoneyBudget = BigDecimal("2500.00"),
            )
        val service =
            ContractService(
                id = 8,
                code = "service",
                from = from,
                to = to,
                monthlyCosts = 99.0,
                description = "Cloud hosting",
            )

        val contracts: List<Contract> = listOf(internal, service)
        val (internalDomain, serviceDomain) = contracts.map { it.toDomain() }

        assertIs<ContractInternalDomain>(internalDomain)
        assertIs<ContractServiceDomain>(serviceDomain)

        assertEquals(7L, internalDomain.internalId)
        assertEquals(internal.person?.uuid, internalDomain.person.uuid)
        assertEquals(36, internalDomain.hoursPerWeek)
        assertEquals(BigDecimal("2500.00"), internalDomain.trainingMoneyBudget)
        assertNull(internalDomain.to)
        assertEquals(true, internalDomain.billable)
        assertEquals("Cloud hosting", serviceDomain.description)
        assertEquals(99.0, serviceDomain.monthlyCosts)
    }

    @Test
    fun `leave days and sick days map their type, status, person and daily hours`() {
        val leaveDay =
            LeaveDay(
                from = from,
                to = to,
                hours = 40.0,
                days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
                description = "Skiing",
                type = LeaveDayType.HOLIDAY,
                status = Status.APPROVED,
                person = aPerson(),
            ).toDomain()
        val sickDay =
            SickDay(
                from = from,
                to = from,
                hours = 8.0,
                status = Status.DONE,
                person = aPerson(),
            ).toDomain()

        assertEquals(LeaveDayTypeDomain.HOLIDAY, leaveDay.type)
        assertEquals(ApprovalStatus.APPROVED, leaveDay.status)
        assertEquals(listOf(8.0, 8.0, 8.0, 8.0, 8.0), leaveDay.days)
        assertEquals("henk@hotmail.com", leaveDay.person.email)
        assertEquals(ApprovalStatus.DONE, sickDay.status)
        assertNull(sickDay.description)
        assertNull(sickDay.days)
    }

    @Test
    fun `an event maps its attendees and derives the budget of each event day`() {
        val henk = aPerson()
        val event =
            Event(
                description = "Kotlin conference",
                from = from,
                to = to,
                hours = 16.0,
                costs = 1200.0,
                type = EventType.CONFERENCE,
            )
        event.eventDays +=
            EventDay(from = from, to = to, hours = 16.0, cost = BigDecimal("600.00"), person = henk, event = event)
        event.eventDays +=
            EventDay(from = from, to = to, hours = 8.0, budgetCategory = BudgetCategory.HACK, person = henk, event = event)

        val domain = event.toDomain()

        assertEquals(EventTypeDomain.CONFERENCE, domain.type)
        assertEquals(BudgetCategoryDomain.TRAINING, domain.budgetCategory)
        assertEquals(listOf(henk.uuid), domain.persons.map { it.uuid })
        assertEquals(BudgetCategoryDomain.TRAINING, domain.budgetCategoryOf(domain.eventDays[0]))
        assertEquals(BudgetCategoryDomain.HACK, domain.budgetCategoryOf(domain.eventDays[1]))
        assertEquals(BigDecimal("600.00"), domain.eventDays[0].cost)
    }

    @Test
    fun `a laptop maps with or without a person`() {
        val assigned = Laptop(name = "Zaphod", serialNumber = "C02X", contractSigned = true, person = aPerson()).toDomain()
        val spare = Laptop(name = "Marvin", serialNumber = "C02Y", purchaseDate = from).toDomain()

        assertEquals("henk@hotmail.com", assigned.person?.email)
        assertEquals(true, assigned.contractSigned)
        assertNull(spare.person)
        assertEquals(from, spare.purchaseDate)
    }
}
