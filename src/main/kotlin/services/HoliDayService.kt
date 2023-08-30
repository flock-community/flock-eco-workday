package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.repository.HolidayRepository
import community.flock.eco.workday.services.email.HolidayEmailService
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager

@Service
class HoliDayService(
    private val holidayRepository: HolidayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
    private val emailService: HolidayEmailService
) {

    fun findByCode(code: String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByPersonUuid(personCode: UUID) = holidayRepository.findAllByPersonUuid(personCode)
    fun findAllByPersonUuid(personCode: UUID, pageable: Pageable) = holidayRepository.findAllByPersonUuid(personCode, pageable)
    fun findAllByPersonUserCode(userCode: String, pageable: Pageable) = holidayRepository.findAllByPersonUserCode(userCode, pageable)
    fun findAllByStatus(status: Status) = holidayRepository.findAllByStatus(status)

    fun findAllActive(from: LocalDate, to: LocalDate): Iterable<HoliDay> {
        val query = "SELECT h FROM HoliDay h LEFT JOIN FETCH h.days WHERE h.from <= :to AND (h.to is null OR h.to >= :from)"
        return entityManager
            .createQuery(query, HoliDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    /**
     * Return all holidays that have at least one day in the date range specified by "from" and "to".
     *
     * The result could include holidays that also contain days that do not fall within that range.
     * You can filter these out using [community.flock.eco.workday.model.Day.hoursPerDayInPeriod].
     */
    fun findAllActiveByPerson(from: LocalDate, to: LocalDate, personCode: UUID): Iterable<HoliDay> {
        val query = "SELECT h FROM HoliDay h LEFT JOIN FETCH h.days WHERE h.from <= :to AND (h.to is null OR h.to >= :from) AND h.person.uuid = :personCode"
        return entityManager
            .createQuery(query, HoliDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun create(form: HoliDayForm): HoliDay = form.copy(status = Status.REQUESTED)
        .consume()
        .validate()
        .save()
        .also { emailService.sendNotification(it) }

    fun update(code: String, form: HoliDayForm): HoliDay {
        val currentHoliDay = holidayRepository.findByCode(code).toNullable()
        return currentHoliDay
            .run {
                form
                    .validate()
                    .consume(this)
                    .save()
            }
            .also {
                emailService.sendUpdate(currentHoliDay!!, it)
            }
    }

    @Transactional
    fun deleteByCode(code: String) = holidayRepository
        .findByCode(code)
        .toNullable()
        ?.also { holidayRepository.deleteByCode(code) }

    private fun HoliDay.save() = holidayRepository.save(this)

    private fun HoliDayForm.consume(it: HoliDay? = null): HoliDay {
        val person = personService
            .findByUuid(this.personId)
            ?: throw error("Cannot find person: ${this.personId}")

        return HoliDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = description,
            status = status,
            from = from,
            to = to,
            person = person,
            hours = hours,
            days = days,
            type = type
        )
    }
}

fun User.isAdmin(): Boolean = this.authorities
    .contains(HolidayAuthority.ADMIN.toName())
