package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteSickDay
import community.flock.eco.workday.api.endpoint.GetSickDayAll
import community.flock.eco.workday.api.endpoint.GetSickDayByCode
import community.flock.eco.workday.api.endpoint.PostSickDay
import community.flock.eco.workday.api.endpoint.PutSickDay
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.domain.common.Status
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.SickDay as SickDayApi
import community.flock.eco.workday.api.model.SickDayForm as SickDayFormApi
import community.flock.eco.workday.api.model.SickDayFormStatus as SickDayFormStatusApi
import community.flock.eco.workday.api.model.SickDayStatus as SickDayStatusApi

@RestController
class SickdayController(
    private val service: SickDayService,
    private val personService: PersonService,
) : GetSickDayAll.Handler,
    GetSickDayByCode.Handler,
    PostSickDay.Handler,
    PutSickDay.Handler,
    DeleteSickDay.Handler {
    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    override suspend fun getSickDayAll(request: GetSickDayAll.Request): GetSickDayAll.Response<*> {
        val auth = authentication()
        val pageable = request.queries.toPageable()
        val personId = request.queries.personId?.let(UUID::fromString)
        val page =
            when {
                auth.isAdmin() && personId == null -> service.findAll(pageable)
                auth.isAdmin() && personId != null -> service.findAllByPersonUuid(personId, pageable)
                else -> service.findAllByPersonUserCode(auth.name, pageable)
            }
        return GetSickDayAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    override suspend fun getSickDayByCode(request: GetSickDayByCode.Request): GetSickDayByCode.Response<*> {
        val sickDay =
            service.findByCode(request.path.code)
                ?.applyAuthentication(authentication())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "SickDay not found")
        return GetSickDayByCode.Response200(sickDay.externalize())
    }

    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    override suspend fun postSickDay(request: PostSickDay.Request): PostSickDay.Response<*> {
        val auth = authentication()
        val form = request.body.internalize().setPersonCode(auth)
        val created = service.create(form)
        return PostSickDay.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    override suspend fun putSickDay(request: PutSickDay.Request): PutSickDay.Response<*> {
        val auth = authentication()
        val code = request.path.code
        val form = request.body.internalize()
        val existing =
            service.findByCode(code)
                ?.applyAuthentication(auth)
                ?.applyAllowedToUpdate(form.status, auth.isAdmin())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "SickDay not found")
        val updated =
            service.update(
                code = code,
                form = form,
                isUpdatedByOwner = auth.isOwnerOf(existing),
            )
        return PutSickDay.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    override suspend fun deleteSickDay(request: DeleteSickDay.Request): DeleteSickDay.Response<*> {
        val auth = authentication()
        service.findByCode(request.path.code)
            ?.applyAuthentication(auth)
            ?.run { service.deleteByCode(this.code) }
        return DeleteSickDay.Response204(Unit)
    }

    private fun SickDayFormApi.internalize(): SickDayForm =
        SickDayForm(
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse) ?: error("to is required"),
            hours = hours ?: 0.0,
            days = days?.toMutableList() ?: mutableListOf(),
            status = status?.toDomain() ?: Status.REQUESTED,
            description = description,
            personId = personId?.let(UUID::fromString) ?: UUID(0L, 0L),
        )

    private fun SickDayForm.setPersonCode(authentication: Authentication): SickDayForm {
        if (authentication.isAdmin()) {
            return this
        }
        return personService
            .findByUserCode(authentication.name)
            ?.let { this.copy(personId = it.uuid) }
            ?: throw ResponseStatusException(FORBIDDEN, "User is not linked to person")
    }

    private fun SickDay.externalize(): SickDayApi =
        SickDayApi(
            personId = person.uuid.toString(),
            id = id,
            code = code,
            from = from.toString(),
            to = to.toString(),
            hours = hours,
            days = days,
            description = description,
            status = status.toApi(),
            type = "SickDay",
        )

    private fun Status.toApi(): SickDayStatusApi =
        when (this) {
            Status.REQUESTED -> SickDayStatusApi.REQUESTED
            Status.APPROVED -> SickDayStatusApi.APPROVED
            Status.REJECTED -> SickDayStatusApi.REJECTED
            Status.DONE -> SickDayStatusApi.DONE
        }

    private fun SickDayFormStatusApi.toDomain(): Status =
        when (this) {
            SickDayFormStatusApi.REQUESTED -> Status.REQUESTED
            SickDayFormStatusApi.APPROVED -> Status.APPROVED
            SickDayFormStatusApi.REJECTED -> Status.REJECTED
            SickDayFormStatusApi.DONE -> Status.DONE
        }

    private fun GetSickDayAll.Queries.toPageable(): Pageable {
        // The React SickDayList always requests `from,desc` ordering and
        // relies on it to surface newly-submitted entries on page 1. Hardcode
        // the same sort here so the wire behavior matches the pre-migration
        // controller, which auto-resolved Spring's Pageable from the URL.
        val sort = Sort.by("from").descending().and(Sort.by("id"))
        return PageRequest.of(page ?: 0, size ?: 20, sort)
    }

    private fun SickDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!(authentication.isAdmin() || authentication.isOwnerOf(this))) {
                throw ResponseStatusException(FORBIDDEN, "User has no access to object")
            }
        }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(SickdayAuthority.ADMIN.toName())

    private fun Authentication.isOwnerOf(sickDay: SickDay) = isAssociatedWith(sickDay.person)
}
