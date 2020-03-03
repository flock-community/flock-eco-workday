package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.persistence.EntityManager

@Service
class HolidayService(
    private val holidayRepository: HolidayRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String) = holidayRepository.findByCode(code).toNullable()
    fun findAllByPersonCode(personCode: String) = holidayRepository.findAllByPersonCode(personCode)
    fun findAllByPersonUserCode(personCode: String) = holidayRepository.findAllByPersonUserCode(personCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<HoliDay> {
        val query = "SELECT h FROM HoliDay h WHERE h.from <= :to AND (h.to is null OR h.to > :from)"
        return entityManager
            .createQuery(query, HoliDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: HoliDayForm): HoliDay = form
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

    private fun HoliDayForm.validate() = apply {
        val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
        if (this.hours < 0) {
            throw error("Hours cannot have negative value")
        }
        if (this.days?.any { it < 0 } == true) {
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

fun User.isAdmin(): Boolean = this.authorities
    .contains(HolidayAuthority.ADMIN.toName())
