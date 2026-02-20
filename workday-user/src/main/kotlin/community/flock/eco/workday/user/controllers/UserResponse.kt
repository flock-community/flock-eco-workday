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
    val type: String
    val created: LocalDateTime?
}

data class UserAccountPasswordResponse(
    override val id: String,
    override val type: String = "PASSWORD",
    override val created: LocalDateTime? = null,
) : UserAccountResponse

data class UserAccountOauthResponse(
    override val id: String,
    override val type: String = "OAUTH",
    override val created: LocalDateTime? = null,
    val provider: String?,
) : UserAccountResponse

data class UserAccountKeyResponse(
    override val id: String,
    override val type: String = "KEY",
    override val created: LocalDateTime? = null,
    val label: String?,
) : UserAccountResponse
