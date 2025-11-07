package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Dayly
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import org.hibernate.annotations.BatchSize
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.ManyToMany

@Entity
@EntityListeners(EventEntityListeners::class)
data class Event(
    val description: String,
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
    override val hours: Double,
    val costs: Double,
    @Enumerated(EnumType.STRING)
    val type: EventType,
    @ElementCollection
    override val days: List<Double>? = null,
    @ManyToMany
    @BatchSize(size = 50)
    val persons: List<Person>,
) : Dayly, AbstractCodeEntity(id, code)
