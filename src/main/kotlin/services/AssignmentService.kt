package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.repository.AssignmentRepository
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.PersonRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*
import javax.persistence.EntityManager
import javax.transaction.Transactional

@Service
class AssignmentService(
    private val clientRepository: ClientRepository,
    private val personRepository: PersonRepository,
    private val assignmentRepository: AssignmentRepository,
    private val entityManager: EntityManager
) {

    fun findAll(page: Pageable): Page<Assignment> = assignmentRepository
        .findAll(page)

    fun findByCode(code: String) = assignmentRepository
        .findByCode(code)
        .toNullable()

    fun findAllByPersonUuid(personUuid: UUID) = assignmentRepository
        .findAllByPersonUuid(personUuid)

    fun findAllByPersonUserCode(userCode: String) = assignmentRepository
        .findAllByPersonUserCode(userCode)

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Assignment> {
        val query = "SELECT a FROM Assignment a WHERE a.from <= :to AND (a.to is null OR a.to >= :from)"
        return entityManager
            .createQuery(query, Assignment::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

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
        from = this.from,
        to = this.to,
        hourlyRate = this.hourlyRate,
        hoursPerWeek = this.hoursPerWeek,
        role = this.role,
        client = this.clientCode
            .let { clientRepository.findByCode(it).toNullable() }
            ?: error("Cannot find Client"),
        person = it?.person
            ?: this.personId.let { personRepository.findByUuid(it).toNullable() }
            ?: error("Cannot find Person")
    )

    private fun Assignment.save() = assignmentRepository.save(this)
}

fun Assignment.isActive(from: LocalDate, to: LocalDate) = this.from <= to && this.to?.let { it >= from } ?: true
