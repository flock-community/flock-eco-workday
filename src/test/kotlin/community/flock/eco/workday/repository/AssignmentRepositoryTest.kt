package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.config.AppTestConfig
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.data.domain.Pageable
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import java.util.UUID
import javax.transaction.Transactional

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
@Transactional
class AssignmentRepositoryTest(
    @Autowired private val personRepository: PersonRepository,
    @Autowired private val projectRepository: ProjectRepository,
    @Autowired private val clientRepository: ClientRepository,
    @Autowired private val repository: AssignmentRepository,
) {
    private final val assignmentCode1 = UUID.randomUUID()
    private final val assignmentCode2 = UUID.randomUUID()
    private final val assignmentCode3 = UUID.randomUUID()
    private final val personCode1 = UUID.randomUUID()
    private final val personCode2 = UUID.randomUUID()
    private final val projectCode = UUID.randomUUID()

    fun loadData() {
        val client =
            clientRepository.save(
                Client(
                    code = UUID.randomUUID().toString(),
                    name = "Test Client",
                ),
            )
        val person1 =
            personRepository.save(
                Person(
                    uuid = personCode1,
                    firstname = "Denholm",
                    lastname = "Reynholm",
                    email = "denholm@reynholm-industries.co.uk",
                    position = "Chief Executive Officer",
                    number = null,
                    user = null,
                ),
            )
        val person2 =
            personRepository.save(
                Person(
                    uuid = personCode2,
                    firstname = "Denholm",
                    lastname = "Reynholm",
                    email = "denholm@reynholm-industries.co.uk",
                    position = "Chief Executive Officer",
                    number = null,
                    user = null,
                ),
            )
        val project =
            projectRepository.save(
                Project(
                    code = projectCode.toString(),
                    name = "Project 1",
                ),
            )
        repository.save(
            Assignment(
                code = assignmentCode1.toString(),
                from = LocalDate.of(2023, 11, 1),
                to = LocalDate.of(2023, 11, 20),
                hourlyRate = 88.8,
                hoursPerWeek = 36,
                client = client,
                person = person1,
            ),
        )
        repository.save(
            Assignment(
                code = assignmentCode2.toString(),
                from = LocalDate.of(2023, 12, 1),
                to = LocalDate.of(2023, 12, 31),
                hourlyRate = 88.8,
                hoursPerWeek = 36,
                client = client,
                person = person2,
                project = project,
            ),
        )
        repository.save(
            Assignment(
                code = assignmentCode3.toString(),
                from = LocalDate.of(2024, 1, 1),
                to = null,
                hourlyRate = 88.8,
                hoursPerWeek = 36,
                client = client,
                person = person2,
                project = project,
            ),
        )
    }

    @Test
    fun `should return all assignments`() {
        loadData()
        val res = repository.findAll()
        assertThat(res.toSet().size).isEqualTo(3)
    }

    @Test
    fun `should return assignments by code`() {
        loadData()
        val res = repository.findByCode(assignmentCode1.toString())
        assertThat(res.get().code).isEqualTo(assignmentCode1.toString())
    }

    @Test
    fun `should return assignments by project code`() {
        loadData()
        val res = repository.findByProjectCode(projectCode.toString(), Pageable.unpaged())
        assertThat(res.totalElements).isEqualTo(2)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode2.toString())
        assertThat(res.toList()[1].code).isEqualTo(assignmentCode3.toString())
    }

    @Test
    fun `should return assignments by person uuid`() {
        loadData()
        val res = repository.findAllByPersonUuid(personCode1, Pageable.unpaged())
        assertThat(res.totalElements).isEqualTo(1)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode1.toString())
    }

    @Test
    fun `should remove by code`() {
        loadData()
        repository.deleteByCode(assignmentCode1.toString())
        val res = repository.findAll().toList()
        assertThat(res.size).isEqualTo(2)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode2.toString())
        assertThat(res.toList()[1].code).isEqualTo(assignmentCode3.toString())
    }

    @Test
    fun `should return to date after or null`() {
        loadData()
        val date = LocalDate.of(2023, 11, 25)
        val res = repository.findAllByToAfterOrToNull(date, Pageable.unpaged())
        assertThat(res.size).isEqualTo(2)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode2.toString())
        assertThat(res.toList()[1].code).isEqualTo(assignmentCode3.toString())
    }

    @Test
    fun `should return all active`() {
        loadData()
        val from = LocalDate.of(2023, 11, 25)
        val to = LocalDate.of(2023, 12, 25)
        val res = repository.findAllActive(from, to)
        assertThat(res.size).isEqualTo(1)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode2.toString())
    }

    @Test
    fun `should return all active by person`() {
        loadData()
        val from = LocalDate.of(2023, 11, 1)
        val to = LocalDate.of(2024, 2, 25)
        val res = repository.findAllActiveByPerson(from, to, personCode1)
        assertThat(res.size).isEqualTo(1)
        assertThat(res.toList()[0].code).isEqualTo(assignmentCode1.toString())
    }
}
