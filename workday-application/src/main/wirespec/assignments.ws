endpoint GetAssignmentAll GET /api/assignments ? {personId: String?, projectCode: String?, to: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> Assignment[]
}
endpoint GetAssignmentByCode GET /api/assignments/{code: String} -> {
  200 -> Assignment
}
endpoint PostAssignment POST AssignmentForm /api/assignments -> {
  200 -> Assignment
}
endpoint PutAssignment PUT AssignmentForm /api/assignments/{code: String} -> {
  200 -> Assignment
}
endpoint DeleteAssignment DELETE /api/assignments/{code: String} -> {
  204 -> Unit
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
  totalHours: Integer32?,
  totalCosts: Number?,
  client: Client?,
  person: Person?,
  project: Project?
}
