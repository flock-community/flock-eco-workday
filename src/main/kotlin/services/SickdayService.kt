package community.flock.eco.workday.services

import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.repository.SickdayRepository
import community.flock.eco.workday.utils.convertDayOff
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class SickdayService(
    private val repository: SickdayRepository,
    private val personService: PersonService,
    private val periodRepository: PeriodRepository
) {
    fun findAll(status: SickdayStatus? = null, code: String? = null): Iterable<Sickday> {
        if (status is SickdayStatus && code is String) {
            return repository.findAllByStatusAndPersonCode(status, code)
        } else if (status is SickdayStatus) {
            return repository.findAllByStatus(status)
        } else if (code is String) {
            return repository.findAllByPersonCode(code)
        }
        return repository.findAll()
    }

    fun findByCode(code: String) = repository.findByCode(code)

    fun create(form: SickdayForm): Sickday {
        val person = personService
            .findByCode(form.personCode)
            ?: throw ResponseStatusException(NOT_FOUND, "No Person found.")

        val period = Period(
            from = form.from,
            to = form.to,
            days = convertDayOff(form.days, form.from)
        ).save()

        return Sickday(
            description = form.description,
            person = person,
            period = period,
            hours = form.hours,
            status = SickdayStatus.SICK
        ).save()
    }

    fun update(code: String, form: SickdayForm): Sickday? {
        val sickday = repository.findByCode(code)

        return when (sickday) {
            is Sickday -> sickday.render(form).save()
            else -> null
        }
    }

    @Transactional
    fun delete(code: String) = repository.deleteByCode(code)

    //
    // *-- Utility functions --*
    //
    private fun Sickday.save() = repository.save(this)
    private fun Period.save() = periodRepository.save(this)

    private fun Sickday.render(it: SickdayForm): Sickday {
        val period = Period(
            from = it.from,
            to = it.to,
            days = convertDayOff(it.days, it.from)
        ).save()

        return Sickday(
            id = this.id,
            code = this.code,
            person = this.person,
            description = it.description,
            status = it.status,
            hours = it.hours,
            period = period
        )
    }
}
