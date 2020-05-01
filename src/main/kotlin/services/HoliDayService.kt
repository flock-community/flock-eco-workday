package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.repository.HolidayRepository
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HoliDayService(
    private val holidayRepository: HolidayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByPersonCode(personCode: String) = holidayRepository.findAllByPersonCode(personCode)
    fun findAllByPersonUserCode(personCode: String) = holidayRepository.findAllByPersonUserCode(personCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<HoliDay> {
        val query = "SELECT h FROM HoliDay h WHERE h.from <= :to AND (h.to is null OR h.to >= :from)"
        return entityManager
            .createQuery(query, HoliDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: HoliDayForm): HoliDay = form.copy(status = Status.REQUESTED)
        .validate()
        .consume()
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
            .findByCode(this.personCode)
            ?: throw error("Cannot find person: ${this.personCode}")

        return HoliDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = this.description,
            status = this.status,
            from = this.from,
            to = this.to,
            person = person,
            hours = this.hours,
            days = this.days
        )
    }
}

fun User.isAdmin(): Boolean = this.authorities
    .contains(HolidayAuthority.ADMIN.toName())
