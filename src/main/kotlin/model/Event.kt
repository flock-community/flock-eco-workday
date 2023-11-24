package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.workday.interfaces.Dayly
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToMany

@Entity
@EntityListeners(EventEntityListeners::class)
class Event(

    val description: String,

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),

    override val hours: Double,

    val costs: Double,

    @ElementCollection
    override val days: List<Double>? = null,

    @ManyToMany
    val persons: List<Person>

) : Dayly, AbstractCodeEntity(id, code)
