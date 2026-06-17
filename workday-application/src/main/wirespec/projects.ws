endpoint GetProjectAll GET /api/projects ? {page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> Project[]
}
endpoint GetProjectByCode GET /api/projects/{code: String} -> {
  200 -> Project
}
endpoint PostProject POST ProjectForm /api/projects -> {
  200 -> Project
}
endpoint PutProject PUT ProjectForm /api/projects/{code: String} -> {
  200 -> Project
}
endpoint DeleteProject DELETE /api/projects/{code: String} -> {
  200 -> Unit
}

type ProjectForm {
  name: String?
}
type Project {
  id: Integer?,
  code: String?,
  name: String?
}
