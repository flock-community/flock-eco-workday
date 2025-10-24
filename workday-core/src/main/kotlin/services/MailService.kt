package community.flock.eco.core.services

import community.flock.eco.core.model.MailMessage

interface MailService {
    fun sendMail(message: MailMessage)
}
