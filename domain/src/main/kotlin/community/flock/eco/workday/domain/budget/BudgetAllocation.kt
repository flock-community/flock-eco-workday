package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.person.Person
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

sealed interface BudgetAllocation {
    val code: String
    val person: Person
    val eventCode: String?
    val date: LocalDate
    val description: String?
}

data class TimeAllocation(
    override val code: String = UUID.randomUUID().toString(),
    override val person: Person,
    override val eventCode: String? = null,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyAllocations: List<DailyTimeAllocation>,
) : BudgetAllocation {
    val totalHours: Double get() = dailyAllocations.sumOf { it.hours }
}

data class MoneyAllocation(
    override val code: String = UUID.randomUUID().toString(),
    override val person: Person,
    override val eventCode: String? = null,
    override val date: LocalDate,
    override val description: String? = null,
    val amount: BigDecimal,
    val files: List<Document> = emptyList(),
) : BudgetAllocation
