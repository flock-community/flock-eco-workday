endpoint GetUserGroupAll GET /api/user-groups ? {search: String?, page: Integer32?, size: Integer32?, sort: String?} -> {
  200 -> UserGroup[] # { `x-total`: Integer32 }
}
endpoint GetUserGroupByCode GET /api/user-groups/{code: String} -> {
  200 -> UserGroup
}
endpoint PostUserGroup POST UserGroupForm /api/user-groups -> {
  200 -> UserGroup
}
endpoint PutUserGroup PUT UserGroupForm /api/user-groups/{code: String} -> {
  200 -> UserGroup
}
endpoint DeleteUserGroup DELETE /api/user-groups/{code: String} -> {
  200 -> Unit
}

type UserGroup {
  id: String,
  name: String?,
  users: String[]?
}
type UserGroupForm {
  name: String?,
  users: String[]?
}
