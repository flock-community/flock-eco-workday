package community.flock.eco.workday.google.sheets

import community.flock.eco.workday.google.WorkdayGoogleDrive
import community.flock.eco.workday.google.WorkdayGoogleSheets
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.utils.toWorkWeeks
import org.springframework.beans.factory.annotation.Value
import java.time.DayOfWeek
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

private enum class Tag(val value: String) {
    WEEK_TABLE("#{weekTable}"),
    FROM_DATE("#{fromDate}"),
    TO_DATE("#{toDate}"),
    MONTH("#{month}"),
    ASSIGNMENT_DEVELOPER_FULL_NAME("#{personFullName}"),
    ASSIGNMENT_CLIENT_NAME("#{assignmentClientName}"),
    ASSIGNMENT_CLIENT_CODE("#{assignmentClientId}"),
    ASSIGNMENT_DEVELOPER_ROLE("#{assignmentDeveloperRole}"),
    ASSIGNMENT_CONTRACT_DATE_FROM("#{assignmentDateFrom}"),
    ASSIGNMENT_CONTRACT_DATE_TO("#{assignmentDateTo}"),
    EXPORT_DATE("#{exportDate}"),
}

class WorkDaySheet(
    private val drive: WorkdayGoogleDrive,
    private val sheets: WorkdayGoogleSheets,
    private val templateId: String,
) {
    fun export(workday: WorkDay): String {
        val file = drive.cloneAndShareFile(templateId, buildFileName(workday))
        file.also {
            replaceSimpleTags(it.id, workday)
            insertTable(it.id, workday)
        }
        return file.webViewLink
    }

    private fun insertTable(
        id: String,
        workday: WorkDay,
    ) {
        val weekRows =
            workday.toWorkWeeks().flatMap { (weekNumber, workedDays) ->
                listOf(
                    listOf(
                        listOf(""),
                        DayOfWeek.values().map { dayOfWeek ->
                            workedDays.firstOrNull { it.date.dayOfWeek.value == dayOfWeek.value }?.date?.format(
                                DateTimeFormatter.ofPattern("YYYY-MM-dd"),
                            ) ?: ""
                        },
                        listOf(""),
                    ).flatten(),
                    listOf(
                        listOf(weekNumber),
                        DayOfWeek.values().map { dayOfWeek ->
                            workedDays.firstOrNull { it.date.dayOfWeek.value == dayOfWeek.value }?.value ?: ""
                        },
                        listOf(workedDays.sumOf { it.value }),
                    ).flatten(),
                )
            }
        sheets.findCellAndInsertRowByTag(id, Tag.WEEK_TABLE.value, weekRows)
    }

    private fun replaceSimpleTags(
        id: String,
        workday: WorkDay,
    ) {
        sheets.findAndReplaceCellByTag(
            id,
            Tag.ASSIGNMENT_DEVELOPER_FULL_NAME.value,
            workday.assignment.person.getFullName(),
        )
        sheets.findAndReplaceCellByTag(id, Tag.FROM_DATE.value, workday.from.format(DateTimeFormatter.ISO_DATE))
        sheets.findAndReplaceCellByTag(id, Tag.TO_DATE.value, workday.to.format(DateTimeFormatter.ISO_DATE))
        sheets.findAndReplaceCellByTag(id, Tag.MONTH.value, workday.from.month.name)
        sheets.findAndReplaceCellByTag(id, Tag.ASSIGNMENT_CLIENT_NAME.value, workday.assignment.client.name)
        sheets.findAndReplaceCellByTag(id, Tag.ASSIGNMENT_CLIENT_CODE.value, workday.assignment.client.code)
        sheets.findAndReplaceCellByTag(id, Tag.ASSIGNMENT_DEVELOPER_ROLE.value, workday.assignment.role ?: "-")
        sheets.findAndReplaceCellByTag(
            id,
            Tag.ASSIGNMENT_CONTRACT_DATE_FROM.value,
            workday.assignment.from.format(DateTimeFormatter.ISO_DATE),
        )
        sheets.findAndReplaceCellByTag(
            id,
            Tag.ASSIGNMENT_CONTRACT_DATE_TO.value,
            workday.assignment.to?.format(DateTimeFormatter.ISO_DATE) ?: "-",
        )
        sheets.findAndReplaceCellByTag(
            id,
            Tag.EXPORT_DATE.value,
            LocalDateTime.now().format(DateTimeFormatter.ISO_DATE) ?: "-",
        )
    }

    private fun buildFileName(workday: WorkDay): String {
        return "${
            LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            )
        } Workday ${workday.assignment.person.lastname} ${workday.from.month.name}"
    }
}
