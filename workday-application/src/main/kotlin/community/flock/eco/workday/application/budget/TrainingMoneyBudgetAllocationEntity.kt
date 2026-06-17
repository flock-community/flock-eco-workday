package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Person
import jakarta.persistence.CollectionTable
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "training_money_budget_allocation")
class TrainingMoneyBudgetAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person?,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    val amount: BigDecimal,
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "training_money_budget_allocation_files",
        joinColumns = [JoinColumn(name = "training_money_budget_allocation_id")],
    )
    val files: MutableList<Document> = mutableListOf(),
) : BudgetAllocationEntity(id, code, person, eventCode, date, description)
