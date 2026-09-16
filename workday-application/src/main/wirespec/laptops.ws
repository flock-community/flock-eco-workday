endpoint GetLaptopAll GET /api/laptops ? {page: Integer32?, size: Integer32?, sort: String?, personId: String?} -> {
  200 -> Laptop[] # { `x-total`: Integer32 }
}
endpoint GetLaptopByCode GET /api/laptops/{code: String} -> {
  200 -> Laptop
  404 -> Error
}
endpoint PostLaptop POST LaptopForm /api/laptops -> {
  200 -> Laptop
  400 -> Error
  409 -> Error
}
endpoint PutLaptop PUT LaptopForm /api/laptops/{code: String} -> {
  200 -> Laptop
  400 -> Error
  404 -> Error
  409 -> Error
}
endpoint DeleteLaptop DELETE /api/laptops/{code: String} -> {
  204 -> Unit
}

type LaptopForm {
  name: String?,
  serialNumber: String?,
  contractSigned: Boolean?,
  personId: String?
}
type Laptop {
  id: Integer?,
  code: String?,
  name: String?,
  serialNumber: String?,
  contractSigned: Boolean?,
  person: Person?
}
