package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.services.SickDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import kotlin.random.Random

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadSickdaysData(
    private val service: SickDayService,
    loadPersonData: LoadPersonData,
    loadData: LoadData,
) {
    final val startOfYear: LocalDate = LocalDate.now().withDayOfYear(1).withDayOfMonth(1)

    val data: MutableSet<SickDay> = mutableSetOf()

    init {
        loadData.load {

            loadPersonData.data.forEach {
                createSickdays(it)
            }
        }
    }

    private fun createSickdays(person: Person) {
        val randomGenerator = Random(person.id)

        for (i in -5..5) {
            val plusYears = i.toLong()
            val random = (0..100).shuffled(randomGenerator).first().toLong()
            val nrOfDays1 = randomGenerator.nextInt(1, 10)
            SickDayForm(
                description = "Runny nose for ${person.firstname}",
                from = startOfYear.plusYears(plusYears).plusDays(random),
                to = startOfYear.plusYears(plusYears).plusDays(random + nrOfDays1 - 1),
                days = MutableList(nrOfDays1) { 8.0 },
                hours = nrOfDays1 * 8.0,
                personId = person.uuid,
            ).create()

            val nrOfDays2 = randomGenerator.nextInt(1, 10)
            SickDayForm(
                description = "Cough for ${person.firstname}",
                from = startOfYear.plusYears(plusYears).plusDays(random + 100),
                to = startOfYear.plusYears(plusYears).plusDays(random + 100 + nrOfDays2 - 1),
                days = MutableList(nrOfDays2) { 8.0 },
                hours = nrOfDays2 * 8.0,
                personId = person.uuid,
            ).create()
        }
    }

    private final fun SickDayForm.create() = service.create(this)
}
