endpoint GetClientAll GET /api/clients -> {
  200 -> Client[]
}
endpoint GetClientByCode GET /api/clients/{code: String} -> {
  200 -> Client
}
endpoint PostClient POST ClientForm /api/clients -> {
  200 -> Client
}
endpoint PutClient PUT ClientForm /api/clients/{code: String} -> {
  200 -> Client
}
endpoint DeleteClient DELETE /api/clients/{code: String} -> {
  200 -> Unit
}

type ClientForm {
  name: String?
}
type Client {
  id: Integer?,
  code: String?,
  name: String?
}
