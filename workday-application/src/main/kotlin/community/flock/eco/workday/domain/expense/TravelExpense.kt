package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.person.Person
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
