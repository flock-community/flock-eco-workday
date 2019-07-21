package community.flock.eco.holidays.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.holidays.authorities.HolidaysAuthority
import community.flock.eco.holidays.forms.HolidayForm
import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.repository.HolidayRepository
import community.flock.eco.holidays.services.HolidayService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/holidays")
class HolidayController(
        private val userRepository: UserRepository,
        private val holidayRepository: HolidayRepository,
        private val holidayService: HolidayService) {

    @GetMapping
    fun findAll(@RequestParam(required = false) userId: Long?, principal: Principal): ResponseEntity<Iterable<Holiday>> {
        return principal
                .findUser()
                ?.let {
                    if (userId != null) {
                        if (userRepository.findById(userId).isPresent) {
                            holidayRepository.findAllByUser(userRepository.findById(userId).get())
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

    @PostMapping
    fun post(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> {
        return principal
                .findUser()
                ?.let { user ->
                    holidayService.create(form, user)
                }
                .toResponse()


    }

    private fun Principal.findUser(): User? = userRepository
            .findByReference(this.name)
            .toNullable()

    private fun User.isAdmin(): Boolean {
        return this.authorities.contains(HolidaysAuthority.SUPER_USER.toName())
    }

}
