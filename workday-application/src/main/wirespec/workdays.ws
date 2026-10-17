endpoint GetWorkDayAll GET /api/workdays ? {personId: String?, ...SortedPaging} -> {
  200 -> WorkDay[] # { ...TotalCount }
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
  ...BookedHours,
  status: WorkDayFormStatus?,
  assignmentCode: String?,
  sheets: WorkDaySheetForm[]?
}
enum WorkDayFormStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
// A timesheet file uploaded with a work day
part WorkDaySheetFile {
  name: String?,
  file: String?
}
type WorkDaySheetForm {
  ...WorkDaySheetFile
}
type WorkDay {
  ...Identified,
  ...BookedHours,
  assignment: Assignment?,
  status: WorkDayStatus?,
  sheets: WorkDaySheet[]?,
  `type`: String
}
enum WorkDayStatus {
  REQUESTED, APPROVED, REJECTED, DONE
}
type WorkDaySheet {
  ...WorkDaySheetFile
}
