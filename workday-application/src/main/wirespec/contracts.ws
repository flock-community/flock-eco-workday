endpoint PutService PUT ContractServiceForm /api/contracts-service/{code: String} -> {
  200 -> ContractService
}
endpoint PutManagement PUT ContractManagementForm /api/contracts-management/{code: String} -> {
  200 -> ContractManagement
}
endpoint PutInternal PUT ContractInternalForm /api/contracts-internal/{code: String} -> {
  200 -> ContractInternal
}
endpoint PutExternal PUT ContractExternalForm /api/contracts-external/{code: String} -> {
  200 -> ContractExternal
}
endpoint PostService POST ContractServiceForm /api/contracts-service -> {
  200 -> ContractService
}
endpoint PostManagement POST ContractManagementForm /api/contracts-management -> {
  200 -> ContractManagement
}
endpoint PostInternal POST ContractInternalForm /api/contracts-internal -> {
  200 -> ContractInternal
}
endpoint PostExternal POST ContractExternalForm /api/contracts-external -> {
  200 -> ContractExternal
}
endpoint FindAll_1_2_1_1 GET /api/contracts ? {page: Pageable,to: String?,start: String?,end: String?,personId: String?} -> {
  200 -> Contract[]
}
endpoint FindByCode_5 GET /api/contracts/{code: String} -> {
  200 -> Contract
}
endpoint Delete_6 DELETE /api/contracts/{code: String} -> {
  200 -> Unit
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
  `type`: ContractServiceType?,
  monthlyCosts: Number?,
  description: String?
}
enum ContractServiceType {
  INTERNAL, EXTERNAL, MANAGEMENT, SERVICE
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
  `type`: ContractManagementType?,
  monthlyFee: Number?
}
enum ContractManagementType {
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
  `type`: ContractInternalType?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  holidayHours: Integer32?,
  hackHours: Integer32?,
  billable: Boolean?
}
enum ContractInternalType {
  INTERNAL, EXTERNAL, MANAGEMENT, SERVICE
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
  `type`: ContractExternalType?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  billable: Boolean?
}
enum ContractExternalType {
  INTERNAL, EXTERNAL, MANAGEMENT, SERVICE
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
