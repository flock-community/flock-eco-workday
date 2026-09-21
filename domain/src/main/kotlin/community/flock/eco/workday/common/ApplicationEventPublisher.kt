package community.flock.eco.workday.common

fun interface ApplicationEventPublisher {
    fun publishEvent(event: Event)
}
