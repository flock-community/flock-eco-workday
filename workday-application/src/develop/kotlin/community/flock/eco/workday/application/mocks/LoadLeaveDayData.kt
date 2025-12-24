package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.LeaveDayService
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import kotlin.random.Random

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadLeaveDayData(
    private val leaveDayService: LeaveDayService,
    loadData: LoadData,
    loadPersonData: LoadPersonData,
) {
    private val log = LoggerFactory.getLogger(this::class.java)
    final val startOfYear: LocalDate = LocalDate.now().withDayOfYear(1).withDayOfMonth(1)

    init {
        loadData.load {
            loadPersonData.data.forEach {
                createHolidays(it)
                createPlusDays(it)
                createPaidParentalLeave(it)
                createUnpaidParentalLeave(it)
            }
        }
    }

    private fun createHolidays(it: Person) {
        for (i in 0 until 10) {
            val random = (0..200).random().toLong()
            LeaveDayForm(
                description = "Test holiday ${it.firstname}",
                from = startOfYear.plusYears(i.toLong()).plusDays(random),
                to = startOfYear.plusYears(i.toLong()).plusDays(random + 5),
                days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid,
            ).create()
        }
    }

    private fun createPlusDays(it: Person) {
        for (i in 0 until 10 step 3) {
            val random = (0..200).random().toLong()
            val date = startOfYear.plusYears(i.toLong()).plusDays(random)

            LeaveDayForm(
                type = LeaveDayType.PLUSDAY,
                description = "Plus day ${it.firstname}",
                from = date,
                to = date,
                days = mutableListOf(8.0),
                hours = 8.0,
                personId = it.uuid,
            ).create()
        }
    }

    private fun createPaidParentalLeave(person: Person) {
        val random = Random(person.id)
        if (random.nextBoolean()) {
            log.info("Skipping paid parental leave for ${person.firstname}")
            return
        }

        (0..11).forEach { monthIdx ->
            val startOfMonth: LocalDate = startOfYear.plusMonths(monthIdx.toLong())
            val endOfMonth: LocalDate = startOfMonth.plusMonths(1L).minusDays(1)

            val days: MutableList<Double> = mutableListOf()
            repeat(startOfMonth.lengthOfMonth()) {
                days +=
                    if (random.nextInt(5) == 0) {
                        random.nextInt(4, 8).toDouble()
                    } else {
                        0.0
                    }
            }

            LeaveDayForm(
                type = LeaveDayType.PAID_PARENTAL_LEAVE,
                description = "Paid parental leave for ${person.firstname} for month ${startOfMonth.month}",
                from = startOfMonth,
                to = endOfMonth,
                days = days,
                hours = days.reduce { acc, curr -> acc + curr },
                personId = person.uuid,
            ).create()
        }
    }

    private fun createUnpaidParentalLeave(person: Person) {
        val random = Random(person.id + 1)

        if (random.nextBoolean()) {
            log.info("Skipping unpaid parental leave for ${person.firstname}")
            return
        }

        (0..11).forEach { monthIdx ->
            val startOfMonth: LocalDate = startOfYear.plusMonths(monthIdx.toLong())
            val endOfMonth: LocalDate = startOfMonth.plusMonths(1L).minusDays(1)

            val days: MutableList<Double> = mutableListOf()
            repeat(startOfMonth.lengthOfMonth()) {
                days +=
                    if (random.nextInt(7) == 0) {
                        random.nextInt(4, 8).toDouble()
                    } else {
                        0.0
                    }
            }

            LeaveDayForm(
                type = LeaveDayType.UNPAID_PARENTAL_LEAVE,
                description = "Unpaid parental leave for ${person.firstname} for month ${startOfMonth.month}",
                from = startOfMonth,
                to = endOfMonth,
                days = days.toMutableList(),
                hours = days.reduce { acc, curr -> acc + curr },
                personId = person.uuid,
            ).create()
        }
    }

    fun LeaveDayForm.create() {
        leaveDayService.create(this)
    }
}
