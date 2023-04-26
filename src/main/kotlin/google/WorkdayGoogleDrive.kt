package community.flock.eco.workday.google

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.model.File
import com.google.api.services.drive.model.Permission
import com.google.auth.http.HttpCredentialsAdapter
import com.google.auth.oauth2.GoogleCredentials
import community.flock.eco.feature.user.services.UserAccountService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component


@Component
class WorkdayGoogleDrive(
    workdayGoogleCredentials: GoogleCredentials?,
    private val userAccountService: UserAccountService
) {
    companion object {
        private const val fields = "id, name, owners(permissionId, displayName, emailAddress), webViewLink"
    }

    private val drive: Drive? = if (workdayGoogleCredentials != null)
        Drive.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            HttpCredentialsAdapter(workdayGoogleCredentials)
        )
            .setApplicationName("Workday")
            .build()
    else (null)

    fun cloneAndShareFile(fileId: String, title: String): File =
        drive!!.files().copy(fileId,
            File().apply {
                name = title
            }).setFields(fields)
            .execute()
            .also {
                shareOrMoveFile(it)
            }

    private fun shareOrMoveFile(file: File) {
        val email = getUserEmail()
        val currentEmail = file.owners.first().emailAddress
        if (isDomainEqual(email, currentEmail)) moveOwnerShip(file.id, email) else shareFile(file.id, email)
    }

    private fun isDomainEqual(mail1: String, mail2: String) = mail1.substringAfter('@') == mail2.substringAfter('@')

    private fun moveOwnerShip(fileId: String, email: String) =
        Permission()
            .apply {
                type = "user"
                role = "owner"
                emailAddress = email
            }
            .let {
                drive!!.permissions().create(fileId, it).also { pm -> pm.transferOwnership = true }.execute()
            }

    private fun shareFile(fileId: String, email: String) =
        Permission()
            .apply {
                type = "user"
                role = "writer"
                emailAddress = email
            }
            .let {
                drive!!.permissions().create(fileId, it).execute()
            }

    private fun getUserEmail(): String = userAccountService.findUserAccountByUserCode(
        SecurityContextHolder.getContext().authentication.name
    ).first().user.email
}
