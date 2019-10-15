package community.flock.eco.workday.forms

import java.time.LocalDate

data class AssignmentForm(

        val userCode:String,
        val clientCode:String,

        val startDate: LocalDate,
        val endDate: LocalDate
)
