package community.flock.eco.workday.model

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.domain.common.Status
import java.time.LocalDate

fun aWorkDay(assignment: Assignment = anAssignment()) =
    WorkDay(
        id = 3,
        code = "41b23e2e-bb80-45d3-aac5-f764aa7b2fc3",
        from = LocalDate.of(2024, 1, 1),
        to = LocalDate.of(2024, 1, 31),
        hours = 160.0,
        days = mutableListOf(),
        assignment = assignment,
        status = Status.REQUESTED,
        sheets =
            listOf(
                aWorkDaySheet(),
            ),
    )
