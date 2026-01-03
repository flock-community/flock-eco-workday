endpoint FindByCode GET /api/workdays/{code: String} -> {
  200 -> WorkDay
}
endpoint Put PUT WorkDayForm /api/workdays/{code: String} -> {
  200 -> WorkDay
}
endpoint Delete DELETE /api/workdays/{code: String} -> {
  200 -> Unit
}
endpoint GetAll GET /api/workdays ? {personId: String,pageable: Pageable} -> {
  200 -> WorkDay[]
}
endpoint Post POST WorkDayForm /api/workdays -> {
  200 -> WorkDay
}
endpoint PostSheets POST PostSheetsRequestBody /api/workdays/sheets -> {
  200 -> String
}
endpoint GetSheets GET /api/workdays/sheets/{file: String}/{name: String} -> {
  200 -> String[]
}
endpoint ExportWorkday POST /export/workday/{code: String} -> {
  200 -> ExportResponse
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
type PostSheetsRequestBody {
  file: String
}
type ExportResponse {
  link: String?
}
