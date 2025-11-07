package community.flock.eco.workday.forms

import community.flock.eco.workday.application.forms.WorkDayForm
import java.time.LocalDate

fun aWorkDayForm() =
    WorkDayForm(
        from = LocalDate.of(2020, 1, 1),
        to = LocalDate.of(2020, 3, 31),
        assignmentCode = "some-assignment-code",
        hours = 50.0,
        sheets =
            listOf(
                aWorkDaySheetForm(),
            ),
    )
