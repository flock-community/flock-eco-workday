package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetUserAccountAll
import community.flock.eco.workday.api.endpoint.PostUserAccountGenerateKey
import community.flock.eco.workday.api.endpoint.PostUserAccountRevokeKey
import community.flock.eco.workday.api.endpoint.PutUserAccountNewPassword
import community.flock.eco.workday.api.endpoint.PutUserAccountResetPassword
import community.flock.eco.workday.user.repositories.UserAccountRepository
import community.flock.eco.workday.user.services.UserAccountService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.GenerateKeyResponse as GenerateKeyResponseApi
import community.flock.eco.workday.api.model.UserAccount as UserAccountApi
import community.flock.eco.workday.user.model.UserAccount as UserAccountInternal
import community.flock.eco.workday.user.model.UserAccountKey as UserAccountKeyInternal
import community.flock.eco.workday.user.model.UserAccountOauth as UserAccountOauthInternal
import community.flock.eco.workday.user.model.UserAccountPassword as UserAccountPasswordInternal

@RestController
class UserAccountApiController(
    private val userAccountRepository: UserAccountRepository,
    private val userAccountService: UserAccountService,
) : GetUserAccountAll.Handler,
    PutUserAccountResetPassword.Handler,
    PutUserAccountNewPassword.Handler,
    PostUserAccountGenerateKey.Handler,
    PostUserAccountRevokeKey.Handler {
    private fun authenticationName(): String = SecurityContextHolder.getContext().authentication.name

    @PreAuthorize("hasAuthority('UserAuthority.READ')")
    override suspend fun getUserAccountAll(request: GetUserAccountAll.Request): GetUserAccountAll.Response<*> {
        val pageable =
            PageRequest.of(
                request.queries.page ?: 0,
                request.queries.size ?: 20,
                request.queries.sort?.toSort() ?: Sort.unsorted(),
            )
        val accounts =
            userAccountRepository
                .findAll(pageable)
                .map { it.externalize() }
                .toList()
        return GetUserAccountAll.Response200(accounts)
    }

    override suspend fun putUserAccountResetPassword(
        request: PutUserAccountResetPassword.Request,
    ): PutUserAccountResetPassword.Response<*> {
        userAccountService.resetPasswordWithResetCode(request.body.resetCode, request.body.password)
        return PutUserAccountResetPassword.Response200(Unit)
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun putUserAccountNewPassword(request: PutUserAccountNewPassword.Request): PutUserAccountNewPassword.Response<*> {
        userAccountService.resetPasswordWithNew(
            authenticationName(),
            request.body.oldPassword,
            request.body.newPassword,
        )
        return PutUserAccountNewPassword.Response200(Unit)
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun postUserAccountGenerateKey(request: PostUserAccountGenerateKey.Request): PostUserAccountGenerateKey.Response<*> {
        val generated =
            userAccountService.generateKeyForUserCode(authenticationName(), request.body.label)
                ?: error("Could not generate key for current user")
        return PostUserAccountGenerateKey.Response200(
            GenerateKeyResponseApi(
                id = generated.id.toString(),
                key = generated.plainKey,
                label = generated.label,
            ),
        )
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun postUserAccountRevokeKey(request: PostUserAccountRevokeKey.Request): PostUserAccountRevokeKey.Response<*> {
        userAccountService.revokeKeyByIdForUserCode(authenticationName(), request.body.id.toLong())
        return PostUserAccountRevokeKey.Response200(Unit)
    }

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
