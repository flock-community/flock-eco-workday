package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.LeaveDayForm
import community.flock.eco.workday.model.LeaveDayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.LeaveDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.DayOfWeek
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadLeaveDayData(
    private val loadData: LoadData,
    loadPersonData: LoadPersonData,
    private val leaveDayService: LeaveDayService,
) {
    final val now: LocalDate = LocalDate.now().withDayOfYear(1).withDayOfMonth(1)

    init {
        loadData.loadWhenEmpty {
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
                from = now.plusYears(i.toLong()).plusDays(random),
                to = now.plusYears(i.toLong()).plusDays(random + 5),
                days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid,
            ).create()
        }
    }

    private fun createPlusDays(it: Person) {
        for (i in 0 until 10 step 3) {
            val random = (0..200).random().toLong()
            val date = now.plusYears(i.toLong()).plusDays(random)

            LeaveDayForm(
                type = LeaveDayType.PLUSDAY,
                description = "Plus day ${it.firstname}",
                from = date,
                to = date,
                days = listOf(8.0),
                hours = 8.0,
                personId = it.uuid,
            ).create()
        }
    }

    private fun createPaidParentalLeave(it: Person) {
        val currentMonthIdx = LocalDate.now().getMonthValue() // 1 = January

        for (monthIdx in 1..12) {
            if (monthIdx <= currentMonthIdx) {
                val startOfMonth: LocalDate = LocalDate.now().withMonth(monthIdx).withDayOfMonth(1)
                val endOfMonth: LocalDate = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth())
                var days: List<Double> = ArrayList()
                for (dayIdx in 1..startOfMonth.lengthOfMonth()) {
                    days += if (LocalDate.now().withMonth(monthIdx).withDayOfMonth(dayIdx).dayOfWeek === DayOfWeek.WEDNESDAY) 4.0 else 0.0
                }

                LeaveDayForm(
                    type = LeaveDayType.PAID_PARENTAL_LEAVE,
                    description = "Paid parental leave for ${it.firstname} for month ${startOfMonth.month}",
                    from = startOfMonth,
                    to = endOfMonth,
                    days = days,
                    hours = days.reduce { acc, curr -> acc + curr },
                    personId = it.uuid,
                ).create()
            }
        }
    }

    private fun createUnpaidParentalLeave(it: Person) {
        val currentMonthIdx = LocalDate.now().getMonthValue() // 1 = January

        for (monthIdx in 1..12) {
            if (monthIdx <= currentMonthIdx) {
                val startOfMonth: LocalDate = LocalDate.now().withMonth(monthIdx).withDayOfMonth(1)
                val endOfMonth: LocalDate = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth())
                var days: List<Double> = ArrayList()
                for (dayIdx in 1..startOfMonth.lengthOfMonth()) {
                    days += if (LocalDate.now().withMonth(monthIdx).withDayOfMonth(dayIdx).dayOfWeek === DayOfWeek.FRIDAY) 8.0 else 0.0
                }

                LeaveDayForm(
                    type = LeaveDayType.UNPAID_PARENTAL_LEAVE,
                    description = "Unpaid parental leave for ${it.firstname} for month ${startOfMonth.month}",
                    from = startOfMonth,
                    to = endOfMonth,
                    days = days,
                    hours = days.reduce { acc, curr -> acc + curr },
                    personId = it.uuid,
                ).create()
            }
        }
    }

    fun LeaveDayForm.create() {
        leaveDayService.create(this)
    }
}
