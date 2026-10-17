endpoint GetPersonAll GET /api/persons ? {...SortedPaging, active: Boolean?, search: String?} -> {
  200 -> Person[] # { ...TotalCount }
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

// Name, contact and employment details of a person
part PersonDetails {
  firstname: String?,
  lastname: String?,
  email: String?,
  position: String?,
  number: String?,
  birthdate: String?,
  joinDate: String?,
  active: Boolean?
}

// Notification settings, clothing sizes, drive folder and address of a person
part PersonProfile {
  reminders: Boolean?,
  receiveEmail: Boolean?,
  shoeSize: String?,
  shirtSize: String?,
  googleDriveId: String?,
  address: Address?
}

type PersonForm {
  ...PersonDetails,
  userCode: String?,
  ...PersonProfile,
  photo: String?
}
type Person {
  id: Integer?,
  uuid: String?,
  ...PersonDetails,
  lastActiveAt: String?,
  ...PersonProfile,
  user: User?,
  fullName: String?,
  photo: String?
}
type Address {
  street: String?,
  houseNumber: String?,
  houseNumberAddition: String?,
  postalCode: String?,
  city: String?
}
type PersonEvent {
  person: Person?,
  eventType: PersonEventEventType?,
  eventDate: String?
}
enum PersonEventEventType {
  JOIN_DAY, BIRTHDAY
}
