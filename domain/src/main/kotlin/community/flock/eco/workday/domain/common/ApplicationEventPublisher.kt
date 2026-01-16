package community.flock.eco.workday.domain.common

fun interface ApplicationEventPublisher {
    fun publishEvent(event: Event)
}
