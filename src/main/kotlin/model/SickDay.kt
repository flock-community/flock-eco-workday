package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.ManyToOne
import javax.persistence.OneToOne

@Entity
@EntityListeners(EventEntityListeners::class)
data class SickDay(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    val from: LocalDate = LocalDate.now(),
    val to: LocalDate = LocalDate.now(),

    val hours: Int,

    @ElementCollection
    val days: List<Int>? = null,

    @ManyToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("personCode")
    val person: Person

) : AbstractCodeEntity(id, code) {
    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
}
