endpoint Put_2 PUT PersonForm /api/persons/{code: String} -> {
  200 -> Person
}
endpoint FindAll_1_1 GET /api/persons ? {pageable: Pageable,active: Boolean?,search: String} -> {
  200 -> Person[]
}
endpoint Post_2 POST PersonForm /api/persons -> {
  200 -> Person
}
endpoint FindByUui GET /api/persons/{uuid: String} -> {
  200 -> Person
}
endpoint SpecialDates GET /api/persons/specialDates ? {start: String,end: String} -> {
  200 -> PersonEvent[]
}
endpoint FindByMe GET /api/persons/me -> {
  200 -> Person
}
endpoint Delete_3 DELETE /api/persons/{personId: String} -> {
  200 -> Unit
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
