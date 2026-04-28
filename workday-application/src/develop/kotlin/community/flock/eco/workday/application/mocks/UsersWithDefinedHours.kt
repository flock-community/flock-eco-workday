package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Person
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

/**
 * Users whose hour logs are painted explicitly by a dedicated seeder.
 *
 * The randomized seeders (sick days, holidays, parental leave, baseline
 * workdays) skip everyone in this set so the demo timelines stay clean
 * and readable on the Hours overview chart. Add a person here whenever
 * another seeder takes full ownership of their hour log.
 */
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class UsersWithDefinedHours(
    private val loadPersonData: LoadPersonData,
) {
    private val emails: Set<String> = setOf("tommy@sesam.straat")

    // Lazy so it only resolves to Person rows after LoadPersonData has had a
    // chance to save them (which happens on the first boot with an empty DB).
    val persons: Set<Person> by lazy {
        emails.mapNotNull { email ->
            runCatching { loadPersonData.findPersonByUserEmail(email) }.getOrNull()
        }.toSet()
    }
}
