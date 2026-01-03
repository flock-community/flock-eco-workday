endpoint GetStatus GET /api/exactonline/status -> {
  200 -> Unit
}
endpoint GetRedirect GET /api/exactonline/redirect ? {code: String} -> {
  200 -> Unit
}
endpoint GetAuthorize GET /api/exactonline/authorize ? {redirect_url: String?} -> {
  200 -> Unit
}
endpoint GetAccountsAll GET /api/exactonline/accounts -> {
  200 -> Unit
}
