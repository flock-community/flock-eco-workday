package community.flock.eco.workday.domain.expense

import java.time.LocalDate
import java.util.UUID

data class CostExpenseExportRow(
    val expenseId: UUID,
    val occurrenceDate: LocalDate,
    val personName: String,
    val description: String?,
    val amount: Double,
    val status: String,
    val recurrencePeriod: RecurrencePeriod,
    val isRecurringInstance: Boolean,
)

class CostExpenseExportService(
    private val costExpenseRepository: CostExpensePersistencePort,
) {
    fun export(
        from: LocalDate?,
        to: LocalDate,
    ): List<CostExpenseExportRow> =
        costExpenseRepository
            .findAll()
            .flatMap { expense -> expense.expandBetween(from, to) }
            .sortedWith(compareBy({ it.occurrenceDate }, { it.expenseId }))

    private fun CostExpense<*>.expandBetween(
        from: LocalDate?,
        to: LocalDate,
    ): Sequence<CostExpenseExportRow> {
        val firstOccurrence = sequenceOf(date)
        val followUps = occurrences(to).drop(1)
        return (firstOccurrence + followUps)
            .filter { from == null || !it.isBefore(from) }
            .filter { !it.isAfter(to) }
            .mapIndexed { index, occurrence ->
                CostExpenseExportRow(
                    expenseId = id,
                    occurrenceDate = occurrence,
                    personName = person.getFullName(),
                    description = description,
                    amount = amount,
                    status = status.let { it::class.simpleName.orEmpty() },
                    recurrencePeriod = recurrencePeriod,
                    isRecurringInstance = index > 0,
                )
            }
    }
}
