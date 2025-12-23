package community.flock.eco.workday.core.model

import jakarta.mail.internet.InternetAddress

data class MailMessage(
    val from: InternetAddress,
    val recipients: List<InternetAddress>,
    val subject: String,
    val text: String,
)
