package community.flock.eco.workday.user.domain

enum class UserAccountOauthProvider(
    name: String,
) {
    GOOGLE("google"),
    FACEBOOK("facebook"),
    GITHUB("github"),
    KRATOS("kratos"),
}
