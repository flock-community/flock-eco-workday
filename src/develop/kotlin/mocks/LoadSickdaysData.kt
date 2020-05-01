package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.services.SickDayService
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
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
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 48,
                personCode = it.code
            ).create()

            SickDayForm(
                from = now.plusDays(random + 100),
                to = now.plusDays(random + 105),
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 48,
                personCode = it.code
            ).run {
                service.create(this)
            }
        }
    }

    private final fun SickDayForm.create() = service.create(this)
}
