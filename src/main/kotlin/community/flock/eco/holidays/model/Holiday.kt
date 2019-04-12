package community.flock.eco.holidays.model

import community.flock.eco.core.events.EventEntityListeners
import java.time.LocalDate
import java.util.*
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Holiday (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0,
        val fromDate: LocalDate = LocalDate.now(),
        val toDate: LocalDate = LocalDate.now().plusDays(7)
)
