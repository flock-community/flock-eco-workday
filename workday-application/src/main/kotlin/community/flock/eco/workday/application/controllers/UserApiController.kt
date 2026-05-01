package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteUser
import community.flock.eco.workday.api.endpoint.GetUserAll
import community.flock.eco.workday.api.endpoint.GetUserByCode
import community.flock.eco.workday.api.endpoint.GetUserMe
import community.flock.eco.workday.api.endpoint.GetUserMeAccounts
import community.flock.eco.workday.api.endpoint.PostUser
import community.flock.eco.workday.api.endpoint.PostUserRegister
import community.flock.eco.workday.api.endpoint.PostUserSearch
import community.flock.eco.workday.api.endpoint.PutUser
import community.flock.eco.workday.api.endpoint.PutUserResetPassword
import community.flock.eco.workday.api.endpoint.PutUserResetPasswordByCode
import community.flock.eco.workday.user.exceptions.UserCannotRemoveOwnAccount
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.repositories.UserRepository
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.User as UserApi
import community.flock.eco.workday.api.model.UserAccount as UserAccountApi
import community.flock.eco.workday.user.model.User as UserInternal
import community.flock.eco.workday.user.model.UserAccount as UserAccountInternal
import community.flock.eco.workday.user.model.UserAccountKey as UserAccountKeyInternal
import community.flock.eco.workday.user.model.UserAccountOauth as UserAccountOauthInternal
import community.flock.eco.workday.user.model.UserAccountPassword as UserAccountPasswordInternal

@RestController
class UserApiController(
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val userAccountService: UserAccountService,
) : GetUserAll.Handler,
    GetUserByCode.Handler,
    GetUserMe.Handler,
    GetUserMeAccounts.Handler,
    PostUser.Handler,
    PutUser.Handler,
    DeleteUser.Handler,
    PostUserSearch.Handler,
    PutUserResetPassword.Handler,
    PutUserResetPasswordByCode.Handler,
    PostUserRegister.Handler {
    private fun authenticationName(): String = SecurityContextHolder.getContext().authentication.name

    @PreAuthorize("isAuthenticated()")
    override suspend fun getUserMe(request: GetUserMe.Request): GetUserMe.Response<*> {
        val user =
            userService.read(authenticationName())
                ?: error("User not found")
        return GetUserMe.Response200(user.externalize())
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun getUserMeAccounts(request: GetUserMeAccounts.Request): GetUserMeAccounts.Response<*> {
        val accounts =
            userAccountService
                .findUserAccountByUserCode(authenticationName())
                .toList()
                .map { it.externalize() }
        return GetUserMeAccounts.Response200(accounts)
    }

    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun getUserAll(request: GetUserAll.Request): GetUserAll.Response<*> {
        val search = request.queries.search ?: ""
        val pageable =
            PageRequest.of(
                request.queries.page ?: 0,
                request.queries.size ?: 20,
                request.queries.sort?.toSort() ?: Sort.unsorted(),
            )
        val page =
            userRepository
                .findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(search, search, pageable)
        return GetUserAll.Response200(
            body = page.map { it.externalize() }.toList(),
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun postUserSearch(request: PostUserSearch.Request): PostUserSearch.Response<*> {
        val users =
            userRepository
                .findAllByCodeIn(request.body.toSet())
                .toList()
                .map { it.externalize() }
        return PostUserSearch.Response200(users)
    }

    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun getUserByCode(request: GetUserByCode.Request): GetUserByCode.Response<*> {
        val user =
            userService.read(request.path.code)
                ?: error("User with code ${request.path.code} not found")
        return GetUserByCode.Response200(user.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun postUser(request: PostUser.Request): PostUser.Response<*> {
        val user = userService.create(request.body.internalize())
        return PostUser.Response200(user.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun putUser(request: PutUser.Request): PutUser.Response<*> {
        val user =
            userService.update(request.path.code, request.body.internalize())
                ?: error("User with code ${request.path.code} not found")
        return PutUser.Response200(user.externalize())
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun deleteUser(request: DeleteUser.Request): DeleteUser.Response<*> {
        if (authenticationName() == request.path.code) throw UserCannotRemoveOwnAccount()
        userService.delete(request.path.code)
        return DeleteUser.Response200(Unit)
    }

    @PreAuthorize("hasAuthority('UserAuthority.WRITE')")
    override suspend fun putUserResetPasswordByCode(request: PutUserResetPasswordByCode.Request): PutUserResetPasswordByCode.Response<*> {
        userAccountService.generateResetCodeForUserCode(request.path.code)
        return PutUserResetPasswordByCode.Response200(Unit)
    }

    override suspend fun putUserResetPassword(request: PutUserResetPassword.Request): PutUserResetPassword.Response<*> {
        userAccountService.generateResetCodeForUserEmail(request.body.email)
        return PutUserResetPassword.Response200(Unit)
    }

    override suspend fun postUserRegister(request: PostUserRegister.Request): PostUserRegister.Response<*> {
        val account =
            userAccountService.createUserAccountPassword(
                UserAccountPasswordForm(
                    email = request.body.email,
                    name = request.body.name,
                    password = request.body.password,
                    authorities = request.body.authorities?.toSet() ?: emptySet(),
                ),
            )
        return PostUserRegister.Response200(account.externalize())
    }

    private fun UserInternal.externalize(): UserApi =
        UserApi(
            id = code,
            name = name,
            email = email,
            authorities = authorities.toList(),
            accounts = accounts.map { it.externalize() },
            created = created.toString(),
        )

    private fun UserAccountInternal.externalize(): UserAccountApi =
        when (this) {
            is UserAccountPasswordInternal ->
                UserAccountApi(
                    id = id.toString(),
                    type = "PASSWORD",
                    created = created.toString(),
                    label = null,
                    provider = null,
                )
            is UserAccountOauthInternal ->
                UserAccountApi(
                    id = id.toString(),
                    type = "OAUTH",
                    created = created.toString(),
                    label = null,
                    provider = provider.name,
                )
            is UserAccountKeyInternal ->
                UserAccountApi(
                    id = id.toString(),
                    type = "KEY",
                    created = created.toString(),
                    label = label,
                    provider = null,
                )
            else -> error("Cannot map UserAccount")
        }

    private fun community.flock.eco.workday.api.model.UserForm.internalize(): UserForm =
        UserForm(
            name = name,
            email = email,
            authorities = authorities?.toSet() ?: emptySet(),
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
