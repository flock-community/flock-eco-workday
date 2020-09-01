package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Inheritance
import javax.persistence.InheritanceType

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED
)
@EntityListeners(EventEntityListeners::class)
abstract class Day(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),

    override val hours: Double,

    @ElementCollection
    override val days: List<Double>? = null

) : Dayly, AbstractCodeEntity(id, code)
