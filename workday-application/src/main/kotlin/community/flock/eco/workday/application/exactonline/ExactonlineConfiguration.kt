package community.flock.eco.workday.application.exactonline

import community.flock.eco.workday.application.exactonline.clients.ExactonlineAccountClient
import community.flock.eco.workday.application.exactonline.clients.ExactonlineAuthenticationClient
import community.flock.eco.workday.application.exactonline.clients.ExactonlineDivisionClient
import community.flock.eco.workday.application.exactonline.clients.ExactonlineDocumentClient
import community.flock.eco.workday.application.exactonline.clients.ExactonlineInvoiceClient
import community.flock.eco.workday.application.exactonline.clients.ExactonlineUserClient
import community.flock.eco.workday.application.exactonline.controllers.ExactonlineAccountController
import community.flock.eco.workday.application.exactonline.controllers.ExactonlineAuthenticationController
import community.flock.eco.workday.application.exactonline.properties.ExactonlineProperties
import community.flock.eco.workday.application.exactonline.services.ExactonlineAuthenticationService
import community.flock.eco.workday.user.controllers.UserControllerAdvice
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

@Configuration
@EnableConfigurationProperties(ExactonlineProperties::class)
@Import(
    UserControllerAdvice::class,
    ExactonlineAccountClient::class,
    ExactonlineAuthenticationClient::class,
    ExactonlineDocumentClient::class,
    ExactonlineInvoiceClient::class,
    ExactonlineUserClient::class,
    ExactonlineDivisionClient::class,
    ExactonlineAccountController::class,
    ExactonlineAuthenticationController::class,
    ExactonlineAuthenticationService::class,
)
class ExactonlineConfiguration
