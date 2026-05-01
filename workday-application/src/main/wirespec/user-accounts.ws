endpoint GetUserAccountAll GET /api/user-accounts ? {search: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> UserAccount[]
}
endpoint PutUserAccountResetPassword PUT PasswordResetForm /api/user-accounts/reset-password -> {
  200 -> Unit
}
endpoint PutUserAccountNewPassword PUT NewPasswordForm /api/user-accounts/new-password -> {
  200 -> Unit
}
endpoint PostUserAccountGenerateKey POST UserKeyForm /api/user-accounts/generate-key -> {
  200 -> GenerateKeyResponse
}
endpoint PostUserAccountRevokeKey POST KeyRevokeForm /api/user-accounts/revoke-key -> {
  200 -> Unit
}

type PasswordResetForm {
  resetCode: String,
  password: String
}
type NewPasswordForm {
  oldPassword: String,
  newPassword: String
}
type UserKeyForm {
  label: String?
}
type KeyRevokeForm {
  id: Integer
}
type GenerateKeyResponse {
  id: String,
  key: String,
  label: String?
}
