package community.flock.eco.workday.event.domain

import community.flock.eco.workday.person.domain.Person

/** The rating a person gave an event. A person rates an event at most once. */
data class EventRating(
    val event: Event,
    val person: Person,
    val rating: Int,
)
