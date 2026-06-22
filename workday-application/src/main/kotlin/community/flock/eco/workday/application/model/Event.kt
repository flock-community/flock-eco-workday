package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Daily
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import org.hibernate.annotations.BatchSize
import java.time.LocalDate
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class Event(
    val description: String,
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
    override val hours: Double,
    val costs: Double,
    @Enumerated(EnumType.STRING)
    val type: EventType,
    @OneToMany(mappedBy = "event", fetch = FetchType.EAGER)
    @BatchSize(size = 50)
    val eventDays: MutableList<EventDay> = mutableListOf(),
) : AbstractCodeEntity(id, code),
    Daily {
    val persons: List<Person> get() = eventDays.map { it.person }.distinct()

    // EventDays share one breakdown until per-person hours editing exists, so the first represents the event.
    override val days: MutableList<Double>? get() = eventDays.firstOrNull()?.days
}
