package community.flock.eco.holidays.model

import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class DayOff(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0,

        @Enumerated(EnumType.STRING)
        val type: DayType,

        val date: LocalDate = LocalDate.now(),
        val hours: Int
)
