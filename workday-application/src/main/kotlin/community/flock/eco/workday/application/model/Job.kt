package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.ManyToOne
import java.time.LocalDate
import java.util.UUID

enum class JobStatus {
    DRAFT,
    OPEN,
    CLOSED,
}

@Entity
@EntityListeners(EventEntityListeners::class)
data class Job(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    val title: String,
    @Column(columnDefinition = "TEXT")
    val description: String,
    val hourlyRate: Double? = null,
    val hoursPerWeek: Int? = null,
    @Column(name = "from_date")
    val from: LocalDate? = null,
    @Column(name = "to_date")
    val to: LocalDate? = null,
    @Enumerated(EnumType.STRING)
    val status: JobStatus = JobStatus.DRAFT,
    @ManyToOne
    val client: Client? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    val documents: MutableList<Document> = mutableListOf(),
) : AbstractCodeEntity(id, code)
