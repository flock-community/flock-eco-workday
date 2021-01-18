package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*
import javax.persistence.EntityManager

@Service
class HoliDayService(
    private val holidayRepository: HolidayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByPersonUuid(personCode: UUID) = holidayRepository.findAllByPersonUuid(personCode)
    fun findAllByPersonUuid(personCode: UUID, pageable: Pageable) = holidayRepository.findAllByPersonUuid(personCode, pageable)
    fun findAllByPersonUserCode(userCode: String, pageable: Pageable) = holidayRepository.findAllByPersonUserCode(userCode, pageable)
    fun findAllByStatus(status: Status) = holidayRepository.findAllByStatus(status)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<HoliDay> {
        val query = "SELECT h FROM HoliDay h WHERE h.from <= :to AND (h.to is null OR h.to >= :from)"
        return entityManager
            .createQuery(query, HoliDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: HoliDayForm): HoliDay = form.copy(status = Status.REQUESTED)
        .consume()
        .apply { if (type == HolidayType.HOLIDAY) validate() }
        .let {
            if (it.type == HolidayType.PLUSDAY) {
                it.copy(hours = (0 - it.hours))
            } else {
                it
            }
        }
        .save()

    fun update(code: String, form: HoliDayForm): HoliDay? = holidayRepository
        .findByCode(code)
        .toNullable()
        .run {
            form
                .validate()
                .consume(this)
                .save()
        }

    @Transactional
    fun deleteByCode(code: String) = holidayRepository
        .deleteByCode(code)

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
