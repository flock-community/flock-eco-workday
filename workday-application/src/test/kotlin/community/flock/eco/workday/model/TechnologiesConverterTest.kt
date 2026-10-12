package community.flock.eco.workday.model

import community.flock.eco.workday.application.model.TechnologiesConverter
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class TechnologiesConverterTest {
    private val converter = TechnologiesConverter()

    @Test
    fun `stores technologies as a JSON array, commas and quotes included`() {
        val technologies = listOf("Kotlin", "HTML, CSS", "\"Lit\" elements")
        val stored = converter.convertToDatabaseColumn(technologies)

        assertEquals("""["Kotlin","HTML, CSS","\"Lit\" elements"]""", stored)
        assertEquals(technologies, converter.convertToEntityAttribute(stored))
    }

    @Test
    fun `stores no technologies as null`() {
        assertNull(converter.convertToDatabaseColumn(emptyList()))
        assertEquals(emptyList(), converter.convertToEntityAttribute(null))
    }

    @Test
    fun `still reads technologies stored comma separated`() {
        assertEquals(listOf("Kotlin", "React"), converter.convertToEntityAttribute("Kotlin, React"))
    }
}
