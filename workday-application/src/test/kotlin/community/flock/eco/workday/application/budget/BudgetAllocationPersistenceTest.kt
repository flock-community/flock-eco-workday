package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
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
    lateinit var hackTimeAdapter: HackTimeBudgetAllocationPersistenceAdapter

    @Autowired
    lateinit var studyTimeAdapter: StudyTimeBudgetAllocationPersistenceAdapter

    @Autowired
    lateinit var studyMoneyAdapter: StudyMoneyBudgetAllocationPersistenceAdapter

    @Autowired
    lateinit var budgetAllocationRepository: BudgetAllocationRepository

    private fun createTestPerson() = createHelper.createPerson()

    @Test
    @Transactional
    fun `test create and retrieve hack time allocation`() {
        val person = createTestPerson()
        hackTimeAdapter.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = "EVT-001",
                date = LocalDate.of(2026, 1, 15),
                description = "Hackathon project",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK),
                        DailyTimeAllocation(LocalDate.of(2026, 1, 16), 4.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 12.0,
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, results.size)
        val retrieved = results.first()
        assertIs<HackTimeBudgetAllocation>(retrieved)
        assertEquals("EVT-001", retrieved.eventCode)
        assertEquals(12.0, retrieved.totalHours)
        assertEquals(2, retrieved.dailyTimeAllocations.size)
        assertEquals(8.0, retrieved.dailyTimeAllocations[0].hours)
        assertEquals(BudgetAllocationType.HACK, retrieved.dailyTimeAllocations[0].type)
    }

    @Test
    @Transactional
    fun `test create and retrieve study time allocation`() {
        val person = createTestPerson()
        studyTimeAdapter.create(
            StudyTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Kotlin course",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 4.0, BudgetAllocationType.STUDY),
                    ),
                totalHours = 4.0,
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, results.size)
        val retrieved = results.first()
        assertIs<StudyTimeBudgetAllocation>(retrieved)
        assertEquals(4.0, retrieved.totalHours)
        assertEquals(1, retrieved.dailyTimeAllocations.size)
        assertEquals(BudgetAllocationType.STUDY, retrieved.dailyTimeAllocations[0].type)
    }

    @Test
    @Transactional
    fun `test create and retrieve study money allocation`() {
        val person = createTestPerson()
        studyMoneyAdapter.create(
            StudyMoneyBudgetAllocation(
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
        assertIs<StudyMoneyBudgetAllocation>(retrieved)
        assertEquals(0, BigDecimal("2500.50").compareTo(retrieved.amount))
        assertEquals(1, retrieved.files.size)
        assertEquals("receipt.pdf", retrieved.files[0].name)
    }

    @Test
    @Transactional
    fun `test find all by person uuid and year`() {
        val person = createTestPerson()

        hackTimeAdapter.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK)),
                totalHours = 8.0,
            ),
        )
        studyTimeAdapter.create(
            StudyTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 3, 1), 4.0, BudgetAllocationType.STUDY)),
                totalHours = 4.0,
            ),
        )
        studyMoneyAdapter.create(
            StudyMoneyBudgetAllocation(
                person = person,
                date = LocalDate.of(2026, 6, 1),
                amount = BigDecimal("1000.00"),
            ),
        )

        val results = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(3, results.size)
        assertTrue(results.any { it is HackTimeBudgetAllocation })
        assertTrue(results.any { it is StudyTimeBudgetAllocation })
        assertTrue(results.any { it is StudyMoneyBudgetAllocation })
    }

    @Test
    @Transactional
    fun `test find all by event code`() {
        val person = createTestPerson()
        val eventCode = "EVT-TEST-${UUID.randomUUID()}"

        hackTimeAdapter.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = eventCode,
                date = LocalDate.of(2026, 1, 15),
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK)),
                totalHours = 8.0,
            ),
        )
        studyTimeAdapter.create(
            StudyTimeBudgetAllocation(
                person = person,
                eventCode = eventCode,
                date = LocalDate.of(2026, 1, 15),
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 4.0, BudgetAllocationType.STUDY)),
                totalHours = 4.0,
            ),
        )

        val results = budgetAllocationAdapter.findAllByEventCode(eventCode)
        assertEquals(2, results.size)
    }

    @Test
    @Transactional
    fun `test delete allocation`() {
        val person = createTestPerson()
        hackTimeAdapter.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK)),
                totalHours = 8.0,
            ),
        )

        val allocations = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, allocations.size)
        val allocationId = allocations.first().id

        val deleted = budgetAllocationAdapter.delete(allocationId)
        assertNotNull(deleted)
        assertIs<HackTimeBudgetAllocation>(deleted)

        val afterDelete = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertTrue(afterDelete.isEmpty())
    }

    @Test
    @Transactional
    fun `test update hack time allocation`() {
        val person = createTestPerson()
        hackTimeAdapter.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 15),
                description = "Original",
                dailyTimeAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK)),
                totalHours = 8.0,
            ),
        )

        val allocations = budgetAllocationAdapter.findAllByPersonUuid(person.uuid, 2026)
        assertEquals(1, allocations.size)
        val existing = allocations.first()
        assertIs<HackTimeBudgetAllocation>(existing)

        val updated =
            hackTimeAdapter.updateIfExists(
                existing.id,
                existing.copy(
                    description = "Updated",
                    totalHours = 16.0,
                    dailyTimeAllocations =
                        listOf(
                            DailyTimeAllocation(LocalDate.of(2026, 1, 15), 8.0, BudgetAllocationType.HACK),
                            DailyTimeAllocation(LocalDate.of(2026, 1, 16), 8.0, BudgetAllocationType.HACK),
                        ),
                ),
            )

        assertNotNull(updated)
        assertEquals("Updated", updated.description)
        assertEquals(16.0, updated.totalHours)
        assertEquals(2, updated.dailyTimeAllocations.size)
    }
}
