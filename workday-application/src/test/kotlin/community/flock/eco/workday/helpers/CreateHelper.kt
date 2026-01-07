package community.flock.eco.workday.helpers

import community.flock.eco.workday.application.forms.AssignmentForm
import community.flock.eco.workday.application.forms.ClientForm
import community.flock.eco.workday.application.forms.ContractExternalForm
import community.flock.eco.workday.application.forms.ContractInternalForm
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.Client
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.AssignmentService
import community.flock.eco.workday.application.services.ClientService
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.mappers.toDomain
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
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
    private val eventService: EventService,
) {
    fun createUser(authorities: Set<Authority>) = createUserEntity(authorities).toDomain()

    fun createUserEntity(authorities: Set<Authority>) = createUserEntity(UUID.randomUUID().toString(), authorities)

    fun createUser(
        name: String,
        authorities: Set<Authority>,
    ) = createUserEntity(name, authorities).toDomain()

    fun createUserEntity(
        name: String,
        authorities: Set<Authority>,
    ) = UserForm(
        name = name,
        email = "$name@workday.io",
        authorities = authorities.map { it.toName() }.toSet(),
    ).run {
        userService.create(this)
    }

    fun createClient() = createClient(UUID.randomUUID().toString())

    fun createClient(name: String) =
        ClientForm(
            name = name,
        ).run {
            clientService.create(this)
        } ?: error("Cannot create client")

    fun createPerson() = createPersonEntity().toDomain()

    fun createPersonEntity() = createPersonEntity(UUID.randomUUID().toString(), UUID.randomUUID().toString())

    fun createPerson(
        firstname: String,
        lastname: String,
        userCode: String = "",
    ) = createPersonEntity(firstname, lastname, userCode).toDomain()

    fun createPersonEntity(
        firstname: String,
        lastname: String,
        userCode: String = "",
    ) = PersonForm(
        email = "$firstname@$lastname",
        firstname = firstname,
        lastname = lastname,
        position = "Software engineer",
        userCode = userCode,
        number = null,
        active = true,
    ).run {
        personService.create(this)
    }

    fun createAssignment(
        client: Client,
        person: Person,
        from: LocalDate,
        to: LocalDate?,
        hoursPerWeek: Int? = null,
    ) = AssignmentForm(
        clientCode = client.code,
        personId = person.uuid,
        hourlyRate = 80.0,
        hoursPerWeek = hoursPerWeek ?: 36,
        role = "Senior software engineer",
        from = from,
        to = to,
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
        holidayHours: Int = 192,
        hackHours: Int = 160,
    ) = ContractInternalForm(
        personId = person.uuid,
        monthlySalary = monthlySalary,
        hoursPerWeek = hoursPerWeek,
        from = from,
        to = to,
        billable = billable,
        holidayHours = holidayHours,
        hackHours = hackHours,
    ).run {
        contractService.create(this)
    } ?: error("Cannot create internal contract")

    fun createContractExternal(
        person: Person,
        from: LocalDate,
        to: LocalDate?,
    ) = ContractExternalForm(
        personId = person.uuid,
        hourlyRate = 75.0,
        hoursPerWeek = 40,
        from = from,
        to = to,
        billable = true,
    ).run {
        contractService.create(this)
    } ?: error("Cannot create external contract")

    fun createSickDay(
        person: Person,
        from: LocalDate,
        to: LocalDate,
    ) = SickDayForm(
        from = from,
        to = to,
        personId = person.uuid,
        hours = 40.0,
        days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
    ).run {
        sickDayService.create(this)
    }

    fun createWorkDay(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        hours: Double? = 40.0,
        days: List<Double>? = null,
    ) = WorkDayForm(
        from = from,
        to = to,
        assignmentCode = assignment.code,
        hours = hours ?: ((ChronoUnit.DAYS.between(from, to) + 1) * 8.0),
        days = days?.toMutableList() ?: (0L..ChronoUnit.DAYS.between(from, to)).map { 8.0 }.toMutableList(),
        sheets = listOf(),
    ).run {
        workDayService.create(this)
    }

    fun createWorkDayWithoutDays(
        assignment: Assignment,
        from: LocalDate,
        to: LocalDate,
        hours: Double? = 40.0,
        days: List<Double>? = null,
    ) = WorkDayForm(
        from = from,
        to = to,
        assignmentCode = assignment.code,
        hours = hours ?: ((ChronoUnit.DAYS.between(from, to) + 1) * 8.0),
        days = days?.toMutableList(),
        sheets = listOf(),
    ).run {
        workDayService.create(this)
    }

    fun createHoliDay(
        person: Person,
        from: LocalDate,
        to: LocalDate,
    ) = LeaveDayForm(
        description = "description",
        from = from,
        to = to,
        personId = person.uuid,
        hours = 40.0,
        days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
    ).run {
        leaveDayService.create(this)
    }

    fun createEvent(
        from: LocalDate,
        to: LocalDate,
        hours: Double? = null,
        days: List<Double>? = null,
        persons: List<UUID>,
    ) = EventForm(
        description = "Very description",
        from = from,
        to = to,
        hours = hours ?: ((ChronoUnit.DAYS.between(from, to) + 1) * 8.0),
        days = days?.toMutableList() ?: (0L..ChronoUnit.DAYS.between(from, to)).map { 8.0 }.toMutableList(),
        personIds = persons,
        costs = 538.38,
        type = EventType.GENERAL_EVENT,
    ).run {
        eventService.create(this)
    }

    class UserSecurity(
        val user: User,
    ) : UserDetails {
        override fun getAuthorities() = user.authorities.map { SimpleGrantedAuthority(it) }

        override fun isEnabled() = user.enabled

        override fun getUsername() = user.code

        override fun getPassword() = null

        override fun isCredentialsNonExpired() = true

        override fun isAccountNonExpired() = true

        override fun isAccountNonLocked() = true
    }
}
