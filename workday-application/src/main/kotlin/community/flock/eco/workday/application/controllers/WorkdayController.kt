package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteWorkDay
import community.flock.eco.workday.api.endpoint.GetWorkDayAll
import community.flock.eco.workday.api.endpoint.GetWorkDayByCode
import community.flock.eco.workday.api.endpoint.PostWorkDay
import community.flock.eco.workday.api.endpoint.PutWorkDay
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.forms.WorkDaySheetForm
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.domain.common.Status
import org.springframework.boot.web.server.MimeMappings
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Assignment as AssignmentApi
import community.flock.eco.workday.api.model.Client as ClientApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.api.model.Project as ProjectApi
import community.flock.eco.workday.api.model.WorkDay as WorkDayApi
import community.flock.eco.workday.api.model.WorkDayForm as WorkDayFormApi
import community.flock.eco.workday.api.model.WorkDayFormStatus as WorkDayFormStatusApi
import community.flock.eco.workday.api.model.WorkDaySheet as WorkDaySheetApi
import community.flock.eco.workday.api.model.WorkDayStatus as WorkDayStatusApi
import community.flock.eco.workday.application.model.Client as ClientInternal
import community.flock.eco.workday.application.model.Person as PersonInternal
import community.flock.eco.workday.application.model.Project as ProjectInternal

@RestController
class WorkdayController(
    private val service: WorkDayService,
    private val documentStorage: DocumentStorage,
) : GetWorkDayAll.Handler,
    GetWorkDayByCode.Handler,
    PostWorkDay.Handler,
    PutWorkDay.Handler,
    DeleteWorkDay.Handler {
    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    override suspend fun getWorkDayAll(request: GetWorkDayAll.Request): GetWorkDayAll.Response<*> {
        val auth = authentication()
        val pageable = request.queries.toPageable()
        val personId =
            request.queries.personId?.let(UUID::fromString)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "personId is required")
        val page =
            when {
                auth.isAdmin() -> service.findAllByPersonUuid(personId, pageable)
                else -> service.findAllByPersonUserCode(auth.name, pageable)
            }
        return GetWorkDayAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    override suspend fun getWorkDayByCode(request: GetWorkDayByCode.Request): GetWorkDayByCode.Response<*> {
        val workDay =
            service.findByCode(request.path.code)
                ?.applyAuthentication(authentication())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "WorkDay not found")
        return GetWorkDayByCode.Response200(workDay.externalize())
    }

    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    override suspend fun postWorkDay(request: PostWorkDay.Request): PostWorkDay.Response<*> {
        val created = service.create(request.body.internalize())
        return PostWorkDay.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    override suspend fun putWorkDay(request: PutWorkDay.Request): PutWorkDay.Response<*> {
        val auth = authentication()
        val code = request.path.code
        val form = request.body.internalize()
        val existing =
            service.findByCode(code)
                ?.applyAuthentication(auth)
                ?.applyAllowedToUpdate(form.status, auth.isAdmin())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "WorkDay not found")
        val updated =
            service.update(
                workDayCode = code,
                form = form,
                isUpdatedByOwner = auth.isOwnerOf(existing),
            )
        return PutWorkDay.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    override suspend fun deleteWorkDay(request: DeleteWorkDay.Request): DeleteWorkDay.Response<*> {
        val auth = authentication()
        service.findByCode(request.path.code)
            ?.applyAuthentication(auth)
            ?.run { service.deleteByCode(this.code) }
        return DeleteWorkDay.Response204(Unit)
    }

    // The /sheets endpoints stay on plain Spring annotations: Wirespec
    // does not support multipart upload or raw byte responses yet, and the
    // React WorkDayForm hits these URLs directly via a Dropzone field.
    @GetMapping("/api/workdays/sheets/{file}/{name}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun getSheets(
        @PathVariable file: UUID,
        @PathVariable name: String,
    ): ResponseEntity<ByteArray> =
        documentStorage
            .readDocument(file)
            .run {
                ResponseEntity
                    .ok()
                    .contentType(getMediaType(name))
                    .body(this)
            }

    @PostMapping("/api/workdays/sheets")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun postSheets(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentStorage
            .storeDocument(file.bytes)
            .toResponse()

    private fun WorkDayFormApi.internalize(): WorkDayForm =
        WorkDayForm(
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse) ?: error("to is required"),
            hours = hours ?: 0.0,
            days = days?.toMutableList(),
            status = status?.toDomain() ?: Status.REQUESTED,
            assignmentCode = assignmentCode ?: error("assignmentCode is required"),
            sheets =
                sheets?.map {
                    WorkDaySheetForm(
                        name = it.name ?: "",
                        file = it.file?.let(UUID::fromString) ?: error("sheet file is required"),
                    )
                } ?: emptyList(),
        )

    private fun WorkDay.externalize(): WorkDayApi =
        WorkDayApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to.toString(),
            hours = hours,
            days = days,
            assignment = assignment.externalize(),
            status = status.toApi(),
            sheets =
                sheets.map {
                    WorkDaySheetApi(name = it.name, file = it.file.toString())
                },
            type = "WorkDay",
        )

    private fun Assignment.externalize(): AssignmentApi =
        AssignmentApi(
            id = id,
            code = code,
            role = role,
            from = from.toString(),
            to = to?.toString(),
            hourlyRate = hourlyRate,
            hoursPerWeek = hoursPerWeek,
            totalHours = null,
            totalCosts = null,
            client = client.externalize(),
            person = person.externalize(),
            project = project?.externalize(),
        )

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

    private fun Status.toApi(): WorkDayStatusApi =
        when (this) {
            Status.REQUESTED -> WorkDayStatusApi.REQUESTED
            Status.APPROVED -> WorkDayStatusApi.APPROVED
            Status.REJECTED -> WorkDayStatusApi.REJECTED
            Status.DONE -> WorkDayStatusApi.DONE
        }

    private fun WorkDayFormStatusApi.toDomain(): Status =
        when (this) {
            WorkDayFormStatusApi.REQUESTED -> Status.REQUESTED
            WorkDayFormStatusApi.APPROVED -> Status.APPROVED
            WorkDayFormStatusApi.REJECTED -> Status.REJECTED
            WorkDayFormStatusApi.DONE -> Status.DONE
        }

    private fun GetWorkDayAll.Queries.toPageable(): Pageable {
        // The previous WorkdayController hardcoded this sort and ignored the
        // sort query parameter, so the React WorkDayList implicitly relied on
        // it. Keep the same behavior to avoid surprising the frontend, which
        // expects newest workdays first.
        val sort = Sort.by("from").descending().and(Sort.by("id"))
        return PageRequest.of(page ?: 0, size ?: 20, sort)
    }

    private fun getMediaType(name: String): MediaType {
        val extension = File(name).extension.lowercase()
        val mime = MimeMappings.DEFAULT[extension]
        return MediaType.parseMediaType(mime)
    }

    private fun WorkDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!authentication.isAdmin() && !authentication.isOwnerOf(this)) {
                throw ResponseStatusException(
                    FORBIDDEN,
                    "User has not access to workday: ${this.code}",
                )
            }
        }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(WorkDayAuthority.ADMIN.toName())

    private fun Authentication.isOwnerOf(workDay: WorkDay) = isAssociatedWith(workDay.assignment.person)
}
