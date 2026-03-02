type Job {
  id: Integer?,
  code: String?,
  title: String,
  description: String,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  from: String?,
  to: String?,
  status: JobStatus,
  client: Client?,
  documents: JobDocument[]
}

type JobForm {
  title: String,
  description: String,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  from: String?,
  to: String?,
  status: JobStatus,
  clientCode: String?,
  documents: JobDocument[]
}

type JobDocument {
  name: String,
  file: String
}

enum JobStatus {
  DRAFT, OPEN, CLOSED
}

endpoint JobFindAll GET /api/jobs ? {status: String?, page: Integer?, size: Integer?, sort: String[]?} -> {
  200 -> Job[]
}

endpoint JobFindByCode GET /api/jobs/{code: String} -> {
  200 -> Job
}

endpoint JobCreate POST JobForm /api/jobs -> {
  200 -> Job
}

endpoint JobUpdate PUT JobForm /api/jobs/{code: String} -> {
  200 -> Job
}

endpoint JobDeleteByCode DELETE /api/jobs/{code: String} -> {
  200 -> Unit
}
