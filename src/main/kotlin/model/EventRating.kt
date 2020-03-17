package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIgnore
import community.flock.eco.core.events.EventEntityListeners
import java.io.Serializable
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Id
import javax.persistence.IdClass
import javax.persistence.ManyToOne

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

    val rating: Int

)

data class EventRatingId(
    var event: Long? = null,
    var person: Long? = null
) : Serializable
