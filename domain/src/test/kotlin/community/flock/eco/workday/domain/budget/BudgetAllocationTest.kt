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
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BudgetAllocationTest {
    // Helper: create a minimal Person for testing
    private fun testPerson() = Person(
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
    fun `test 1 - can instantiate HackTimeBudgetAllocation with valid fields including dailyTimeAllocations with HACK type`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 1)
        val allocation = HackTimeBudgetAllocation(
            id = 1L,
            person = person,
            eventCode = "HACK-2026",
            date = date,
            description = "Spring Hack Day",
            dailyTimeAllocations = listOf(
                DailyTimeAllocation(
                    date = date,
                    hours = 8.0,
                    type = BudgetAllocationType.HACK,
                ),
            ),
            totalHours = 8.0,
        )

        assertNotNull(allocation)
        assertEquals(1L, allocation.id)
        assertEquals(person, allocation.person)
        assertEquals("HACK-2026", allocation.eventCode)
        assertEquals(date, allocation.date)
        assertEquals("Spring Hack Day", allocation.description)
        assertEquals(1, allocation.dailyTimeAllocations.size)
        assertEquals(8.0, allocation.dailyTimeAllocations[0].hours)
        assertEquals(BudgetAllocationType.HACK, allocation.dailyTimeAllocations[0].type)
        assertEquals(8.0, allocation.totalHours)
    }

    @Test
    fun `test 2 - can instantiate StudyTimeBudgetAllocation with dailyTimeAllocations containing STUDY type override`() {
        val person = testPerson()
        val date = LocalDate.of(2026, 3, 15)
        val allocation = StudyTimeBudgetAllocation(
            id = 2L,
            person = person,
            eventCode = "STUDY-2026",
            date = date,
            description = "Kotlin Conference",
            dailyTimeAllocations = listOf(
                DailyTimeAllocation(
                    date = date,
                    hours = 16.0,
                    type = BudgetAllocationType.STUDY,
                ),
            ),
            totalHours = 16.0,
        )

        assertNotNull(allocation)
        assertEquals(2L, allocation.id)
        assertEquals(person, allocation.person)
        assertEquals("STUDY-2026", allocation.eventCode)
        assertEquals(date, allocation.date)
        assertEquals("Kotlin Conference", allocation.description)
        assertEquals(1, allocation.dailyTimeAllocations.size)
        assertEquals(16.0, allocation.dailyTimeAllocations[0].hours)
        assertEquals(BudgetAllocationType.STUDY, allocation.dailyTimeAllocations[0].type)
        assertEquals(16.0, allocation.totalHours)
    }

    @Test
    fun `test 3 - can instantiate StudyMoneyBudgetAllocation with BigDecimal amount and optional files`() {
        val person = testPerson()
        val allocation = StudyMoneyBudgetAllocation(
            id = 3L,
            person = person,
            eventCode = null, // Study money may not be tied to events
            date = LocalDate.of(2026, 3, 20),
            description = "Online course subscription",
            amount = BigDecimal("149.99"),
            files = emptyList(),
        )

        assertNotNull(allocation)
        assertEquals(3L, allocation.id)
        assertEquals(person, allocation.person)
        assertEquals(null, allocation.eventCode)
        assertEquals(LocalDate.of(2026, 3, 20), allocation.date)
        assertEquals("Online course subscription", allocation.description)
        assertEquals(BigDecimal("149.99"), allocation.amount)
        assertTrue(allocation.files.isEmpty())
    }

    @Test
    fun `test 4 - DailyTimeAllocation with HACK type differs from DailyTimeAllocation with STUDY type`() {
        val date = LocalDate.of(2026, 3, 1)
        val hackAllocation = DailyTimeAllocation(
            date = date,
            hours = 8.0,
            type = BudgetAllocationType.HACK,
        )
        val studyAllocation = DailyTimeAllocation(
            date = date,
            hours = 8.0,
            type = BudgetAllocationType.STUDY,
        )

        assertNotEquals(hackAllocation, studyAllocation)
        assertEquals(BudgetAllocationType.HACK, hackAllocation.type)
        assertEquals(BudgetAllocationType.STUDY, studyAllocation.type)
    }

    @Test
    fun `test 5 - BudgetAllocation sealed interface allows polymorphic when-expression exhaustiveness`() {
        val person = testPerson()
        val allocations: List<BudgetAllocation> = listOf(
            HackTimeBudgetAllocation(
                id = 1L,
                person = person,
                eventCode = "HACK-2026",
                date = LocalDate.of(2026, 3, 1),
                description = "Hack Day",
                dailyTimeAllocations = emptyList(),
                totalHours = 0.0,
            ),
            StudyTimeBudgetAllocation(
                id = 2L,
                person = person,
                eventCode = "STUDY-2026",
                date = LocalDate.of(2026, 3, 15),
                description = "Conference",
                dailyTimeAllocations = emptyList(),
                totalHours = 0.0,
            ),
            StudyMoneyBudgetAllocation(
                id = 3L,
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 20),
                description = "Course",
                amount = BigDecimal("100.00"),
                files = emptyList(),
            ),
        )

        val types = allocations.map { allocation ->
            when (allocation) {
                is HackTimeBudgetAllocation -> "HACK_TIME"
                is StudyTimeBudgetAllocation -> "STUDY_TIME"
                is StudyMoneyBudgetAllocation -> "STUDY_MONEY"
            }
        }

        assertEquals(listOf("HACK_TIME", "STUDY_TIME", "STUDY_MONEY"), types)
    }

    @Test
    fun `test 6 - BudgetAllocationService deleteById publishes DeleteBudgetAllocationEvent`() {
        val person = testPerson()
        val allocation = HackTimeBudgetAllocation(
            id = 1L,
            person = person,
            eventCode = "HACK-2026",
            date = LocalDate.of(2026, 3, 1),
            description = "Hack Day",
            dailyTimeAllocations = emptyList(),
            totalHours = 0.0,
        )

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository = object : BudgetAllocationPersistencePort {
            override fun findAllByPersonUuid(personUuid: UUID, year: Int): List<BudgetAllocation> = emptyList()
            override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = emptyList()
            override fun findById(id: Long): BudgetAllocation? = allocation
            override fun delete(id: Long): BudgetAllocation? = allocation
        }

        val service = BudgetAllocationService(repository, eventPublisher)
        val deleted = service.deleteById(1L)

        assertNotNull(deleted)
        assertEquals(allocation, deleted)
        assertNotNull(publishedEvent)
        assertIs<DeleteBudgetAllocationEvent>(publishedEvent)
        assertEquals(allocation, (publishedEvent as DeleteBudgetAllocationEvent).entity)
    }

    @Test
    fun `test 7 - HackTimeBudgetAllocationService create publishes CreateBudgetAllocationEvent`() {
        val person = testPerson()
        val allocation = HackTimeBudgetAllocation(
            id = 0L, // New entity
            person = person,
            eventCode = "HACK-2026",
            date = LocalDate.of(2026, 3, 1),
            description = "Hack Day",
            dailyTimeAllocations = emptyList(),
            totalHours = 0.0,
        )

        val savedAllocation = allocation.copy(id = 1L) // Simulated saved entity with generated ID

        var publishedEvent: Event? = null
        val eventPublisher = ApplicationEventPublisher { event -> publishedEvent = event }

        val repository = object : HackTimeBudgetAllocationPersistencePort {
            override fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation = savedAllocation
            override fun findById(id: Long): HackTimeBudgetAllocation? = null
            override fun updateIfExists(id: Long, allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation? = null
        }

        val service = HackTimeBudgetAllocationService(repository, eventPublisher)
        val created = service.create(allocation)

        assertNotNull(created)
        assertEquals(1L, created.id)
        assertNotNull(publishedEvent)
        assertIs<CreateBudgetAllocationEvent>(publishedEvent)
        assertEquals(savedAllocation, (publishedEvent as CreateBudgetAllocationEvent).entity)
    }
}
