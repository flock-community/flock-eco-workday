package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.person.Person
import java.math.BigDecimal
import java.time.LocalDate

sealed interface BudgetAllocation {
    val id: Long
    val person: Person
    val eventCode: String?
    val date: LocalDate
    val description: String?
}

data class HackTimeBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String?,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double,
) : BudgetAllocation

data class StudyTimeBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String?,
    override val date: LocalDate,
    override val description: String? = null,
    val dailyTimeAllocations: List<DailyTimeAllocation>,
    val totalHours: Double,
) : BudgetAllocation

data class StudyMoneyBudgetAllocation(
    override val id: Long = 0,
    override val person: Person,
    override val eventCode: String? = null,
    override val date: LocalDate,
    override val description: String? = null,
    val amount: BigDecimal,
    val files: List<Document> = emptyList(),
) : BudgetAllocation
