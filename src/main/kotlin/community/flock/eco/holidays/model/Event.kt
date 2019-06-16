package community.flock.eco.holidays.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@EntityListeners(EventEntityListeners::class)
data class Event(
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        val id: Long = 0,

        val name: String,
        val data: LocalDateTime = LocalDateTime.now(),

        @Enumerated(EnumType.STRING)
        val type: EventType
)
