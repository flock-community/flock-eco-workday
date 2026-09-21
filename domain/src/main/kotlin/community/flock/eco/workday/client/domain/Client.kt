package community.flock.eco.workday.client.domain

/** A customer that people are assigned to and that work days are billed to. */
data class Client(
    val internalId: Long,
    val code: String,
    val name: String,
)
