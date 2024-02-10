package community.flock.eco.workday.controllers

import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.google.sheets.WorkDaySheet
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.WorkDayService
import community.flock.eco.workday.services.isUser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

data class ExportResponse(val link: String)

@RestController()
@RequestMapping("/export")
class GoogleExportController(
    private val service: WorkDayService,
    private val workdaySheet: WorkDaySheet,
) {
    private val log: Logger = LoggerFactory.getLogger(GoogleExportController::class.java)

    @PostMapping("/workday/{code}")
    fun exportWorkday(
        @PathVariable code: String,
        authentication: Authentication,
    ): ExportResponse {
        log.info("Exporting workday $code to google drive")
        val workday: WorkDay =
            service.findByCode(code)?.applyAuthentication(authentication)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Workday not found with Id $code")
        if (workday.days == null) {
            throw ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Workday days are empty for Id $code")
        }
        val link = workdaySheet.export(workday)
        return ExportResponse(link)
    }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(ExpenseAuthority.ADMIN.toName())

    private fun WorkDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!(authentication.isAdmin() || this.assignment.person.isUser(authentication.name))) {
                throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User has no access to workday: $code")
            }
        }
}
