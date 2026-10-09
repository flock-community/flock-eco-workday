package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.PersonRepository
import org.apache.pdfbox.Loader
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.text.PDFTextStripper
import org.apache.pdfbox.text.TextPosition
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.io.IOException

class CvImportException(
    override val message: String,
) : RuntimeException(message)

/** A CV read from a PDF, not stored yet: the user checks it in the editor and saves it. */
data class CvImport(
    val cv: ParsedCv,
    /** The person the CV is about, when the e-mail address or name on it matches one. */
    val person: Person?,
)

@Service
class CvImportService(
    private val personRepository: PersonRepository,
) {
    /**
     * Reads a CV in the Flock template from [pdf]. With [matchPerson] the person the CV
     * belongs to is looked up by the e-mail address on it, or else by the full name.
     */
    fun read(
        pdf: ByteArray,
        matchPerson: Boolean,
    ): CvImport {
        if (pdf.size > MAX_PDF_SIZE) throw CvImportException("The PDF may be at most ${MAX_PDF_SIZE / 1024 / 1024} MB")
        val cv = FlockCvParser.parse(pdf.text())
        if (cv.isEmpty()) throw CvImportException("No CV found in this PDF")
        return CvImport(
            cv = cv,
            person = if (matchPerson) cv.findPerson() else null,
        )
    }

    private fun ByteArray.text(): String =
        try {
            Loader.loadPDF(this).use { document ->
                ParagraphTextStripper()
                    .apply { sortByPosition = true }
                    .getText(document)
            }
        } catch (e: IOException) {
            throw CvImportException("The file is not a readable PDF")
        }

    private fun ParsedCv.findPerson(): Person? =
        email?.let { personRepository.findFirstByEmailIgnoreCase(it) }
            ?: name?.let { fullName ->
                personRepository
                    .findAllByFullName(Pageable.unpaged(), fullName)
                    .content
                    .singleOrNull { it.getFullName().equals(fullName, ignoreCase = true) }
            }

    /**
     * Text extraction that marks the white space between paragraphs with an empty line.
     * A PDF made by a browser has no empty lines between paragraphs, only a larger gap;
     * without this the paragraphs of a description would run together.
     */
    private class ParagraphTextStripper : PDFTextStripper() {
        private var lastLineY: Float? = null

        override fun startPage(page: PDPage) {
            lastLineY = null
            super.startPage(page)
        }

        override fun writeString(
            text: String,
            textPositions: List<TextPosition>,
        ) {
            textPositions.firstOrNull()?.let { first ->
                val y = first.yDirAdj
                val previous = lastLineY
                // Lines run about 1.2 to 1.5 font sizes apart; a paragraph adds at least half a line
                if (previous != null && y - previous > first.fontSizeInPt * PARAGRAPH_GAP) writeLineSeparator()
                lastLineY = y
            }
            super.writeString(text, textPositions)
        }
    }

    companion object {
        private const val PARAGRAPH_GAP = 1.75f
        const val MAX_PDF_SIZE = 10 * 1024 * 1024
    }
}
