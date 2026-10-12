package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.model.Document

data class ClientForm(
    val name: String,
    val logo: Document? = null,
)
