package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.repository.AssignmentRepository
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.PersonRepository
import community.flock.eco.workday.repository.ProjectRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID
import javax.transaction.Transactional

@Service
class AssignmentService(
    private val clientRepository: ClientRepository,
    private val personRepository: PersonRepository,
    private val assignmentRepository: AssignmentRepository,
    private val projectRepository: ProjectRepository,
) {
    fun findAll(page: Pageable): Page<Assignment> =
        assignmentRepository
            .findAll(page)

    fun findByCode(code: String) =
        assignmentRepository
            .findByCode(code)
            .toNullable()

    fun findAllByPersonUuid(
        personUuid: UUID,
        page: Pageable = Pageable.unpaged(),
    ) = assignmentRepository
        .findAllByPersonUuid(personUuid, page)

    fun findAllByPersonUserCode(
        userCode: String,
        page: Pageable = Pageable.unpaged(),
    ) = assignmentRepository
        .findAllByPersonUserCode(userCode, page)

    fun findAllByToAfterOrToNull(
        to: LocalDate,
        page: Pageable,
    ): Page<Assignment> = assignmentRepository.findAllByToAfterOrToNull(to, page)

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): List<Assignment> = assignmentRepository.findAllActive(from, to)

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): List<Assignment> = assignmentRepository.findAllActiveByPerson(from, to, personCode)

    fun findByProjectCode(
        projectCode: String,
        page: Pageable,
    ): Page<Assignment> = assignmentRepository.findByProjectCode(projectCode, page)

    @Transactional
    fun create(form: AssignmentForm): Assignment? =
        form
            .internalize()
            .save()

    @Transactional
    fun update(
        code: String,
        form: AssignmentForm,
    ): Assignment? =
        findByCode(code)
            ?.let { form.internalize(it) }
            ?.save()

    @Transactional
    fun deleteByCode(code: String): Unit =
        assignmentRepository
            .deleteByCode(code)

    private fun AssignmentForm.internalize(it: Assignment? = null) =
        Assignment(
            id = it?.id ?: 0,
            from = this.from,
            to = this.to,
            hourlyRate = this.hourlyRate,
            hoursPerWeek = this.hoursPerWeek,
            role = this.role,
            client =
                this.clientCode
                    .let { clientRepository.findByCode(it).toNullable() }
                    ?: error("Cannot find Client"),
            person =
                it?.person
                    ?: this.personId.let { personRepository.findByUuid(it).toNullable() }
                    ?: error("Cannot find Person"),
            project =
                this.projectCode
                    ?.let { projectRepository.findByCode(it) },
        )

    private fun Assignment.save() = assignmentRepository.save(this)
}
