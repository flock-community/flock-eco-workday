package community.flock.eco.workday.services

import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.StorageOptions
import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.WorkDaySheet
import community.flock.eco.workday.repository.WorkDayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
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

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<WorkDay> {
        val query = "SELECT it FROM WorkDay it WHERE it.from <= :to AND (it.to is null OR it.to >= :from)"
        return entityManager
            .createQuery(query, WorkDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun create(form: WorkDayForm): WorkDay = form.copy(status = Status.REQUESTED)
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

    fun uploadSheet(byteArray: ByteArray): UUID {
        val bucketName = "flock-workday-hour-sheets"
        return UUID.randomUUID()
            .apply {
                BlobInfo
                    .newBuilder(bucketName, toString())
                    .build()
                    .apply {
                        storage.create(this, byteArray)
                    }
            }
    }

    @Transactional
    fun deleteByCode(code: String) = workDayRepository.deleteByCode(code)

    private fun WorkDayForm.validate() = apply {
        val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
        if (this.hours < 0) {
            throw error("Hours cannot have negative value")
        }
        if (this.days?.any { it < 0 } == true) {
            throw error("Days cannot have negative value")
        }
        if (this.days != null) {
            if (this.days.size.toLong() != daysBetween) {
                throw error("amount of days ($daysBetween) not equal to period (${this.days.size})")
            }
            if (this.days.sum() != this.hours) {
                throw error("Total hour does not match sum: ${this.days.sum()} hours: ${this.hours}")
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
            days = this.days,
            status = this.status,
            sheets = this.sheets.map {
                WorkDaySheet(
                    name = it.name,
                    file = it.file
                )
            }
        )
    }

    private fun WorkDay.save() = workDayRepository.save(this)

    companion object {
        val storage = StorageOptions.getDefaultInstance().service
    }
}
