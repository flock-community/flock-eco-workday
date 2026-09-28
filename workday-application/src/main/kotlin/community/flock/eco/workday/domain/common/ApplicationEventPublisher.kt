package community.flock.eco.workday.domain.common

import community.flock.eco.workday.core.events.Event

fun interface ApplicationEventPublisher {
    fun publishEvent(event: Event)
}
