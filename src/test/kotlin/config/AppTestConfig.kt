package config

import com.google.api.gax.core.CredentialsProvider
import com.google.auth.Credentials
import io.mockk.every
import io.mockk.mockk
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.test.context.ActiveProfiles

@TestConfiguration
@ActiveProfiles("test")
class AppTestConfig {
    @Bean
    fun credentialProvider(): CredentialsProvider {
        val provider = mockk<CredentialsProvider>()
        val credentials = mockk<Credentials>()
        every { provider.credentials }.returns(credentials)
        return provider
    }
}
