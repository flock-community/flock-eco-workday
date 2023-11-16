package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import community.flock.eco.workday.repository.WorkDayRepository
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.SubjectSet
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class KetoService(
    private val ketoClient: KetoClientConfiguration.KetoClient,
) {
    suspend fun createWorkdayRelation(workDayId: String, personId: String):CreateRelationshipBody {
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
        return createRelationshipBody
            .run { CreateRelationship.RequestApplicationJson(this) }
            .run { ketoClient.createRelationship(this) }
            .run { if (status > 299) {
                //TODO: error handling in some form or another
                error("Some error occurred creating relationship $createRelationshipBody. Error: ${content?.body}")
            } }
            .run { createRelationshipBody }
    }
}
