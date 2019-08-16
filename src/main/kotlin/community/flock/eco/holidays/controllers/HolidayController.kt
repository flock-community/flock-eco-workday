package community.flock.eco.holidays.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.holidays.authorities.HolidaysAuthority
import community.flock.eco.holidays.forms.HolidayForm
import community.flock.eco.holidays.model.DayType
import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.model.HolidaySummary
import community.flock.eco.holidays.repository.HolidayRepository
import community.flock.eco.holidays.services.HolidayService
import community.flock.eco.holidays.services.HolidaysSummaryService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/holidays")
class HolidayController(
        private val userRepository: UserRepository,
        private val holidayRepository: HolidayRepository,
        private val holidayService: HolidayService,
        private val holidaysSummaryService: HolidaysSummaryService) {

    @GetMapping
    @PreAuthorize("hasAuthority('HolidaysAuthority.READ')")
    fun findAll(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Holiday>> {

        return principal
                .findUser()
                ?.let {
                    if (userCode != null) {
                        if (userRepository.findByCode(userCode).isPresent) {
                            holidayRepository.findAllByUser(userRepository.findByCode(userCode).get())
                        } else {
                            listOf()
                        }
                    } else {
                        if (it.isAdmin()) {
                            holidayRepository.findAll()
                        } else {
                            holidayRepository.findAllByUser(it)
                        }

                    }
                }
                .toResponse()
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('HolidaysAuthority.ADMIN')")
    fun getSummary(@RequestParam(name = "type") typeFilter: DayType?, principal: Principal): ResponseEntity<HolidaySummary> {

        return principal
                .findUser()
                ?.let{
                    if(it.isAdmin()) {
                        holidaysSummaryService.getSummary(typeFilter)
                    } else {
                        HolidaySummary(0)
                    }
                }
                .toResponse()

    }

    @PostMapping
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun post(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> {
        return principal
                .findUser()
                ?.let {
                    if(!it.isAuthorizedForUserCode(form.userCode)) {
                        form.copy(userCode = it.code)
                    } else {
                        form.copy(userCode = form.userCode?:it.code)
                    }
                }
                ?.let {
                    holidayService.create(it)
                }
                .toResponse()
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun put(@PathVariable id: Long, @RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if(it.isAuthorizedForHoliday(id)){
                        holidayService.update(id, form)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }
                }
                .toResponse()
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HolidaysAuthority.WRITE')")
    fun delete(@PathVariable  id: Long, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if(it.isAuthorizedForHoliday(id)) {
                        holidayService.delete(id)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }

                }
                .toResponse()
    }

    private fun Principal.findUser(): User? = userRepository
            .findByReference(this.name)
            .toNullable()

    private fun User.isAdmin(): Boolean {
        return this.authorities.contains(HolidaysAuthority.ADMIN.toName())
    }

    private fun User.isAuthorizedForUserCode(userCode: String?): Boolean {
        return this.isAdmin() || this.code.equals(userCode)
    }

    private fun User.isAuthorizedForHoliday(id: Long): Boolean {
        return this.isAdmin() || this.equals(holidayRepository.findById(id).get().user)
    }

}
