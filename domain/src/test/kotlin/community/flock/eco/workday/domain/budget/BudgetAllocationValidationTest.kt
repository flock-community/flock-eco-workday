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

    @Test
    fun `new allocations default code to a random uuid`() {
        val person = testPerson()
        val timeAlloc =
            TimeAllocation(
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyAllocations = emptyList(),
            )
        val moneyAlloc =
            MoneyAllocation(
                person = person,
                date = LocalDate.of(2026, 3, 1),
                amount = BigDecimal("50.00"),
            )

        assertNotNull(UUID.fromString(timeAlloc.code))
        assertNotNull(UUID.fromString(moneyAlloc.code))
    }

    @Test
    fun `total hours is derived from the sum of daily allocations`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 1)
        val allocation =
            TimeAllocation(
                person = person,
                date = date,
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(date, 8.0, AllocationType.HACK),
                        DailyTimeAllocation(date.plusDays(1), 4.0, AllocationType.HACK),
                        DailyTimeAllocation(date.plusDays(2), 2.5, AllocationType.TRAINING),
                    ),
            )

        assertEquals(14.5, allocation.totalHours)
    }

    @Test
    fun `money amount uses BigDecimal precision without floating point loss`() {
        val person = testPerson()
        val amount = BigDecimal("0.10") + BigDecimal("0.20")
        val allocation =
            MoneyAllocation(
                person = person,
                date = LocalDate.of(2026, 3, 1),
                amount = amount,
            )

        assertEquals(BigDecimal("0.30"), allocation.amount)
        assertTrue(allocation.amount.toDouble() == 0.3)
    }

    @Test
    fun `persistence port supports findAllByPersonUuid with year filter`() {
        val person = testPerson()
        val personUuid = person.uuid
        val alloc =
            TimeAllocation(
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, AllocationType.HACK)),
            )

        val port =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = if (year == 2026) listOf(alloc) else emptyList()

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()

                override fun findByCode(code: String): BudgetAllocation? = null

                override fun deleteByCode(code: String): BudgetAllocation? = null
            }

        val results2026 = port.findAllByPersonUuid(personUuid, 2026)
        val results2025 = port.findAllByPersonUuid(personUuid, 2025)

        assertEquals(1, results2026.size)
        assertTrue(results2025.isEmpty())
    }

    @Test
    fun `time allocation service update publishes UpdateBudgetAllocationEvent`() {
        val person = testPerson()
        val original =
            TimeAllocation(
                code = "EXISTING",
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, AllocationType.HACK)),
            )
        val updated =
            original.copy(
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, AllocationType.HACK),
                        DailyTimeAllocation(LocalDate.of(2026, 3, 2), 8.0, AllocationType.HACK),
                    ),
            )

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : TimeAllocationPersistencePort {
                override fun create(allocation: TimeAllocation) = allocation

                override fun findByCode(code: String): TimeAllocation? = null

                override fun updateByCode(
                    code: String,
                    allocation: TimeAllocation,
                ) = updated
            }

        val service = TimeAllocationService(repository, eventPublisher)
        val result = service.update("EXISTING", updated)

        assertNotNull(result)
        assertEquals(16.0, result.totalHours)
        assertNotNull(publishedEvent)
        assertIs<UpdateBudgetAllocationEvent>(publishedEvent)
        assertEquals(updated, (publishedEvent as UpdateBudgetAllocationEvent).entity)
    }

    @Test
    fun `time allocation service update returns null and skips event when entity not found`() {
        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : TimeAllocationPersistencePort {
                override fun create(allocation: TimeAllocation) = allocation

                override fun findByCode(code: String): TimeAllocation? = null

                override fun updateByCode(
                    code: String,
                    allocation: TimeAllocation,
                ): TimeAllocation? = null
            }

        val service = TimeAllocationService(repository, eventPublisher)
        val person = testPerson()
        val allocation =
            TimeAllocation(
                code = "MISSING",
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyAllocations = emptyList(),
            )

        val result = service.update("MISSING", allocation)

        assertNull(result)
        assertNull(publishedEvent)
    }

    @Test
    fun `budget allocation service delegates findAllByPersonUuid to persistence port`() {
        val person = testPerson()
        val personUuid = person.uuid
        val alloc =
            TimeAllocation(
                person = person,
                eventCode = "TRAINING-2026",
                date = LocalDate.of(2026, 6, 15),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 6, 15), 8.0, AllocationType.TRAINING)),
            )

        val repository =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = listOf(alloc)

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()

                override fun findByCode(code: String): BudgetAllocation? = null

                override fun deleteByCode(code: String): BudgetAllocation? = null
            }

        val eventPublisher = ApplicationEventPublisher { }
        val service = BudgetAllocationService(repository, eventPublisher)
        val results = service.findAllByPersonUuid(personUuid, 2026)

        assertEquals(1, results.size)
        assertIs<TimeAllocation>(results[0])
        assertEquals(8.0, (results[0] as TimeAllocation).totalHours)
    }

    @Test
    fun `budget allocation service delegates findAllByEventCode to persistence port`() {
        val person = testPerson()
        val alloc =
            TimeAllocation(
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, AllocationType.HACK)),
            )

        val repository =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = emptyList()

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
                    if (eventCode == "HACK-2026") listOf(alloc) else emptyList()

                override fun findByCode(code: String): BudgetAllocation? = null

                override fun deleteByCode(code: String): BudgetAllocation? = null
            }

        val eventPublisher = ApplicationEventPublisher { }
        val service = BudgetAllocationService(repository, eventPublisher)

        val results = service.findAllByEventCode("HACK-2026")
        val empty = service.findAllByEventCode("NONEXISTENT")

        assertEquals(1, results.size)
        assertTrue(empty.isEmpty())
    }
}
