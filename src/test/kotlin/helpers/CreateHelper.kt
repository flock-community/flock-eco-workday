package community.flock.eco.workday.helpers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.forms.ContractExternalForm
import community.flock.eco.workday.forms.ContractInternalForm
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.AssignmentService
import community.flock.eco.workday.services.ClientService
import community.flock.eco.workday.services.ContractService
import community.flock.eco.workday.services.PersonService
import java.time.LocalDate
import java.util.UUID
import org.springframework.stereotype.Component

@Component
class CreateHelper(
    val assignmentService: AssignmentService,
    val contractService: ContractService,
    val clientService: ClientService,
    val personService: PersonService,
    val userService: UserService
) {

    fun createUser(authorities: Set<Authority>) = createUser(UUID.randomUUID().toString(), authorities)
    fun createUser(name: String, authorities: Set<Authority>) = UserForm(
        name = name,
        email = "$name@workday.io",
        authorities = authorities.map { it.toName() }.toSet()
    ).run {
        userService.create(this)
    }

    fun createClient() = createClient(UUID.randomUUID().toString())
    fun createClient(name: String) = ClientForm(
        name = name
    ).run {
        clientService.create(this)
    } ?: error("Cannot create client")

    fun createPerson() = createPerson(UUID.randomUUID().toString(), UUID.randomUUID().toString())
    fun createPerson(firstname: String, lastname: String) = PersonForm(
        email = "$firstname@$lastname",
        firstname = firstname,
        lastname = lastname,
        position = "Software engineer",
        userCode = null,
        number = null
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

    fun createContractInternal(person: Person, startDate: LocalDate, endDate: LocalDate?) = ContractInternalForm(
        personCode = person.code,
        monthlySalary = 4000.0,
        hoursPerWeek = 40,
        startDate = startDate,
        endDate = endDate
    ).run {
        contractService.create(this)
    } ?: error("Cannot create internal contract")

    fun createContractExternal(person: Person, startDate: LocalDate, endDate: LocalDate?) = ContractExternalForm(
        personCode = person.code,
        hourlyRate = 75.0,
        hoursPerWeek = 40,
        startDate = startDate,
        endDate = endDate
    ).run {
        contractService.create(this)
    } ?: error("Cannot create external contract")
}
