package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.common.Event
import community.flock.eco.workday.domain.person.Person
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BudgetAllocationTest {
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
    fun `test 1 - can instantiate TimeAllocation with HACK-typed daily allocations`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 1)
        val allocation =
            TimeAllocation(
                code = "HACK-CODE",
                person = person,
                eventCode = "HACK-2026",
                date = date,
                description = "Spring Hack Day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(date = date, hours = 8.0, type = AllocationType.HACK),
                    ),
            )

        assertNotNull(allocation)
        assertEquals("HACK-CODE", allocation.code)
        assertEquals(person, allocation.person)
        assertEquals("HACK-2026", allocation.eventCode)
        assertEquals(date, allocation.date)
        assertEquals("Spring Hack Day", allocation.description)
        assertEquals(1, allocation.dailyAllocations.size)
        assertEquals(8.0, allocation.dailyAllocations[0].hours)
        assertEquals(AllocationType.HACK, allocation.dailyAllocations[0].type)
        assertEquals(8.0, allocation.totalHours)
    }

    @Test
    fun `test 2 - can instantiate TimeAllocation with TRAINING-typed daily allocations`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 15)
        val allocation =
            TimeAllocation(
                code = "TRAINING-CODE",
                person = person,
                eventCode = "TRAINING-2026",
                date = date,
                description = "Kotlin Conference",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(date = date, hours = 16.0, type = AllocationType.TRAINING),
                    ),
            )

        assertNotNull(allocation)
        assertEquals("TRAINING-CODE", allocation.code)
        assertEquals(person, allocation.person)
        assertEquals("TRAINING-2026", allocation.eventCode)
        assertEquals(date, allocation.date)
        assertEquals("Kotlin Conference", allocation.description)
        assertEquals(1, allocation.dailyAllocations.size)
        assertEquals(16.0, allocation.dailyAllocations[0].hours)
        assertEquals(AllocationType.TRAINING, allocation.dailyAllocations[0].type)
        assertEquals(16.0, allocation.totalHours)
    }

    @Test
    fun `test 3 - a single TimeAllocation can mix HACK and TRAINING daily allocations`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 1)
        val allocation =
            TimeAllocation(
                person = person,
                eventCode = "MIXED-2026",
                date = date,
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(date = date, hours = 5.0, type = AllocationType.HACK),
                        DailyTimeAllocation(date = date, hours = 3.0, type = AllocationType.TRAINING),
                    ),
            )

        assertEquals(2, allocation.dailyAllocations.size)
        assertEquals(8.0, allocation.totalHours)
        assertEquals(1, allocation.dailyAllocations.count { it.type == AllocationType.HACK })
        assertEquals(1, allocation.dailyAllocations.count { it.type == AllocationType.TRAINING })
    }

    @Test
    fun `test 4 - can instantiate MoneyAllocation with BigDecimal amount and optional files`() {
        val person = testPerson()
        val allocation =
            MoneyAllocation(
                code = "MONEY-CODE",
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 20),
                description = "Online course subscription",
                amount = BigDecimal("149.99"),
                files = emptyList(),
            )

        assertNotNull(allocation)
        assertEquals("MONEY-CODE", allocation.code)
        assertEquals(person, allocation.person)
        assertEquals(null, allocation.eventCode)
        assertEquals(LocalDate.of(2026, 3, 20), allocation.date)
        assertEquals("Online course subscription", allocation.description)
        assertEquals(BigDecimal("149.99"), allocation.amount)
        assertTrue(allocation.files.isEmpty())
    }

    @Test
    fun `test 5 - DailyTimeAllocation with HACK type differs from DailyTimeAllocation with TRAINING type`() {
        val date = LocalDate.of(2026, 3, 1)
        val hackAllocation = DailyTimeAllocation(date = date, hours = 8.0, type = AllocationType.HACK)
        val trainingAllocation = DailyTimeAllocation(date = date, hours = 8.0, type = AllocationType.TRAINING)

        assertNotEquals(hackAllocation, trainingAllocation)
        assertEquals(AllocationType.HACK, hackAllocation.type)
        assertEquals(AllocationType.TRAINING, trainingAllocation.type)
    }

    @Test
    fun `test 6 - BudgetAllocation sealed interface allows polymorphic when-expression exhaustiveness`() {
        val person = testPerson()
        val allocations: List<BudgetAllocation> =
            listOf(
                TimeAllocation(
                    person = person,
                    eventCode = "HACK-2026",
                    date = LocalDate.of(2026, 3, 1),
                    description = "Hack Day",
                    dailyAllocations = emptyList(),
                ),
                MoneyAllocation(
                    person = person,
                    eventCode = null,
                    date = LocalDate.of(2026, 3, 20),
                    description = "Course",
                    amount = BigDecimal("100.00"),
                    files = emptyList(),
                ),
            )

        val kinds =
            allocations.map { allocation ->
                when (allocation) {
                    is TimeAllocation -> "TIME"
                    is MoneyAllocation -> "MONEY"
                }
            }

        assertEquals(listOf("TIME", "MONEY"), kinds)
    }

    @Test
    fun `test 7 - BudgetAllocationService deleteByCode publishes DeleteBudgetAllocationEvent`() {
        val person = testPerson()
        val allocation =
            TimeAllocation(
                code = "TO-DELETE",
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                description = "Hack Day",
                dailyAllocations = emptyList(),
            )

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : BudgetAllocationPersistencePort {
                override fun findAllByPersonUuid(
                    personUuid: UUID,
                    year: Int,
                ): List<BudgetAllocation> = emptyList()

                override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()

                override fun findByCode(code: String): BudgetAllocation? = allocation

                override fun deleteByCode(code: String): BudgetAllocation? = allocation
            }

        val service = BudgetAllocationService(repository, eventPublisher)
        val deleted = service.deleteByCode("TO-DELETE")

        assertNotNull(deleted)
        assertEquals(allocation, deleted)
        assertNotNull(publishedEvent)
        assertIs<DeleteBudgetAllocationEvent>(publishedEvent)
        assertEquals(allocation, (publishedEvent as DeleteBudgetAllocationEvent).entity)
    }

    @Test
    fun `test 8 - TimeAllocationService create publishes CreateBudgetAllocationEvent`() {
        val person = testPerson()
        val allocation =
            TimeAllocation(
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                description = "Hack Day",
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, AllocationType.HACK)),
            )

        val savedAllocation = allocation.copy(code = "SAVED")

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : TimeAllocationPersistencePort {
                override fun create(allocation: TimeAllocation): TimeAllocation = savedAllocation

                override fun findByCode(code: String): TimeAllocation? = null

                override fun updateByCode(
                    code: String,
                    allocation: TimeAllocation,
                ): TimeAllocation? = null
            }

        val service = TimeAllocationService(repository, eventPublisher)
        val created = service.create(allocation)

        assertNotNull(created)
        assertEquals("SAVED", created.code)
        assertEquals(8.0, created.totalHours)
        assertNotNull(publishedEvent)
        assertIs<CreateBudgetAllocationEvent>(publishedEvent)
        assertEquals(savedAllocation, (publishedEvent as CreateBudgetAllocationEvent).entity)
    }

    @Test
    fun `test 9 - MoneyAllocationService create publishes CreateBudgetAllocationEvent`() {
        val person = testPerson()
        val allocation =
            MoneyAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Course",
                amount = BigDecimal("250.00"),
                files = listOf(Document(name = "receipt.pdf", file = UUID.randomUUID())),
            )

        val savedAllocation = allocation.copy(code = "SAVED-MONEY")

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository =
            object : MoneyAllocationPersistencePort {
                override fun create(allocation: MoneyAllocation): MoneyAllocation = savedAllocation

                override fun findByCode(code: String): MoneyAllocation? = null

                override fun updateByCode(
                    code: String,
                    allocation: MoneyAllocation,
                ): MoneyAllocation? = null
            }

        val service = MoneyAllocationService(repository, eventPublisher)
        val created = service.create(allocation)

        assertNotNull(created)
        assertEquals("SAVED-MONEY", created.code)
        assertNotNull(publishedEvent)
        assertIs<CreateBudgetAllocationEvent>(publishedEvent)
        assertEquals(savedAllocation, (publishedEvent as CreateBudgetAllocationEvent).entity)
    }
}
