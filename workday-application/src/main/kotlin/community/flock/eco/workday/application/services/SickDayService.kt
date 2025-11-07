package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.repository.SickdayRepository
import community.flock.eco.workday.application.services.email.SickDayMailService
import community.flock.eco.workday.core.utils.toNullable
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
    private val entityManager: EntityManager,
    private val emailService: SickDayMailService,
) {
    fun findAll(pageable: Pageable) =
        repository
            .findAll(pageable)

    fun findByCode(code: String): SickDay? =
        repository
            .findByCode(code)
            .toNullable()

    fun findAllByPersonUuid(personCode: UUID) =
        repository
            .findAllByPersonUuid(personCode)

    fun findAllByPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ) = repository
        .findAllByPersonUuid(personCode, pageable)

    fun findAllByPersonUserCode(
        userCode: String,
        pageable: Pageable,
    ) = repository
        .findAllByPersonUserCode(userCode, pageable)

    fun findAllByStatus(status: Status) = repository.findAllByStatus(status)

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<SickDay> {
        val query =
            """SELECT s
                |FROM SickDay s LEFT JOIN FETCH s.days
                |WHERE s.from <= :to AND (s.to is null OR s.to >= :from)
                |AND s.person.uuid = :personCode
            """.trimMargin()
        return entityManager
            .createQuery(query, SickDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<SickDay> {
        val query =
            "SELECT s FROM SickDay s LEFT JOIN FETCH s.days WHERE s.from <= :to AND (s.to is null OR s.to >= :from)"
        return entityManager
            .createQuery(query, SickDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    fun create(form: SickDayForm): SickDay =
        form.copy(status = Status.REQUESTED)
            .validate()
            .consume()
            .save()
            .also { emailService.sendNotification(it) }

    fun update(
        code: String,
        form: SickDayForm,
        isUpdatedByOwner: Boolean,
    ): SickDay {
        val currentSickDay = repository.findByCode(code).toNullable()
        return currentSickDay
            .run {
                form
                    .validate()
                    .consume(this)
                    .save()
            }
            .also {
                if (!isUpdatedByOwner) {
                    emailService.sendUpdate(it)
                }
            }
    }

    @Transactional
    fun deleteByCode(code: String) = repository.deleteByCode(code)

    private fun SickDayForm.consume(it: SickDay? = null): SickDay {
        val person =
            personService
                .findByUuid(this.personId)
                ?: error("Cannot find person: ${this.personId}")

        return SickDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            person = person,
            hours = this.hours,
            days = this.days,
            description = this.description,
            status = this.status,
        )
    }

    private fun SickDay.save() = repository.save(this)
}
