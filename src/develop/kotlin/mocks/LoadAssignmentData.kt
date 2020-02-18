package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Assignment
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
        person = loadPersonData.findPersonByUserEmail(email),
        client = loadClientData.findClientByCode(client),
        hourlyRate = 80.5,
        hoursPerWeek = 36,
        role = role)
        .save()

    private fun Assignment.save(): Assignment = assignmentRepository
        .save(this)
        .also { data.add(it) }
}
