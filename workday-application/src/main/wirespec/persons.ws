endpoint GetPersonAll GET /api/persons ? {page: Integer32?, size: Integer32?, sort: String?, active: Boolean?, search: String?} -> {
  200 -> Person[] # { `x-total`: Integer32 }
}
endpoint GetPersonByUuid GET /api/persons/{uuid: String} -> {
  200 -> Person
}
endpoint GetPersonMe GET /api/persons/me -> {
  200 -> Person
}
endpoint GetPersonSpecialDates GET /api/persons/specialDates ? {start: String, end: String} -> {
  200 -> PersonEvent[]
}
endpoint PostPerson POST PersonForm /api/persons -> {
  200 -> Person
}
endpoint PutPerson PUT PersonForm /api/persons/{uuid: String} -> {
  200 -> Person
}
endpoint DeletePerson DELETE /api/persons/{uuid: String} -> {
  204 -> Unit
}

type PersonForm {
  firstname: String?,
  lastname: String?,
  email: String?,
  position: String?,
  number: String?,
  birthdate: String?,
  joinDate: String?,
  active: Boolean?,
  userCode: String?,
  reminders: Boolean?,
  receiveEmail: Boolean?,
  shoeSize: String?,
  shirtSize: String?,
  googleDriveId: String?
}
type Person {
  id: Integer?,
  uuid: String?,
  firstname: String?,
  lastname: String?,
  email: String?,
  position: String?,
  number: String?,
  birthdate: String?,
  joinDate: String?,
  active: Boolean?,
  lastActiveAt: String?,
  reminders: Boolean?,
  receiveEmail: Boolean?,
  shoeSize: String?,
  shirtSize: String?,
  googleDriveId: String?,
  user: User?,
  fullName: String?
}
type PersonEvent {
  person: Person?,
  eventType: PersonEventEventType?,
  eventDate: String?
}
enum PersonEventEventType {
  JOIN_DAY, BIRTHDAY
}
