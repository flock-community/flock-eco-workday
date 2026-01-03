endpoint UnsubscribeFromEvent PUT /api/events/{eventCode: String}/unsubscribe -> {
  200 -> Event
}
endpoint SubscribeToEvent PUT /api/events/{eventCode: String}/subscribe -> {
  200 -> Event
}
endpoint FindByCode_4 GET /api/events/{code: String} -> {
  200 -> Event
}
endpoint Put_4 PUT EventForm /api/events/{code: String} -> {
  200 -> Event
}
endpoint Delete_5 DELETE /api/events/{code: String} -> {
  200 -> Unit
}
endpoint GetAll_2 GET /api/events ? {pageable: Pageable} -> {
  200 -> Event[]
}
endpoint Post_4 POST EventForm /api/events -> {
  200 -> Event
}
endpoint FindEventRatings GET /api/events/{code: String}/ratings -> {
  200 -> EventRating[]
}
endpoint PostRating POST EventRatingForm /api/events/{code: String}/ratings -> {
  200 -> EventRating
}
endpoint DeleteRatings DELETE /api/events/{eventCode: String}/ratings/{personId: String} -> {
  200 -> Unit
}
endpoint GetHackDays GET /api/events/hack-days ? {year: Integer32} -> {
  200 -> EventProjection[]
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
