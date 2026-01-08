package community.flock.eco.workday.core.extentions

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Pageable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

fun Pageable?.consume(): PageRequest {
    val sort1 = this?.sort
    return when {
        this != null && sort1 == null -> PageRequest.of(page ?: 1, size ?: 10)
        this != null && sort1 != null -> PageRequest.of(page ?: 1, size ?: 10, sort1.first().direction.consume(), sort1.first().property)
        else -> PageRequest.of(0, 10)
    }
}

private fun Direction?.consume(): Sort.Direction =
    this
        ?.run {
            Sort.Direction
                .fromOptionalString(name)
                .toNullable()
        }
        ?: Sort.DEFAULT_DIRECTION
