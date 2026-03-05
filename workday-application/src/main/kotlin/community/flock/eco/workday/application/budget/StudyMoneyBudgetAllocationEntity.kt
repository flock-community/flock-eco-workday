package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Person
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "study_money_budget_allocation")
class StudyMoneyBudgetAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person?,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    val amount: BigDecimal,
    @ElementCollection(fetch = FetchType.LAZY)
    val files: MutableList<Document> = mutableListOf(),
) : BudgetAllocationEntity(id, code, person, eventCode, date, description)
