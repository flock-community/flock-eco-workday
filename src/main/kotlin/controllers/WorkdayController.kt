package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.authorities.HolidaysAuthority
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Type
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.services.PeriodService
import community.flock.eco.workday.services.HolidaysSummaryService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/workdays")
class WorkdayController(
        private val userRepository: UserRepository,
        private val periodRepository: PeriodRepository,
        private val periodService: PeriodService,
        private val holidaysSummaryService: HolidaysSummaryService) {

    data class HolidaySummary(
            val totalHours: Long = 0,
            val totalDays: Long = 0
    )

    @GetMapping
    @PreAuthorize("hasAuthority('HolidaysAuthority.READ')")
    fun findAll(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Period>> {

        return principal
                .findUser()
                ?.let {
                    if (userCode != null) {
                        if (userRepository.findByCode(userCode).isPresent) {
                            periodRepository.findAllByUser(userRepository.findByCode(userCode).get())
                        } else {
                            listOf()
                        }
                    } else {
                        if (it.isAdmin()) {
                            periodRepository.findAll()
                        } else {
                            periodRepository.findAllByUser(it)
                        }

                    }
                }
                .toResponse()
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('HolidaysAuthority.ADMIN')")
    fun getSummary(@RequestParam(name = "type") typeFilter: Type?, principal: Principal): ResponseEntity<HolidaySummary> {

        return principal
                .findUser()
                ?.let {
                    if (it.isAdmin()) {
                        holidaysSummaryService.getSummary(typeFilter)
                    } else {
                        HolidaySummary(0)
                    }
                }
                .toResponse()
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun post(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Period> {
        return principal
                .findUser()
                ?.let {
                    if (!it.isAuthorizedForUserCode(form.userCode)) {
                        form.copy(userCode = it.code)
                    } else {
                        form.copy(userCode = form.userCode ?: it.code)
                    }
                }
                ?.let {
                    periodService.create(it)
                }
                .toResponse()
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun put(@PathVariable id: Long, @RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if (it.isAuthorizedForHoliday(id)) {
                        periodService.update(id, form)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }
                }
                .toResponse()
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun delete(@PathVariable id: Long, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if (it.isAuthorizedForHoliday(id)) {
                        periodService.delete(id)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }

                }
                .toResponse()
    }

    private fun Principal.findUser(): User? = userRepository
            .findByCode(this.name)
            .toNullable()

    private fun User.isAdmin(): Boolean {
        return this.authorities.contains(HolidaysAuthority.ADMIN.toName())
    }

    private fun User.isAuthorizedForUserCode(userCode: String?): Boolean {
        return this.isAdmin() || this.code.equals(userCode)
    }

    private fun User.isAuthorizedForHoliday(id: Long): Boolean {
        return this.isAdmin() || this.equals(periodRepository.findById(id).get().user)
    }

}
