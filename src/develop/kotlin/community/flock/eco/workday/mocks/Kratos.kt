package community.flock.eco.workday.mocks

import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy
import com.fasterxml.jackson.databind.annotation.JsonNaming
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "flock.eco.ory.kratos")
data class KratosConfig(
    val requestUri: String = "",
)

@ConstructorBinding
@ConfigurationProperties(prefix = "flock.eco.ory.keto")
data class KetoConfig(
    val requestUri: String = "",
)


@JsonNaming(SnakeCaseStrategy::class)
data class CreateKratosIdentity(
    val schemaId: String = "default",
    val traits: Traits,
    val credentials: Credentials,
    val verifiableAddresses: List<Address>
) {

    data class Traits(
        val name: Name,
        val email: String
    ) {
        data class Name(
            val first: String,
            val last: String
        )
    }

    data class Credentials(
        val password: Password

    ) {
        companion object{
            fun passwordCredentials(password: String) = Credentials(
                Password(
                    Password.PasswordConfig(
                        password
                    )
                )
            )
        }

        data class Password(
            val config: PasswordConfig
        ) {
            data class PasswordConfig(
                val password: String
            )

        }
    }

    data class Address(
        val value: String,
        val verified: Boolean,
        val via: String = "email",
        val status: String = "completed"
    )

}
