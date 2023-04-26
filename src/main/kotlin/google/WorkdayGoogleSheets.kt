package community.flock.eco.workday.google

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.gax.core.CredentialsProvider
import com.google.api.services.sheets.v4.Sheets
import com.google.api.services.sheets.v4.model.*
import com.google.auth.http.HttpCredentialsAdapter
import org.springframework.stereotype.Component

@Component
class WorkdayGoogleSheets(
    credentialsProvider: CredentialsProvider,
) {
    private val sheetsService = Sheets.Builder(
        GoogleNetHttpTransport.newTrustedTransport(),
        GsonFactory.getDefaultInstance(),
        HttpCredentialsAdapter(credentialsProvider.credentials)
    ).setApplicationName("Your Application Name").build()

    fun findAndReplaceCellByTag(sheetId: String, tag: String, newValue: String): BatchUpdateSpreadsheetResponse =
        BatchUpdateSpreadsheetRequest().apply {
            requests = listOf(
                Request().apply {
                    findReplace = FindReplaceRequest().apply {
                        find = tag
                        replacement = newValue
                        allSheets = true
                        matchCase = false
                    }
                }
            )
        }.let {
            sheetsService.spreadsheets().batchUpdate(sheetId, it).execute()
        }

    fun findCellAndInsertRowByTag(id: String, tag: String, values: List<List<Any?>>) {
        val range = findRangeByTag(id, tag) ?: return
        val cell1 = "${getColumnLetter(range.first)}${range.second}"
        val cell2 = "${getColumnLetter(range.first + 9)}${range.second + values.size}"
        val valueRange = ValueRange()
        valueRange.setRange("$cell1:$cell2")
        valueRange.setValues(values)
        val batchBody = BatchUpdateValuesRequest()
            .setValueInputOption("USER_ENTERED")
            .setData(listOf(valueRange))
        sheetsService.spreadsheets().values()
            .batchUpdate(id, batchBody)
            .execute()
    }

    private fun findRangeByTag(id: String, searchValue: String): Pair<Int, Int>? {
        val range = "A1:Z100"
        // Retrieve the values from the sheet
        val response = sheetsService!!.spreadsheets().values()
            .get(id, range)
            .execute()

        for ((rowIndex, row) in response.getValues().withIndex()) {
            for ((colIndex, cellValue) in row.withIndex()) {
                if (cellValue == searchValue) {
                    // Found the cell with the desired value
                    val row = rowIndex + 1
                    val col = colIndex + 1
                    return Pair(col, row)
                }
            }
        }
        return null
    }

    private fun getColumnLetter(columnIndex: Int): String {
        var dividend = columnIndex
        var columnLetter = ""
        while (dividend > 0) {
            val modulo = (dividend - 1) % 26
            columnLetter = (65 + modulo).toChar() + columnLetter
            dividend = (dividend - modulo) / 26
        }
        return columnLetter
    }
}
