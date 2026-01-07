package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.domain.common.Status
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
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
    @ElementCollection(fetch = FetchType.EAGER)
    val files: MutableList<Document> = mutableListOf(),
) : Expense(id, date, description, person, status, ExpenseType.COST)
