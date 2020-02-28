package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Holiday
import community.flock.eco.workday.model.HolidayStatus
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.repository.HolidayRepository
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.utils.convertDayOff
import java.time.LocalDate
import javax.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HolidayService(
    private val holidayRepository: HolidayRepository,
    private val periodRepository: PeriodRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByPersonCode(personCode: String) = holidayRepository.findAllByPersonCode(personCode)
    fun findAllByPersonUserCode(personCode: String) = holidayRepository.findAllByPersonUserCode(personCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Holiday> {
        val query = "SELECT h FROM Holiday h WHERE h.period.from <= :to AND (h.period.to is null OR h.period.to > :from)"
        return entityManager
            .createQuery(query, Holiday::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: HolidayForm): Holiday {
        form.validate()

        val person = form.personCode
            ?.let { personService.findByCode(it) }
            ?: throw RuntimeException("Person not found")

        val period = Period(
            from = form.from,
            to = form.to,
            days = convertDayOff(form.days, form.from)
        ).save()

        return Holiday(
            description = form.description,
            status = HolidayStatus.REQUESTED,
            hours = form.hours,
            period = period,
            person = person
        ).save()
    }

    fun update(code: String, form: HolidayForm): Holiday? {
        form.validate()
        return findByCode(code)
            ?.let { holiday ->
                val period = Period(
                    from = form.from,
                    to = form.to,
                    days = convertDayOff(form.days, form.from)
                ).save()

                holiday.copy(
                    description = form.description,
                    status = form.status
                        ?.run { form.status }
                        ?: holiday.status,
                    period = period,
                    hours = form.hours
                )
            }
            ?.save()
            ?: throw RuntimeException("Holiday not found")
    }

    @Transactional
    fun deleteByCode(code: String) = holidayRepository
        .deleteByCode(code)

    // *-- utility functions --*
    private fun Holiday.save() = holidayRepository.save(this)
    private fun Period.save() = periodRepository.save(this)

    private fun HolidayForm.validate() {
        val daysBetween = java.time.Period.between(this.from, this.to).days + 1
        if (this.days.size != daysBetween) {
            throw error("amount of DayOff not equal to period")
        }

        if (this.days.sum() != this.hours) {
            throw error("Total hour does not match")
        }
    }
}

fun User.isAdmin(): Boolean = this.authorities
        .contains(HolidayAuthority.ADMIN.toName())
