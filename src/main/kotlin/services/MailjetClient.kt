// package community.flock.eco.workday.services
//
// import com.mailjet.client.ClientOptions
// import com.mailjet.client.MailjetClient
// import com.mailjet.client.MailjetRequest
// import com.mailjet.client.MailjetResponse
// import community.flock.eco.workday.config.properties.MailjetClientProperties
// import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
// import org.springframework.http.HttpStatus
// import org.springframework.stereotype.Component
// import org.springframework.stereotype.Service
//
// @Service
// @ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"], havingValue = "false")
// class MailjetClientProvider(
//     mailjetProperties: MailjetClientProperties
// ) : IMailjetClientProvider {
//     private val options = ClientOptions.builder()
//         .apiKey(mailjetProperties.apiKey)
//         .apiSecretKey(mailjetProperties.apiSecretKey)
//         .build()
//
//     override val client = MailjetClient(options)
// }
//
// @Component
//
