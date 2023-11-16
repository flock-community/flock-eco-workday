package community.flock.eco.workday.clients

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.wirespec.Wirespec
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.DeleteRelationships
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import java.lang.reflect.Type
import kotlin.reflect.KFunction1

@Configuration
class KetoClientConfiguration {
    interface KetoClient : CreateRelationship, DeleteRelationships

    val restTemplate = RestTemplate()

    @Bean
    fun contentMapper(objectMapper: ObjectMapper) =
        object : Wirespec.ContentMapper<ByteArray> {
            override fun <T> read(
                content: Wirespec.Content<ByteArray>,
                valueType: Type,
            ): Wirespec.Content<T> = content.let {
                val type = objectMapper.constructType(valueType)
                val obj: T = objectMapper.readValue(content.body, type)
                Wirespec.Content(it.type, obj)
            }

            override fun <T> write(
                content: Wirespec.Content<T>,
            ): Wirespec.Content<ByteArray> = content.let {
                val bytes = objectMapper.writeValueAsBytes(content.body)
                Wirespec.Content(it.type, bytes)
            }
        }

    fun Wirespec.Request<*>.toUri() = UriComponentsBuilder
        .fromUriString("http://accounts.flock.local:8081/keto${path}")
        .queryParams(LinkedMultiValueMap(query.mapValues { it.value.filterNotNull().map { it.toString() } }.filter { it.value.isNotEmpty() }))
        .build()
        .toUri()

    @Bean
    fun ketoClient(contentMapper: Wirespec.ContentMapper<ByteArray>): KetoClient = object : KetoClient {
        fun <Req : Wirespec.Request<*>, Res : Wirespec.Response<*>> handle(
            request: Req,
            responseMapper: KFunction1<Wirespec.ContentMapper<ByteArray>, (Wirespec.Response<ByteArray>) -> Res>
        ) = restTemplate.execute(
            request.toUri(),
            HttpMethod.valueOf(request.method.name),
            { req ->
                request.content
                    ?.let { contentMapper.write(it) }
                    ?.let { req.body.write(it.body) }
            },
            { res ->
                val contentType = res.headers.contentType?.toString()?.replace(";charset=utf-8", "")
                val content = contentType?.let { Wirespec.Content(it, res.body.readBytes()) }
                val response = object : Wirespec.Response<ByteArray> {
                    override val status = res.statusCode.value()
                    override val headers = res.headers
                    override val content = content
                }
                responseMapper(contentMapper)(response)
            }
        ) ?: error("No response")

        override suspend fun createRelationship(request: CreateRelationship.Request<*>): CreateRelationship.Response<*> {
            return handle(request, CreateRelationship::RESPONSE_MAPPER)
        }

        override suspend fun deleteRelationships(request: DeleteRelationships.Request<*>): DeleteRelationships.Response<*> {
            return handle(request, DeleteRelationships::RESPONSE_MAPPER)
        }
    }
}
