package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.repository.WorkDayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager

@Service
class WorkDayService(
    private val workDayRepository: WorkDayRepository,
    private val assignmentService: AssignmentService,
    private val entityManager: EntityManager
) {

    fun findByCode(code: String): WorkDay? = workDayRepository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonPersonCode(userCode: String) = workDayRepository
        .findAllByAssignmentPersonCode(userCode)

    fun findAllByPersonUserCode(userCode: String) = workDayRepository
        .findAllByAssignmentPersonUserCode(userCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Sickday> {
        val query = "SELECT it FROM WorkDay it WHERE it.from <= :to AND (it.to is null OR it.to >= :from)"
        return entityManager
            .createQuery(query, Sickday::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: WorkDayForm): WorkDay = form
        .validate()
        .consume()
        .save()


    fun update(workDayCode: String, form: WorkDayForm): WorkDay = workDayRepository
        .findByCode(workDayCode)
        .toNullable()
        .run {
            form
                .validate()
                .consume(this)
                .save()
        }

    @Transactional
    fun deleteByCode(code: String) = workDayRepository.deleteByCode(code)


    private fun WorkDayForm.validate() = apply {
        val daysBetween = java.time.Period.between(this.from, this.to).days + 1
        if(this.hours < 0 ){
            throw error("Hours cannot have negative value")
        }
        if(this.days?.any{it < 0} == true) {
            throw error("Days cannot have negative value")
        }
        if (this.days != null) {
            if (this.days.size != daysBetween) {
                throw error("amount of days (${daysBetween}) not equal to period (${this.days.size})")
            }
            if (this.days.sum() != this.hours) {
                throw error("Total hour does not match")
            }
        }
    }

    private fun WorkDayForm.consume(it: WorkDay? = null): WorkDay {
        val assignment = assignmentService
            .findByCode(this.assignmentCode)
            ?: throw error("Cannot find assignment: ${this.assignmentCode}")

        return WorkDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            assignment = assignment,
            hours = this.hours,
            days = this.days
        )
    }

    private fun WorkDay.save() = workDayRepository.save(this)

}
