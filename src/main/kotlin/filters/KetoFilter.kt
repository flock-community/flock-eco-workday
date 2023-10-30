package community.flock.eco.workday.filters

import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.SubjectSet
import community.flock.wirespec.generated.WorkdayCreate
import community.flock.wirespec.kotlin.Wirespec
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

        if (req.method == "POST" && pathMatcher.match(WorkdayCreate.PATH, req.servletPath)) {
            val mapper = WorkdayCreate.RESPONSE_MAPPER(contentMapper)
            val content = Wirespec.Content(res.contentType, res.contentAsByteArray)
            val workdayRes = mapper(res.status, emptyMap(), content)

            val responseBody = workdayRes.content.body
            LOG.debug(
                "Creating a relation in Keto between workday: ${responseBody.code} " +
                    "and person ${responseBody.assignment?.person?.email} (${responseBody.assignment?.person?.uuid})"
            )

            runBlocking {
                val workdayId = responseBody.code
                val personId = responseBody.assignment?.person?.uuid

                if (workdayId != null && personId != null) {
                    createRelation(workdayId, personId)
                }
            }
        }

        res.copyBodyToResponse();

    }

    suspend fun createRelation(workDayId: String, personId: String) {
        val createRelationshipBody = CreateRelationshipBody(
            namespace = "Workday",
            `object` = workDayId,
            relation = "owners",
            subject_set = SubjectSet(
                namespace = "Person",
                `object` = personId,
                relation = ""
            )
        )
        createRelationshipBody
            .run { CreateRelationship.RequestApplicationJson(this) }
            .run { ketoClient.createRelationship(this) }
            .run { if (status > 299) {
                //TODO: error handling in some form or another
                error("Some error occurred creating relationship $createRelationshipBody. Error: ${content?.body}")
            } }
    }

    companion object {
        private val LOG: Logger = LoggerFactory.getLogger(KetoFilter::class.java)
    }
}
