package community.flock.eco.workday.application.config

import com.google.api.gax.core.CredentialsProvider
import community.flock.eco.workday.application.common.google.WorkdayGoogleDrive
import community.flock.eco.workday.application.common.google.WorkdayGoogleSheets
import community.flock.eco.workday.application.workday.service.WorkDaySheetExportService
import community.flock.eco.workday.user.services.UserAccountService
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty(
    prefix = "flock.eco.workday.google",
    name = ["enabled"],
    havingValue = "true",
    matchIfMissing = true,
)
class GoogleDriveConfiguration {
    //    @Bean
//    fun googleCredentialsProvider(): CredentialsProvider {
//        return GoogleCredentialsProvider.newBuilder().build()
//    }

    @Bean
    fun workdayGoogleDrive(
        credentialsProvider: CredentialsProvider,
        userAccountService: UserAccountService,
    ): WorkdayGoogleDrive = WorkdayGoogleDrive(credentialsProvider, userAccountService)

    @Bean
    fun workdayGoogleSheets(credentialsProvider: CredentialsProvider): WorkdayGoogleSheets = WorkdayGoogleSheets(credentialsProvider)

    @Bean
    fun workDaySheet(
        workdayGoogleDrive: WorkdayGoogleDrive,
        workdayGoogleSheets: WorkdayGoogleSheets,
        @Value("\${google.drive.sheets.workday.templateId}") templateId: String,
    ): WorkDaySheetExportService = WorkDaySheetExportService(workdayGoogleDrive, workdayGoogleSheets, templateId)
}
