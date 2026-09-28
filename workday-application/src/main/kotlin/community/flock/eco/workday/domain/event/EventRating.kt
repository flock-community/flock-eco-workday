package community.flock.eco.workday.domain.event

import community.flock.eco.workday.domain.person.Person

/** The rating a person gave an event. A person rates an event at most once. */
data class EventRating(
    val event: Event,
    val person: Person,
    val rating: Int,
)
