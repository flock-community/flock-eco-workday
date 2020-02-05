package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
class AssignmentServiceTest {

    @Autowired
    lateinit var assignmentService: AssignmentService

    @Autowired
    lateinit var clientService: ClientService

    @Autowired
    lateinit var personService: PersonService

    @Test
    fun `find all active assignments`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val client1 = createClient("client 1")
        val person1 = createPerson("firstname 1", "lastname 1")

        // In range
        val in1 = createAssignment(client1, person1, from.plusMonths(1), to.minusMonths(1))
        val in2 = createAssignment(client1, person1, from.minusMonths(1), to.minusMonths(1))
        val in3 = createAssignment(client1, person1, from.plusMonths(1), to.plusMonths(1))
        val in4 = createAssignment(client1, person1, from.minusMonths(1), to.plusMonths(1))
        val in5 = createAssignment(client1, person1, from.plusMonths(1), null)
        val in6 = createAssignment(client1, person1, from.minusMonths(1), null)

        // Out range
        val out1 = createAssignment(client1, person1, to.plusMonths(1), to.minusMonths(3))
        val out2 = createAssignment(client1, person1, from.minusMonths(3), from.minusMonths(1))
        val out3 = createAssignment(client1, person1, to.plusMonths(1), null)

        val res = assignmentService.findAllActive(from, to)

        assertEquals(6, res.size)
        assertTrue(res.contains(in1))
        assertTrue(res.contains(in2))
        assertTrue(res.contains(in3))
        assertTrue(res.contains(in4))
        assertTrue(res.contains(in5))
        assertTrue(res.contains(in6))
        assertFalse(res.contains(out1))
        assertFalse(res.contains(out2))
        assertFalse(res.contains(out3))
    }

    fun createClient(name: String) = ClientForm(
        name = name
    ).run {
        clientService.create(this)
    } ?: error("Cannot create client")

    fun createPerson(firstname: String, lastname: String) = PersonForm(
        email = "$firstname@$lastname",
        firstname = firstname,
        lastname = lastname,
        position = "Software engineer",
        userCode = null
    ).run {
        personService.create(this)
    } ?: error("Cannot create person")

    fun createAssignment(client: Client, person: Person, startDate: LocalDate, endDate: LocalDate?) = AssignmentForm(
        clientCode = client.code,
        personCode = person.code,
        hourlyRate = 80.0,
        hoursPerWeek = 36,
        role = "Senior software engineer",
        startDate = startDate,
        endDate = endDate
    ).run {
        assignmentService.create(this)
    } ?: error("Cannot create assignment")
}
