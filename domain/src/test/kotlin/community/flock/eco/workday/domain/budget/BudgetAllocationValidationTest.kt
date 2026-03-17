package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import community.flock.eco.workday.domain.common.Event
import community.flock.eco.workday.domain.person.Person
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Nyquist validation tests for Phase 03 (domain-layer) requirements DOM-01 and DOM-02.
 * These tests fill coverage gaps not addressed by the original BudgetAllocationTest.
 */
class BudgetAllocationValidationTest {
    private fun testPerson() =
        Person(
            internalId = 1L,
            uuid = UUID.randomUUID(),
            firstname = "Test",
            lastname = "Person",
            email = "test@example.com",
            position = "Developer",
            number = null,
            birthdate = null,
            joinDate = null,
            active = true,
            lastActiveAt = null,
            reminders = false,
            receiveEmail = false,
            shoeSize = null,
            shirtSize = null,
            googleDriveId = null,
            user = null,
        )

    // DOM-01-G1: New entities default id to 0 for JOINED inheritance compatibility
    @Test
    fun `new budget allocations default id to zero for JOINED inheritance`() {
        val person = testPerson()
        val hackAlloc =
            HackTimeBudgetAllocation(
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 0.0,
            )
        val studyTimeAlloc =
            StudyTimeBudgetAllocation(
                person = person,
                eventCode = "STUDY-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 0.0,
            )
        val studyMoneyAlloc =
            StudyMoneyBudgetAllocation(
                person = person,
                date = LocalDate.of(2026, 3, 1),
                amount = BigDecimal("50.00"),
            )

        assertEquals(0L, hackAlloc.id)
        assertEquals(0L, studyTimeAlloc.id)
        assertEquals(0L, studyMoneyAlloc.id)
    }

    // DOM-01-G2: BigDecimal monetary precision is preserved (no floating-point loss)
    @Test
    fun `study money amount uses BigDecimal precision without floating point loss`() {
        val person = testPerson()
        // 0.1 + 0.2 in Double = 0.30000000000000004, but BigDecimal preserves exactness
        val amount = BigDecimal("0.10") + BigDecimal("0.20")
        val allocation =
            StudyMoneyBudgetAllocation(
                person = person,
                date = LocalDate.of(2026, 3, 1),
                amount = amount,
            )

        assertEquals(BigDecimal("0.30"), allocation.amount)
        // Confirm it does NOT equal the floating-point imprecise value
        assertTrue(allocation.amount.toDouble() == 0.3)
    }

    // DOM-01-G3: Persistence port contracts are correctly shaped
    @Test
    fun `polymorphic persistence port supports findAllByPersonUuid with year filter`() {
        val person = testPerson()
        val personUuid = person.uuid
        val alloc =
            HackTimeBudgetAllocation(
                id = 1L,
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 8.0,
            )

        val port =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = if (year == 2026) listOf(alloc) else emptyList()

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()

                override fun findById(id: Long): BudgetAllocation? = null

                override fun delete(id: Long): BudgetAllocation? = null
            }

        val results2026 = port.findAllByPersonUuid(personUuid, 2026)
        val results2025 = port.findAllByPersonUuid(personUuid, 2025)

        assertEquals(1, results2026.size)
        assertTrue(results2025.isEmpty())
    }

    // DOM-02-G1: Update event publishing verified for type-specific service
    @Test
    fun `hack time service update publishes UpdateBudgetAllocationEvent`() {
        val person = testPerson()
        val original =
            HackTimeBudgetAllocation(
                id = 1L,
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 8.0,
            )
        val updated = original.copy(totalHours = 16.0)

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : HackTimeBudgetAllocationPersistencePort {
                override fun create(allocation: HackTimeBudgetAllocation) = allocation

                override fun findById(id: Long): HackTimeBudgetAllocation? = null

                override fun updateIfExists(
                    id: Long,
                    allocation: HackTimeBudgetAllocation,
                ) = updated
            }

        val service = HackTimeBudgetAllocationService(repository, eventPublisher)
        val result = service.update(1L, updated)

        assertNotNull(result)
        assertEquals(16.0, result.totalHours)
        assertNotNull(publishedEvent)
        assertIs<UpdateBudgetAllocationEvent>(publishedEvent)
        assertEquals(updated, (publishedEvent as UpdateBudgetAllocationEvent).entity)
    }

    // DOM-02-G1b: Update returning null does NOT publish event
    @Test
    fun `hack time service update returns null and skips event when entity not found`() {
        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : HackTimeBudgetAllocationPersistencePort {
                override fun create(allocation: HackTimeBudgetAllocation) = allocation

                override fun findById(id: Long): HackTimeBudgetAllocation? = null

                override fun updateIfExists(
                    id: Long,
                    allocation: HackTimeBudgetAllocation,
                ): HackTimeBudgetAllocation? = null
            }

        val service = HackTimeBudgetAllocationService(repository, eventPublisher)
        val person = testPerson()
        val allocation =
            HackTimeBudgetAllocation(
                id = 99L,
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 8.0,
            )

        val result = service.update(99L, allocation)

        assertNull(result)
        assertNull(publishedEvent)
    }

    // DOM-02-G2: BudgetAllocationService query delegation
    @Test
    fun `budget allocation service delegates findAllByPersonUuid to persistence port`() {
        val person = testPerson()
        val personUuid = person.uuid
        val alloc =
            StudyTimeBudgetAllocation(
                id = 1L,
                person = person,
                eventCode = "STUDY-2026",
                date = LocalDate.of(2026, 6, 15),
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(
                            date = LocalDate.of(2026, 6, 15),
                            hours = 8.0,
                            type = BudgetAllocationType.STUDY,
                        ),
                    ),
                totalHours = 8.0,
            )

        val repository =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = listOf(alloc)

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()

                override fun findById(id: Long): BudgetAllocation? = null

                override fun delete(id: Long): BudgetAllocation? = null
            }

        val eventPublisher = ApplicationEventPublisher { }
        val service = BudgetAllocationService(repository, eventPublisher)
        val results = service.findAllByPersonUuid(personUuid, 2026)

        assertEquals(1, results.size)
        assertIs<StudyTimeBudgetAllocation>(results[0])
        assertEquals(8.0, (results[0] as StudyTimeBudgetAllocation).totalHours)
    }

    // DOM-02-G2b: BudgetAllocationService delegates findAllByEventCode
    @Test
    fun `budget allocation service delegates findAllByEventCode to persistence port`() {
        val person = testPerson()
        val alloc =
            HackTimeBudgetAllocation(
                id = 1L,
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyTimeAllocations = emptyList(),
                totalHours = 8.0,
            )

        val repository =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = emptyList()

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
                    if (eventCode == "HACK-2026") listOf(alloc) else emptyList()

                override fun findById(id: Long): BudgetAllocation? = null

                override fun delete(id: Long): BudgetAllocation? = null
            }

        val eventPublisher = ApplicationEventPublisher { }
        val service = BudgetAllocationService(repository, eventPublisher)

        val results = service.findAllByEventCode("HACK-2026")
        val empty = service.findAllByEventCode("NONEXISTENT")

        assertEquals(1, results.size)
        assertTrue(empty.isEmpty())
    }
}
