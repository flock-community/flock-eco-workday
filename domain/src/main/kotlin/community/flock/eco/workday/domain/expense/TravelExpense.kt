package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate
import java.util.UUID

data class TravelExpense(
    override val id: UUID,
    override val date: LocalDate,
    override val description: String?,
    override val person: Person,
    override val status: Status,
    val distance: Double,
    val allowance: Double,
) : Expense(id, date, description, person, status, ExpenseType.TRAVEL)
