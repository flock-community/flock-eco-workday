package community.flock.eco.workday.services

import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.repository.SickdayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SickdayService(
    private val repository: SickdayRepository,
    private val personService: PersonService
) {
    private fun Sickday.save() = repository.save(this)
    private fun Sickday.render(it: SickdayForm? = null): Sickday {
        return Sickday(
            id = this.id,
            code = this.code,
            person = this.person,
            description = it?.description ?: this.description,
            status = it?.status ?: this.status,
            hours = it?.hours ?: this.hours
        )
    }


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
        val person = personService.findByCode(form.personCode)!!

        return Sickday(
            description = form.description,
            person = person,
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
}
