package community.flock.eco.workday.forms

data class PersonForm(
    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,
    val active: Boolean,
    val userCode: String?,
    val reminders: Boolean = false,
)
