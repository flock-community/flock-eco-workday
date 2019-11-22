package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.AssignmentRepository
import org.springframework.context.annotation.Profile
import java.time.LocalDate
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadAssignmentData(
    private val loadUserData: LoadUserData,
    private val loadClientData: LoadClientData,
    private val assignmentRepository: AssignmentRepository
) {

    val data: MutableSet<Assignment> = mutableSetOf()

    init {
        create("ieniemienie@sesam.straat", "ing", LocalDate.of(2018, 6, 1))
        create("pino@sesam.straat", "bolcom", LocalDate.of(2019, 2, 1), LocalDate.of(2020, 1, 1))
    }

    private final fun create(email: String, client: String, startDate: LocalDate, endDate: LocalDate? = null) = Assignment(
            startDate = startDate,
            endDate = endDate,
            user = findUserByEmail(email),
            client = findClientByCode(client))
            .save()

    private fun findUserByEmail(email: String): User = loadUserData.data
            .find { it.email == email }
            ?: throw RuntimeException("Cannot find User")

    private fun findClientByCode(code: String): Client = loadClientData.data
            .find { it.code == code }
            ?: throw RuntimeException("Cannot find Client")

    private fun Assignment.save(): Assignment = assignmentRepository
            .save(this)
            .also { data.add(it) }
}
