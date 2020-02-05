package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.AssignmentRepository
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadAssignmentData(
    private val loadUserData: LoadUserData,
    private val loadClientData: LoadClientData,
    private val assignmentRepository: AssignmentRepository,
    private val loadPersonData: LoadPersonData
) {

    val data: MutableSet<Assignment> = mutableSetOf()

    init {
        create("bert@sesam.straat", "ing", "DevOps engineer", LocalDate.of(2018, 6, 1))
        create("ieniemienie@sesam.straat", "ing", "Test engineer", LocalDate.of(2018, 6, 1), LocalDate.of(2018, 12, 1))
        create("pino@sesam.straat", "bolcom", "Agile clown", LocalDate.of(2019, 2, 1), LocalDate.of(2020, 2, 1))
    }

    private final fun create(email: String, client: String, role: String, startDate: LocalDate, endDate: LocalDate? = null) = Assignment(
        startDate = startDate,
        endDate = endDate,
        person = findPersonByUserEmail(email),
        client = findClientByCode(client),
        hourlyRate = 80.5,
        hoursPerWeek = 36,
        role = role)
        .save()

    private fun findUserByEmail(email: String): User = loadUserData.data
        .find { it.email == email }
        ?: error("Cannot find User")

    private fun findClientByCode(code: String): Client = loadClientData.data
        .find { it.code == code }
        ?: error("Cannot find Client")

    private fun findPersonByUserCode(code: String): Person = loadPersonData.data
        .find { it.user?.code == code }
        ?: error("Cannot find Client")

    private fun findPersonByUserEmail(email: String): Person = loadPersonData.data
        .find { it.user?.email == email }
        ?: error("Cannot find Client")

    private fun Assignment.save(): Assignment = assignmentRepository
        .save(this)
        .also { data.add(it) }
}
