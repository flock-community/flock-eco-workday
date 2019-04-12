package community.flock.eco.fundraising.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer


class WebMvcConfig : WebMvcConfigurer {

    @Value("\${flock.fundraising.donations.cors.allowedOrigins:@null}")
    lateinit var cors: String

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/ui/**")
                .addResourceLocations("/index.html", "classpath:/index.html")
                .addResourceLocations("/main.js", "classpath:/main.js")
                .addResourceLocations("/donation.html", "classpath:/donation.html")
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/donations/donate")
                .allowedOrigins(cors)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600)

    }
}