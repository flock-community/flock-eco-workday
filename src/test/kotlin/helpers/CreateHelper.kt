package community.flock.eco.workday.helpers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.forms.ContractExternalForm
import community.flock.eco.workday.forms.ContractInternalForm
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.AssignmentService
import community.flock.eco.workday.services.ClientService
import community.flock.eco.workday.services.ContractService
import community.flock.eco.workday.services.HoliDayService
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.SickDayService
import community.flock.eco.workday.services.WorkDayService
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDate
import java.util.UUID
import org.springframework.stereotype.Component

@Component
class CreateHelper(
    val assignmentService: AssignmentService,
    val contractService: ContractService,
    val clientService: ClientService,
    val personService: PersonService,
    val userService: UserService,
    val sickDayService: SickDayService,
    val holiDayService: HoliDayService,
    val workDayService: WorkDayService
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
    fun createPerson(firstname: String, lastname: String, userCode: String = "") = PersonForm(
        email = "$firstname@$lastname",
        firstname = firstname,
        lastname = lastname,
        position = "Software engineer",
        userCode = userCode,
        number = null
    ).run {
        personService.create(this)
    } ?: error("Cannot create person")

    fun createAssignment(client: Client, person: Person, from: LocalDate, to: LocalDate?) = AssignmentForm(
        clientCode = client.code,
        personCode = person.code,
        hourlyRate = 80.0,
        hoursPerWeek = 36,
        role = "Senior software engineer",
        from = from,
        to = to
    ).run {
        assignmentService.create(this)
    } ?: error("Cannot create assignment")

    fun createContractInternal(person: Person, from: LocalDate, to: LocalDate?) = ContractInternalForm(
        personCode = person.code,
        monthlySalary = 4000.0,
        hoursPerWeek = 40,
        from = from,
        to = to
    ).run {
        contractService.create(this)
    } ?: error("Cannot create internal contract")

    fun createContractExternal(person: Person, from: LocalDate, to: LocalDate?) = ContractExternalForm(
        personCode = person.code,
        hourlyRate = 75.0,
        hoursPerWeek = 40,
        from = from,
        to = to
    ).run {
        contractService.create(this)
    } ?: error("Cannot create external contract")

    fun createSickDay(person: Person, from: LocalDate, to: LocalDate) = SickDayForm(
        from = from,
        to = to,
        personCode = person.code,
        hours = 40,
        days = listOf(8, 8, 8, 8, 8)
    ).run {
        sickDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createWorkDay(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        hours: Int = 40,
        days: List<Int>? = null
    ) = WorkDayForm(
        from = from,
        to = to,
        assignmentCode = assignment.code,
        hours = hours,
        days = days ?: listOf(8, 8, 8, 8, 8),
        sheets = listOf()
    ).run {
        workDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createHoliDay(person: Person, from: LocalDate, to: LocalDate) = HoliDayForm(
        description = "description",
        from = from,
        to = to,
        personCode = person.code,
        hours = 40,
        days = listOf(8, 8, 8, 8, 8)
    ).run {
        holiDayService.create(this)
    } ?: error("Cannot create sick day contract")


    class UserSecurity(val user: User) : UserDetails {
        override fun getAuthorities() = user.authorities.map { SimpleGrantedAuthority(it) }
        override fun isEnabled() = user.enabled
        override fun getUsername() = user.code
        override fun getPassword() = null
        override fun isCredentialsNonExpired() = true
        override fun isAccountNonExpired() = true
        override fun isAccountNonLocked() = true
    }
}
