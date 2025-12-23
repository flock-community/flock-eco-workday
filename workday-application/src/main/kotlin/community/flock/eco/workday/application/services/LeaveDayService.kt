package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.repository.LeaveDayRepository
import community.flock.eco.workday.application.services.email.LeaveDayMailService
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.model.User
import jakarta.persistence.EntityManager
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class LeaveDayService(
    private val leaveDayRepository: LeaveDayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
    private val emailService: LeaveDayMailService,
) {
    fun findByCode(code: String) = leaveDayRepository.findByCode(code).toNullable()

    fun findAllByPersonUuid(personCode: UUID) = leaveDayRepository.findAllByPersonUuid(personCode)

    fun findAllByPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ) = leaveDayRepository.findAllByPersonUuid(personCode, pageable)

    fun findAllByPersonUserCode(
        userCode: String,
        pageable: Pageable,
    ) = leaveDayRepository.findAllByPersonUserCode(userCode, pageable)

    fun findAllByStatus(status: Status) = leaveDayRepository.findAllByStatus(status)

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<LeaveDay> {
        val query =
            "SELECT h FROM LeaveDay h LEFT JOIN FETCH h.days WHERE h.from <= :to AND (h.to is null OR h.to >= :from)"
        return entityManager
            .createQuery(query, LeaveDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    /**
     * Return all leave days that have at least one day in the date range specified by "from" and "to".
     *
     * The result could include leave days that also contain days that do not fall within that range.
     * You can filter these out using [community.flock.eco.workday.application.model.Day.hoursPerDayInPeriod].
     */
    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<LeaveDay> {
        val query =
            """SELECT h
                |FROM LeaveDay h
                |LEFT JOIN FETCH h.days
                |WHERE h.from <= :to
                |AND (h.to is null OR h.to >= :from)
                |AND h.person.uuid = :personCode
            """.trimMargin()
        return entityManager
            .createQuery(query, LeaveDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun create(form: LeaveDayForm): LeaveDay =
        form.copy(status = Status.REQUESTED)
            .consume()
            .validate()
            .save()
            .also { emailService.sendNotification(it) }

    fun update(
        code: String,
        form: LeaveDayForm,
        isUpdatedByOwner: Boolean,
    ): LeaveDay {
        val currentLeaveDay = leaveDayRepository.findByCode(code).toNullable()
        return currentLeaveDay
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
    fun deleteByCode(code: String) =
        leaveDayRepository
            .deleteByCode(code)

    private fun LeaveDay.save() = leaveDayRepository.save(this)

    private fun LeaveDayForm.consume(it: LeaveDay? = null): LeaveDay {
        val person =
            personService
                .findByUuid(this.personId)
                ?: error("Cannot find person: ${this.personId}")

        return LeaveDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = description,
            status = status,
            from = from,
            to = to,
            person = person,
            hours = hours,
            days = days,
            type = type,
        )
    }
}

fun User.isAdmin(): Boolean =
    this.authorities
        .contains(LeaveDayAuthority.ADMIN.toName())
