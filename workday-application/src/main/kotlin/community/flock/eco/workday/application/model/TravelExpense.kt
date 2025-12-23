package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.time.LocalDate
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class TravelExpense(
    id: UUID = UUID.randomUUID(),
    date: LocalDate,
    description: String?,
    person: Person,
    status: Status,
    val distance: Double,
    val allowance: Double,
) : Expense(id, date, description, person, status, ExpenseType.TRAVEL)
