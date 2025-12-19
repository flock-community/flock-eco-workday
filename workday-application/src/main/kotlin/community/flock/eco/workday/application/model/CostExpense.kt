package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.time.LocalDate
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class CostExpense(
    id: UUID = UUID.randomUUID(),
    date: LocalDate,
    description: String?,
    person: Person,
    status: Status,
    val amount: Double,
    @ElementCollection
    val files: List<Document> = listOf(),
) : Expense(id, date, description, person, status, ExpenseType.COST)
