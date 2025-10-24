package community.flock.eco.core.model

import javax.mail.internet.InternetAddress

data class MailMessage(
    val from: InternetAddress,
    val recipients: List<InternetAddress>,
    val subject: String,
    val text: String,
)
