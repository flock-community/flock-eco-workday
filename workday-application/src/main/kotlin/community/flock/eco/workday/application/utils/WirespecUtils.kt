package community.flock.eco.workday.application.utils

import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Pageable
import community.flock.eco.workday.domain.common.Sort
import org.springframework.data.domain.Sort as SpringSort

fun toDomain(
    page: Int,
    size: Int,
    sort: List<String>,
    defaultSort: List<Sort>? = null,
): Pageable =
    Pageable(
        page = page,
        size = size,
        sort = sort.consumeSorting(defaultSort),
    )

/**
 * Parses a wirespec-delivered sort list into a Spring [SpringSort].
 *
 * Wirespec splits comma-separated query values, so `?sort=from,desc` arrives as
 * `["from", "desc"]`. Pairs are interpreted as (property, direction); a trailing
 * unpaired token is treated as an ascending property.
 */
fun parseSort(sort: List<String>?): SpringSort {
    val tokens = sort?.map(String::trim)?.filter(String::isNotEmpty).orEmpty()
    if (tokens.isEmpty()) return SpringSort.unsorted()

    val orders = mutableListOf<SpringSort.Order>()
    var i = 0
    while (i < tokens.size) {
        val property = tokens[i]
        val direction = tokens.getOrNull(i + 1)?.let(::asDirection)
        if (direction != null) {
            orders += SpringSort.Order(direction, property)
            i += 2
        } else {
            orders += SpringSort.Order.asc(property)
            i += 1
        }
    }
    return SpringSort.by(orders)
}

private fun asDirection(token: String): SpringSort.Direction? =
    when {
        token.equals("asc", ignoreCase = true) -> SpringSort.Direction.ASC
        token.equals("desc", ignoreCase = true) -> SpringSort.Direction.DESC
        else -> null
    }

/**
 * Sorting parameters can be send in various formats.
 *
 * Workday isn't very specific on how to do this, so multiple things are seen. Would be good to generalize on this
 * --> and put this in the wirespec contracts too
 *
 * e.g.
 * - date,asc
 * - date desc, id
 * - person.personId, date desc
 *
 * NOTE: Current implementation only supports a sorts and will always sort desc
 * e.g. date desc will sort by date descending
 */
private fun List<String>?.consumeSorting(defaultSort: List<Sort>?): List<Sort>? =
    this
        ?.firstOrNull()
        ?.split(" ")
        ?.let { s -> listOf(Sort(s.first(), Direction.DESC)) }
        ?: defaultSort
