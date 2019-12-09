package community.flock.eco.workday.services

import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.repository.PersonRepository
import community.flock.eco.workday.repository.SickdayRepository
import org.springframework.stereotype.Service

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
}
