package community.flock.eco.workday.services

import community.flock.eco.workday.application.forms.LaptopForm
import community.flock.eco.workday.application.model.Laptop
import community.flock.eco.workday.application.repository.LaptopRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.application.services.LaptopInvalidInputException
import community.flock.eco.workday.application.services.LaptopPersonNotFoundException
import community.flock.eco.workday.application.services.LaptopSerialNumberInUseException
import community.flock.eco.workday.application.services.LaptopService
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.time.LocalDate
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertSame

@ExtendWith(MockKExtension::class)
class LaptopServiceTest {
    @MockK
    lateinit var laptopRepository: LaptopRepository

    @MockK
    lateinit var personRepository: PersonRepository

    @InjectMockKs
    lateinit var laptopService: LaptopService

    private fun form(
        name: String = "MacBook Pro",
        serialNumber: String = "C02XK1",
        contractSigned: Boolean = false,
        purchaseDate: LocalDate? = null,
        personId: UUID? = null,
    ) = LaptopForm(
        name = name,
        serialNumber = serialNumber,
        contractSigned = contractSigned,
        purchaseDate = purchaseDate,
        personId = personId,
    )

    private fun stubSave() {
        val saved = slot<Laptop>()
        every { laptopRepository.save(capture(saved)) } answers { saved.captured }
    }

    @Test
    fun `create trims the name and serial number and links the person`() {
        val person = aPerson()
        every { laptopRepository.findBySerialNumberIgnoreCase("C02XK1") } returns null
        every { personRepository.findByUuid(person.uuid) } returns Optional.of(person)
        stubSave()

        val laptop =
            laptopService.create(
                form(
                    name = "  MacBook Pro ",
                    serialNumber = " C02XK1 ",
                    contractSigned = true,
                    purchaseDate = LocalDate.of(2024, 5, 3),
                    personId = person.uuid,
                ),
            )

        assertEquals("MacBook Pro", laptop.name)
        assertEquals("C02XK1", laptop.serialNumber)
        assertEquals(true, laptop.contractSigned)
        assertEquals(LocalDate.of(2024, 5, 3), laptop.purchaseDate)
        assertSame(person, laptop.person)
    }

    @Test
    fun `create without a person leaves the laptop unassigned`() {
        every { laptopRepository.findBySerialNumberIgnoreCase("C02XK1") } returns null
        stubSave()

        val laptop = laptopService.create(form())

        assertNull(laptop.person)
        verify(exactly = 0) { personRepository.findByUuid(any()) }
    }

    @Test
    fun `create rejects a blank name or serial number`() {
        assertThrows<LaptopInvalidInputException> { laptopService.create(form(name = "  ")) }
        assertThrows<LaptopInvalidInputException> { laptopService.create(form(serialNumber = "")) }
        verify(exactly = 0) { laptopRepository.save(any()) }
    }

    @Test
    fun `create rejects a serial number that another laptop already has`() {
        every { laptopRepository.findBySerialNumberIgnoreCase("C02XK1") } returns Laptop(id = 7, name = "Other", serialNumber = "c02xk1")

        assertThrows<LaptopSerialNumberInUseException> { laptopService.create(form()) }
        verify(exactly = 0) { laptopRepository.save(any()) }
    }

    @Test
    fun `create rejects an unknown person`() {
        val personId = UUID.randomUUID()
        every { laptopRepository.findBySerialNumberIgnoreCase("C02XK1") } returns null
        every { personRepository.findByUuid(personId) } returns Optional.empty()

        assertThrows<LaptopPersonNotFoundException> { laptopService.create(form(personId = personId)) }
        verify(exactly = 0) { laptopRepository.save(any()) }
    }

    @Test
    fun `update keeps the id and code and may keep its own serial number`() {
        val existing =
            Laptop(id = 7, code = "the-code", name = "Old name", serialNumber = "C02XK1", contractSigned = false, person = aPerson())
        every { laptopRepository.findByCode("the-code") } returns existing
        every { laptopRepository.findBySerialNumberIgnoreCase("C02XK1") } returns existing
        stubSave()

        val updated = laptopService.update("the-code", form(name = "New name", contractSigned = true))

        assertEquals(7, updated?.id)
        assertEquals("the-code", updated?.code)
        assertEquals("New name", updated?.name)
        assertEquals(true, updated?.contractSigned)
        assertNull(updated?.person)
    }

    @Test
    fun `update rejects the serial number of another laptop`() {
        val existing = Laptop(id = 7, code = "the-code", name = "Mine", serialNumber = "MINE")
        every { laptopRepository.findByCode("the-code") } returns existing
        every { laptopRepository.findBySerialNumberIgnoreCase("THEIRS") } returns Laptop(id = 8, name = "Theirs", serialNumber = "THEIRS")

        assertThrows<LaptopSerialNumberInUseException> { laptopService.update("the-code", form(serialNumber = "THEIRS")) }
        verify(exactly = 0) { laptopRepository.save(any()) }
    }

    @Test
    fun `update of an unknown code returns null`() {
        every { laptopRepository.findByCode("unknown") } returns null

        assertNull(laptopService.update("unknown", form()))
        verify(exactly = 0) { laptopRepository.save(any()) }
    }
}
