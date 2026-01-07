package community.flock.eco.workday.domain.common

import java.time.Clock
import java.time.Instant
import java.util.EventObject

abstract class ApplicationEvent : EventObject {
    /**
     * Return the time when the event occurred.
     */
    /** System time when the event happened.  */
    val timestamp: Instant?


    /**
     * Create a new `ApplicationEvent` with its [timestamp][.getTimestamp]
     * set to [System.currentTimeMillis].
     * @param source the object on which the event initially occurred or with
     * which the event is associated (never `null`)
     * @see .ApplicationEvent
     */
    constructor(source: Any) : super(source) {
        this.timestamp = Instant.now()
    }

    /**
     * Create a new `ApplicationEvent` with its [timestamp][.getTimestamp]
     * set to the value returned by [Clock.millis] in the provided [Clock].
     *
     * This constructor is typically used in testing scenarios.
     * @param source the object on which the event initially occurred or with
     * which the event is associated (never `null`)
     * @param clock a clock which will provide the timestamp
     * @since 5.3.8
     * @see .ApplicationEvent
     */
    constructor(source: Any, clock: Clock) : super(source) {
        this.timestamp = clock.instant()
    }
}
