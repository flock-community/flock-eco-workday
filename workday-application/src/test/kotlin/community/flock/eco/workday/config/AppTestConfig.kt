package community.flock.eco.workday.config

import com.google.api.gax.core.CredentialsProvider
import com.google.auth.Credentials
import community.flock.eco.workday.utils.CleanupDbService
import io.mockk.every
import io.mockk.mockk
import org.springframework.boot.sql.init.dependency.DependsOnDatabaseInitialization
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.test.context.ActiveProfiles
import javax.sql.DataSource

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

    @Bean
    @DependsOnDatabaseInitialization
    fun cleanupDbService(dataSource: DataSource) = CleanupDbService(dataSource)
}
