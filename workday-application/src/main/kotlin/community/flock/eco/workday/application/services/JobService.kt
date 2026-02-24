package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.JobForm
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Job
import community.flock.eco.workday.application.model.JobStatus
import community.flock.eco.workday.application.repository.ClientRepository
import community.flock.eco.workday.application.repository.JobRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class JobService(
    private val jobRepository: JobRepository,
    private val clientRepository: ClientRepository,
) {
    fun findAll(page: Pageable): Page<Job> =
        jobRepository
            .findAll(page)

    fun findAllByStatus(
        status: JobStatus,
        page: Pageable,
    ): Page<Job> =
        jobRepository
            .findAllByStatus(status, page)

    fun findByCode(code: String) =
        jobRepository
            .findByCode(code)
            .toNullable()

    @Transactional
    fun create(form: JobForm): Job? =
        form
            .internalize()
            .save()

    @Transactional
    fun update(
        code: String,
        form: JobForm,
    ): Job? =
        this
            .findByCode(code)
            ?.let {
                form.internalize(it).save()
            }

    @Transactional
    fun deleteByCode(code: String): Unit =
        jobRepository
            .deleteByCode(code)

    private fun JobForm.internalize(it: Job? = null) =
        Job(
            id = it?.id ?: 0,
            title = this.title,
            description = this.description,
            hourlyRate = this.hourlyRate,
            hoursPerWeek = this.hoursPerWeek,
            from = this.from,
            to = this.to,
            status = this.status,
            client =
                this.clientCode
                    ?.let { clientRepository.findByCode(it).toNullable() },
            documents =
                this.documents
                    .map { Document(name = it.name, file = UUID.fromString(it.file)) }
                    .toMutableList(),
        )

    private fun Job.save() = jobRepository.save(this)
}
