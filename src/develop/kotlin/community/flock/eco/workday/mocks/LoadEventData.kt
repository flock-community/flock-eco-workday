package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.EventType
import community.flock.eco.workday.services.EventService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadEventData(
    private val service: EventService,
    loadData: LoadData,
    loadPersonData: LoadPersonData,
) {
    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    final val data: MutableList<Event> = mutableListOf()

    init {
        loadData.loadWhenEmpty {
            listOf(
                EventForm(
                    description = "New years eve",
                    from = LocalDate.of(now.year, 1, 1),
                    to = LocalDate.of(now.year, 1, 1),
                    days = listOf(8.0),
                    hours = 8.0,
                    personIds = loadPersonData.data.map { it.uuid },
                    costs = 1000.0,
                    type = EventType.GENERAL_EVENT,
                ),
                EventForm(
                    description = "Flock. Hack Day",
                    from = LocalDate.of(now.year, 1, 3),
                    to = LocalDate.of(now.year, 1, 3),
                    days = listOf(8.0),
                    hours = 8.0,
                    personIds = loadPersonData.data.map { it.uuid },
                    costs = 1000.0,
                    type = EventType.FLOCK_HACK_DAY,
                ),
                EventForm(
                    description = "Flock. Community Day",
                    from = LocalDate.of(now.year, 1, 3),
                    to = LocalDate.of(now.year, 1, 3),
                    days = listOf(8.0),
                    hours = 8.0,
                    personIds = loadPersonData.data.map { it.uuid },
                    costs = 1000.0,
                    type = EventType.FLOCK_COMMUNITY_DAY,
                ),
                EventForm(
                    description = "Conference",
                    from = LocalDate.of(now.year, 5, 27),
                    to = LocalDate.of(now.year, 5, 29),
                    days = listOf(8.0, 8.0, 8.0),
                    hours = 24.0,
                    personIds = loadPersonData.data.take(2).map { it.uuid },
                    costs = 1000.0,
                    type = EventType.CONFERENCE,
                ),
            )
                .map { it.create() }
                .let { data.addAll(it) }
        }
    }

    private final fun EventForm.create() = service.create(this)
}
