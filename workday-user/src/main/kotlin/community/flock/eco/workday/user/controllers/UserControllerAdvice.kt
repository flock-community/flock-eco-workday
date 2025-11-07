package community.flock.eco.workday.user.controllers

import community.flock.eco.workday.core.exceptions.FlockEcoException
import community.flock.eco.workday.user.exceptions.UserAccountExistsException
import community.flock.eco.workday.user.exceptions.UserAccountNotFoundForUserCode
import community.flock.eco.workday.user.exceptions.UserAccountNotFoundForUserEmail
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.CONFLICT
import org.springframework.http.HttpStatus.NO_CONTENT
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class UserControllerAdvice {
    @ExceptionHandler(UserAccountExistsException::class)
    fun handleUserAccountWithEmailExistsException(e: UserAccountExistsException) = respond(e, CONFLICT)

    @ExceptionHandler(UserAccountNotFoundForUserCode::class)
    fun handleUserAccountNotFoundForUser(e: UserAccountNotFoundForUserCode) = respond(NO_CONTENT)

    @ExceptionHandler(UserAccountNotFoundForUserEmail::class)
    fun handleUserAccountNotFoundForUser(e: UserAccountNotFoundForUserEmail) = respond(NO_CONTENT)

    private fun respond(status: HttpStatus) = ResponseEntity<String>(status)

    private fun respond(
        e: FlockEcoException,
        status: HttpStatus,
    ) = ResponseEntity<String>(e.message, status)
}
