package community.flock.eco.holidays.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Holiday(

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Long = 0,
        val description: String?,

        val from: LocalDate = LocalDate.now(),
        val to: LocalDate = LocalDate.now(),

        @OneToMany(cascade = [CascadeType.ALL])
        val dayOff: Set<DayOff>,

        @ManyToOne
        @JsonIdentityInfo(generator= ObjectIdGenerators.PropertyGenerator::class, property="code")
        @JsonIdentityReference(alwaysAsId=true)
        val user: User
)
