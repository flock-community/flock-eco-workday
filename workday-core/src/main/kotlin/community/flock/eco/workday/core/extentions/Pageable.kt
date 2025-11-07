package community.flock.eco.workday.core.extentions

data class Pageable(
    val page: Int?,
    val size: Int?,
    val sort: Sort?,
)

data class Sort(
    val order: String?,
    val direction: Direction?,
)

enum class Direction {
    ASC,
    DESC,
}
