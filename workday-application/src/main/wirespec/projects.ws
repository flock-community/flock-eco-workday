endpoint FindByCode_2 GET /api/projects/{code: String} -> {
  200 -> Project
}
endpoint Update PUT ProjectForm /api/projects/{code: String} -> {
  200 -> Project
}
endpoint Delete_2 DELETE /api/projects/{code: String} -> {
  200 -> Unit
}
endpoint FindAll GET /api/projects ? {pageable: Pageable} -> {
  200 -> Project[]
}
endpoint Create POST ProjectForm /api/projects -> {
  200 -> Project
}

type ProjectForm {
  name: String?
}
type Project {
  id: Integer?,
  code: String?,
  name: String?
}
