package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.Type
import community.flock.eco.workday.repository.PeriodRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.Period
import java.util.*


@Service
class PeriodService(
        val periodRepository: PeriodRepository, val userRepository: UserRepository) {

    fun findById(id: Long): Optional<community.flock.eco.workday.model.Period> = periodRepository.findById(id)

    fun create(form: HolidayForm): community.flock.eco.workday.model.Period {
        form.validate()
        form.userCode?.let{
            userRepository.findByCode(it).toNullable()
        }?.let{
            return community.flock.eco.workday.model.Period(
                    description = form.description,
                    from = form.from,
                    to = form.to,
                    day = convertDayOff(form.dayOff, form.from, form.type),
                    user = it)
                    .save()
        }?:throw RuntimeException("Cannot create holiday")

    }

    fun update(id: Long, form: HolidayForm): community.flock.eco.workday.model.Period {
        form.validate()
        return periodRepository.findById(id)
                .toNullable()
                ?.let { holiday ->
                    holiday.copy(
                            description = form.description,
                            from = form.from,
                            to = form.to,
                            day = convertDayOff(form.dayOff, form.from, form.type))
                }
                ?.save()
                ?: throw java.lang.RuntimeException("Cannot update Holiday")
    }

    fun delete(id: Long) = periodRepository.deleteById(id)

    private fun convertDayOff(dayOff: Array<Int>, from: LocalDate, type: Type) = dayOff
            .mapIndexed { index, hours ->
                Day(
                        type = type,
                        date = from.plusDays(index.toLong()),
                        hours = hours
                )
            }
            .toSet()

    private fun community.flock.eco.workday.model.Period.save() = periodRepository
            .save(this)

    private fun HolidayForm.validate() {
        val daysBetween = Period.between(this.from, this.to).days + 1
        if (this.dayOff.size != daysBetween) {
            throw RuntimeException("amount of DayOff not equal to period")
        }
    }
}
