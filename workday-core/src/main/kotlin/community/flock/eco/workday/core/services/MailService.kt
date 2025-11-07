package community.flock.eco.workday.core.services

import community.flock.eco.workday.core.model.MailMessage

interface MailService {
    fun sendMail(message: MailMessage)
}
