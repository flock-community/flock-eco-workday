package community.flock.eco.workday.application.controllers

import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.exc.InvalidNullException
import com.fasterxml.jackson.databind.exc.MismatchedInputException
import community.flock.eco.workday.api.model.Error
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * A request body that does not satisfy the wirespec contract (a required field that is
 * missing or null, a value of the wrong JSON type) fails while wirespec deserializes it,
 * before the handler runs. Without this advice that surfaces as a 500; here it becomes a
 * 400 with the shared [Error] body naming the field. Wirespec resolves the request
 * reflectively, so the Jackson exception arrives wrapped; Spring matches handlers on the
 * cause chain.
 */
@RestControllerAdvice
class WirespecRequestBodyAdvice {
    @ExceptionHandler(MismatchedInputException::class)
    fun onMismatchedInput(e: MismatchedInputException): ResponseEntity<Error> {
        val field =
            (e as? InvalidNullException)?.propertyName?.simpleName
                ?: e.path
                    .mapNotNull { it.fieldName }
                    .joinToString(".")
                    .ifBlank { null }
        val message =
            when {
                field == null -> "Request body is invalid"
                e is InvalidNullException -> "$field is required"
                else -> "$field is invalid"
            }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Error(message))
    }

    /**
     * Any other value Jackson cannot map, such as an unknown enum constant: wirespec's
     * enum deserializer fails with a bare [JsonMappingException] rather than a
     * [MismatchedInputException]. The more specific handler above wins for those.
     */
    @ExceptionHandler(JsonMappingException::class)
    fun onJsonMapping(e: JsonMappingException): ResponseEntity<Error> {
        val field =
            e.path
                .mapNotNull { it.fieldName }
                .joinToString(".")
                .ifBlank { null }
        val message = field?.let { "$it is invalid" } ?: "Request body is invalid"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Error(message))
    }
}
