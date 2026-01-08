package community.flock.eco.workday.domain.common

data class Pageable(
    val page: Int,
    val size: Int,
    val sort: List<Sort>?,
)

data class Sort(
    val property: String,
    val direction: Direction,
)

enum class Direction {
    ASC,
    DESC,
}
