package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpenseExportService
import community.flock.eco.workday.domain.expense.CostExpensePersistencePort
import community.flock.eco.workday.domain.expense.RecurrencePeriod
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.UUID

class CostExpenseExportServiceTest {
    private val personDomain = aPerson().toDomain()

    private fun costExpense(
        date: LocalDate,
        recurrencePeriod: RecurrencePeriod = RecurrencePeriod.NONE,
        recurrenceEndDate: LocalDate? = null,
        amount: Double = 9.99,
    ) = CostExpense(
        id = UUID.randomUUID(),
        date = date,
        description = "Netflix",
        person = personDomain,
        status = ApprovalStatus.APPROVED,
        amount = amount,
        files = emptyList(),
        recurrencePeriod = recurrencePeriod,
        recurrenceEndDate = recurrenceEndDate,
    )

    @Test
    fun `expands monthly recurrence into one row per month`() {
        val repository = mockk<CostExpensePersistencePort>()
        every { repository.findAll() } returns
            listOf(
                costExpense(
                    date = LocalDate.of(2026, 1, 15),
                    recurrencePeriod = RecurrencePeriod.MONTH,
                ),
            )
        val service = CostExpenseExportService(repository)

        val rows = service.export(from = null, to = LocalDate.of(2026, 4, 30))

        assertEquals(4, rows.size)
        assertEquals(LocalDate.of(2026, 1, 15), rows[0].occurrenceDate)
        assertEquals(LocalDate.of(2026, 2, 15), rows[1].occurrenceDate)
        assertEquals(LocalDate.of(2026, 3, 15), rows[2].occurrenceDate)
        assertEquals(LocalDate.of(2026, 4, 15), rows[3].occurrenceDate)
        assertFalse(rows[0].isRecurringInstance)
        assertTrue(rows[1].isRecurringInstance)
    }

    @Test
    fun `honours recurrence end date`() {
        val repository = mockk<CostExpensePersistencePort>()
        every { repository.findAll() } returns
            listOf(
                costExpense(
                    date = LocalDate.of(2026, 1, 15),
                    recurrencePeriod = RecurrencePeriod.MONTH,
                    recurrenceEndDate = LocalDate.of(2026, 3, 14),
                ),
            )
        val service = CostExpenseExportService(repository)

        val rows = service.export(from = null, to = LocalDate.of(2026, 12, 31))

        // End date 2026-03-14 cuts off the 2026-03-15 occurrence
        assertEquals(2, rows.size)
        assertEquals(LocalDate.of(2026, 1, 15), rows[0].occurrenceDate)
        assertEquals(LocalDate.of(2026, 2, 15), rows[1].occurrenceDate)
    }

    @Test
    fun `from date filters out earlier occurrences`() {
        val repository = mockk<CostExpensePersistencePort>()
        every { repository.findAll() } returns
            listOf(
                costExpense(
                    date = LocalDate.of(2026, 1, 1),
                    recurrencePeriod = RecurrencePeriod.QUARTER,
                ),
            )
        val service = CostExpenseExportService(repository)

        val rows =
            service.export(
                from = LocalDate.of(2026, 4, 1),
                to = LocalDate.of(2026, 12, 31),
            )

        assertEquals(3, rows.size)
        assertEquals(LocalDate.of(2026, 4, 1), rows[0].occurrenceDate)
        assertEquals(LocalDate.of(2026, 7, 1), rows[1].occurrenceDate)
        assertEquals(LocalDate.of(2026, 10, 1), rows[2].occurrenceDate)
    }

    @Test
    fun `non-recurring expense yields single row`() {
        val repository = mockk<CostExpensePersistencePort>()
        every { repository.findAll() } returns
            listOf(
                costExpense(
                    date = LocalDate.of(2026, 2, 10),
                    recurrencePeriod = RecurrencePeriod.NONE,
                ),
            )
        val service = CostExpenseExportService(repository)

        val rows = service.export(from = null, to = LocalDate.of(2026, 12, 31))

        assertEquals(1, rows.size)
        assertEquals(RecurrencePeriod.NONE, rows[0].recurrencePeriod)
        assertFalse(rows[0].isRecurringInstance)
    }
}
