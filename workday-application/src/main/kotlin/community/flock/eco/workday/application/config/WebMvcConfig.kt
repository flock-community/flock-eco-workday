package community.flock.eco.workday.application.config

import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.http.CacheControl
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver
import java.io.IOException

class WebMvcConfig : WebMvcConfigurer {
    val etagCache: MutableMap<String, String> = mutableMapOf()

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry
            .addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .setCacheControl(CacheControl.empty().mustRevalidate())
            .setEtagGenerator { resource ->
                etagCache.computeIfAbsent(resource.file.path) {
                    resource.contentAsByteArray.contentHashCode().toString()
                }
            }.resourceChain(true)
            .addResolver(
                object : PathResourceResolver() {
                    @Throws(IOException::class)
                    override fun getResource(
                        resourcePath: String,
                        location: Resource,
                    ): Resource {
                        val requestedResource = location.createRelative(resourcePath)
                        return if (requestedResource.exists() && requestedResource.isReadable) {
                            requestedResource
                        } else {
                            ClassPathResource("/static/index.html")
                        }
                    }
                },
            )
    }
}
