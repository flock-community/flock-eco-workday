package community.flock.eco.workday.application.config

import community.flock.wirespec.kotlin.Wirespec
import org.springframework.core.MethodParameter
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice
import kotlin.reflect.full.companionObjectInstance

/**
 * Very similar to
 * [community.flock.wirespec.integration.spring.kotlin.web.WirespecResponseBodyAdvice] but now for response headers
 */
@ControllerAdvice
class WirespecResponseHeaderAdvice(
    private val wirespecSerialization: Wirespec.Serialization,
) : ResponseBodyAdvice<Any?> {
    override fun supports(
        returnType: MethodParameter,
        converterType: Class<out HttpMessageConverter<*>?>,
    ): Boolean = Wirespec.Response::class.java.isAssignableFrom(returnType.parameterType)

    @Suppress("UNCHECKED_CAST")
    override fun beforeBodyWrite(
        body: Any?,
        returnType: MethodParameter,
        selectedContentType: MediaType,
        selectedConverterType: Class<out HttpMessageConverter<*>>,
        request: ServerHttpRequest,
        response: ServerHttpResponse,
    ): Any? {
        val declaringClass = returnType.parameterType.declaringClass
        val handler =
            declaringClass.declaredClasses
                .toList()
                .find { it.simpleName == "Handler" }
                ?: error("Handler not found")
        val instance =
            handler
                .kotlin.companionObjectInstance as Wirespec.Server<Wirespec.Request<*>, Wirespec.Response<*>>
        val server = instance.server(wirespecSerialization)
        if (body is Wirespec.Response<*>) {
            val rawResponse = server.to(body)
            rawResponse.headers.forEach { (key, value) ->
                response.headers.addAll(key, value)
            }
        }
        return body
    }
}
