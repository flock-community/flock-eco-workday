package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.repository.SickdayRepository
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager

@Service
class SickDayService(
    private val repository: SickdayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {

    fun findAll(): Iterable<SickDay> = repository
        .findAll()

    fun findByCode(code: String): SickDay? = repository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonUuid(personCode: UUID) = repository
        .findAllByPersonUuid(personCode)

    fun findAllByPersonUuid(personCode: UUID, pageable: Pageable) = repository
        .findAllByPersonUuid(personCode, pageable)

    fun findAllByPersonUserCode(userCode: String, pageable: Pageable) = repository
        .findAllByPersonUserCode(userCode, pageable)

    fun findAllByStatus(status: Status) = repository.findAllByStatus(status)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<SickDay> {
        val query = "SELECT s FROM SickDay s WHERE s.from <= :to AND (s.to is null OR s.to >= :from)"
        return entityManager
            .createQuery(query, SickDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: SickDayForm): SickDay = form.copy(status = Status.REQUESTED)
        .validate()
        .consume()
        .save()

    fun update(code: String, form: SickDayForm): SickDay = repository
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
            .findByUuid(this.personId)
            ?: throw error("Cannot find person: ${this.personId}")

        return SickDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            person = person,
            hours = this.hours,
            days = this.days,
            description = this.description,
            status = this.status
        )
    }

    private fun SickDay.save() = repository.save(this)
}
