package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractIdEntity
import java.time.LocalDate
import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.OneToMany
import javax.persistence.OrderBy

@Entity
@EntityListeners(EventEntityListeners::class)
data class Period(

    override val id: Long = 0,

    val from: LocalDate = LocalDate.now(),
    val to: LocalDate = LocalDate.now(),

    @OneToMany(cascade = [CascadeType.ALL])
    @OrderBy("date")
    val days: Set<Day>

) : AbstractIdEntity(id) {
        override fun equals(other: Any?) = super.equals(other)
        override fun hashCode(): Int = super.hashCode()
}
