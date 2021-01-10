package community.flock.eco.workday.forms

import java.util.*

data class EventRatingForm(

    val personId: UUID,
    val eventCode: String,
    val rating: Int

)
