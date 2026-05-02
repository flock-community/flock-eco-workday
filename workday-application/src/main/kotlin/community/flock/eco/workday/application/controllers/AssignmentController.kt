package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteAssignment
import community.flock.eco.workday.api.endpoint.GetAssignmentAll
import community.flock.eco.workday.api.endpoint.GetAssignmentByCode
import community.flock.eco.workday.api.endpoint.PostAssignment
import community.flock.eco.workday.api.endpoint.PutAssignment
import community.flock.eco.workday.application.authorities.AssignmentAuthority
import community.flock.eco.workday.application.forms.AssignmentForm
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.services.AssignmentService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Assignment as AssignmentApi
import community.flock.eco.workday.api.model.AssignmentForm as AssignmentFormApi
import community.flock.eco.workday.api.model.Client as ClientApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.api.model.Project as ProjectApi
import community.flock.eco.workday.application.model.Client as ClientInternal
import community.flock.eco.workday.application.model.Person as PersonInternal
import community.flock.eco.workday.application.model.Project as ProjectInternal

@RestController
class AssignmentController(
    private val userService: UserService,
    private val assignmentService: AssignmentService,
    private val workDayService: WorkDayService,
) : GetAssignmentAll.Handler,
    GetAssignmentByCode.Handler,
    PostAssignment.Handler,
    PutAssignment.Handler,
    DeleteAssignment.Handler {
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    override suspend fun getAssignmentAll(request: GetAssignmentAll.Request): GetAssignmentAll.Response<*> {
        val user = requireAuthority(AssignmentAuthority.READ)
        val q = request.queries
        val page = q.toPageable()

        val to = q.to?.let(LocalDate::parse)
        val personId = q.personId?.let(UUID::fromString)
        val isAdmin = user.hasAuthority(AssignmentAuthority.ADMIN)

        val assignments: List<Assignment> =
            when {
                to != null -> assignmentService.findAllByToAfterOrToNull(to, page).content
                isAdmin && personId != null -> assignmentService.findAllByPersonUuid(personId, page).content
                isAdmin && q.projectCode != null -> assignmentService.findByProjectCode(q.projectCode, page).content
                else -> assignmentService.findAllByPersonUserCode(user.code, page).content
            }

        return GetAssignmentAll.Response200(
            assignments
                .map { it.applyHourlyRate(isAdmin) }
                .map { it.externalize(includeHours = to == null) },
        )
    }

    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    override suspend fun getAssignmentByCode(request: GetAssignmentByCode.Request): GetAssignmentByCode.Response<*> {
        val user = requireAuthority(AssignmentAuthority.READ)
        val assignment =
            assignmentService.findByCode(request.path.code)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found")
        val canEdit = user.hasAuthority(AssignmentAuthority.WRITE)
        val visible = if (canEdit) assignment else assignment.copy(hourlyRate = 0.0)
        return GetAssignmentByCode.Response200(visible.externalize(includeHours = false))
    }

    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
    override suspend fun postAssignment(request: PostAssignment.Request): PostAssignment.Response<*> {
        val user = requireAuthority(AssignmentAuthority.WRITE)
        val isAdmin = user.hasAuthority(AssignmentAuthority.ADMIN)
        val form = request.body.internalize()
        val personId = if (isAdmin) form.personId else UUID.fromString(user.code)
        val created =
            assignmentService.create(form.copy(personId = personId))
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create assignment")
        return PostAssignment.Response200(created.externalize(includeHours = false))
    }

    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
    override suspend fun putAssignment(request: PutAssignment.Request): PutAssignment.Response<*> {
        requireAuthority(AssignmentAuthority.WRITE)
        val updated =
            assignmentService.update(request.path.code, request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found")
        return PutAssignment.Response200(updated.externalize(includeHours = false))
    }

    @PreAuthorize("hasAuthority('AssignmentAuthority.ADMIN')")
    override suspend fun deleteAssignment(request: DeleteAssignment.Request): DeleteAssignment.Response<*> {
        requireAuthority(AssignmentAuthority.ADMIN)
        assignmentService.deleteByCode(request.path.code)
        return DeleteAssignment.Response204(Unit)
    }

    private fun requireAuthority(authority: AssignmentAuthority): User {
        val auth =
            SecurityContextHolder.getContext().authentication
                ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        if (!auth.authorities.map { it.authority }.contains(authority.toName())) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return userService.findByCode(auth.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }

    private fun User.hasAuthority(authority: AssignmentAuthority): Boolean = authorities.contains(authority.toName())

    private fun Assignment.applyHourlyRate(isAdmin: Boolean): Assignment = if (isAdmin) this else copy(hourlyRate = 0.0)

    private fun Assignment.externalize(includeHours: Boolean): AssignmentApi {
        val (totalHours, totalCosts) =
            if (includeHours) {
                val hours = workDayService.getTotalHoursByAssignment(this)
                hours to (BigDecimal(hours) * BigDecimal(hourlyRate)).toDouble()
            } else {
                null to null
            }
        return AssignmentApi(
            id = id,
            code = code,
            role = role,
            from = from.toString(),
            to = to?.toString(),
            hourlyRate = hourlyRate,
            hoursPerWeek = hoursPerWeek,
            totalHours = totalHours,
            totalCosts = totalCosts,
            client = client.externalize(),
            person = person.externalize(),
            project = project?.externalize(),
        )
    }

    private fun ClientInternal.externalize() = ClientApi(id = id, code = code, name = name)

    private fun ProjectInternal.externalize() = ProjectApi(id = id, code = code, name = name)

    private fun PersonInternal.externalize() =
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

    private fun AssignmentFormApi.internalize() =
        AssignmentForm(
            personId = personId?.let(UUID::fromString) ?: error("personId is required"),
            clientCode = clientCode ?: error("clientCode is required"),
            projectCode = projectCode,
            hourlyRate = hourlyRate ?: 0.0,
            hoursPerWeek = hoursPerWeek ?: 0,
            role = role,
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse),
        )

    private fun GetAssignmentAll.Queries.toPageable(): Pageable {
        val sort = sort?.takeIf { it.isNotBlank() }?.let { Sort.by(it) } ?: Sort.unsorted()
        return PageRequest.of(page ?: 0, size ?: 20, sort)
    }
}
