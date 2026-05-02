endpoint GetContractAll GET /api/contracts ? {personId: String?, to: String?, start: String?, end: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> Contract[]
}
endpoint GetContractByCode GET /api/contracts/{code: String} -> {
  200 -> Contract
}
endpoint DeleteContract DELETE /api/contracts/{code: String} -> {
  204 -> Unit
}
endpoint PostContractInternal POST ContractInternalForm /api/contracts-internal -> {
  200 -> ContractInternal
}
endpoint PutContractInternal PUT ContractInternalForm /api/contracts-internal/{code: String} -> {
  200 -> ContractInternal
}
endpoint PostContractExternal POST ContractExternalForm /api/contracts-external -> {
  200 -> ContractExternal
}
endpoint PutContractExternal PUT ContractExternalForm /api/contracts-external/{code: String} -> {
  200 -> ContractExternal
}
endpoint PostContractManagement POST ContractManagementForm /api/contracts-management -> {
  200 -> ContractManagement
}
endpoint PutContractManagement PUT ContractManagementForm /api/contracts-management/{code: String} -> {
  200 -> ContractManagement
}
endpoint PostContractService POST ContractServiceForm /api/contracts-service -> {
  200 -> ContractService
}
endpoint PutContractService PUT ContractServiceForm /api/contracts-service/{code: String} -> {
  200 -> ContractService
}

type Contract {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractType?
}
enum ContractType {
  INTERNAL, EXTERNAL, MANAGEMENT, SERVICE
}

type ContractInternalForm {
  personId: String?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  from: String?,
  to: String?,
  holidayHours: Integer32?,
  hackHours: Integer32?,
  billable: Boolean?
}
type ContractInternal {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractType?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  holidayHours: Integer32?,
  hackHours: Integer32?,
  billable: Boolean?
}

type ContractExternalForm {
  personId: String?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  from: String?,
  to: String?,
  billable: Boolean?
}
type ContractExternal {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractType?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  billable: Boolean?
}

type ContractManagementForm {
  personId: String?,
  monthlyFee: Number?,
  from: String?,
  to: String?
}
type ContractManagement {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractType?,
  monthlyFee: Number?
}

type ContractServiceForm {
  monthlyCosts: Number?,
  description: String?,
  from: String?,
  to: String?
}
type ContractService {
  id: Integer?,
  code: String?,
  from: String?,
  to: String?,
  person: Person?,
  `type`: ContractType?,
  monthlyCosts: Number?,
  description: String?
}
