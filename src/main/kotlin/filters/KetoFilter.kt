package community.flock.eco.workday.filters

import community.flock.eco.workday.services.KetoService
import community.flock.wirespec.Wirespec
import community.flock.wirespec.generated.WorkdayCreate
import community.flock.wirespec.generated.WorkdayDelete
import kotlinx.coroutines.runBlocking
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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
    private val ketoService: KetoService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {

        val req = ContentCachingRequestWrapper(request)
        val res = ContentCachingResponseWrapper(response)

        filterChain.doFilter(req, res)

        if (WorkdayCreate.METHOD == req.method && pathMatcher.match(WorkdayCreate.PATH, req.servletPath)) {
            runBlocking {
                val workdayRes = WorkdayCreate.RESPONSE_MAPPER(contentMapper)(res.internalize())
                val workdayId = workdayRes.content.body.code
                val personId = workdayRes.content.body.assignment?.person?.uuid
                LOG.debug("Creating a relation in Keto between workday: $workdayId and person $personId")
                if (workdayId != null && personId != null) {
                    ketoService.createWorkdayRelation(workdayId, personId)
                }
            }
        }

        if (WorkdayDelete.METHOD == req.method && pathMatcher.match(WorkdayDelete.PATH, req.servletPath)) {
            runBlocking {
                val pathParams = pathMatcher.extractUriTemplateVariables(WorkdayDelete.PATH, req.servletPath)
                val workdayId = pathParams["code"]
                LOG.debug("Delete a relation in Keto for workday: $workdayId")
                if (workdayId != null) {
                    ketoService.deleteWorkdayRelation(workdayId)
                }
            }
        }

        res.copyBodyToResponse();
    }

    private fun ContentCachingResponseWrapper.internalize(): Wirespec.Response<ByteArray> {
        val content = Wirespec.Content(contentType, contentAsByteArray)
        return object : Wirespec.Response<ByteArray> {
            override val status = this@internalize.status
            override val headers: Map<String, List<Any?>> = emptyMap()
            override val content = content
        }
    }

    private fun ContentCachingRequestWrapper.internalize(): Wirespec.Request<ByteArray> {
        return object : Wirespec.Request<ByteArray> {
            override val path = servletPath
            override val method = Wirespec.Method.valueOf(this@internalize.method)
            override val query = queryString?.split("&")?.map { it.split("=") }?.map { it[0] to it[1] }?.groupBy({ it.first }, { it.second })?.toMap() ?: emptyMap()
            override val headers: Map<String, List<Any?>> = emptyMap()
            override val content = contentType?.let { Wirespec.Content(it, contentAsByteArray)}
        }
    }

    companion object {
        private val LOG: Logger = LoggerFactory.getLogger(KetoFilter::class.java)
    }
}
