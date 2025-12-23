package community.flock.eco.workday.application.services

import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.model.WorkDaySheet
import community.flock.eco.workday.application.repository.WorkDayRepository
import community.flock.eco.workday.application.services.email.WorkdayEmailService
import community.flock.eco.workday.core.utils.toNullable
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

@Transactional
@Service
class WorkDayService(
    private val workDayRepository: WorkDayRepository,
    private val assignmentService: AssignmentService,
    private val entityManager: EntityManager,
    private val emailService: WorkdayEmailService,
    @Value("\${flock.eco.workday.bucket.documents}") val bucketName: String,
) {
    fun findByCode(code: String): WorkDay? =
        workDayRepository
            .findByCode(code)
            .toNullable()

    fun findAllByPersonUuid(personCode: UUID) =
        workDayRepository
            .findAllByAssignmentPersonUuid(personCode)

    fun findAllByPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ) = workDayRepository
        .findAllByAssignmentPersonUuid(personCode, pageable)

    fun findAllByPersonUserCode(
        userCode: String,
        pageable: Pageable,
    ) = workDayRepository
        .findAllByAssignmentPersonUserCode(userCode, pageable)

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<WorkDay> {
        val query =
            "SELECT it FROM WorkDay it LEFT JOIN FETCH it.days WHERE it.from <= :to AND (it.to is null OR it.to >= :from)"
        return entityManager
            .createQuery(query, WorkDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<WorkDay> {
        val query =
            """SELECT it
                |FROM WorkDay it
                |LEFT JOIN FETCH it.days
                |WHERE it.from <= :to
                |AND (it.to is null OR it.to >= :from)
                |AND it.assignment.person.uuid = :personCode
            """.trimMargin()
        return entityManager
            .createQuery(query, WorkDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun findAllByStatus(status: Status) = workDayRepository.findAllByStatus(status)

    fun create(form: WorkDayForm): WorkDay =
        form.copy(status = Status.REQUESTED)
            .validate()
            .consume()
            .save()
            .also {
                emailService.sendNotification(it)
            }

    fun update(
        workDayCode: String,
        form: WorkDayForm,
        isUpdatedByOwner: Boolean,
    ): WorkDay {
        val currentWorkday = workDayRepository.findByCode(workDayCode).toNullable()
        return currentWorkday
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

    fun uploadSheet(byteArray: ByteArray): UUID {
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

    fun readSheet(uuid: UUID): ByteArray {
        val blob = storage.get(bucketName, uuid.toString())
        return blob.getContent()
    }

    @Transactional
    fun deleteByCode(code: String) = workDayRepository.deleteByCode(code)

    fun getTotalHoursByAssignment(assignment: Assignment) = workDayRepository.getTotalHoursByAssignment(assignment)

    private fun WorkDayForm.validate() =
        apply {
            val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
            if (this.hours < 0) {
                error("Hours cannot have negative value")
            }
            if (this.days?.any { it < 0 } == true) {
                error("Days cannot have negative value")
            }
            if (this.days != null) {
                if (this.days.size.toLong() != daysBetween) {
                    error("amount of days ($daysBetween) not equal to period (${this.days.size})")
                }
                if (this.days.sum() != this.hours) {
                    error("Total hour does not match sum: ${this.days.sum()} hours: ${this.hours}")
                }
            }
        }

    private fun WorkDayForm.consume(it: WorkDay? = null): WorkDay {
        val assignment =
            assignmentService
                .findByCode(this.assignmentCode)
                ?: error("Cannot find assignment: ${this.assignmentCode}")

        return WorkDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            assignment = assignment,
            hours = this.hours,
            days = this.days,
            status = this.status,
            sheets =
                this.sheets.map {
                    WorkDaySheet(
                        name = it.name,
                        file = it.file,
                    )
                },
        )
    }

    private fun WorkDay.save() = workDayRepository.save(this)

    companion object {
        val storage: Storage = StorageOptions.getDefaultInstance().service
    }
}
