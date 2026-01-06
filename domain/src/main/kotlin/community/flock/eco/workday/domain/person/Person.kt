package community.flock.eco.workday.domain.person

import community.flock.eco.workday.domain.user.User
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class Person(
    val internalIid: Long,
    val uuid: UUID,
    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,
    val birthdate: LocalDate?,
    val joinDate: LocalDate?,
    val active: Boolean,
    val lastActiveAt: Instant?,
    val reminders: Boolean,
    val receiveEmail: Boolean,
    val shoeSize: String?,
    val shirtSize: String?,
    val googleDriveId: String?,
    val user: User?,
) {
    fun getFullName(): String = "$firstname $lastname"

}
