package community.flock.eco.holidays.controllers;

import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.model.HolidayForm
import community.flock.eco.holidays.repository.HolidayRepository
import org.springframework.web.bind.annotation.*
import java.time.LocalDate


@RestController
class HolidayController (private val holidayRepository: HolidayRepository) {

    @GetMapping("/api/holidays")
    fun findAllHolidays() : MutableIterable<Holiday> {
        return holidayRepository.findAll();
    }

    @PostMapping("/api/holidays")
    fun postHolidays(@RequestBody holidayForm: HolidayForm): MutableIterable<Holiday> {
        holidayRepository.save(holidayForm.createHoliday(holidayForm))
        return holidayRepository.findAll();
    }

    @PutMapping("/api/holidays")
    fun putMapping(@RequestBody holidayForm: HolidayForm): MutableIterable<Holiday> {
        holidayRepository.save(holidayForm.updateHoliday())
        return holidayRepository.findAll();
    }

    @DeleteMapping("/api/holidays/{id}")
    fun deleteHolidays(@PathVariable id: Long): MutableIterable<Holiday> {
        holidayRepository.deleteById(id)
        return holidayRepository.findAll();
    }
}
