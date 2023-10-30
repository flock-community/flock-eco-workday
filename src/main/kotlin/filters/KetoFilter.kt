package community.flock.eco.workday.filters

import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.WorkdayUpdate
import community.flock.wirespec.kotlin.Wirespec
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Component
import org.springframework.util.PathMatcher
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.ContentCachingRequestWrapper
import org.springframework.web.util.ContentCachingResponseWrapper
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class KetoFilter(
    private val contentMapper: Wirespec.ContentMapper<ByteArray>,
    private val pathMatcher: PathMatcher,
    private val ketoClient: KetoClientConfiguration.KetoClient
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {

        val req = ContentCachingRequestWrapper(request)
        val res = ContentCachingResponseWrapper(response)

        filterChain.doFilter(req, res);

        if (req.method == "PUT" && pathMatcher.match(WorkdayUpdate.PATH, req.servletPath)) {
            val mapper = WorkdayUpdate.RESPONSE_MAPPER(contentMapper)
            val content = Wirespec.Content(res.contentType, res.contentAsByteArray)
            val workdayRes = mapper(res.status, emptyMap(), content)

            println(workdayRes.content.body.code)

            runBlocking {
                workdayRes.content.body.code?.run {
                    createRelation(this)
                }
            }
        }

        res.copyBodyToResponse();

    }

    suspend fun createRelation(id: String) = CreateRelationshipBody("Workday", id)
        .run { CreateRelationship.RequestApplicationJson(this) }
        .run { ketoClient.createRelationship(this) }
}
