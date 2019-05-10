package community.flock.eco.holidays.controllers;

import community.flock.eco.feature.user.model.User
import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.model.HolidayForm
import community.flock.eco.holidays.repository.HolidayRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
class HolidayController(
        private val holidayRepository: HolidayRepository) {

    @GetMapping("/api/holidays")
    fun findAllHolidays(principal: Principal): Iterable<Holiday> {
        val token = principal as UsernamePasswordAuthenticationToken
        val user = token.principal as User
        return holidayRepository.findAllByUser(user)
    }

    @PostMapping("/api/holidays")
    fun postHolidays(@RequestBody holidayForm: HolidayForm, principal: Principal): MutableIterable<Holiday> {
        val token = principal as UsernamePasswordAuthenticationToken
        val user = token.principal as User
        holidayRepository.save(holidayForm.createHoliday(holidayForm, user))
        return holidayRepository.findAll()
    }

    @PutMapping("/api/holidays/{id}")
    fun putMapping(@PathVariable id: Long, @RequestBody holidayForm: HolidayForm, principal: Principal): MutableIterable<Holiday> {
        val token = principal as UsernamePasswordAuthenticationToken
        val user = token.principal as User
        holidayRepository.save(holidayForm.updateHoliday(user))
        return holidayRepository.findAll()
    }

    @DeleteMapping("/api/holidays/{id}")
    fun deleteHolidays(@PathVariable id: Long): MutableIterable<Holiday> {
        holidayRepository.deleteById(id)
        return holidayRepository.findAll()
    }
}
