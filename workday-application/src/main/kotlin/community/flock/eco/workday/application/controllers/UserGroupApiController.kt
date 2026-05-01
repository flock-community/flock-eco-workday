package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteUserGroup
import community.flock.eco.workday.api.endpoint.GetUserGroupAll
import community.flock.eco.workday.api.endpoint.GetUserGroupByCode
import community.flock.eco.workday.api.endpoint.PostUserGroup
import community.flock.eco.workday.api.endpoint.PutUserGroup
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.forms.UserGroupForm
import community.flock.eco.workday.user.repositories.UserGroupRepository
import community.flock.eco.workday.user.services.UserGroupService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.UserGroup as UserGroupApi
import community.flock.eco.workday.user.model.UserGroup as UserGroupInternal

@RestController
class UserGroupApiController(
    private val userGroupService: UserGroupService,
    private val userGroupRepository: UserGroupRepository,
) : GetUserGroupAll.Handler,
    GetUserGroupByCode.Handler,
    PostUserGroup.Handler,
    PutUserGroup.Handler,
    DeleteUserGroup.Handler {
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun getUserGroupAll(request: GetUserGroupAll.Request): GetUserGroupAll.Response<*> {
        val search = request.queries.search ?: ""
        val pageable =
            PageRequest.of(
                request.queries.page ?: 0,
                request.queries.size ?: 20,
                request.queries.sort?.toSort() ?: Sort.unsorted(),
            )
        val groups =
            userGroupRepository
                .findAllByNameIgnoreCaseContaining(search, pageable)
                .map { it.externalize() }
                .toList()
        return GetUserGroupAll.Response200(groups)
    }

    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun getUserGroupByCode(request: GetUserGroupByCode.Request): GetUserGroupByCode.Response<*> {
        val group =
            userGroupRepository.findByCode(request.path.code).toNullable()
                ?: error("UserGroup with code ${request.path.code} not found")
        return GetUserGroupByCode.Response200(group.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun postUserGroup(request: PostUserGroup.Request): PostUserGroup.Response<*> {
        val group = userGroupService.create(request.body.internalize())
        return PostUserGroup.Response200(group.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun putUserGroup(request: PutUserGroup.Request): PutUserGroup.Response<*> {
        val group =
            userGroupService.update(request.path.code, request.body.internalize())
                ?: error("UserGroup with code ${request.path.code} not found")
        return PutUserGroup.Response200(group.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun deleteUserGroup(request: DeleteUserGroup.Request): DeleteUserGroup.Response<*> {
        userGroupService.delete(request.path.code)
        return DeleteUserGroup.Response200(Unit)
    }

    private fun UserGroupInternal.externalize(): UserGroupApi =
        UserGroupApi(
            id = code,
            name = name,
            users = users.map { it.code },
        )

    private fun community.flock.eco.workday.api.model.UserGroupForm.internalize(): UserGroupForm =
        UserGroupForm(
            name = name,
            users = users?.toSet() ?: emptySet(),
        )

    private fun String.toSort(): Sort =
        split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .let { parts ->
                when {
                    parts.isEmpty() -> Sort.unsorted()
                    parts.size == 1 -> Sort.by(parts[0])
                    parts.last().equals("asc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.ASC, *parts.dropLast(1).toTypedArray())
                    parts.last().equals("desc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.DESC, *parts.dropLast(1).toTypedArray())
                    else -> Sort.by(*parts.toTypedArray())
                }
            }
}
