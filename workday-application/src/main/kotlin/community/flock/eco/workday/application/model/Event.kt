package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Daily
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.ManyToMany
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
    @ElementCollection(fetch = FetchType.EAGER)
    override val days: MutableList<Double>? = null,
    @ManyToMany(fetch = FetchType.EAGER)
    @BatchSize(size = 50)
    val persons: MutableList<Person>,
) : Daily, AbstractCodeEntity(id, code)
