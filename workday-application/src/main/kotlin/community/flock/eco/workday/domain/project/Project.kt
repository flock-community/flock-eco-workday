package community.flock.eco.workday.domain.project

/** A project an assignment can be part of, used to group assignments across clients. */
data class Project(
    val internalId: Long,
    val code: String,
    val name: String,
)
