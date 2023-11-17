package community.flock.eco.workday.services

import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.wirespec.Wirespec
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.DeleteRelationships
import community.flock.wirespec.generated.SubjectSet
import org.springframework.stereotype.Service

@Service
class KetoService(
    private val ketoClient: KetoClientConfiguration.KetoClient,
) {
    fun <Res : Wirespec.Response<*>> Res.handleCall(): Res = run {
        if (status > 299) {
            error("Some error occurred creating relationship status: $status body: ${content?.body}")
        } else {
            this
        }
    }

    suspend fun createWorkdayRelation(workDayId: String, personId: String): CreateRelationship.Response<*> {
        val request = CreateRelationship.RequestApplicationJson(
            CreateRelationshipBody(
                namespace = "Workday",
                `object` = workDayId,
                relation = "owners",
                subject_set = SubjectSet(
                    namespace = "Person",
                    `object` = personId,
                    relation = ""
                )
            )
        )
        return ketoClient.createRelationship(request).handleCall()
    }

    suspend fun deleteWorkdayRelation(workDayId: String): DeleteRelationships.Response<*> {
        val request = DeleteRelationships.RequestUnit(
            namespace = "Workday",
            `object` = workDayId
        )
        return ketoClient.deleteRelationships(request).handleCall()
    }

    suspend fun deleteAllWorkdayRelation(): DeleteRelationships.Response<*> {
        val request = DeleteRelationships.RequestUnit(
            namespace = "Workday"
        )
        return ketoClient.deleteRelationships(request).handleCall()
    }
}
