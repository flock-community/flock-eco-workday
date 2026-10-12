endpoint GetLogoAll GET /api/logos -> {
  200 -> Logo[]
}
endpoint PostLogo POST LogoForm /api/logos -> {
  200 -> Logo
  400 -> Error
  409 -> Error
}
endpoint PutLogo PUT LogoForm /api/logos/{id: String} -> {
  200 -> Logo
  400 -> Error
  404 -> Error
  409 -> Error
}
endpoint DeleteLogo DELETE /api/logos/{id: String} -> {
  204 -> Unit
  404 -> Error
}

type LogoName = String(/^(?!\s*$).{1,100}$/g)

type LogoForm {
  name: LogoName,
  image: String?
}
type Logo {
  id: String,
  name: String,
  contentType: String,
  updatedAt: String
}
