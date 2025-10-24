package community.flock.eco.workday.application

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class ApplicationConstants {
    @Value("\${workday.average_sick_days}")
    lateinit var averageSickDays: String

    @Value("\${workday.average_training_days}")
    lateinit var averageTrainingDays: String

    @Value("\${workday.average_holi_days}")
    lateinit var averageHoliDays: String

    @Value("\${workday.average_public_days}")
    lateinit var averagePublicDays: String
}
