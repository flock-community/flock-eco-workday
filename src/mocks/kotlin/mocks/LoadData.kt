package mocks

import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.EventType
import community.flock.eco.workday.repository.EventRepository
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class LoadData(
        val eventRepository: EventRepository
){

    init {
        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 7, 19, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 7, 5, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 6, 21, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 6, 7, 0,0)
        ).save()
    }

    private fun Event.save() {
        eventRepository.save(this) //To change body of created functions use File | Settings | File Templates.
    }

}
