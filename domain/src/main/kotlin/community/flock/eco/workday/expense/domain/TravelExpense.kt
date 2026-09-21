package community.flock.eco.workday.expense.domain

import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.person.domain.Person
import java.time.LocalDate
import java.util.UUID

data class TravelExpense<T : ApprovalStatus>(
    override val id: UUID,
    override val date: LocalDate,
    override val description: String?,
    override val person: Person,
    override val status: T,
    val distance: Double,
    val allowance: Double,
) : Expense<T>
