package community.flock.eco.workday.services

import com.mailjet.client.MailjetClient

interface IMailjetClientProvider {
    val client: MailjetClient
}
