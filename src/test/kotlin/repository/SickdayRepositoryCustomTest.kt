package repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.filters.SickdayFilters
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.repository.PersonRepository
import community.flock.eco.workday.repository.SickdayRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
class SickdayRepositoryCustomTest {
    @Autowired
    private lateinit var entity: TestEntityManager

    @Autowired
    private lateinit var personRepository: PersonRepository
    @Autowired
    private lateinit var repository: SickdayRepository

    val roy: Person = Person(
        firstname = "Roy",
        lastname = "Trenneman",
        email = "roy@reynholm-industries.co.uk",
        position = "Support technician"
    )
    val maurice: Person = Person(
        firstname = "Maurice",
        lastname = "Moss",
        email = "maurice@reynholm-industries.co.uk",
        position = "Software application developer"
    )

    @Before
        /**
         * creating a couple of persons with them having a couple of sickdays
         */
    fun setup() {
        for (person in arrayListOf(roy, maurice)) {
            entity.persist(person)

            // create sickdays for given person
            for (idx in 1..5) {
                entity.persist(
                    Sickday(
                        description = "Sickday no.$idx",
                        status = when (idx % 2) {
                            0 -> SickdayStatus.SICK
                            else -> SickdayStatus.HEALTHY
                        },
                        hours = idx * 8,
                        person = person
                    )
                )
            }
        }
        entity.flush()
    }

    @After
    fun teardown() {
        entity.clear()
    }

    // Test non filter params
    @Test
    fun `should filter all people with all sickdays and return them in a list`() {
        val res = repository.filterBy(status = null, personCode = null)

        assertThat(res.toSet().size).isEqualTo(10)
    }

    // Test status filter param
    @Test
    fun `should filter all sick people and return them in a list`() {
        val res = repository.filterBy(status = SickdayFilters.SICK, personCode = null)

        val iter = res.iterator()
        while (iter.hasNext()) {
            assertThat(iter.next()).hasFieldOrPropertyWithValue("status", SickdayStatus.SICK)
        }
        assertThat(res.toSet().size).isEqualTo(4)
    }

    @Test
    fun `should filter all healthy people and return them in a list`() {
        val res = repository.filterBy(status = SickdayFilters.HEALTHY, personCode = null)

        val iter = res.iterator()
        while (iter.hasNext()) {
            assertThat(iter.next()).hasFieldOrPropertyWithValue("status", SickdayStatus.HEALTHY)
        }
        assertThat(res.toSet().size).isEqualTo(6)
    }

    // Test Person filter param
//    @Test fun `should filter person Roy Tennemans all sickdays, including all statuses`() {
//        val res = repository.filterBy(status = null, personCode = roy.code)
//
//        assertThat(res.toSet().size).isEqualTo(4)
//    }
//
//    @Test fun `should filter person Roy Tennemans all sick sickdays`() {
//        val res = repository.filterBy(status = SickdayFilters.SICK, personCode = roy.code)
//
//        val iter = res.iterator()
//        while(iter.hasNext()) {
//            assertThat(iter.next()).hasFieldOrPropertyWithValue("status", "SICK")
//        }
//        assertThat(res.toSet().size).isEqualTo(2)
//    }
//
//    @Test fun `should filter person Roy Tennemans all healthy sickdays`() {
//        val res = repository.filterBy(status = SickdayFilters.SICK, personCode = roy.code)
//
//        val iter = res.iterator()
//        while (iter.hasNext()) {
//            assertThat(iter.next()).hasFieldOrPropertyWithValue("status", "HEALTHY")
//        }
//        assertThat(res.toSet().size).isEqualTo(2)
//    }
}
