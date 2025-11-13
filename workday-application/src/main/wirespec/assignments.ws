endpoint FindByCode_7 GET /api/assignments/{code: String} -> {
  200 -> Assignment
}
endpoint Put_6 PUT AssignmentForm /api/assignments/{code: String} -> {
  200 -> Assignment
}
endpoint Delete_8 DELETE /api/assignments/{code: String} -> {
  200 -> Unit
}
endpoint FindAll_2_1 GET /api/assignments ? {personId: String?,projectCode: String?,page: Pageable,to: String} -> {
  200 -> FindAll_2_1200ResponseBody
}
endpoint Post_6 POST AssignmentForm /api/assignments -> {
  200 -> Assignment
}

type AssignmentForm {
  personId: String?,
  clientCode: String?,
  projectCode: String?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  role: String?,
  from: String?,
  to: String?
}
type Assignment {
  id: Integer?,
  code: String?,
  role: String?,
  from: String?,
  to: String?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  client: Client?,
  person: Person?,
  project: Project?
}
type AssignmentWithHours {
  id: Integer?,
  code: String?,
  role: String?,
  from: String?,
  to: String?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  client: Client?,
  person: Person?,
  project: Project?,
  totalHours: Integer32?,
  totalCosts: Number?
}
type FindAll_2_1200ResponseBody = Assignment[] | AssignmentWithHours[]
