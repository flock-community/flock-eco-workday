endpoint GetEventAll GET /api/events ? {page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> Event[] # { `x-total`: Integer32 }
}
endpoint GetEventByCode GET /api/events/{code: String} -> {
  200 -> Event
}
endpoint PostEvent POST EventForm /api/events -> {
  200 -> Event
}
endpoint PutEvent PUT EventForm /api/events/{code: String} -> {
  200 -> Event
}
endpoint DeleteEvent DELETE /api/events/{code: String} -> {
  204 -> Unit
}
endpoint GetEventHackDays GET /api/events/hack-days ? {year: Integer32} -> {
  200 -> EventProjection[]
}
endpoint SubscribeToEvent PUT /api/events/{eventCode: String}/subscribe -> {
  200 -> Event
}
endpoint UnsubscribeFromEvent PUT /api/events/{eventCode: String}/unsubscribe -> {
  200 -> Event
}
endpoint GetEventRatings GET /api/events/{code: String}/ratings -> {
  200 -> EventRating[]
}
endpoint PostEventRating POST EventRatingForm /api/events/{code: String}/ratings -> {
  200 -> EventRating
}
endpoint DeleteEventRating DELETE /api/events/{eventCode: String}/ratings/{personId: String} -> {
  204 -> Unit
}

type Event {
  id: Integer?,
  code: String?,
  description: String?,
  from: String?,
  to: String?,
  hours: Number?,
  costs: Number?,
  `type`: EventType?,
  days: Number[]?,
  persons: Person[]?
}
enum EventType {
  FLOCK_HACK_DAY, FLOCK_COMMUNITY_DAY, CONFERENCE, GENERAL_EVENT
}
type EventForm {
  description: String?,
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  costs: Number?,
  personIds: String[]?,
  `type`: EventFormType?
}
enum EventFormType {
  FLOCK_HACK_DAY, FLOCK_COMMUNITY_DAY, CONFERENCE, GENERAL_EVENT
}
type EventRatingForm {
  personId: String?,
  eventCode: String?,
  rating: Integer32?
}
type EventRating {
  person: Person?,
  rating: Integer32?
}
type EventProjection {
  `type`: EventProjectionType?,
  from: String?,
  persons: PersonProjection[]?,
  code: String?,
  description: String?,
  to: String?
}
enum EventProjectionType {
  FLOCK_HACK_DAY, FLOCK_COMMUNITY_DAY, CONFERENCE, GENERAL_EVENT
}
type PersonProjection {
  uuid: String?,
  firstname: String?,
  email: String?,
  lastname: String?
}
