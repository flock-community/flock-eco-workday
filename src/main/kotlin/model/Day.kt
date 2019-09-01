package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Day(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0,

        @Enumerated(EnumType.STRING)
        val type: Type,

        val date: LocalDate = LocalDate.now(),
        val hours: Int
)
