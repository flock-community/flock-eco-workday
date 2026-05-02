endpoint GetTaskReminder GET /tasks/reminder -> {
  200 -> Unit
}
endpoint GetLoginType GET /login/type -> {
  200 -> LoginType
}
endpoint LoginStatus GET /login/status -> {
  200 -> LoginStatusResponse
}
endpoint Bootstrap GET /bootstrap -> {
  200 -> BootstrapResponse
}
endpoint GetCalendar GET /api/ext/calendar/calendar ? {token: String} -> {
  200 -> String
}

type LoginType {
  `type`: String?
}
type LoginStatusResponse {
  authorities: String[]?,
  loggedIn: Boolean?
}
type BootstrapResponse {
  authorities: String[]?,
  userId: String?,
  personId: String?,
  loggedIn: Boolean?
}
type Pageable {
  page: Integer32,
  size: Integer32,
  sort: String[]?
}
type UUID = String
