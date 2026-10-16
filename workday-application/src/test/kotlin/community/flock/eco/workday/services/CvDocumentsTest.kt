package community.flock.eco.workday.services

import community.flock.eco.workday.application.cv.CvDocumentContent
import community.flock.eco.workday.application.cv.CvImages
import community.flock.eco.workday.application.cv.CvPdf
import community.flock.eco.workday.application.cv.CvWord
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.CvSkill
import community.flock.eco.workday.application.model.Person
import org.apache.pdfbox.Loader
import org.apache.pdfbox.text.PDFTextStripper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import java.util.zip.ZipInputStream

class CvDocumentsTest {
    private val logoId = UUID.randomUUID()

    private val svg =
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 10"><rect width="10" height="10" fill="#ff6200"/></svg>"""

    private fun cv(language: CvLanguage = CvLanguage.NL) =
        Cv(
            person =
                Person(
                    firstname = "Tommy",
                    lastname = "Dog",
                    email = "tommy@sesam.straat",
                    position = "",
                    number = null,
                    birthdate = LocalDate.of(1980, 5, 8),
                    user = null,
                ),
            name = "Algemeen",
            language = language,
            place = "Hilversum",
            phone = "0612345678",
            summary = "Tommy is een **ervaren** engineer.\n\nHij bouwt graag dingen.",
            experiences =
                listOf(
                    CvExperience(
                        from = YearMonth.of(2022, 12),
                        to = YearMonth.of(2024, 7),
                        role = "Software Engineer",
                        client = "ING",
                        employer = "Flock",
                        technologies = listOf("Kotlin", "Typescript"),
                        description =
                            "Werkte aan Baker.\nOp twee regels.\n\n- Ontwerp\n- Bouw\n  - genest\n\n1. Eerste\n2. Tweede\n\n" +
                                "Zie [Baker](https://ing-bank.github.io/baker/) <b>en</b> ![een plaatje](https://example.com/x.png).",
                        logoId = logoId,
                    ),
                    CvExperience(
                        from = YearMonth.of(2007, 1),
                        to = YearMonth.of(2012, 12),
                        role = "Java engineer",
                        client = "Information Makers",
                    ),
                ),
            skills =
                listOf(
                    CvSkill(category = "Programming", name = "Java", level = 3),
                    CvSkill(category = "Tools", name = "Git", level = 4),
                    CvSkill(category = "Programming", name = "Kotlin", level = 5),
                ),
            education = "Master, Rotterdam (2012)\n\nTrainingen\nScrum master",
            languages = "Nederlands – moedertaal\nEngels – uitstekend",
        )

    private fun content(cv: Cv = cv()) =
        CvDocumentContent(
            cv = cv,
            photo = CvImages.photo(svg.toByteArray(), 91.0),
            logos = mapOf(logoId to CvImages.logo(svg.toByteArray(), 90.0, 48.0)!!),
            disc = CvImages.disc(44.0),
            today = YearMonth.of(2026, 10),
        )

    private fun pdfText(pdf: ByteArray) = Loader.loadPDF(pdf).use { PDFTextStripper().apply { sortByPosition = true }.getText(it) }

    private fun docx(docx: ByteArray): Map<String, String> =
        ZipInputStream(ByteArrayInputStream(docx)).use { zip ->
            generateSequence { zip.nextEntry }
                .associate { it.name to (if (it.name.endsWith(".png")) "" else zip.readBytes().toString(Charsets.UTF_8)) }
        }

    /** The text of a Word part, one paragraph a line. */
    private fun wordText(xml: String) =
        xml
            .split("</w:p>")
            .map { p -> Regex("<w:t[^>]*>([^<]*)</w:t>|<w:tab/>").findAll(p).joinToString("") { it.groupValues[1].ifEmpty { "\t" } } }
            .filter { it.isNotEmpty() }
            .joinToString("\n")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")

    private val expected =
        listOf(
            "Curriculum Vitae - Tommy Dog",
            "Naam:",
            "Tommy Dog",
            "Hilversum",
            "08-05-1980",
            "Tommy is een ervaren engineer.",
            "Hij bouwt graag dingen.",
            "Werkervaring",
            "Periode",
            "12-2022 - 07-2024",
            "20",
            "ING (via Flock)",
            "Information Makers",
            "december 2022 - juli 2024",
            "Kotlin, Typescript",
            "Werkte aan Baker.",
            "Op twee regels.",
            "Ontwerp",
            "genest",
            "Tweede",
            "Baker",
            "<b>en</b>",
            "een plaatje",
            "Opleiding",
            "Master, Rotterdam (2012)",
            "Trainingen",
            "Scrum master",
            "Programming",
            "Kotlin",
            "Java",
            "Tools",
            "Git",
            "Talen",
            "Nederlands – moedertaal",
        )

    private fun assertInOrder(text: String) {
        var at = 0
        expected.forEach {
            val found = text.indexOf(it, at)
            assertThat(found).describedAs("'%s' after position %d in:\n%s", it, at, text).isGreaterThanOrEqualTo(0)
            at = found
        }
    }

    @Test
    fun `the PDF holds the CV in the order of the template`() {
        val pdf = CvPdf.render(content())
        save("cv.pdf", pdf)
        assertThat(String(pdf, 0, 5)).isEqualTo("%PDF-")
        assertInOrder(pdfText(pdf))
    }

    @Test
    fun `the PDF starts the assignments on a page of their own`() {
        val pages = Loader.loadPDF(CvPdf.render(content())).use { it.numberOfPages }
        assertThat(pages).isEqualTo(2)
    }

    @Test
    fun `the Word document holds the CV in the order of the template`() {
        val word = CvWord.render(content())
        save("cv.docx", word)
        val parts = docx(word)
        assertThat(parts.keys).contains(
            "[Content_Types].xml",
            "word/document.xml",
            "word/header1.xml",
            "word/footer1.xml",
            "word/numbering.xml",
        )
        assertInOrder(wordText(parts.getValue("word/header1.xml")) + "\n" + wordText(parts.getValue("word/document.xml")))
        assertThat(parts.getValue("word/document.xml")).contains("<w:pageBreakBefore")
        assertThat(parts.getValue("word/_rels/document.xml.rels")).contains("https://ing-bank.github.io/baker/")
        assertThat(parts.getValue("word/footer1.xml")).contains("PAGE")
        // The photo, the logo, the disc and the yellow band
        assertThat(parts.keys.filter { it.startsWith("word/media/") }).hasSize(4)
    }

    @Test
    fun `an English CV has the English labels`() {
        val content = content(cv(CvLanguage.EN))
        val text = wordText(docx(CvWord.render(content)).getValue("word/document.xml"))
        assertThat(text).contains("Work experience", "December 2022 - July 2024", "Technologies:")
        assertThat(pdfText(CvPdf.render(content))).contains("Work experience", "December 2022 - July 2024")
    }

    @Test
    fun `an image that cannot be read is left out`() {
        assertThat(CvImages.logo("not an image".toByteArray(), 90.0, 48.0)).isNull()
        // An SVG that points elsewhere is not drawn
        val external =
            """<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg">&x;</svg>"""
        assertThat(CvImages.logo(external.toByteArray(), 90.0, 48.0)).isNull()
    }

    @Test
    fun `a logo keeps its shape within its box`() {
        val logo = CvImages.logo(svg.toByteArray(), 90.0, 48.0)!!
        assertThat(logo.width).isEqualTo(90.0)
        assertThat(logo.height).isEqualTo(30.0)
    }

    /** With -Dcv.output=<dir> the documents are saved there, to look at. */
    private fun save(
        name: String,
        data: ByteArray,
    ) {
        System.getProperty("cv.output")?.let { Files.write(Path.of(it, name), data) }
    }
}
