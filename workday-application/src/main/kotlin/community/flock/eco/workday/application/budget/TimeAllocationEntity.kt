package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.CollectionTable
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "time_allocation")
class TimeAllocationEntity(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    @ManyToOne(fetch = FetchType.EAGER)
    val person: Person,
    val eventCode: String? = null,
    val date: LocalDate,
    val description: String? = null,
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "time_allocation_days",
        joinColumns = [JoinColumn(name = "time_allocation_id")],
    )
    val dailyAllocations: MutableList<DailyTimeAllocationEmbeddable> = mutableListOf(),
) : AbstractCodeEntity(id, code)
