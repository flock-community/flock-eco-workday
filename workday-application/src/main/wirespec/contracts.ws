endpoint GetContractAll GET /api/contracts ? {personId: String?, to: String?, start: String?, end: String?, ...Paging, sort: String[]?} -> {
  200 -> Contract[] # { ...TotalCount }
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
  ...ContractBase,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  holidayHours: Integer32?,
  hackTimeBudget: Integer32?,
  hourlyRate: Number?,
  monthlyFee: Number?,
  monthlyCosts: Number?,
  description: String?,
  billable: Boolean?,
  ...TrainingBudget
}
enum ContractType {
  INTERNAL, EXTERNAL, MANAGEMENT, SERVICE
}

// Fields every kind of contract has
part ContractBase {
  ...Identified,
  ...Period,
  person: Person?,
  `type`: ContractType?
}

// Training budget of an internal contract, in hours and in money
part TrainingBudget {
  trainingTimeBudget: Integer32?,
  trainingMoneyBudget: Number?
}

type ContractInternalForm {
  personId: String?,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  ...Period,
  holidayHours: Integer32?,
  hackTimeBudget: Integer32?,
  billable: Boolean?,
  ...TrainingBudget
}
type ContractInternal {
  ...ContractBase,
  monthlySalary: Number?,
  hoursPerWeek: Integer32?,
  holidayHours: Integer32?,
  hackTimeBudget: Integer32?,
  billable: Boolean?,
  ...TrainingBudget
}

type ContractExternalForm {
  personId: String?,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  ...Period,
  billable: Boolean?
}
type ContractExternal {
  ...ContractBase,
  hourlyRate: Number?,
  hoursPerWeek: Integer32?,
  billable: Boolean?
}

type ContractManagementForm {
  personId: String?,
  monthlyFee: Number?,
  ...Period
}
type ContractManagement {
  ...ContractBase,
  monthlyFee: Number?
}

type ContractServiceForm {
  monthlyCosts: Number?,
  description: String?,
  ...Period
}
type ContractService {
  ...ContractBase,
  monthlyCosts: Number?,
  description: String?
}
