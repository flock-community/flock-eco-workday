endpoint FindUserById GET /api/users/{code: String} -> {
  200 -> User
}
endpoint UpdateUser PUT UserForm /api/users/{code: String} -> {
  200 -> User
}
endpoint DeleteUser DELETE /api/users/{code: String} -> {
  200 -> Unit
}
endpoint GenerateUserResetCodeForUserCode PUT /api/users/{code: String}/reset-password -> {
  200 -> Unit
}
endpoint GenerateUserResetCode PUT RequestPasswordReset /api/users/reset-password -> {
  200 -> Unit
}
endpoint FindAllUsers GET /api/users ? {search: String?,page: Pageable} -> {
  200 -> User[]
}
endpoint CreateUser POST UserForm /api/users -> {
  200 -> User
}
endpoint FindAllUsersByCodes POST String[] /api/users/search -> {
  200 -> User[]
}
endpoint FindMeUser GET /api/users/me -> {
  200 -> User
}
endpoint FindMeUserAccounts GET /api/users/me/accounts -> {
  200 -> UserAccount[]
}

type User {
  id: Integer?,
  code: String?,
  name: String?,
  email: String?,
  enabled: Boolean?,
  authorities: String[]?,
  accounts: UserAccountsArray[]?,
  created: String?
}
type UserAccountsArray = UserAccountKey | UserAccountOauth | UserAccountPassword
type UserAccount = UserAccountKey | UserAccountOauth | UserAccountPassword
type UserAccountKey {
  id: Integer?,
  user: User?,
  created: String?,
  `type`: String,
  label: String?
}
type UserAccountOauth {
  id: Integer?,
  user: User?,
  created: String?,
  `type`: String,
  reference: String?,
  provider: UserAccountOauthProvider?
}
enum UserAccountOauthProvider {
  GOOGLE, FACEBOOK, GITHUB, KRATOS
}
type UserAccountPassword {
  id: Integer?,
  user: User?,
  created: String?,
  `type`: String
}
type UserForm {
  name: String?,
  email: String?,
  authorities: String[]?
}
type RequestPasswordReset {
  email: String?
}
