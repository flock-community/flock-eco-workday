package community.flock.eco.feature.user.controllers

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.forms.UserGroupForm
import community.flock.eco.feature.user.model.UserGroup
import community.flock.eco.feature.user.repositories.UserGroupRepository
import community.flock.eco.feature.user.services.UserGroupService
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.feature.user.graphql.kotlin.UserGroup as UserGroupGraphql

@RestController
@RequestMapping("/api/user-groups")
class UserGroupController(
    private val userGroupService: UserGroupService,
    private val userGroupRepository: UserGroupRepository,
) {
    @GetMapping()
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findAllUserGroups(
        @RequestParam(defaultValue = "", required = false) search: String,
        page: Pageable,
    ) = userGroupRepository
        .findAllByNameIgnoreCaseContaining(search, page)
        .map { it.toGraphql() }
        .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    fun findUserGroupById(
        @PathVariable code: String,
    ) = userGroupRepository
        .findByCode(code)
        .toNullable()
        ?.toGraphql()
        .toResponse()

    @PostMapping()
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun createUserGroup(
        @RequestBody form: UserGroupForm,
    ) = userGroupService
        .create(form)
        .toGraphql()
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun updateUserGroup(
        @RequestBody form: UserGroupForm,
        @PathVariable code: String,
    ) = userGroupService
        .update(code, form)
        ?.toGraphql()
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    fun deleteUserGroup(
        @PathVariable code: String,
    ) = userGroupService
        .delete(code)
        .toResponse()
}

fun UserGroup.toGraphql() =
    UserGroupGraphql(
        id = code,
        name = name,
        users = users.map { it.code },
    )
