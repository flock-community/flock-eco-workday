package community.flock.eco.workday.core.utils

import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Page
import community.flock.eco.workday.domain.common.Pageable
import community.flock.eco.workday.domain.common.Sort
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Page as PageEntity
import org.springframework.data.domain.Sort as SpringSort

fun <ENTITY> PageEntity<ENTITY>.toDomainPage(): Page<ENTITY> =
    Page(
        totalPages = totalPages,
        totalElements = totalElements,
        content = content,
    )

fun <ENTITY, DOMAIN> PageEntity<ENTITY>.toDomainPage(entityMapper: ENTITY.() -> (DOMAIN)): Page<DOMAIN> =
    Page(
        totalPages = totalPages,
        totalElements = totalElements,
        content = content.map { entityMapper(it) },
    )

fun PageRequest.toDomain(): Pageable {
    val toList = sort.toList()
    return Pageable(
        page = pageNumber,
        size = pageSize,
        sort =
            toList.map { s ->
                Sort(
                    property = s.property,
                    direction = s.direction.toDomain(),
                )
            },
    )
}

private fun SpringSort.Direction.toDomain(): Direction =
    when (this) {
        SpringSort.Direction.ASC -> Direction.ASC
        SpringSort.Direction.DESC -> Direction.DESC
    }

fun Pageable.toEntity(): PageRequest {
    val sort1 = sort
    return if (sort1 == null) {
        PageRequest.of(page, size)
    } else {
        PageRequest.of(
            page,
            size,
            sort1
                .map { SpringSort.by(it.direction.toEntity(), it.property) }
                .reduce { acc, sort -> acc.and(sort) },
        )
    }
}

fun Direction.toEntity(): SpringSort.Direction =
    when (this) {
        Direction.ASC -> SpringSort.Direction.ASC
        Direction.DESC -> SpringSort.Direction.DESC
    }
