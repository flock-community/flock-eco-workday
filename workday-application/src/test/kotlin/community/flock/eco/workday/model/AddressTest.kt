package community.flock.eco.workday.model

import community.flock.eco.workday.person.domain.Address
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class AddressTest {
    @Test
    fun `normalises a Dutch postal code to the canonical 1234 AB form`() {
        assertEquals("1234 AB", Address.normalizePostalCode("1234 AB"))
        assertEquals("1234 AB", Address.normalizePostalCode("1234ab"))
        assertEquals("1234 AB", Address.normalizePostalCode("  1234   Ab "))
    }

    @Test
    fun `rejects postal codes that are not Dutch`() {
        listOf("", "1234", "ABCD", "0234 AB", "12345 AB", "1234 A", "1234 ABC", "AB 1234", "SW1A 1AA", "1234 SA", "1234 SD", "1234 SS")
            .forEach { assertNull(Address.normalizePostalCode(it), "expected '$it' to be rejected") }
    }

    @Test
    fun `accepts plain house numbers`() {
        assertEquals("1", Address.normalizeHouseNumber(" 1 "))
        assertEquals("123", Address.normalizeHouseNumber("123"))
        assertEquals("99999", Address.normalizeHouseNumber("99999"))
    }

    @Test
    fun `rejects house numbers that are not a plain number`() {
        listOf("", "0", "012", "12A", "12-14", "12 bis", "100000", "twaalf")
            .forEach { assertNull(Address.normalizeHouseNumber(it), "expected '$it' to be rejected") }
    }
}
