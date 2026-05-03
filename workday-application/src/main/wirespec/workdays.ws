endpoint GetWorkDayAll GET /api/workdays ? {personId: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> WorkDay[]
}
endpoint GetWorkDayByCode GET /api/workdays/{code: String} -> {
  200 -> WorkDay
}
endpoint PostWorkDay POST WorkDayForm /api/workdays -> {
  200 -> WorkDay
}
endpoint PutWorkDay PUT WorkDayForm /api/workdays/{code: String} -> {
  200 -> WorkDay
}
endpoint DeleteWorkDay DELETE /api/workdays/{code: String} -> {
  204 -> Unit
}

type WorkDayForm {
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  status: WorkDayFormStatus?,
  assignmentCode: String?,
  sheets: WorkDaySheetForm[]?
}
enum WorkDayFormStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type WorkDaySheetForm {
  name: String?,
  file: String?
}
type WorkDay {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  hours: Number?,
  days: Number[]?,
  assignment: Assignment?,
  status: WorkDayStatus?,
  sheets: WorkDaySheet[]?,
  `type`: String
}
enum WorkDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type WorkDaySheet {
  name: String?,
  file: String?
}
