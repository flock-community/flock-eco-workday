package config

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

@ControllerAdvice
class ControllerConfig : ResponseEntityExceptionHandler() {
    val logger = LoggerFactory.getLogger("community.flock.eco.workday.controllers")

    @ExceptionHandler
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handle(e: HttpMessageNotReadableException) = println(e)
}
