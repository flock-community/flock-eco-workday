package community.flock.eco.workday.services

import community.flock.eco.workday.model.DayType
import community.flock.eco.workday.model.HolidaySummary
import community.flock.eco.workday.repository.HolidayRepository
import org.springframework.stereotype.Service

@Service
class HolidaysSummaryService(val holidayRepository: HolidayRepository) {
    fun getSummary(dayType: DayType?) : HolidaySummary {
        var holidays = holidayRepository.findAll();

        dayType?.let {
            holidays = holidays.filter { holiday ->
                it.equals(holiday.dayOff.first().type)
            }
        }

        var totalHours : Long = 0
        var totalDays : Long = 0

        holidays.forEach {
            totalHours += it.dayOff.stream().mapToInt { dayOff -> dayOff.hours }.sum()
            totalDays += it.dayOff.size

        }

        return HolidaySummary(totalHours, totalDays)
    }
}