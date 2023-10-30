package community.flock.eco.workday.clients

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.kotlin.Wirespec
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.web.client.RestTemplate
import java.lang.reflect.Type
import java.net.URI

@Configuration
class KetoClientConfiguration {
    interface KetoClient : CreateRelationship

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


    @Bean
    fun ketoClient(contentMapper: Wirespec.ContentMapper<ByteArray>): KetoClient =
        object : KetoClient {
            fun <Req : Wirespec.Request<*>, Res : Wirespec.Response<*>> handle(
                request: Req,
                responseMapper: (Wirespec.ContentMapper<ByteArray>) -> (Int, Map<String, List<String>>, Wirespec.Content<ByteArray>) -> Res
            ) = restTemplate.execute(
                URI("http://accounts.flock.local:8081/keto${request.path}"),
                HttpMethod.valueOf(request.method.name),
                { req ->
                    request.content
                        ?.let { contentMapper.write(it) }
                        ?.let { req.body.write(it.body) }
                },
                { res ->
                    val contentType = res.headers.contentType?.toString()?.replace(";charset=utf-8", "") ?: error("No content type")
                    val content = Wirespec.Content(contentType, res.body.readBytes())
                    responseMapper(contentMapper)(
                        res.statusCode.value(),
                        res.headers,
                        content
                    )
                }
            ) ?: error("No response")

            override suspend fun createRelationship(request: CreateRelationship.Request<*>): CreateRelationship.Response<*> {
                return handle(request, CreateRelationship::RESPONSE_MAPPER)
            }
        }
}
