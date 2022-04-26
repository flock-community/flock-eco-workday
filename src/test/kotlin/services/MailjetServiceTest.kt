package services

import com.mailjet.client.MailjetClient
import com.mailjet.client.MailjetRequest
import community.flock.eco.workday.config.properties.MailjetProperties
import community.flock.eco.workday.config.properties.NotificationProperties
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.IMailjetClientProvider
import community.flock.eco.workday.services.MailjetService
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.json.JSONObject
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.fail
import java.time.YearMonth
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class MailjetServiceTest {

    private lateinit var service: MailjetService
    private lateinit var client: MailjetClient
    private lateinit var notificationProperties: NotificationProperties
    private lateinit var mailjetProperties: MailjetProperties

    private val person = Person(
        firstname = "First",
        lastname = "Last",
        email = "person@test.com",
        position = "",
        number = "",
        user = null
    )

    @BeforeAll
    fun beforeAll() {
        client = mockk()

        mailjetProperties =
            MailjetProperties(apiKey = "", apiSecretKey = "", reminderTemplateId = 2, updateTemplateId = 3)

        notificationProperties = NotificationProperties("recipient@test.com")

        val clientProvider = object : IMailjetClientProvider {
            override val client = this@MailjetServiceTest.client
        }

        service = MailjetService(clientProvider, notificationProperties, mailjetProperties)
    }

    @Test
    fun sendUpdate_sendToGlobalRecipient() {
        val requestSlot = slot<MailjetRequest>()
        every { client.post(capture(requestSlot)) } returns null

        service.sendUpdate(person, YearMonth.now())

        val email = requestSlot.captured.getSingleRecipientEmail()
        assertEquals(notificationProperties.recipient, email)
    }

    @Test
    fun sendReminder_sendToContextPerson() {
        val requestSlot = slot<MailjetRequest>()
        every { client.post(capture(requestSlot)) } returns null

        service.sendReminder(person, YearMonth.now())

        val email = requestSlot.captured.getSingleRecipientEmail()
        assertEquals(person.email, email)
    }

    @Test
    fun sendUpdate_useUpdateTemplate() {
        val requestSlot = slot<MailjetRequest>()
        every { client.post(capture(requestSlot)) } returns null

        service.sendUpdate(person, YearMonth.now())

        val templateId = requestSlot.captured.getSingleTemplateId()
        assertEquals(mailjetProperties.updateTemplateId, templateId)
    }

    @Test
    fun sendReminder_useReminderTemplate() {
        val requestSlot = slot<MailjetRequest>()
        every { client.post(capture(requestSlot)) } returns null

        service.sendReminder(person, YearMonth.now())

        val templateId = requestSlot.captured.getSingleTemplateId()

        assertEquals(mailjetProperties.reminderTemplateId, templateId)
    }

    private fun MailjetRequest.getSingleTemplateId() = getSingleMessage()
        .optInt("TemplateID", -1)

    private fun MailjetRequest.getSingleRecipientEmail() = getSingleMessage().getSingleRecipient().getEmail()

    private fun MailjetRequest.getSingleMessage() =
        bodyJSON
            .apply {
                println(this.toString(2))
            }
            .getJSONArray("Messages")
            .apply { assertEquals(1, length(), "Found more than one message") }
            .getJSONObject(0)

    private fun JSONObject.getSingleRecipient() =
        getJSONArray("To")
            .apply { assertEquals(1, length(), "Found more than one recipient") }
            .getJSONObject(0)

    private fun JSONObject.getEmail() =
        optString("Email")
            ?: fail("No email property found")
}
