package community.flock.eco.holidays.controllers;

import community.flock.eco.holidays.model.HolidayForm
import community.flock.eco.holidays.repository.HolidayRepository
import org.springframework.web.bind.annotation.*


@RestController
class HolidayController (private val holidayRepository: HolidayRepository) {

    @GetMapping("/api/holidays")
    fun findAllHolidays() {
        holidayRepository.findAll();
    }

    @PostMapping("/api/holidays")
    fun postHolidays(@RequestBody holidayForm: HolidayForm) {
        holidayRepository.save(holidayForm.createHoliday())
    }

    @PutMapping("/api/holidays")
    fun putMapping(@RequestBody holidayForm: HolidayForm) {
        holidayRepository.save(holidayForm.updateHoliday())
    }

    @DeleteMapping("/api/holidays/{id}")
    fun deleteHolidays(@PathVariable id: Long) {
        holidayRepository.deleteById(id)
    }
}
