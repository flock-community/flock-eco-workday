package community.flock.eco.workday.mocks

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.ClientResponse
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono


@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
@EnableConfigurationProperties(KratosConfig::class)
class KratosClient(
    private val objectMapper: ObjectMapper,
    kratosConfig: KratosConfig,
) {
    val kratosClient: WebClient = WebClient.builder()
        .baseUrl(kratosConfig.requestUri)
        .defaultHeaders {
            it.accept = listOf(MediaType.APPLICATION_JSON)
        }
        .build()


    fun getKratosIdentities(): List<KratosIdentity> {
        return kratosClient.get()
            .uri("admin/identities")
            .handleResponseList()
    }

    fun getOrCreateIdentity(mockUser: MockUser, identities: List<KratosIdentity>): KratosIdentity =
        identities.find { it.traits.email == mockUser.email }
            ?: createKratosIdentity(mockUser)

    private fun createKratosIdentity(mockUser: MockUser): KratosIdentity {
        val createKratosIdentity = mockUser.toCreateKratosIdentity()
        return kratosClient.post()
            .uri("admin/identities")
            .body(
                BodyInserters.fromValue(
                    objectMapper.writeValueAsString(
                        createKratosIdentity
                    )
                )
            )
            .handleResponse<KratosIdentity>()
    }

    private fun MockUser.toCreateKratosIdentity() = CreateKratosIdentity(
        traits = CreateKratosIdentity.Traits(
            CreateKratosIdentity.Traits.Name(firstName, lastName),
            email
        ),
        credentials = CreateKratosIdentity.Credentials.passwordCredentials(firstName.lowercase()),
        verifiableAddresses = listOf(
            CreateKratosIdentity.Address(
                value = email,
                verified = true,
                via = "email",
                status = "completed"
            )
        )
    )

}

private inline fun <reified T> WebClient.RequestHeadersSpec<*>.handleResponseList(): List<T> =
    handleResponseDetails { it.toEntityList(T::class.java) }

private inline fun <reified T> WebClient.RequestHeadersSpec<*>.handleResponse(): T =
    handleResponseDetails { it.toEntity(T::class.java) }

private inline fun <reified T> WebClient.RequestHeadersSpec<*>.handleResponseDetails(crossinline responseMapper: (ClientResponse) -> Mono<ResponseEntity<T>>): T =
    exchangeToMono { response ->
        when (response.rawStatusCode()) {
            in 200..299 -> responseMapper(response)
            else -> response.createException().flatMap { Mono.error(it) }
        }
    }.block()?.body ?: error("Something went wrong")

