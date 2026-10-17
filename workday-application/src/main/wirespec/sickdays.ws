endpoint GetSickDayAll GET /api/sickdays ? {personId: String?, ...SortedPaging} -> {
  200 -> SickDay[] # { ...TotalCount }
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
  ...BookedHours,
  status: SickDayFormStatus?,
  description: String?,
  personId: String?
}
enum SickDayFormStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type SickDay {
  personId: String?,
  ...Identified,
  ...BookedHours,
  description: String?,
  status: SickDayStatus?,
  `type`: String
}
enum SickDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
