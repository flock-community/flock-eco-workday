package community.flock.eco.workday.user.model

enum class UserAccountOauthProvider(
    @Suppress("UNUSED_PARAMETER") name: String,
) {
    GOOGLE("google"),
    FACEBOOK("facebook"),
    GITHUB("github"),
    KRATOS("kratos"),
}
