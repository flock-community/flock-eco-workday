package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.services.EventService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@Profile("local")
class LoadEventData(
    loadPersonData: LoadPersonData,
    private val service: EventService
) {

    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    final val data: MutableList<Event> = mutableListOf()

    init {
        listOf(
            EventForm(
                description = "New years eve",
                from = LocalDate.of(now.year, 1, 1),
                to = LocalDate.of(now.year, 1, 1),
                days = listOf(8),
                hours = 8,
                personCodes = loadPersonData.data.map { it.code }
            ),
            EventForm(
                description = "Flock. dag",
                from = LocalDate.of(now.year, 1, 3),
                to = LocalDate.of(now.year, 1, 3),
                days = listOf(8),
                hours = 8,
                personCodes = loadPersonData.data.map { it.code }
            ),
            EventForm(
                description = "Conference",
                from = LocalDate.of(now.year, 5, 27),
                to = LocalDate.of(now.year, 5, 29),
                days = listOf(8, 8, 8),
                hours = 24,
                personCodes = loadPersonData.data.take(2).map { it.code }
            ))
            .map { it.create() }
            .let { data.addAll(it) }
    }

    private final fun EventForm.create() = service.create(this)
}