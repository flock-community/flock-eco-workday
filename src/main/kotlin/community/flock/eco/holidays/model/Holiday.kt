package community.flock.eco.holidays.model

import community.flock.eco.core.events.EventEntityListeners
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Holiday (
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0
)
