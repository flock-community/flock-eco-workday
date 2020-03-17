package community.flock.eco.workday

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class ApplicationConstants {

    @Value("\${workday.average_sickday}")
    lateinit var averageSickday: String

    @Value("\${workday.holidays}")
    lateinit var holidays: String

    @Value("\${workday.extradays}")
    lateinit var extradays: String
}
