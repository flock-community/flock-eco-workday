package community.flock.eco.workday.services

import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.application.services.CvImportException
import community.flock.eco.workday.application.services.CvImportService
import community.flock.eco.workday.model.aPerson
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.verify
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.font.PDType1Font
import org.apache.pdfbox.pdmodel.font.Standard14Fonts
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.io.ByteArrayOutputStream
import java.time.YearMonth
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertSame

@ExtendWith(MockKExtension::class)
class CvImportServiceTest {
    @MockK
    lateinit var personRepository: PersonRepository

    @InjectMockKs
    lateinit var cvImportService: CvImportService

    /** A PDF with one line of text per entry of [pages]; an empty line leaves a gap. */
    private fun pdf(vararg pages: List<String>): ByteArray =
        PDDocument().use { document ->
            val font = PDType1Font(Standard14Fonts.FontName.HELVETICA)
            pages.forEach { lines ->
                val page = PDPage()
                document.addPage(page)
                PDPageContentStream(document, page).use { stream ->
                    stream.beginText()
                    stream.setFont(font, 10f)
                    stream.setLeading(14f)
                    stream.newLineAtOffset(50f, 740f)
                    lines.forEach { line ->
                        stream.showText(line)
                        stream.newLine()
                    }
                    stream.endText()
                }
            }
            ByteArrayOutputStream().also { document.save(it) }.toByteArray()
        }

    private val cv =
        pdf(
            listOf(
                "Curriculum Vitae - Tommy Dog",
                "",
                "Name Tommy Dog",
                "Place Hilversum",
                "Mail tommy@sesam.straat",
                "",
                "Tommy is an engineer who likes to build things for the people that use them.",
                "",
                "Working experience",
                "",
                "Period Function Months Employer / client",
                "08-2024 - now Software Engineer 8 ING (via Flock)",
                "",
                "Tommy Dog page 1",
            ),
            listOf(
                "Curriculum Vitae - Tommy Dog",
                "Period 08-2024 - now",
                "Client ING (via Flock)",
                "Role Software Engineer",
                "Technologies Kotlin, React",
                "",
                "Tommy rebuilt the business portal of the bank.",
                "",
                "Tommy Dog page 2",
            ),
        )

    @Test
    fun `reads a CV from the text of a PDF and finds the person by e-mail address`() {
        val tommy = aPerson()
        every { personRepository.findFirstByEmailIgnoreCase("tommy@sesam.straat") } returns tommy

        val imported = cvImportService.read(cv, matchPerson = true)

        assertSame(tommy, imported.person)
        assertEquals("Tommy Dog", imported.cv.name)
        assertEquals("Hilversum", imported.cv.place)
        assertEquals("Tommy is an engineer who likes to build things for the people that use them.", imported.cv.summary)
        val experience = imported.cv.experiences.single()
        assertEquals(YearMonth.of(2024, 8), experience.from)
        assertNull(experience.to)
        assertEquals("ING", experience.client)
        assertEquals("Flock", experience.employer)
        assertEquals(listOf("Kotlin", "React"), experience.technologies)
        assertEquals("Tommy rebuilt the business portal of the bank.", experience.description)
    }

    @Test
    fun `keeps paragraphs apart when the PDF only leaves white space between them`() {
        // A browser prints no empty lines, only a larger gap: two lines down instead of one
        val printed =
            PDDocument().use { document ->
                val page = PDPage()
                document.addPage(page)
                PDPageContentStream(document, page).use { stream ->
                    stream.beginText()
                    stream.setFont(PDType1Font(Standard14Fonts.FontName.HELVETICA), 10f)
                    stream.newLineAtOffset(50f, 740f)
                    listOf(
                        0f to "Curriculum Vitae - Tommy Dog",
                        14f to "Name Tommy Dog",
                        24f to "Tommy is an engineer who",
                        14f to "likes to build things.",
                        24f to "He is a team player.",
                    ).forEach { (down, line) ->
                        stream.newLineAtOffset(0f, -down)
                        stream.showText(line)
                    }
                    stream.endText()
                }
                ByteArrayOutputStream().also { document.save(it) }.toByteArray()
            }

        assertEquals(
            "Tommy is an engineer who likes to build things.\n\nHe is a team player.",
            cvImportService.read(printed, matchPerson = false).cv.summary,
        )
    }

    @Test
    fun `does not look for the person unless asked to`() {
        val imported = cvImportService.read(cv, matchPerson = false)

        assertNull(imported.person)
        verify(exactly = 0) { personRepository.findFirstByEmailIgnoreCase(any()) }
    }

    @Test
    fun `rejects a file that is no PDF, a PDF without a CV and a PDF that is too large`() {
        assertEquals(
            "The file is not a readable PDF",
            assertThrows<CvImportException> { cvImportService.read("not a pdf".toByteArray(), matchPerson = false) }.message,
        )
        assertEquals(
            "No CV found in this PDF",
            assertThrows<CvImportException> { cvImportService.read(pdf(listOf("Invoice 2024-001", "Total 12,50")), matchPerson = false) }.message,
        )
        assertEquals(
            "The PDF may be at most 10 MB",
            assertThrows<CvImportException> {
                cvImportService.read(ByteArray(CvImportService.MAX_PDF_SIZE + 1), matchPerson = false)
            }.message,
        )
    }
}
