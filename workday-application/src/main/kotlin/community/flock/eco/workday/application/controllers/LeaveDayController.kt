package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteLeaveDay
import community.flock.eco.workday.api.endpoint.GetLeaveDayAll
import community.flock.eco.workday.api.endpoint.GetLeaveDayByCode
import community.flock.eco.workday.api.endpoint.PostLeaveDay
import community.flock.eco.workday.api.endpoint.PutLeaveDay
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.PersonService
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
import community.flock.eco.workday.api.model.LeaveDay as LeaveDayApi
import community.flock.eco.workday.api.model.LeaveDayForm as LeaveDayFormApi
import community.flock.eco.workday.api.model.LeaveDayFormStatus as LeaveDayFormStatusApi
import community.flock.eco.workday.api.model.LeaveDayFormType as LeaveDayFormTypeApi
import community.flock.eco.workday.api.model.LeaveDayStatus as LeaveDayStatusApi
import community.flock.eco.workday.api.model.LeaveDayType as LeaveDayTypeApi

@RestController
class LeaveDayController(
    private val service: LeaveDayService,
    private val personService: PersonService,
) : GetLeaveDayAll.Handler,
    GetLeaveDayByCode.Handler,
    PostLeaveDay.Handler,
    PutLeaveDay.Handler,
    DeleteLeaveDay.Handler {
    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    override suspend fun getLeaveDayAll(request: GetLeaveDayAll.Request): GetLeaveDayAll.Response<*> {
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
        return GetLeaveDayAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    override suspend fun getLeaveDayByCode(request: GetLeaveDayByCode.Request): GetLeaveDayByCode.Response<*> {
        val leaveDay =
            service.findByCode(request.path.code)
                ?.applyAuthentication(authentication())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "LeaveDay not found")
        return GetLeaveDayByCode.Response200(leaveDay.externalize())
    }

    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    override suspend fun postLeaveDay(request: PostLeaveDay.Request): PostLeaveDay.Response<*> {
        val auth = authentication()
        val form = request.body.internalize().setPersonCode(auth)
        val created = service.create(form)
        return PostLeaveDay.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    override suspend fun putLeaveDay(request: PutLeaveDay.Request): PutLeaveDay.Response<*> {
        val auth = authentication()
        val code = request.path.code
        val form = request.body.internalize()
        val existing =
            service.findByCode(code)
                ?.applyAuthentication(auth)
                ?.applyAllowedToUpdate(form.status, auth.isAdmin())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "LeaveDay not found")
        val updated =
            service.update(
                code = code,
                form = form,
                isUpdatedByOwner = auth.isOwnerOf(existing),
            )
        return PutLeaveDay.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    override suspend fun deleteLeaveDay(request: DeleteLeaveDay.Request): DeleteLeaveDay.Response<*> {
        val auth = authentication()
        service.findByCode(request.path.code)
            ?.applyAuthentication(auth)
            ?.run { service.deleteByCode(this.code) }
        return DeleteLeaveDay.Response204(Unit)
    }

    private fun LeaveDayFormApi.internalize(): LeaveDayForm =
        LeaveDayForm(
            description = description ?: "",
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse) ?: error("to is required"),
            hours = hours ?: 0.0,
            days = days?.toMutableList(),
            status = status?.toDomain() ?: Status.REQUESTED,
            type = type?.toDomain() ?: LeaveDayType.HOLIDAY,
            personId = personId?.let(UUID::fromString) ?: UUID(0L, 0L),
        )

    private fun LeaveDayForm.setPersonCode(authentication: Authentication): LeaveDayForm {
        if (authentication.isAdmin()) {
            return this
        }
        return personService
            .findByUserCode(authentication.name)
            ?.let { this.copy(personId = it.uuid) }
            ?: throw ResponseStatusException(FORBIDDEN, "User is not linked to person")
    }

    private fun LeaveDay.externalize(): LeaveDayApi =
        LeaveDayApi(
            personId = person.uuid.toString(),
            id = id,
            code = code,
            from = from.toString(),
            to = to.toString(),
            hours = hours,
            days = days,
            description = description,
            type = type.toApi(),
            status = status.toApi(),
        )

    private fun LeaveDayType.toApi(): LeaveDayTypeApi =
        when (this) {
            LeaveDayType.HOLIDAY -> LeaveDayTypeApi.HOLIDAY
            LeaveDayType.PLUSDAY -> LeaveDayTypeApi.PLUSDAY
            LeaveDayType.PAID_PARENTAL_LEAVE -> LeaveDayTypeApi.PAID_PARENTAL_LEAVE
            LeaveDayType.UNPAID_PARENTAL_LEAVE -> LeaveDayTypeApi.UNPAID_PARENTAL_LEAVE
            LeaveDayType.PAID_LEAVE -> LeaveDayTypeApi.PAID_LEAVE
        }

    private fun LeaveDayFormTypeApi.toDomain(): LeaveDayType =
        when (this) {
            LeaveDayFormTypeApi.HOLIDAY -> LeaveDayType.HOLIDAY
            LeaveDayFormTypeApi.PLUSDAY -> LeaveDayType.PLUSDAY
            LeaveDayFormTypeApi.PAID_PARENTAL_LEAVE -> LeaveDayType.PAID_PARENTAL_LEAVE
            LeaveDayFormTypeApi.UNPAID_PARENTAL_LEAVE -> LeaveDayType.UNPAID_PARENTAL_LEAVE
            LeaveDayFormTypeApi.PAID_LEAVE -> LeaveDayType.PAID_LEAVE
        }

    private fun Status.toApi(): LeaveDayStatusApi =
        when (this) {
            Status.REQUESTED -> LeaveDayStatusApi.REQUESTED
            Status.APPROVED -> LeaveDayStatusApi.APPROVED
            Status.REJECTED -> LeaveDayStatusApi.REJECTED
            Status.DONE -> LeaveDayStatusApi.DONE
        }

    private fun LeaveDayFormStatusApi.toDomain(): Status =
        when (this) {
            LeaveDayFormStatusApi.REQUESTED -> Status.REQUESTED
            LeaveDayFormStatusApi.APPROVED -> Status.APPROVED
            LeaveDayFormStatusApi.REJECTED -> Status.REJECTED
            LeaveDayFormStatusApi.DONE -> Status.DONE
        }

    private fun GetLeaveDayAll.Queries.toPageable(): Pageable {
        // The React LeaveDayList always requests `from,desc` ordering and
        // relies on it to surface newly-submitted entries on page 1. Hardcode
        // the same sort here so the wire behavior matches the pre-migration
        // controller, which auto-resolved Spring's Pageable from the URL.
        val sort = Sort.by("from").descending().and(Sort.by("id"))
        return PageRequest.of(page ?: 0, size ?: 20, sort)
    }

    private fun LeaveDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!(authentication.isAdmin() || authentication.isOwnerOf(this))) {
                throw ResponseStatusException(FORBIDDEN, "User has no access to object")
            }
        }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(LeaveDayAuthority.ADMIN.toName())

    private fun Authentication.isOwnerOf(leaveDay: LeaveDay) = isAssociatedWith(leaveDay.person)
}
