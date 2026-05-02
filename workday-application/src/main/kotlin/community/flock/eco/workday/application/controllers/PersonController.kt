package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeletePerson
import community.flock.eco.workday.api.endpoint.GetPersonAll
import community.flock.eco.workday.api.endpoint.GetPersonByUuid
import community.flock.eco.workday.api.endpoint.GetPersonMe
import community.flock.eco.workday.api.endpoint.GetPersonSpecialDates
import community.flock.eco.workday.api.endpoint.PostPerson
import community.flock.eco.workday.api.endpoint.PutPerson
import community.flock.eco.workday.application.authorities.PersonAuthority
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.PersonEvent
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.api.model.PersonEvent as PersonEventApi
import community.flock.eco.workday.api.model.PersonEventEventType as PersonEventEventTypeApi
import community.flock.eco.workday.api.model.PersonForm as PersonFormApi

@RestController
class PersonController(
    private val service: PersonService,
    private val userService: UserService,
) : GetPersonAll.Handler,
    GetPersonByUuid.Handler,
    GetPersonMe.Handler,
    GetPersonSpecialDates.Handler,
    PostPerson.Handler,
    PutPerson.Handler,
    DeletePerson.Handler {
    @PreAuthorize("isAuthenticated()")
    override suspend fun getPersonMe(request: GetPersonMe.Request): GetPersonMe.Response<*> {
        val user = currentUser() ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        val person =
            service.findByUserCode(user.code)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No person found for current user")
        return GetPersonMe.Response200(person.externalize())
    }

    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    override suspend fun getPersonAll(request: GetPersonAll.Request): GetPersonAll.Response<*> {
        requireAuthority(PersonAuthority.ADMIN)
        val q = request.queries
        val pageable = q.toPageable()

        val page: Page<Person> =
            when {
                q.search != null -> service.findAllByFullName(pageable, q.search)
                q.active != null -> service.findAllByActive(pageable, q.active)
                else -> service.findAll(pageable)
            }
        return GetPersonAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('PersonAuthority.READ')")
    override suspend fun getPersonByUuid(request: GetPersonByUuid.Request): GetPersonByUuid.Response<*> {
        val user = requireAuthority(PersonAuthority.READ)
        val uuid = UUID.fromString(request.path.uuid)
        val person =
            when {
                user.isAdmin() -> service.findByUuid(uuid)
                else -> service.findByUserCode(user.code)
            } ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No Item found with this PersonUui")
        return GetPersonByUuid.Response200(person.externalize())
    }

    @PreAuthorize("hasAuthority('PersonAuthority.READ')")
    override suspend fun getPersonSpecialDates(request: GetPersonSpecialDates.Request): GetPersonSpecialDates.Response<*> {
        requireAuthority(PersonAuthority.READ)
        val start = LocalDate.parse(request.queries.start)
        val end = LocalDate.parse(request.queries.end)
        val events = service.findAllPersonEvents(start, end).map { it.externalize() }
        return GetPersonSpecialDates.Response200(events)
    }

    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    override suspend fun postPerson(request: PostPerson.Request): PostPerson.Response<*> {
        val user = requireAuthority(PersonAuthority.WRITE)
        val form = request.body.internalize()
        val userCode = if (user.isAdmin()) form.userCode else user.code
        val created = service.create(form.copy(userCode = userCode))
        return PostPerson.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    override suspend fun putPerson(request: PutPerson.Request): PutPerson.Response<*> {
        val user = requireAuthority(PersonAuthority.WRITE)
        val form = request.body.internalize()
        val userCode = if (user.isAdmin()) form.userCode else user.code
        val uuid = UUID.fromString(request.path.uuid)
        val updated =
            service.update(uuid, form.copy(userCode = userCode))
                ?: throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot perform PUT on given item. PersonUui cannot be found. Use POST Method",
                )
        return PutPerson.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    override suspend fun deletePerson(request: DeletePerson.Request): DeletePerson.Response<*> {
        requireAuthority(PersonAuthority.ADMIN)
        service.deleteByUuid(UUID.fromString(request.path.uuid))
        return DeletePerson.Response204(Unit)
    }

    private fun currentUser(): User? =
        SecurityContextHolder
            .getContext()
            .authentication
            ?.name
            ?.let(userService::findByCode)

    private fun requireAuthority(authority: PersonAuthority): User {
        val auth =
            SecurityContextHolder.getContext().authentication
                ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        if (!auth.authorities.map { it.authority }.contains(authority.toName())) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return userService.findByCode(auth.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }

    private fun User.isAdmin(): Boolean = authorities.contains(PersonAuthority.ADMIN.toName())

    private fun GetPersonAll.Queries.toPageable(): Pageable {
        val sort = sort?.takeIf { it.isNotBlank() }?.let(::parseSort) ?: Sort.unsorted()
        return PageRequest.of(page ?: 0, size ?: 20, sort)
    }

    private fun parseSort(spec: String): Sort =
        spec
            .split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .let { parts ->
                when {
                    parts.isEmpty() -> Sort.unsorted()
                    parts.size == 1 -> Sort.by(parts[0])
                    parts.last().equals("asc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.ASC, *parts.dropLast(1).toTypedArray())
                    parts.last().equals("desc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.DESC, *parts.dropLast(1).toTypedArray())
                    else -> Sort.by(*parts.toTypedArray())
                }
            }

    private fun Person.externalize(): PersonApi =
        PersonApi(
            id = id,
            uuid = uuid.toString(),
            firstname = firstname,
            lastname = lastname,
            email = email,
            position = position,
            number = number,
            birthdate = birthdate?.toString(),
            joinDate = joinDate?.toString(),
            active = active,
            lastActiveAt = lastActiveAt?.toString(),
            reminders = reminders,
            receiveEmail = receiveEmail,
            shoeSize = shoeSize,
            shirtSize = shirtSize,
            googleDriveId = googleDriveId,
            user = null,
            fullName = "$firstname $lastname",
        )

    private fun PersonEvent.externalize(): PersonEventApi =
        PersonEventApi(
            person = person.externalize(),
            eventType =
                when (eventType) {
                    PersonEvent.EventType.BIRTHDAY -> PersonEventEventTypeApi.BIRTHDAY
                    PersonEvent.EventType.JOIN_DAY -> PersonEventEventTypeApi.JOIN_DAY
                },
            eventDate = eventDate.toString(),
        )

    private fun PersonFormApi.internalize(): PersonForm =
        PersonForm(
            firstname = firstname ?: "",
            lastname = lastname ?: "",
            email = email ?: "",
            position = position ?: "",
            number = number,
            birthdate = birthdate?.let(LocalDate::parse),
            joinDate = joinDate?.let(LocalDate::parse),
            active = active ?: true,
            userCode = userCode,
            reminders = reminders ?: false,
            receiveEmail = receiveEmail ?: true,
            shoeSize = shoeSize,
            shirtSize = shirtSize,
            googleDriveId = googleDriveId,
        )
}
