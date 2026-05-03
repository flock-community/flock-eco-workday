endpoint GetLeaveDayAll GET /api/leave-days ? {personId: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> LeaveDay[]
}
endpoint GetLeaveDayByCode GET /api/leave-days/{code: String} -> {
  200 -> LeaveDay
}
endpoint PostLeaveDay POST LeaveDayForm /api/leave-days -> {
  200 -> LeaveDay
}
endpoint PutLeaveDay PUT LeaveDayForm /api/leave-days/{code: String} -> {
  200 -> LeaveDay
}
endpoint DeleteLeaveDay DELETE /api/leave-days/{code: String} -> {
  204 -> Unit
}

type LeaveDayForm {
  description: String?,
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  status: LeaveDayFormStatus?,
  `type`: LeaveDayFormType?,
  personId: String?
}
enum LeaveDayFormStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
enum LeaveDayFormType {
  HOLIDAY, PLUSDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE, PAID_LEAVE
}
type LeaveDay {
  personId: String?,
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  description: String?,
  `type`: LeaveDayType?,
  status: LeaveDayStatus?
}
enum LeaveDayType {
  HOLIDAY, PLUSDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE, PAID_LEAVE
}
enum LeaveDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
