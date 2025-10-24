package extentions

import community.flock.eco.core.graphql.kotlin.Direction
import community.flock.eco.core.graphql.kotlin.Pageable
import community.flock.eco.core.utils.toNullable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

fun Pageable?.consume(): PageRequest =
    when {
        this != null && sort == null -> PageRequest.of(page ?: 1, size ?: 10)
        this != null && sort != null -> PageRequest.of(page ?: 1, size ?: 10, sort.direction.consume(), sort.order)
        else -> PageRequest.of(0, 10)
    }

private fun Direction?.consume(): Sort.Direction =
    this
        ?.run {
            Sort.Direction
                .fromOptionalString(name)
                .toNullable()
        }
        ?: Sort.DEFAULT_DIRECTION
