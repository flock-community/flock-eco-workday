package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.repository.AssignmentRepository
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.PersonRepository
import javax.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class AssignmentService(
    private val clientRepository: ClientRepository,
    private val personRepository: PersonRepository,
    private val assignmentRepository: AssignmentRepository
) {

    fun findAll(page: Pageable): Page<Assignment> = assignmentRepository
        .findAll(page)

    fun findByCode(code: String) = assignmentRepository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonCode(personCode: String) = assignmentRepository
        .findAllByPersonCode(personCode)

    fun findAllByPersonUserCode(userCode: String) = assignmentRepository
        .findAllByPersonUserCode(userCode)

    @Transactional
    fun create(form: AssignmentForm): Assignment? = form
        .internalize()
        .save()

    @Transactional
    fun update(code: String, form: AssignmentForm): Assignment? = findByCode(code)
        ?.let { form.internalize(it) }
        ?.save()

    @Transactional
    fun deleteByCode(code: String): Unit = assignmentRepository
        .deleteByCode(code)

    private fun AssignmentForm.internalize(it: Assignment? = null) = Assignment(
        id = it?.id ?: 0,
        startDate = this.startDate,
        endDate = this.endDate,
        hourlyRate = this.hourlyRate,
        hoursPerWeek = this.hoursPerWeek,
        role = this.role,
        client = this.clientCode
            .let { clientRepository.findByCode(it).toNullable() }
            ?: error("Cannot find Client"),
        person = it?.person
            ?: this.personCode.let { personRepository.findByCode(it).toNullable() }
            ?: error("Cannot find Person")
    )

    private fun Assignment.save() = assignmentRepository.save(this)
}
