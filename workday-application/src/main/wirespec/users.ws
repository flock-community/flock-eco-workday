endpoint GetUserAll GET /api/users ? {search: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> User[] # { `x-total`: Integer32 }
}
endpoint GetUserMe GET /api/users/me -> {
  200 -> User
}
endpoint GetUserMeAccounts GET /api/users/me/accounts -> {
  200 -> UserAccount[]
}
endpoint GetUserByCode GET /api/users/{code: String} -> {
  200 -> User
}
endpoint PostUser POST UserForm /api/users -> {
  200 -> User
}
endpoint PutUser PUT UserForm /api/users/{code: String} -> {
  200 -> User
}
endpoint DeleteUser DELETE /api/users/{code: String} -> {
  200 -> Unit
}
endpoint PostUserSearch POST String[] /api/users/search -> {
  200 -> User[]
}
endpoint PutUserResetPasswordByCode PUT /api/users/{code: String}/reset-password -> {
  200 -> Unit
}
endpoint PutUserResetPassword PUT RequestPasswordReset /api/users/reset-password -> {
  200 -> Unit
}
endpoint PostUserRegister POST UserAccountPasswordForm /api/users/register -> {
  200 -> UserAccount
}

type User {
  id: String,
  name: String?,
  email: String?,
  authorities: String[]?,
  accounts: UserAccount[]?,
  created: String?
}
type UserAccount {
  id: String,
  `type`: String,
  created: String?,
  label: String?,
  provider: String?
}
type UserForm {
  name: String?,
  email: String,
  authorities: String[]?
}
type UserAccountPasswordForm {
  email: String,
  name: String?,
  password: String,
  authorities: String[]?
}
type RequestPasswordReset {
  email: String
}
