package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.DayOff
import community.flock.eco.workday.model.DayType
import community.flock.eco.workday.model.Holiday
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.Period
import java.util.*


@Service
class HolidayService(
        val holidayRepository: HolidayRepository, val userRepository: UserRepository) {

    fun findById(id: Long): Optional<Holiday> = holidayRepository.findById(id)

    fun create(form: HolidayForm): Holiday {
        form.validate()
        form.userCode?.let{
            userRepository.findByCode(it).toNullable()
        }?.let{
            return Holiday(
                    description = form.description,
                    from = form.from,
                    to = form.to,
                    dayOff = convertDayOff(form.dayOff, form.from, form.type),
                    user = it)
                    .save()
        }?:throw RuntimeException("Cannot create holiday")

    }

    fun update(id: Long, form: HolidayForm): Holiday {
        form.validate()
        return holidayRepository.findById(id)
                .toNullable()
                ?.let { holiday ->
                    holiday.copy(
                            description = form.description,
                            from = form.from,
                            to = form.to,
                            dayOff = convertDayOff(form.dayOff, form.from, form.type))
                }
                ?.save()
                ?: throw java.lang.RuntimeException("Cannot update Holiday")
    }

    fun delete(id: Long) = holidayRepository.deleteById(id)

    private fun convertDayOff(dayOff: Array<Int>, from: LocalDate, dayType: DayType) = dayOff
            .mapIndexed { index, hours ->
                DayOff(
                        type = dayType,
                        date = from.plusDays(index.toLong()),
                        hours = hours
                )
            }
            .toSet()

    private fun Holiday.save() = holidayRepository
            .save(this)

    private fun HolidayForm.validate() {
        val daysBetween = Period.between(this.from, this.to).days + 1
        if (this.dayOff.size != daysBetween) {
            throw RuntimeException("amount of DayOff not equal to period")
        }
    }
}
