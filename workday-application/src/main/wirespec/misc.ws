endpoint Reminder GET /tasks/reminder -> {
  200 -> Unit
}
endpoint GetType GET /login/type -> {
  200 -> LoginType
}
endpoint Index GET /login/status -> {
  200 -> Status
}
endpoint Bootstrap GET /bootstrap -> {
  200 -> Bootstrap
}
endpoint Get GET /api/ext/calendar/calendar ? {token: String} -> {
  200 -> String
}

type LoginType {
  `type`: String?
}
type Status {
  authorities: String[]?,
  loggedIn: Boolean?
}
type Bootstrap {
  authorities: String[]?,
  userId: String?,
  personId: String?,
  loggedIn: Boolean?
}
type Pageable {
  page: Integer32?,
  size: Integer32?,
  sort: String[]?
}
