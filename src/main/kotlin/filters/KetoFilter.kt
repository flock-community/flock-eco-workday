package community.flock.eco.workday.filters

import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.eco.workday.services.KetoService
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.SubjectSet
import community.flock.wirespec.generated.WorkdayCreate
import community.flock.wirespec.Wirespec
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



        filterChain.doFilter(req, res);


        if ("POST" == req.method && pathMatcher.match(WorkdayCreate.PATH, req.servletPath)) {
            val content = Wirespec.Content(res.contentType, res.contentAsByteArray)
            val r = object: Wirespec.Response<ByteArray>{
                override val status = res.status
                override val headers: Map<String, List<Any?>> = emptyMap()
                override val content = content
            }
            val workdayRes = WorkdayCreate.RESPONSE_MAPPER(contentMapper)(r)
            val responseBody = workdayRes.content.body
            LOG.debug(
                "Creating a relation in Keto between workday: ${responseBody.code} " +
                    "and person ${responseBody.assignment?.person?.email} (${responseBody.assignment?.person?.uuid})"
            )

            runBlocking {
                val workdayId = responseBody.code
                val personId = responseBody.assignment?.person?.uuid

                if (workdayId != null && personId != null) {
                    ketoService.createWorkdayRelation(workdayId, personId)
                }
            }
        }

        res.copyBodyToResponse();

    }

    companion object {
        private val LOG: Logger = LoggerFactory.getLogger(KetoFilter::class.java)
    }
}
