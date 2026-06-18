package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.domain.budget.AllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BudgetAllocationPersistenceTest : WorkdayIntegrationTest() {
    @Autowired
    lateinit var createHelper: CreateHelper

    @Autowired
    lateinit var budgetAllocationAdapter: BudgetAllocationPersistenceAdapter

    @Autowired
    lateinit var timeAllocationAdapter: TimeAllocationPersistenceAdapter

    @Autowired
    lateinit var moneyAllocationAdapter: MoneyAllocationPersistenceAdapter

    private fun createTestPerson() = createHelper.createPerson()

    @Test
    @Transactional
    fun `test create and retrieve hack time allocation`() {
        val person = createTestPerson()
        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = "EVT-001",
                date = LocalDate.of(2026, 1, 15),
                description = "Hackathon project",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK),
                        DailyTimeAllocation(LocalDate.of(2026, 1, 16), 4.0, AllocationType.HACK),
                    ),
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, results.size)
        val retrieved = results.first()
        assertIs<TimeAllocation>(retrieved)
        assertEquals("EVT-001", retrieved.eventCode)
        assertEquals(12.0, retrieved.totalHours)
        assertEquals(2, retrieved.dailyAllocations.size)
        assertEquals(8.0, retrieved.dailyAllocations[0].hours)
        assertEquals(AllocationType.HACK, retrieved.dailyAllocations[0].type)
    }

    @Test
    @Transactional
    fun `test create and retrieve training time allocation`() {
        val person = createTestPerson()
        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Kotlin course",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 4.0, AllocationType.TRAINING),
                    ),
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, results.size)
        val retrieved = results.first()
        assertIs<TimeAllocation>(retrieved)
        assertEquals(4.0, retrieved.totalHours)
        assertEquals(1, retrieved.dailyAllocations.size)
        assertEquals(AllocationType.TRAINING, retrieved.dailyAllocations[0].type)
    }

    @Test
    @Transactional
    fun `test create and retrieve money allocation`() {
        val person = createTestPerson()
        moneyAllocationAdapter.create(
            MoneyAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 2, 1),
                description = "Conference ticket",
                amount = BigDecimal("2500.50"),
                files =
                    listOf(
                        Document(name = "receipt.pdf", file = UUID.randomUUID()),
                    ),
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, results.size)
        val retrieved = results.first()
        assertIs<MoneyAllocation>(retrieved)
        assertEquals(0, BigDecimal("2500.50").compareTo(retrieved.amount))
        assertEquals(1, retrieved.files.size)
        assertEquals("receipt.pdf", retrieved.files[0].name)
    }

    @Test
    @Transactional
    fun `test find all by person uuid and year`() {
        val person = createTestPerson()

        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK)),
            ),
        )
        moneyAllocationAdapter.create(
            MoneyAllocation(
                person = person,
                date = LocalDate.of(2026, 6, 1),
                amount = BigDecimal("1000.00"),
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(2, results.size)
        assertTrue(results.any { it is TimeAllocation })
        assertTrue(results.any { it is MoneyAllocation })
    }

    @Test
    @Transactional
    fun `test find all by event code`() {
        val person = createTestPerson()
        val eventCode = "EVT-TEST-${UUID.randomUUID()}"

        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = eventCode,
                date = LocalDate.of(2026, 1, 15),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK)),
            ),
        )
        moneyAllocationAdapter.create(
            MoneyAllocation(
                person = person,
                eventCode = eventCode,
                date = LocalDate.of(2026, 1, 15),
                amount = BigDecimal("250.00"),
            ),
        )

        val results = budgetAllocationAdapter.findAllByEventCode(eventCode)
        assertEquals(2, results.size)
    }

    @Test
    @Transactional
    fun `test delete allocation by code`() {
        val person = createTestPerson()
        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK)),
            ),
        )

        val allocations = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, allocations.size)
        val code = allocations.first().code

        val deleted = budgetAllocationAdapter.deleteByCode(code)
        assertNotNull(deleted)
        assertIs<TimeAllocation>(deleted)

        val afterDelete = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertTrue(afterDelete.isEmpty())
    }

    @Test
    @Transactional
    fun `test update time allocation by code`() {
        val person = createTestPerson()
        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                description = "Original",
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK)),
            ),
        )

        val allocations = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, allocations.size)
        val existing = allocations.first()
        assertIs<TimeAllocation>(existing)

        val updated =
            timeAllocationAdapter.updateByCode(
                existing.code,
                existing.copy(
                    description = "Updated",
                    dailyAllocations =
                        listOf(
                            DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK),
                            DailyTimeAllocation(LocalDate.of(2026, 1, 16), 8.0, AllocationType.HACK),
                        ),
                ),
            )

        assertNotNull(updated)
        assertEquals("Updated", updated.description)
        assertEquals(16.0, updated.totalHours)
        assertEquals(2, updated.dailyAllocations.size)
    }

    @Test
    @Transactional
    fun `test update retypes the same time allocation without recreating it`() {
        val person = createTestPerson()
        timeAllocationAdapter.create(
            TimeAllocation(
                person = person,
                eventCode = "RETYPE",
                date = LocalDate.of(2026, 1, 15),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, AllocationType.HACK)),
            ),
        )

        val existing = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026).first()
        assertIs<TimeAllocation>(existing)

        timeAllocationAdapter.updateByCode(
            existing.code,
            existing.copy(
                dailyAllocations =
                    existing.dailyAllocations.map { it.copy(type = AllocationType.TRAINING) },
            ),
        )

        val afterSwitch = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, afterSwitch.size, "switch must reuse the same allocation, not create a new one")
        val retyped = afterSwitch.first()
        assertIs<TimeAllocation>(retyped)
        assertEquals(existing.code, retyped.code)
        assertTrue(retyped.dailyAllocations.all { it.type == AllocationType.TRAINING })
    }
}
