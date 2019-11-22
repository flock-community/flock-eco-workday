package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.repository.AssignmentRepository
import community.flock.eco.workday.repository.ClientRepository
import javax.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class AssignmentService(
    private val clientRepository: ClientRepository,
    private val userRepository: UserRepository,
    private val assignmentRepository: AssignmentRepository
) {

    fun findAll(page: Pageable): Page<Assignment> = assignmentRepository
            .findAll(page)

    fun findByCode(code: String) = assignmentRepository
            .findByCode(code)
            .toNullable()

    fun findAllByUserCode(userCode: String) = assignmentRepository
            .findAllByUserCode(userCode)

    @Transactional
    fun create(form: AssignmentForm): Assignment? = form
            .internalize()
            .save()

    @Transactional
    fun update(code: String, form: AssignmentForm): Assignment? = assignmentRepository
            .findByCode(code)
            .toNullable()
            ?.let { form.internalize(it).save() }

    @Transactional
    fun delete(code: String): Unit = assignmentRepository
            .deleteByCode(code)

    private fun AssignmentForm.internalize(it: Assignment? = null) = Assignment(
            id = it?.id ?: 0,
            startDate = this.startDate,
            endDate = this.endDate,
            client = it?.client
                    ?: this.clientCode.let { clientRepository.findByCode(it).toNullable() }
                    ?: throw RuntimeException("Cannot find client"),
            user = it?.user
                    ?: this.userCode.let { userRepository.findByCode(it).toNullable() }
                    ?: throw RuntimeException("Cannot find user")
    )

    private fun Assignment.save() = assignmentRepository.save(this)
}
