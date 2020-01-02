package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.utils.convertDayOff
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat
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
class SickdayRepositoryTest {
    @Autowired
    private lateinit var entity: TestEntityManager
    @Autowired
    private lateinit var personRepository: PersonRepository
    @Autowired
    private lateinit var periodRepository: PeriodRepository
    @Autowired
    private lateinit var repository: SickdayRepository

    lateinit var person: Person

    @Before
    fun setup() {
        entity.persist(Person(
            firstname = "Denholm",
            lastname = "Reynholm",
            email = "denholm@reynholm-industries.co.uk",
            position = "Chief Executive Officer",
            user = null
        ))
        entity.flush()
        person = personRepository.findAll().first()
    }

    private final fun createSickdayAndPersist(): Sickday {
        val startDate = LocalDate.of(1970, 1, 1)

        val period = Period(
            from = startDate,
            to = LocalDate.of(1970, 1, 6),
            days = convertDayOff(listOf(8, 8, 8, 8, 8), startDate)
        ).save()

        val sickday = Sickday(
            description = "Jumped out of an open Window",
            status = SickdayStatus.SICK,
            hours = 8,
            person = person,
            period = period
        )

        entity.persist(sickday)
        entity.flush()

        return sickday
    }

    @Test
    fun `expect sickdays to be created for a person`() {
        var res: MutableIterable<Sickday> = repository.findAll()
        assertThat(res.toSet().isEmpty()).isTrue()

        val sickday = createSickdayAndPersist()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(sickday)

        val sickdayTwo = createSickdayAndPersist()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(2)
        assertThat(res.first()).isNotEqualTo(sickdayTwo)
        assertThat(res.last()).isNotEqualTo(sickday)
        assertThat(res.last()).isEqualTo(sickdayTwo)
    }

    @Test
    fun `expect to update an existing sickdays status`() {
        createSickdayAndPersist()
        var res: MutableIterable<Sickday> = repository.findAll()

        val sickday = Sickday(
            id = res.first().id,
            code = res.first().code,
            description = "Jumped out of an open Window",
            status = SickdayStatus.HEALTHY,
            hours = 48,
            person = person,
            period = res.first().period
        )
        repository.save(sickday)
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(1)
        assertThat(res.first()).isEqualTo(sickday)
    }

    @Test
    fun `should delete sickday from repository`() {
        var res: MutableIterable<Sickday>
        val sickdayList: MutableList<Sickday> = mutableListOf()
        val startDate = LocalDate.of(1970, 1, 1)

        for (i in 1..5) {
            var period = Period(
                from = startDate,
                to = LocalDate.of(1970, 1, i),
                days = convertDayOff(listOf(8, 8, 8, 8, 8), startDate)
            ).save()

            sickdayList.add(
                Sickday(
                    description = "$i sickday",
                    status = SickdayStatus.SICK,
                    hours = i * 8,
                    person = person,
                    period = period
                )
            )
        }

        val iterator: Iterator<Sickday> = sickdayList.iterator()
        for (sickday in iterator) {
            entity.persist(sickday)
        }
        entity.flush()
        res = repository.findAll()

        assertThat(res.toSet().size).isEqualTo(5)

        repository.deleteByCode(res.first().code)
        res = repository.findAll()
        assertThat(res.toSet().size).isEqualTo(4)
    }

    private fun Period.save() = periodRepository.save(this)
}
