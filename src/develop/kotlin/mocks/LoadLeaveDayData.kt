package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.LeaveDayForm
import community.flock.eco.workday.model.LeaveDayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.LeaveDayService
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadLeaveDayData(
        private val loadData: LoadData,
        loadPersonData: LoadPersonData,
        private val leaveDayService: LeaveDayService
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

    private fun getRandomDate(index: Int, onlyWorkDay: Boolean = false, offsetInDays: Long = 0): LocalDate {
        val random = (0..200).random().toLong()
        var date: LocalDate = now.plusYears(index.toLong()).plusDays(random + offsetInDays)
        while (onlyWorkDay && !date.isWorkingDay()) {
            date = now.plusYears(index.toLong()).plusDays(random)
        }
        return date
    }

    private fun createHolidays(it: Person) {
        for (i in 0 until 10) {
            LeaveDayForm(
                    description = "Test holiday ${it.firstname}",
                    from = getRandomDate(i),
                    to = getRandomDate(i, false, 5),
                    days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                    hours = 48.0,
                    personId = it.uuid
            ).create()
        }
    }

    private fun createPlusDays(it: Person) {
        for (i in 0 until 10 step 3) {
            val date = getRandomDate(i, true)
            LeaveDayForm(
                    type = LeaveDayType.PLUSDAY,
                    description = "Plus day ${it.firstname}",
                    from = date,
                    to = date,
                    days = listOf(8.0),
                    hours = 8.0,
                    personId = it.uuid
            ).create()
        }
    }

    private fun createPaidParentalLeave(it: Person) {
        for (i in 0 until 10 step 3) {
            val date = getRandomDate(i, true)
            LeaveDayForm(
                type = LeaveDayType.PAID_PARENTAL_LEAVE,
                description = "Paid parental leave for ${it.firstname}",
                from = date,
                to = date,
                days = listOf(4.0),
                hours = 4.0,
                personId = it.uuid
            ).create()
        }
    }

    private fun createUnpaidParentalLeave(it: Person) {
        for (i in 0 until 10 step 3) {
            val date = getRandomDate(i, true)
            LeaveDayForm(
                type = LeaveDayType.PAID_PARENTAL_LEAVE,
                description = "Unpaid parental leave for ${it.firstname}",
                from = date,
                to = date,
                days = listOf(8.0),
                hours = 8.0,
                personId = it.uuid
            ).create()
        }
    }

    fun LeaveDayForm.create() {
        leaveDayService.create(this)
    }
}
