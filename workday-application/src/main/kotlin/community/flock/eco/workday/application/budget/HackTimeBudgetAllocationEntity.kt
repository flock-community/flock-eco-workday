package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "hack_time_budget_allocation")
class HackTimeBudgetAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person?,
    eventCode: String? = null,
    date: LocalDate,
    description: String? = null,
    @ElementCollection(fetch = FetchType.LAZY)
    val dailyTimeAllocations: MutableList<DailyTimeAllocationEmbeddable> = mutableListOf(),
    val totalHours: Double,
) : BudgetAllocationEntity(id, code, person, eventCode, date, description)
