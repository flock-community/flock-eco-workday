package community.flock.eco.workday.authentication

data class KratosIdentity(
    val userId: UserId,
    val emailAddress: EmailAddress

) {
    @JvmInline
    value class UserId(val value: String)

    @JvmInline
    value class EmailAddress(val value: String)
}
