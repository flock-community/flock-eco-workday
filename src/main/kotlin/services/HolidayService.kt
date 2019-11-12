package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.Holiday
import community.flock.eco.workday.model.HolidayStatus
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.repository.HolidayRepository
import community.flock.eco.workday.repository.PeriodRepository
import java.time.LocalDate
import org.springframework.stereotype.Service

@Service
class HolidayService(
        private val holidayRepository: HolidayRepository,
        private val periodRepository: PeriodRepository,
        private val userRepository: UserRepository) {

    fun findByCode(code:String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByUserCode(userCode: String) = holidayRepository.findAllByUserCode(userCode)

    fun create(form: HolidayForm): Holiday {

        form.validate()

        val user = form.userCode
                .let { userRepository.findByCode(it).toNullable() }
                ?: throw RuntimeException("User not found")

        val period = Period(
                from = form.from,
                to = form.to,
                days = convertDayOff(form.days, form.from))
                .save()

        return Holiday(
                description = form.description,
                user = user,
                period = period,
                status = HolidayStatus.REQUESTED)
                .save()

    }

    fun update(code: String, form: HolidayForm): Holiday? {
        form.validate()
        return findByCode(code)
                ?.let { holiday ->

                    val period = Period(
                            from = form.from,
                            to = form.to,
                            days = convertDayOff(form.days, form.from))
                            .save()

                    holiday.copy(
                            description = form.description,
                            period = period)
                }
                ?.save()
    }

    fun delete(code: String) = holidayRepository.deleteByCode(code)

    private fun convertDayOff(dayOff: List<Int>, from: LocalDate) = dayOff
            .mapIndexed { index, hours ->
                Day(
                        date = from.plusDays(index.toLong()),
                        hours = hours
                )
            }
            .toSet()


    private fun Holiday.save() = holidayRepository
            .save(this)

    private fun Period.save() = periodRepository
            .save(this)

    private fun HolidayForm.validate() {
        val daysBetween = java.time.Period.between(this.from, this.to).days + 1
        if (this.days.size != daysBetween) {
            throw RuntimeException("amount of DayOff not equal to period")
        }
    }

}
