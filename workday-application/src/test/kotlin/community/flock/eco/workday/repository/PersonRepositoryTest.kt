package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.Address
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.helpers.CreateHelper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import java.time.LocalDate

class PersonRepositoryTest(
    @Autowired private val repository: PersonRepository,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    @Test
    fun `should create person without email`() {
        val person =
            Person(
                firstname = "Maurice",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                user = null,
            )

        repository.save(person)
        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }

    @Test
    fun `should create person with email`() {
        val person =
            Person(
                firstname = "Roy",
                lastname = "Trennerman",
                email = "roy@reynholm-industries.co.uk",
                position = "",
                number = null,
                user = null,
            )

        repository.save(person)

        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
    }

    @Test
    fun `should persist and hydrate an embedded address`() {
        val address =
            Address(
                street = "Sesamstraat",
                houseNumber = "123",
                houseNumberAddition = "A",
                postalCode = "1234 AB",
                city = "Hilversum",
            )
        val person =
            Person(
                firstname = "Bert",
                lastname = "Muppets",
                email = "bert@sesam.straat",
                position = "",
                number = null,
                user = null,
                address = address,
            )

        repository.save(person)

        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
        assertThat(res.get().address).isEqualTo(address)
    }

    @Test
    fun `should hydrate a person without address as address null`() {
        val person =
            Person(
                firstname = "Ernie",
                lastname = "Muppets",
                email = "ernie@sesam.straat",
                position = "",
                number = null,
                user = null,
            )

        repository.save(person)

        val res = repository.findByUuid(person.uuid)
        assertThat(res).isNotEmpty
        assertThat(res.get().address).isNull()
    }

    @Test
    fun `should find person by firstname`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "ro")
        assertThat(res1.totalElements).isEqualTo(2)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "rob")
        assertThat(res2.totalElements).isEqualTo(1)

        val res3 = repository.findAllByFullName(Pageable.unpaged(), "ba")
        assertThat(res3.totalElements).isEqualTo(0)

        val res4 = repository.findAllByFullName(Pageable.unpaged(), "ROB")
        assertThat(res4.totalElements).isEqualTo(1)
    }

    @Test
    fun `should find person by lastname`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "j")
        assertThat(res1.totalElements).isEqualTo(2)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "jansen")
        assertThat(res2.totalElements).isEqualTo(1)

        val res3 = repository.findAllByFullName(Pageable.unpaged(), "ba")
        assertThat(res3.totalElements).isEqualTo(0)

        val res4 = repository.findAllByFullName(Pageable.unpaged(), "JANSEN")
        assertThat(res4.totalElements).isEqualTo(1)
    }

    @Test
    fun `should find person by full name`() {
        val persons =
            listOf(
                Person(
                    firstname = "Roy",
                    lastname = "Jensen",
                    email = "roy@jensen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
                Person(
                    firstname = "Rob",
                    lastname = "Jansen",
                    email = "rob@jansen-industries.co.uk",
                    position = "",
                    number = null,
                    user = null,
                ),
            )

        repository.saveAll(persons)

        val res1 = repository.findAllByFullName(Pageable.unpaged(), "rob ja")
        assertThat(res1.totalElements).isEqualTo(1)

        val res2 = repository.findAllByFullName(Pageable.unpaged(), "roy jansen")
        assertThat(res2.totalElements).isEqualTo(0)
    }

    @Test
    fun `should find active persons with an internal contract running on the date`() {
        val today = LocalDate.of(2026, 10, 30)
        val running = createHelper.createPersonEntity("Running", "Internal")
        val openEnded = createHelper.createPersonEntity("OpenEnded", "Internal")
        val ended = createHelper.createPersonEntity("Ended", "Internal")
        val future = createHelper.createPersonEntity("Future", "Internal")
        val external = createHelper.createPersonEntity("Running", "External")
        val inactive =
            repository.save(
                Person(
                    firstname = "Inactive",
                    lastname = "Internal",
                    email = "inactive@internal",
                    position = "",
                    number = null,
                    user = null,
                    active = false,
                ),
            )

        createHelper.createContractInternal(running, today.minusYears(1), today)
        createHelper.createContractInternal(openEnded, today.minusYears(1), null)
        // A second contract for the same person must not list them twice.
        createHelper.createContractInternal(openEnded, today.minusYears(2), today.plusMonths(1))
        createHelper.createContractInternal(ended, today.minusYears(1), today.minusDays(1))
        createHelper.createContractInternal(future, today.plusDays(1), null)
        createHelper.createContractExternal(external, today.minusYears(1), null)
        createHelper.createContractInternal(inactive, today.minusYears(1), null)

        val res = repository.findAllActiveInternalNames(today)

        assertThat(res.map { it.uuid }).containsExactlyInAnyOrder(running.uuid, openEnded.uuid)
    }
}
