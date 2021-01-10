package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.services.SickDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import java.time.LocalDate
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadSickdaysData(
    loadPersonData: LoadPersonData,
    private val service: SickDayService
) {

    final val now: LocalDate = LocalDate.now().withDayOfYear(1).withDayOfMonth(1)

    val data: MutableSet<SickDay> = mutableSetOf()

    init {

        loadPersonData.data.forEach {
            val random = (0..100).shuffled().first().toLong()
            SickDayForm(
                from = now.plusDays(random),
                to = now.plusDays(random + 5),
                days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid
            ).create()

            SickDayForm(
                from = now.plusDays(random + 100),
                to = now.plusDays(random + 105),
                days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid
            ).run {
                service.create(this)
            }
        }
    }

    private final fun SickDayForm.create() = service.create(this)
}
