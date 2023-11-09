package community.flock.eco.workday.forms

import java.time.LocalDate

data class PersonForm(
    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null,
    val active: Boolean,
    val userCode: String?,
    val reminders: Boolean = false,
    val receiveEmail: Boolean = true,
    val shoeSize: String? = null,
    val shirtSize: String? = null,
)
