package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.CollectionTable
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import org.hibernate.annotations.BatchSize
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

// Joined child of `day`: reuses `day_seq` and the shared `day_days` table — its
// migration must add only the `event_day` join row, not a sequence or collection table.
@Entity
@EntityListeners(EventEntityListeners::class)
class EventDay(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    from: LocalDate = LocalDate.now(),
    to: LocalDate = LocalDate.now(),
    hours: Double,
    days: MutableList<Double>? = null,
    val cost: BigDecimal? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_day_files", joinColumns = [JoinColumn(name = "event_day_id")])
    @BatchSize(size = 50)
    val files: MutableList<Document> = mutableListOf(),
    @ManyToOne
    val person: Person,
    @ManyToOne
    val event: Event,
) : Day(id, code, from, to, hours, days)
