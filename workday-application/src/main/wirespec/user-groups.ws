endpoint GetUserGroupAll GET /api/user-groups ? {search: String?, ...SortedPaging} -> {
  200 -> UserGroup[] # { ...TotalCount }
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

// The name of a user group and the codes of its users
part UserGroupMembers {
  name: String?,
  users: String[]?
}
type UserGroup {
  id: String,
  ...UserGroupMembers
}
type UserGroupForm {
  ...UserGroupMembers
}
