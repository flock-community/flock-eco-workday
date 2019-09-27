package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractIdEntity
import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Period(

        override val id: Long = 0,

        val description: String?,

        val from: LocalDate = LocalDate.now(),
        val to: LocalDate = LocalDate.now(),

        @OneToMany(cascade = [CascadeType.ALL])
        @OrderBy("date")
        val days: Set<Day>,

        @ManyToOne
        @JsonIdentityInfo(generator= ObjectIdGenerators.PropertyGenerator::class, property="code")
        @JsonIdentityReference(alwaysAsId=true)
        val user: User
): AbstractIdEntity(id) {
        override fun equals(other: Any?) = super.equals(other)
        override fun hashCode(): Int = super.hashCode()
}

