package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.common.Approve
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate
import java.util.UUID

sealed class Expense(
    open val id: UUID,
    open val date: LocalDate,
    open val description: String?,
    open val person: Person,
    override val status: Status,
    open val type: ExpenseType,
) : Approve

enum class ExpenseType {
    COST,
    TRAVEL,
}
