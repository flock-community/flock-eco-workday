package community.flock.eco.core.utils

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.util.Optional

fun <T> Page<T>?.toResponse(): ResponseEntity<List<T>> =
    this
        ?.let {
            ResponseEntity(
                it.content.toList(),
                HttpHeaders().apply {
                    set("x-total", it.totalElements.toString())
                },
                HttpStatus.OK,
            )
        }
        ?: ResponseEntity.notFound().build()

@Deprecated("Page is already part of the request use Page<T>.toResponse()")
fun <T> Page<T>?.toResponse(page: Pageable): ResponseEntity<List<T>> =
    this
        ?.let {
            ResponseEntity(
                this.content.toList(),
                HttpHeaders().also {
                    it.set("x-page", page.pageNumber.toString())
                    it.set("x-total", this.totalElements.toString())
                },
                HttpStatus.OK,
            )
        }
        ?: ResponseEntity.notFound().build()

fun Unit.toResponse(): ResponseEntity<Unit> = ResponseEntity.noContent().build()

fun <T> Optional<T>.toResponse(): ResponseEntity<T> = toNullable().toResponse()

fun <T> T?.toResponse(): ResponseEntity<T> =
    when (this) {
        is Unit -> ResponseEntity.noContent().build<T>()
        null -> ResponseEntity.notFound().build<T>()
        else -> ResponseEntity.ok<T>(this)
    }

fun <T> Optional<T>.toNullable(): T? = orElse(null)
