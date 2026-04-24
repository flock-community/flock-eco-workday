package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate
import java.util.UUID

data class CostExpense<T : ApprovalStatus>(
    override val id: UUID,
    override val date: LocalDate,
    override val description: String?,
    override val person: Person,
    override val status: T,
    val amount: Double,
    val files: List<Document>,
    val recurrencePeriod: RecurrencePeriod = RecurrencePeriod.NONE,
    val recurrenceEndDate: LocalDate? = null,
) : Expense<T> {
    fun occurrences(until: LocalDate): Sequence<LocalDate> =
        generateSequence(date) { previous ->
            if (recurrencePeriod == RecurrencePeriod.NONE) return@generateSequence null
            val next = recurrencePeriod.advance(previous)
            when {
                next.isAfter(until) -> null
                recurrenceEndDate != null && next.isAfter(recurrenceEndDate) -> null
                else -> next
            }
        }
}
