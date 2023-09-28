package community.flock.eco.workday.helpers

import community.flock.eco.core.authorities.Authority
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.forms.*
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.*
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

@Component
class CreateHelper(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val clientService: ClientService,
    private val personService: PersonService,
    private val userService: UserService,
    private val sickDayService: SickDayService,
    private val leaveDayService: LeaveDayService,
    private val workDayService: WorkDayService,
    private val eventService: EventService
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
        number = null,
        active = true
    ).run {
        personService.create(this)
    } ?: error("Cannot create person")

    fun createAssignment(client: Client, person: Person, period: Period) = createAssignment(client, person, period.from, period.to)
    fun createAssignment(client: Client, person: Person, from: LocalDate, to: LocalDate?, hoursPerWeek: Int? = null) = AssignmentForm(
        clientCode = client.code,
        personId = person.uuid,
        hourlyRate = 80.0,
        hoursPerWeek = hoursPerWeek ?: 36,
        role = "Senior software engineer",
        from = from,
        to = to
    ).run {
        assignmentService.create(this)
    } ?: error("Cannot create assignment")

    fun createContractInternal(
        person: Person,
        from: LocalDate,
        to: LocalDate?,
        monthlySalary: Double = 4000.0,
        hoursPerWeek: Int = 40,
        billable: Boolean = true,
        holidayHours: Int = 192
    ) = ContractInternalForm(
        personId = person.uuid,
        monthlySalary = monthlySalary,
        hoursPerWeek = hoursPerWeek,
        from = from,
        to = to,
        billable = billable,
        holidayHours = holidayHours,
    ).run {
        contractService.create(this)
    } ?: error("Cannot create internal contract")

    fun createContractManagement(
        person: Person,
        from: LocalDate,
        to: LocalDate?,
        monthlyFee: Double = 10000.0,
    ) = ContractManagementForm(
        personId = person.uuid,
        from = from,
        to = to,
        monthlyFee = monthlyFee
    ).run {
        contractService.create(this)
    } ?: error("Cannot create internal contract")

    fun createContractExternal(person: Person, from: LocalDate, to: LocalDate?) = ContractExternalForm(
        personId = person.uuid,
        hourlyRate = 75.0,
        hoursPerWeek = 40,
        from = from,
        to = to,
        billable = true
    ).run {
        contractService.create(this)
    } ?: error("Cannot create external contract")

    fun createSickDay(person: Person, from: LocalDate, to: LocalDate) = SickDayForm(
        from = from,
        to = to,
        personId = person.uuid,
        hours = 40.0,
        days = listOf(8.0, 8.0, 8.0, 8.0, 8.0)
    ).run {
        sickDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createWorkDay(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        hours: Double? = 40.0,
        days: List<Double>? = null
    ) = WorkDayForm(
        from = from,
        to = to,
        assignmentCode = assignment.code,
        hours = hours ?: (ChronoUnit.DAYS.between(from, to) + 1) * 8.0,
        days = days ?: (0L..ChronoUnit.DAYS.between(from, to)).map { 8.0 },
        sheets = listOf()
    ).run {
        workDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createWorkDayWithoutDays(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        hours: Double? = 40.0,
        days: List<Double>? = null
    ) = WorkDayForm(
        from = from,
        to = to,
        assignmentCode = assignment.code,
        hours = hours ?: (ChronoUnit.DAYS.between(from, to) + 1) * 8.0,
        days = days,
        sheets = listOf()
    ).run {
        workDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createHoliDay(person: Person, from: LocalDate, to: LocalDate) = HoliDayForm(
        description = "description",
        from = from,
        to = to,
        personId = person.uuid,
        hours = 40.0,
        days = listOf(8.0, 8.0, 8.0, 8.0, 8.0)
    ).run {
        leaveDayService.create(this)
    } ?: error("Cannot create sick day contract")

    fun createEvent(
        from: LocalDate,
        to: LocalDate,
        hours: Double? = null,
        days: List<Double>? = null,
        persons: List<UUID>
    ) = EventForm(
        description = "Very description",
        from = from,
        to = to,
        hours = hours ?: (ChronoUnit.DAYS.between(from, to) + 1) * 8.0,
        days = days ?: (0L..ChronoUnit.DAYS.between(from, to)).map { 8.0 },
        personIds = persons
    ).run {
        eventService.create(this)
    }

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
