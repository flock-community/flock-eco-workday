package community.flock.eco.workday.core.model

data class Page<T>(
    val totalPages: Int,
    val totalElements: Long,
    val content: List<T>,
) {
    fun <U> map(block: (T) -> U): Page<U> = Page(totalPages, totalElements, content.map(block))
}
