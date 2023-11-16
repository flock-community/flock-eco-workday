package community.flock.eco.workday.mocks

import community.flock.eco.workday.clients.KetoClientConfiguration
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.forms.WorkDaySheetForm
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.WorkDayService
import community.flock.wirespec.generated.CreateRelationship
import community.flock.wirespec.generated.CreateRelationshipBody
import community.flock.wirespec.generated.SubjectSet
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.*

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadWorkDayData(
    private val loadData: LoadData,
    loadPersonData: LoadPersonData,
    loadAssignmentData: LoadAssignmentData,
    private val workDayService: WorkDayService,
    private val ketoClient: KetoClientConfiguration.KetoClient,
    ) {
    val now = LocalDate.now()
    val data: MutableSet<WorkDay> = mutableSetOf()

    /**
     * add a create() function to the WorkDayForm which calls the create function of WorkDayService
     * to create and persist the Workday.
     */
    private final fun WorkDayForm.create(): WorkDay? {
        return loadData.loadWhenEmpty {
            workDayService.create(this)
        }
    }

    /**
     * Initialize a Sickday with status SickdayStatus.SICK (which is the default)
     * and one Sickday with status SickdayStatus.HEALTHY (to indicate a past Sickday)
     */
    init {
        val now = LocalDate.now()
        loadAssignmentData.data
            .flatMap { assignment ->
                    (1..3)
                            .map {
                                WorkDayForm(
                                        from = now.withMonth(it).withDayOfMonth(1),
                                        to = now.withMonth(it).withDayOfMonth(1).plusDays(9),
                                        hours = 80.0,
                                        days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                                        assignmentCode = assignment.code,
                                        sheets = listOf(
                                                WorkDaySheetForm(
                                                        name = "File1.jpg",
                                                        file = UUID.randomUUID()
                                                ),
                                                WorkDaySheetForm(
                                                        name = "File2.pdf",
                                                        file = UUID.randomUUID()
                                                )
                                        )
                                )
                            }
                }
            .forEach {
                it.create()
                    ?.run {
                        runBlocking { createRelationBetweenWorkdayAndPerson(this@run) }
                    }
            }
    }


//    private fun createKetoRelationForPersonAndUserAccounts(person: Person) {
//        val kratosUserIds =
//            (person.user
//                ?.accounts
//                ?.filter { ua -> ua is UserAccountOauth && ua.provider == UserAccountOauthProvider.KRATOS } as List<UserAccountOauth>?)
//                ?.map { it.reference }
//                ?: emptyList()
//
//        kratosUserIds.forEach {
//            runBlocking { createRelationBetweenPersonAndUser(person, it) }
//        }
//    }

    private suspend fun createRelationBetweenWorkdayAndPerson(workday: WorkDay) {
        val body = CreateRelationshipBody(
            namespace = "Workday",
            `object` = workday.code,
            relation = "owners",
            subject_set = SubjectSet(
                namespace = "Person",
                `object` = workday.assignment.person.uuid.toString(),
                relation = ""
            ),
        )

        val createRelationship = ketoClient.createRelationship(
            CreateRelationship.RequestApplicationJson(body)
        )
        if (createRelationship.status > 299) {
            error("Some error occurred creating relationship $body. Error: ${createRelationship.content?.body}")
        }
        log.info("Created relation between workday {} and person {}", workday.code, workday.assignment.person.uuid)
    }

    companion object {
        private val log = LoggerFactory.getLogger(LoadWorkDayData::class.java)
    }
}
