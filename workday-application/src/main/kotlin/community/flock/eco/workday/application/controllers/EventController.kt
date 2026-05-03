package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteEvent
import community.flock.eco.workday.api.endpoint.DeleteEventRating
import community.flock.eco.workday.api.endpoint.GetEventAll
import community.flock.eco.workday.api.endpoint.GetEventByCode
import community.flock.eco.workday.api.endpoint.GetEventHackDays
import community.flock.eco.workday.api.endpoint.GetEventRatings
import community.flock.eco.workday.api.endpoint.PostEvent
import community.flock.eco.workday.api.endpoint.PostEventRating
import community.flock.eco.workday.api.endpoint.PutEvent
import community.flock.eco.workday.api.endpoint.SubscribeToEvent
import community.flock.eco.workday.api.endpoint.UnsubscribeFromEvent
import community.flock.eco.workday.application.authorities.EventAuthority
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.forms.EventRatingForm
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventRating
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventProjection
import community.flock.eco.workday.application.services.EventRatingService
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.isUser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Event as EventApi
import community.flock.eco.workday.api.model.EventForm as EventFormApi
import community.flock.eco.workday.api.model.EventFormType as EventFormTypeApi
import community.flock.eco.workday.api.model.EventProjection as EventProjectionApi
import community.flock.eco.workday.api.model.EventProjectionType as EventProjectionTypeApi
import community.flock.eco.workday.api.model.EventRating as EventRatingApi
import community.flock.eco.workday.api.model.EventRatingForm as EventRatingFormApi
import community.flock.eco.workday.api.model.EventType as EventTypeApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.api.model.PersonProjection as PersonProjectionApi

@RestController
class EventController(
    private val eventService: EventService,
    private val eventRatingService: EventRatingService,
    private val personService: PersonService,
) : GetEventAll.Handler,
    GetEventByCode.Handler,
    PostEvent.Handler,
    PutEvent.Handler,
    DeleteEvent.Handler,
    GetEventHackDays.Handler,
    SubscribeToEvent.Handler,
    UnsubscribeFromEvent.Handler,
    GetEventRatings.Handler,
    PostEventRating.Handler,
    DeleteEventRating.Handler {
    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PreAuthorize("hasAuthority('EventAuthority.READ')")
    override suspend fun getEventAll(request: GetEventAll.Request): GetEventAll.Response<*> {
        val auth = authentication()
        val page = eventService.findAll(request.queries.toPageable())
        val body =
            page.content.map { event ->
                if (!event.isAuthenticated(auth)) event.redact() else event
            }
        return GetEventAll.Response200(
            body = body.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('EventAuthority.SUBSCRIBE')")
    override suspend fun getEventHackDays(request: GetEventHackDays.Request): GetEventHackDays.Response<*> {
        val year = request.queries.year ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "year is required")
        val projections =
            eventService
                .findAllHackDaysOf(year)
                .sortedBy { it.getFrom() }
                .map { it.externalize() }
        return GetEventHackDays.Response200(projections)
    }

    override suspend fun getEventByCode(request: GetEventByCode.Request): GetEventByCode.Response<*> {
        val event =
            eventService.findByCode(request.path.code)
                ?.applyAuthentication(authentication())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found")
        return GetEventByCode.Response200(event.externalize())
    }

    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    override suspend fun postEvent(request: PostEvent.Request): PostEvent.Response<*> {
        val created = eventService.create(request.body.internalize())
        return PostEvent.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    override suspend fun putEvent(request: PutEvent.Request): PutEvent.Response<*> {
        val updated = eventService.update(request.path.code, request.body.internalize())
        return PutEvent.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    override suspend fun deleteEvent(request: DeleteEvent.Request): DeleteEvent.Response<*> {
        val auth = authentication()
        eventService.findByCode(request.path.code)
            ?.applyAuthentication(auth)
            ?.run { eventService.deleteByCode(this.code) }
        return DeleteEvent.Response204(Unit)
    }

    override suspend fun subscribeToEvent(request: SubscribeToEvent.Request): SubscribeToEvent.Response<*> {
        // @PreAuthorize on overridden Wirespec handler methods is not picked
        // up reliably because the @PutMapping annotation lives on the
        // generated interface; check the SUBSCRIBE authority explicitly.
        authentication().requireAuthority(EventAuthority.SUBSCRIBE)
        val person = currentPerson()
        val event = eventService.subscribeToEvent(request.path.eventCode, person)
        return SubscribeToEvent.Response200(event.externalize())
    }

    override suspend fun unsubscribeFromEvent(request: UnsubscribeFromEvent.Request): UnsubscribeFromEvent.Response<*> {
        val auth = authentication().requireAuthority(EventAuthority.SUBSCRIBE)
        val person = currentPerson()
        eventService.findByCode(request.path.eventCode)
            ?.applyAuthentication(auth)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found")
        val event = eventService.unsubscribeFromEvent(request.path.eventCode, person)
        return UnsubscribeFromEvent.Response200(event.externalize())
    }

    override suspend fun getEventRatings(request: GetEventRatings.Request): GetEventRatings.Response<*> {
        val auth = authentication()
        val ratings =
            eventRatingService
                .findByEventCode(request.path.code)
                .filter { it.isAuthenticated(auth) }
                .sortedBy { it.person.lastname }
                .map { it.externalize() }
        return GetEventRatings.Response200(ratings)
    }

    override suspend fun postEventRating(request: PostEventRating.Request): PostEventRating.Response<*> {
        val rating =
            eventRatingService.create(
                EventRatingForm(
                    eventCode = request.path.code,
                    personId = request.body.personId?.let(UUID::fromString)
                        ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "personId is required"),
                    rating = request.body.rating ?: 0,
                ),
            )
        return PostEventRating.Response200(rating.externalize())
    }

    override suspend fun deleteEventRating(request: DeleteEventRating.Request): DeleteEventRating.Response<*> {
        eventRatingService.deleteByEventCodeAndPersonUuid(
            request.path.eventCode,
            UUID.fromString(request.path.personId),
        )
        return DeleteEventRating.Response204(Unit)
    }

    private fun currentPerson(): Person =
        personService.findByUserCode(authentication().name)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not linked to person")

    private fun Event.redact(): Event =
        Event(
            description = "N/A - $description",
            costs = 0.00,
            days = null,
            persons = mutableListOf(),
            id = id,
            code = code,
            from = from,
            to = to,
            hours = hours,
            type = type,
        )

    private fun EventFormApi.internalize(): EventForm =
        EventForm(
            description = description ?: "",
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse) ?: error("to is required"),
            hours = hours ?: 0.0,
            days = days?.toMutableList() ?: mutableListOf(),
            costs = costs ?: 0.0,
            personIds = personIds?.map(UUID::fromString) ?: emptyList(),
            type = type?.toDomain() ?: EventType.GENERAL_EVENT,
        )

    private fun Event.externalize(): EventApi =
        EventApi(
            id = id,
            code = code,
            description = description,
            from = from.toString(),
            to = to.toString(),
            hours = hours,
            costs = costs,
            type = type.toApi(),
            days = days,
            persons = persons.map { it.externalize() },
        )

    private fun EventRating.externalize(): EventRatingApi =
        EventRatingApi(
            person = person.externalize(),
            rating = rating,
        )

    private fun EventProjection.externalize(): EventProjectionApi =
        EventProjectionApi(
            type = getType().toProjectionApi(),
            from = getFrom().toString(),
            to = getTo().toString(),
            code = getCode(),
            description = getDescription(),
            persons = getPersons().map { it.externalize() },
        )

    private fun community.flock.eco.workday.application.model.PersonProjection.externalize(): PersonProjectionApi =
        PersonProjectionApi(
            uuid = getUuid().toString(),
            firstname = getFirstname(),
            lastname = getLastname(),
            email = getEmail(),
        )

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

    private fun EventType.toApi(): EventTypeApi =
        when (this) {
            EventType.FLOCK_HACK_DAY -> EventTypeApi.FLOCK_HACK_DAY
            EventType.FLOCK_COMMUNITY_DAY -> EventTypeApi.FLOCK_COMMUNITY_DAY
            EventType.CONFERENCE -> EventTypeApi.CONFERENCE
            EventType.GENERAL_EVENT -> EventTypeApi.GENERAL_EVENT
        }

    private fun EventType.toProjectionApi(): EventProjectionTypeApi =
        when (this) {
            EventType.FLOCK_HACK_DAY -> EventProjectionTypeApi.FLOCK_HACK_DAY
            EventType.FLOCK_COMMUNITY_DAY -> EventProjectionTypeApi.FLOCK_COMMUNITY_DAY
            EventType.CONFERENCE -> EventProjectionTypeApi.CONFERENCE
            EventType.GENERAL_EVENT -> EventProjectionTypeApi.GENERAL_EVENT
        }

    private fun EventFormTypeApi.toDomain(): EventType =
        when (this) {
            EventFormTypeApi.FLOCK_HACK_DAY -> EventType.FLOCK_HACK_DAY
            EventFormTypeApi.FLOCK_COMMUNITY_DAY -> EventType.FLOCK_COMMUNITY_DAY
            EventFormTypeApi.CONFERENCE -> EventType.CONFERENCE
            EventFormTypeApi.GENERAL_EVENT -> EventType.GENERAL_EVENT
        }

    private fun GetEventAll.Queries.toPageable(): Pageable {
        // The React EventList always requests `from,desc` ordering (see
        // EventClient.getAll). Hardcode the same sort here so behavior matches
        // the pre-Wirespec controller, which auto-resolved Spring's Pageable.
        val sort = Sort.by("from").descending().and(Sort.by("id"))
        return PageRequest.of(page ?: 0, size ?: 10, sort)
    }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(EventAuthority.ADMIN.toName())

    private fun Authentication.requireAuthority(authority: EventAuthority): Authentication =
        also {
            val granted = it.authorities.map { granted -> granted.authority }
            if (authority.toName() !in granted) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Missing authority: ${authority.toName()}")
            }
        }

    private fun Event.isAuthenticated(authentication: Authentication?): Boolean =
        authentication?.isAdmin() == true || persons.any { it.isUser(authentication?.name) }

    private fun Event.applyAuthentication(authentication: Authentication?): Event =
        apply {
            if (!isAuthenticated(authentication)) {
                throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User has not access to event")
            }
        }

    private fun EventRating.isAuthenticated(authentication: Authentication?): Boolean =
        authentication?.isAdmin() == true || person.isUser(authentication?.name)
}
