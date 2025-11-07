package community.flock.eco.workday.user.controllers

import java.time.LocalDateTime

data class UserResponse(
    val id: String,
    val name: String?,
    val email: String?,
    val authorities: List<String?>?,
    val accounts: List<UserAccountResponse?>?,
    val created: LocalDateTime?,
)

data class UserGroupResponse(
    val id: String,
    val name: String?,
    val users: List<String?>?,
)

interface UserAccountResponse {
    val id: String
}

data class UserAccountPasswordResponse(
    override val id: String,
) : UserAccountResponse

data class UserAccountOauthResponse(
    override val id: String,
    val provider: String?,
) : UserAccountResponse

data class UserAccountKeyResponse(
    override val id: String,
    val key: String?,
) : UserAccountResponse
