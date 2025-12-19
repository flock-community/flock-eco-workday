package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonIgnore
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.ManyToOne
import java.io.Serializable

@Entity
@EntityListeners(EventEntityListeners::class)
@IdClass(EventRatingId::class)
class EventRating(
    @Id
    @ManyToOne
    @JsonIgnore
    val event: Event,
    @Id
    @ManyToOne
    val person: Person,
    val rating: Int,
)

data class EventRatingId(
    var event: Long? = null,
    var person: Long? = null,
) : Serializable
