endpoint ResetPasswordWithResetCode PUT PasswordResetForm /api/user-accounts/reset-password -> {
  200 -> Unit
}
endpoint ResetPasswordWithNew PUT NewPasswordForm /api/user-accounts/new-password -> {
  200 -> Unit
}
endpoint FindAllAccounts GET /api/user-accounts ? {search: String?,page: Pageable} -> {
  200 -> UserAccount[]
}
endpoint RevokeAccountKey POST KeyRevokeForm /api/user-accounts/revoke-key -> {
  200 -> Unit
}
endpoint GenerateKey POST UserKeyForm /api/user-accounts/generate-key -> {
  200 -> GenerateKeyResponse
}

type UserKeyForm {
  label: String?
}
type PasswordResetForm {
  resetCode: String?,
  password: String?
}
type NewPasswordForm {
  oldPassword: String?,
  newPassword: String?
}
type KeyRevokeForm {
  id: Integer
}
type GenerateKeyResponse {
  id: String,
  key: String,
  label: String?
}
