package community.flock.eco.holidays.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Holiday(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0,
        val name: String,
        val fromDate: LocalDate = LocalDate.now(),
        val toDate: LocalDate = LocalDate.now().plusDays(7),

        @ManyToOne
        val user: User
)
