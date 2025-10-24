package community.flock.eco.workday.application.google

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.gax.core.CredentialsProvider
import com.google.api.services.drive.Drive
import com.google.api.services.drive.model.File
import com.google.api.services.drive.model.Permission
import com.google.auth.http.HttpCredentialsAdapter
import community.flock.eco.workday.user.services.UserAccountService
import org.springframework.security.core.context.SecurityContextHolder

class WorkdayGoogleDrive(
    credentialsProvider: CredentialsProvider,
    private val userAccountService: UserAccountService,
) {
    companion object {
        private const val FIELDS = "id, name, owners(permissionId, displayName, emailAddress), webViewLink"
    }

    private val drive: Drive =
        Drive.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            HttpCredentialsAdapter(credentialsProvider.credentials),
        )
            .setApplicationName("Workday")
            .build()

    fun cloneAndShareFile(
        fileId: String,
        title: String,
    ): File =
        drive.files().copy(
            fileId,
            File().apply {
                name = title
                parents = listOf("root")
            },
        )
            .setSupportsTeamDrives(true)
            .setFields(FIELDS)
            .execute()
            .also {
                shareOrMoveFile(it)
            }

    private fun shareOrMoveFile(file: File) {
        val email = getUserEmail()
        val currentEmail = file.owners.first().emailAddress
        if (isDomainEqual(email, currentEmail)) moveOwnerShip(file.id, email) else shareFile(file.id, email)
    }

    private fun isDomainEqual(
        mail1: String,
        mail2: String,
    ) = mail1.substringAfter('@') == mail2.substringAfter('@')

    private fun moveOwnerShip(
        fileId: String,
        email: String,
    ) = Permission()
        .apply {
            type = "user"
            role = "owner"
            emailAddress = email
        }
        .let {
            drive.permissions().create(fileId, it)
                .setSupportsAllDrives(true)
                .setTransferOwnership(true)
                .execute()
        }

    private fun shareFile(
        fileId: String,
        email: String,
    ) = Permission()
        .apply {
            type = "user"
            role = "writer"
            emailAddress = email
        }
        .let {
            drive.permissions().create(fileId, it)
                .setSupportsAllDrives(true)
                .execute()
        }

    private fun getUserEmail(): String =
        userAccountService.findUserAccountByUserCode(
            SecurityContextHolder.getContext().authentication.name,
        ).first().user.email
}
