endpoint GetSickDayAll GET /api/sickdays ? {personId: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> SickDay[] # { `x-total`: Integer32 }
}
endpoint GetSickDayByCode GET /api/sickdays/{code: String} -> {
  200 -> SickDay
}
endpoint PostSickDay POST SickDayForm /api/sickdays -> {
  200 -> SickDay
}
endpoint PutSickDay PUT SickDayForm /api/sickdays/{code: String} -> {
  200 -> SickDay
}
endpoint DeleteSickDay DELETE /api/sickdays/{code: String} -> {
  204 -> Unit
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
  `type`: String
}
enum SickDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
