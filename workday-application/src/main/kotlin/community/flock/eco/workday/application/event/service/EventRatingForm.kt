package community.flock.eco.workday.application.event.service

import java.util.UUID

data class EventRatingForm(
    val personId: UUID,
    val eventCode: String,
    val rating: Int,
)
