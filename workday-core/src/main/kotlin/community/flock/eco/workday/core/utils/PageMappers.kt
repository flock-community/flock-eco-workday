package community.flock.eco.workday.core.utils

import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Page
import community.flock.eco.workday.domain.common.Pageable
import org.springframework.data.domain.Page as PageEntity
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import kotlin.collections.map

fun <ENTITY> PageEntity<ENTITY>.toDomainPage(): Page<ENTITY> = Page(
    totalPages = totalPages,
    totalElements = totalElements,
    content = content
)

fun <ENTITY,DOMAIN> PageEntity<ENTITY>.toDomainPage(entityMapper: ENTITY.() -> (DOMAIN)): Page<DOMAIN> = Page(
    totalPages = totalPages,
    totalElements = totalElements,
    content = content.map { entityMapper(it) }
)


fun Pageable.toEntity(): PageRequest {
    val sort1 = sort
    return if (sort1 == null) {
        PageRequest.of(page, size)
    } else {
        PageRequest.of(
            page,
            size,
            sort1.map { Sort.by(it.direction.toEntity(), it.property) }.reduce { acc, sort -> acc.and(sort) })
    }
}

fun Direction.toEntity(): Sort.Direction = when (this) {
    Direction.ASC -> Sort.Direction.ASC
    Direction.DESC -> Sort.Direction.DESC
}
