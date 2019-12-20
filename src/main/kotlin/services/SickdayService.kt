package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.filters.SickdayFilters
import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.repository.PersonRepository
import community.flock.eco.workday.repository.SickdayRepository
import java.lang.RuntimeException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SickdayService(
    private val repository: SickdayRepository,
    private val personRepository: PersonRepository
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


    fun findAll(status: SickdayFilters? = null, code: Int? = null): Any? {
        return repository.filterBy(status, code)
    }

    fun create(form: SickdayForm): Sickday {
        val person = form.personId
            ?.let { personRepository.findById(it).toNullable() }
            ?: throw RuntimeException("Person not found.")

        val hours = form.hours

        return Sickday(
            description = form.description,
            person = person,
            hours = hours,
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
