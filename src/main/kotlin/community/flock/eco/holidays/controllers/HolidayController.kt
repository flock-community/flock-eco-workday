package community.flock.eco.holidays.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.model.HolidayForm
import community.flock.eco.holidays.repository.HolidayRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
class HolidayController(
        private val userRepository: UserRepository,
        private val holidayRepository: HolidayRepository) {

    @GetMapping("/api/holidays")
    fun findAllHolidays(principal: Principal): Iterable<Holiday> {
        return principal
                .findUser()
                ?.let { holidayRepository.findAllByUser(it) }
                ?: listOf()
    }

    @PostMapping("/api/holidays")
    fun postHolidays(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> = principal
            .findUser()
            ?.let { form.createHoliday(it) }
            ?.let { holidayRepository.save(it) }
            .toResponse()

    @PutMapping("/api/holidays/{id}")
    fun putMapping(@PathVariable id: Long, @RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Holiday> {
        return holidayRepository.findById(id)
                .toNullable()
                ?.let { holiday ->
                    principal
                            .findUser()
                            ?.let { user -> form.createHoliday(user).copy(id = holiday.id) }
                            ?.let { holidayRepository.save(it) }
                }
                .toResponse()
    }

    @DeleteMapping("/api/holidays/{id}")
    fun deleteHolidays(@PathVariable id: Long) {
        return holidayRepository.deleteById(id)
    }

    private fun Principal.findUser(): User? = userRepository
            .findByReference(this.name)
            .toNullable()

}
