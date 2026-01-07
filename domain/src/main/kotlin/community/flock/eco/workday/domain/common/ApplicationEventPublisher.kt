package community.flock.eco.workday.domain.common

fun interface ApplicationEventPublisher {
    fun publishEvent(event: Event) {
        this.publishEvent(event as Any)
    }

    fun publishEvent(event: Any)
}
