package community.flock.eco.workday.domain.expenses

import community.flock.eco.workday.application.interfaces.Approve
import community.flock.eco.workday.application.model.Status
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

