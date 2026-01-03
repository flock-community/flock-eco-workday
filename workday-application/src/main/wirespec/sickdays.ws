endpoint FindByCode_1 GET /api/sickdays/{code: String} -> {
  200 -> SickDay
}
endpoint Put_1 PUT SickDayForm /api/sickdays/{code: String} -> {
  200 -> SickDay
}
endpoint Delete_1 DELETE /api/sickdays/{code: String} -> {
  200 -> Unit
}
endpoint GetAllByPersonId GET /api/sickdays ? {personId: String?,pageable: Pageable} -> {
  200 -> SickDay[]
}
endpoint Post_1 POST SickDayForm /api/sickdays -> {
  200 -> SickDay
}

type SickDayForm {
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  status: SickDayFormStatus?,
  description: String?,
  personId: String?
}
enum SickDayFormStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type SickDay {
  personId: String?,
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  description: String?,
  status: SickDayStatus?,
  person: Person?,
  `type`: String
}
enum SickDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
