package community.flock.eco.feature.exactonline.model

import java.util.UUID

data class ExactonlineUser(
    val id: UUID,
    val name: String,
    val fullName: String,
    val employeeId: UUID,
    val divisionCustomer: UUID,
    val currentDivision: Int,
    val title: String,
    val initials: String?,
    val firstName: String,
    val middleName: String?,
    val lastName: String,
    val email: String,
)
