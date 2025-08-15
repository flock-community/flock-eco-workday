package community.flock.eco.workday.config

import community.flock.eco.workday.google.WorkdayGoogleDrive
import community.flock.eco.workday.google.WorkdayGoogleSheets
import community.flock.eco.workday.google.sheets.WorkDaySheet
import com.google.api.gax.core.CredentialsProvider
import community.flock.eco.feature.user.services.UserAccountService
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty(
    prefix = "flock.eco.workday.google",
    name = ["enabled"],
    havingValue = "true",
    matchIfMissing = true
)
class GoogleDriveConfiguration {

    @Bean
    fun workdayGoogleDrive(
        credentialsProvider: CredentialsProvider,
        userAccountService: UserAccountService
    ): WorkdayGoogleDrive {
        return WorkdayGoogleDrive(credentialsProvider, userAccountService)
    }

    @Bean
    fun workdayGoogleSheets(credentialsProvider: CredentialsProvider): WorkdayGoogleSheets {
        return WorkdayGoogleSheets(credentialsProvider)
    }

    @Bean
    fun workDaySheet(
        workdayGoogleDrive: WorkdayGoogleDrive,
        workdayGoogleSheets: WorkdayGoogleSheets,
        @Value("\${google.drive.sheets.workday.templateId}") templateId: String
    ): WorkDaySheet {
        return WorkDaySheet(workdayGoogleDrive, workdayGoogleSheets, templateId)
    }
}