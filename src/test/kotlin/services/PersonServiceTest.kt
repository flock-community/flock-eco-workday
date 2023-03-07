package services

import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
import community.flock.eco.workday.services.PersonService
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import java.time.LocalDate
import java.time.Month
import kotlin.test.assertEquals

@ExtendWith(MockKExtension::class)
class PersonServiceTest {
    @MockK
    lateinit var repository: PersonRepository

    @MockK
    lateinit var userRepository: UserRepository

    @InjectMockKs
    lateinit var personService: PersonService

    @Test
    fun `find person events when birthday is in next year`() {
        val start = LocalDate.of(2022, Month.DECEMBER, 1)
        val end = LocalDate.of(2023, Month.JANUARY, 31)
        val person = Person(
            firstname = "john",
            lastname = "doe",
            email = "john@doe",
            position = "Software engineer",
            number = null,
            user = null,
            birthdate = LocalDate.of(1985, Month.JANUARY, 1)
        )

        every { repository.findAllByActive(Pageable.unpaged(), true) } returns PageImpl(listOf(person))

        val result = personService.findAllPersonEvents(start, end)

        assertEquals(1, result.size)
    }

    @Test
    fun `find person events same year`() {
        val start = LocalDate.of(2022, Month.DECEMBER, 1)
        val end = LocalDate.of(2022, Month.DECEMBER, 31)
        val person = Person(
            firstname = "john",
            lastname = "doe",
            email = "john@doe",
            position = "Software engineer",
            number = null,
            user = null,
            birthdate = LocalDate.of(1985, Month.DECEMBER, 15)
        )

        every { repository.findAllByActive(Pageable.unpaged(), true) } returns PageImpl(listOf(person))

        val result = personService.findAllPersonEvents(start, end)

        assertEquals(1, result.size)
    }
}
