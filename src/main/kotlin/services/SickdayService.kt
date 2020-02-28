package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.repository.SickdayRepository
import community.flock.eco.workday.utils.convertDayOff
import java.time.LocalDate
import javax.persistence.EntityManager
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class SickdayService(
    private val repository: SickdayRepository,
    private val personService: PersonService,
    private val periodRepository: PeriodRepository,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String): Sickday? = repository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonCode(personCode: String) = repository
        .findAllByPersonCode(personCode)

    fun findAllByPersonUserCode(userCode: String) = repository
        .findAllByPersonUserCode(userCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Sickday> {
        val query = "SELECT s FROM Sickday s WHERE s.period.from <= :to AND (s.period.to is null OR s.period.to > :from)"
        return entityManager
            .createQuery(query, Sickday::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: SickdayForm): Sickday {
        form.validate()
        val person = personService
            .findByCode(form.personCode)
            ?: throw ResponseStatusException(NOT_FOUND, "No Person found.")

        val period = Period(
            from = form.from,
            to = form.to,
            days = convertDayOff(form.days, form.from)
        ).save()

        return Sickday(
            person = person,
            period = period,
            hours = form.hours
        ).save()
    }

    fun update(code: String, form: SickdayForm): Sickday? {
        form.validate()
        val sickday = findByCode(code)
        return when (sickday) {
            is Sickday -> sickday.internalize(form).save()
            else -> null
        }
    }

    @Transactional
    fun deleteByCode(code: String) = repository.deleteByCode(code)

    //
    // *-- Utility functions --*
    //
    private fun Sickday.save() = repository.save(this)

    private fun Period.save() = periodRepository.save(this)

    private fun Sickday.internalize(it: SickdayForm): Sickday {
        val period = Period(
            from = it.from,
            to = it.to,
            days = convertDayOff(it.days, it.from)
        ).save()

        return Sickday(
            id = this.id,
            code = this.code,
            person = this.person,
            hours = it.hours,
            period = period
        )
    }

    private fun SickdayForm.validate() {
        val daysBetween = java.time.Period.between(this.from, this.to).days + 1
        if (this.days.size != daysBetween) {
            throw error("amount of DayOff not equal to period")
        }

        if (this.days.sum() != this.hours) {
            throw error("Total hour does not match")
        }
    }
}
