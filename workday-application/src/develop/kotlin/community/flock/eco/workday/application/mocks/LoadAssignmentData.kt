package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.repository.AssignmentRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadAssignmentData(
    private val loadClientData: LoadClientData,
    private val assignmentRepository: AssignmentRepository,
    private val loadPersonData: LoadPersonData,
    private val loadProjectData: LoadProjectData,
    loadData: LoadData,
) {
    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)

    val data: MutableSet<Assignment> = mutableSetOf()

    init {
        loadData.loadWhenEmpty {
            create(
                "tommy@sesam.straat",
                "client_a",
                "DevOps engineer",
                90.0,
                now.minusMonths(3),
                projectName = "Project A1",
            )
            create(
                "ieniemienie@sesam.straat",
                "client_a",
                "Test engineer",
                100.0,
                now.minusMonths(8),
                now.plusMonths(8),
                projectName = "Project A2",
            )
            create(
                "pino@sesam.straat",
                "client_b",
                "Senior software engineer",
                135.0,
                now.minusMonths(0),
                now.plusMonths(12),
            )
            create(
                "bert@sesam.straat",
                "client_c",
                "Medior software engineer",
                90.0,
                now.minusMonths(4),
                now.plusMonths(8),
                projectName = "Project C",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2020, 10, 27),
                LocalDate.of(2021, 10, 26),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2021, 10, 27),
                LocalDate.of(2021, 12, 31),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2022, 1, 1),
                LocalDate.of(2022, 12, 31),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2023, 1, 1),
                LocalDate.of(2023, 12, 31),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2024, 1, 1),
                LocalDate.of(2024, 12, 31),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 12, 31),
                32,
                projectName = "Project D",
            )
            create(
                "ernie@sesam.straat",
                "client_d",
                "Junior software engineer",
                85.0,
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 12, 31),
                32,
                projectName = "Project D",
            )
        }
    }

    private fun create(
        email: String,
        client: String,
        role: String,
        hourlyRate: Double,
        from: LocalDate,
        to: LocalDate? = null,
        hoursPerWeek: Int? = null,
        projectName: String? = null,
    ) = Assignment(
        from = from,
        to = to,
        person = loadPersonData.findPersonByUserEmail(email),
        client = loadClientData.findClientByCode(client),
        hourlyRate = hourlyRate,
        hoursPerWeek = hoursPerWeek ?: 36,
        role = role,
        project = projectName?.let { loadProjectData.getProjectByName(it) },
    )
        .save()

    private fun Assignment.save(): Assignment =
        assignmentRepository
            .save(this)
            .also { data.add(it) }
}
