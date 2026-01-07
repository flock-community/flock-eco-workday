package community.flock.eco.workday.application.utils

import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Pageable
import community.flock.eco.workday.domain.common.Sort

fun toDomain(page: Int, size: Int, sort: List<String>, defaultSort: List<Sort>? = null): Pageable =
    Pageable(
        page = page,
        size = size,
        sort = sort.consumeSorting(defaultSort),
    )

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
 * NOTE: Current implementation only supports a single sort and will always sort asc
 * e.g. date,desc will sort by date ascending
 */
private fun List<String>?.consumeSorting(defaultSort: List<Sort>?): List<Sort>? =
    this
        ?.firstOrNull()
        ?.split(",")
        ?.let { s -> listOf(Sort(s.first(), Direction.ASC)) }
        ?: defaultSort
