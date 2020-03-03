package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.repository.SickdayRepository
import community.flock.eco.workday.utils.convertDayOff
import java.time.LocalDate
import javax.persistence.EntityManager
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class SickdayService(
    private val repository: SickdayRepository,
    private val personService: PersonService,
    private val periodRepository: PeriodRepository,
    private val entityManager: EntityManager
) {

    fun findAll(): Iterable<SickDay> = repository
        .findAll()

    fun findByCode(code: String): SickDay? = repository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonCode(personCode: String) = repository
        .findAllByPersonCode(personCode)

    fun findAllByPersonUserCode(userCode: String) = repository
        .findAllByPersonUserCode(userCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<SickDay> {
        val query = "SELECT s FROM SickDay s WHERE s.from <= :to AND (s.to is null OR s.to >= :from)"
        return entityManager
            .createQuery(query, SickDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: SickDayForm): SickDay = form
        .validate()
        .consume()
        .save()

    fun update(code: String, form: SickDayForm): SickDay? = repository
        .findByCode(code)
        .toNullable()
        .run {
            form
                .validate()
                .consume(this)
                .save()
        }


    @Transactional
    fun deleteByCode(code: String) = repository.deleteByCode(code)

    private fun SickDayForm.consume(it: SickDay? = null): SickDay {
        val person = personService
            .findByCode(this.personCode)
            ?: throw error("Cannot find person: ${this.personCode}")

        return SickDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            person = person,
            hours = this.hours,
            days = this.days
        )
    }

    private fun SickDay.save() = repository.save(this)

    private fun Period.save() = periodRepository.save(this)

    private fun SickDayForm.validate() = apply {
        val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
        if(this.hours < 0 ){
            throw error("Hours cannot have negative value")
        }
        if(this.days?.any{it < 0} == true) {
            throw error("Days cannot have negative value")
        }
        if (this.days != null) {
            if (this.days.size.toLong() != daysBetween) {
                throw error("amount of days (${daysBetween}) not equal to period (${this.days.size})")
            }
            if (this.days.sum() != this.hours) {
                throw error("Total hour does not match")
            }
        }
    }
}
