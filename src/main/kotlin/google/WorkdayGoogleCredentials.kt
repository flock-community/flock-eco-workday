package community.flock.eco.workday.google

import com.google.api.services.drive.DriveScopes
import com.google.api.services.sheets.v4.SheetsScopes
import com.google.auth.oauth2.GoogleCredentials
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.IOException

@Configuration
class WorkdayGoogleCredentials(@Value("\${google.serviceToken}") private val serviceToken: String?) {

    private val log: Logger = LoggerFactory.getLogger(WorkdayGoogleCredentials::class.java)

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
    val workdayGoogleCredentials: GoogleCredentials? = loadCredentials()

    private fun loadCredentials():GoogleCredentials? {
        try {
            GoogleCredentials.getApplicationDefault().createScoped(scopes)
        } catch (e: IOException) {
            log.info("Google Credentials not found: switching to token")
        }
        if (serviceToken.isNullOrEmpty()) {
            log.error("Google Service Token not found: GoogleCredentials unavailable")
            return null
        }
        return GoogleCredentials.fromStream(serviceToken.byteInputStream()).createScoped(scopes)
    }
}
