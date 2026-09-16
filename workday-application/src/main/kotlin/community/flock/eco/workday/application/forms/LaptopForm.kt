package community.flock.eco.workday.application.forms

import java.util.UUID

data class LaptopForm(
    val name: String,
    val serialNumber: String,
    val contractSigned: Boolean = false,
    val personId: UUID? = null,
)
