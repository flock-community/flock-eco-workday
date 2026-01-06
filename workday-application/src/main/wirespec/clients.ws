endpoint FindByCode_6 GET /api/clients/{code: String} -> {
  200 -> Client
}
endpoint Put_5 PUT ClientForm /api/clients/{code: String} -> {
  200 -> Client
}
endpoint Delete_7 DELETE /api/clients/{code: String} -> {
  200 -> Unit
}
endpoint FindAll_1 GET /api/clients ? {pageable: Pageable} -> {
  200 -> Client[]
}
endpoint Post_5 POST ClientForm /api/clients -> {
  200 -> Client
}

type ClientForm {
  name: String?
}
type Client {
  id: Integer?,
  code: String?,
  name: String?
}
