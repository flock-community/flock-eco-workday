package community.flock.eco.workday.services

import community.flock.eco.workday.controllers.WorkdayController
import community.flock.eco.workday.model.Type
import community.flock.eco.workday.repository.PeriodRepository
import org.springframework.stereotype.Service

@Service
class HolidaysSummaryService(val periodRepository: PeriodRepository) {
    fun getSummary(type: Type?): WorkdayController.HolidaySummary {
        var holidays = periodRepository.findAll();

        type?.let {
            holidays = holidays.filter { holiday ->
                it.equals(holiday.day.first().type)
            }
        }

        var totalHours: Long = 0
        var totalDays: Long = 0

        holidays.forEach {
            totalHours += it.day.stream().mapToInt { dayOff -> dayOff.hours }.sum()
            totalDays += it.day.size

        }

        return WorkdayController.HolidaySummary(totalHours, totalDays)
    }
}
