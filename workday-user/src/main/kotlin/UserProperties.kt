package community.flock.eco.feature.user

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "flock.eco.feature.user")
data class UserProperties(
    val secretType: SecretType = SecretType.NONE,
    val secretLength: Int = 8,
    val secretAlphabet: String = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    val secretResetMailFrom: String = "",
    val secretResetMailSubject: String = "Reset password",
    val secretResetMessage: String = "Your password is: %s",
)

enum class SecretType {
    NONE,
    GENERATED,
    CHOSEN,
}
