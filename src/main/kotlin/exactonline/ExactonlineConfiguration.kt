package community.flock.eco.workday.exactonline

import community.flock.eco.feature.exactonline.clients.ExactonlineAccountClient
import community.flock.eco.feature.exactonline.clients.ExactonlineAuthenticationClient
import community.flock.eco.feature.exactonline.clients.ExactonlineDocumentClient
import community.flock.eco.feature.exactonline.clients.ExactonlineInvoiceClient
import community.flock.eco.feature.exactonline.clients.ExactonlineUserClient
import community.flock.eco.feature.exactonline.controllers.ExactonlineAccountController
import community.flock.eco.feature.exactonline.controllers.ExactonlineAuthenticationController
import community.flock.eco.feature.user.controllers.UserControllerAdvice
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import community.flock.eco.workday.exactonline.services.ExactonlineAuthenticationService
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@EnableJpaRepositories
@EntityScan
@EnableConfigurationProperties(ExactonlineProperties::class)
@Import(UserControllerAdvice::class,
    ExactonlineAccountClient::class,
    ExactonlineAuthenticationClient::class,
    ExactonlineDocumentClient::class,
    ExactonlineInvoiceClient::class,
    ExactonlineUserClient::class,
    ExactonlineAccountController::class,
    ExactonlineAuthenticationController::class,
    ExactonlineAuthenticationService::class,
    ExactonlineProperties::class)
class ExactonlineConfiguration {


}
