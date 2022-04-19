package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.services.SickDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

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
            createSickdays(it)
        }
    }

    private fun createSickdays(it: Person) {
        for (i in 1..10) {
            val plusYears = i.toLong()
            val random = (0..100).shuffled().first().toLong()
            SickDayForm(
                from = now.plusYears(plusYears).plusDays(random),
                to = now.plusYears(plusYears).plusDays(random + 5),
                days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid
            ).create()

            SickDayForm(
                from = now.plusYears(plusYears).plusDays(random + 100),
                to = now.plusYears(plusYears).plusDays(random + 105),
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
