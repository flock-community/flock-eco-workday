endpoint FindUserGroupById GET /api/user-groups/{code: String} -> {
  200 -> UserGroup
}
endpoint UpdateUserGroup PUT UserGroupForm /api/user-groups/{code: String} -> {
  200 -> UserGroup
}
endpoint DeleteUserGroup DELETE /api/user-groups/{code: String} -> {
  200 -> Unit
}
endpoint FindAllUserGroups GET /api/user-groups ? {search: String?,page: Pageable} -> {
  200 -> UserGroup[]
}
endpoint CreateUserGroup POST UserGroupForm /api/user-groups -> {
  200 -> UserGroup
}

type UserGroupForm {
  name: String?,
  users: String[]?
}
type UserGroup {
  id: String?,
  name: String?,
  users: String[]?
}
