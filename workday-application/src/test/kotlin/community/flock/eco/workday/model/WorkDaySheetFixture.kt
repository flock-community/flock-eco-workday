package community.flock.eco.workday.model

import community.flock.eco.workday.application.model.WorkDaySheet
import java.util.UUID

fun aWorkDaySheet() = WorkDaySheet("some-sheet", UUID.fromString("51b23e2e-bb80-45d3-aac5-f764aa7b2fc3"))
