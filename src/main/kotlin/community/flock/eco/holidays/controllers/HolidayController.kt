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
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/holidays")
class HolidayController(
        private val userRepository: UserRepository,
        private val holidayRepository: HolidayRepository,
        private val holidayService: HolidayService) {

    @GetMapping
    fun findAll(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Holiday>> {

        val jerre = User(name = "Jerre van Veluw", email = "jerre@flock-se.com", authorities = setOf(HolidaysAuthority.USER.name), reference = "jerre");
        if(!userRepository.findByReference(jerre.reference).isPresent) {
            userRepository.save(jerre)
        }
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

    @PostMapping
    fun post(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> {
        return principal
                .findUser()
                ?.let {
                    if(!it.isAdmin()) {
                        form.copy(userCode = it.code)
                    } else {
                        form
                    }
                }
                ?.let {
                    holidayService.create(form)
                }
                .toResponse()
    }

    @PutMapping("/{id}")
    fun put(@PathVariable id: Long, @RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> {
        return principal
                .findUser()
                ?.let { user ->
                    holidayService.update(id, form)

                }
                .toResponse()
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable  id: Long, principal: Principal): ResponseEntity<Unit> {
        return principal
                .findUser()
                ?.let { user ->
                    holidayService.delete(id)
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
