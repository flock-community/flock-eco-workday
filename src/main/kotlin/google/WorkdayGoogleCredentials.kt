package community.flock.eco.workday.google

import com.google.api.services.drive.DriveScopes
import com.google.api.services.sheets.v4.SheetsScopes
import com.google.auth.oauth2.GoogleCredentials
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.IOException

@Configuration
class WorkdayGoogleCredentials(@Value("\${google.serviceToken}") private val serviceToken: String?) {

    private val scopes: List<String> = listOf(
        DriveScopes.DRIVE,
        DriveScopes.DRIVE_FILE,
        DriveScopes.DRIVE_READONLY,
        DriveScopes.DRIVE_METADATA,
        DriveScopes.DRIVE_METADATA_READONLY,
        SheetsScopes.SPREADSHEETS,
        SheetsScopes.DRIVE_FILE
    )

    @get:Bean
    val workdayGoogleCredentials: GoogleCredentials =
        try {
            GoogleCredentials.getApplicationDefault()
        } catch (e: IOException) {
            GoogleCredentials.fromStream(serviceToken?.byteInputStream()).createScoped(scopes)
        }
}
