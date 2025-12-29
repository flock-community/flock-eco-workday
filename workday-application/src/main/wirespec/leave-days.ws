endpoint FindByCode_3 GET /api/leave-days/{code: String} -> {
  200 -> LeaveDay
}
endpoint Put_3 PUT LeaveDayForm /api/leave-days/{code: String} -> {
  200 -> LeaveDay
}
endpoint Delete_4 DELETE /api/leave-days/{code: String} -> {
  200 -> Unit
}
endpoint GetAll_1 GET /api/leave-days ? {personId: String,pageable: Pageable} -> {
  200 -> LeaveDay[]
}
endpoint Post_3 POST LeaveDayForm /api/leave-days -> {
  200 -> LeaveDay
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
  HOLIDAY, PLUSDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE
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
  status: LeaveDayStatus?,
  person: Person?
}
enum LeaveDayType {
  HOLIDAY, PLUSDAY, PAID_PARENTAL_LEAVE, UNPAID_PARENTAL_LEAVE, PAID_LEAVE
}
enum LeaveDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
