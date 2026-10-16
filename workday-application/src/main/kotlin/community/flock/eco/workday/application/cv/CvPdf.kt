package community.flock.eco.workday.application.cv

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle
import com.openhtmltopdf.outputdevice.helper.ExternalResourceControlPriority
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.Base64
import javax.imageio.ImageIO

/**
 * A CV in the Flock template as PDF, laid out like the CV in the browser
 * (features/cv/CvDocument.tsx): the name and the Flock logo on top of every page, the
 * yellow band along its left edge and its number at the bottom right; the personal
 * details with the photo, the profile, an overview of the working experience, a section
 * per assignment, and the skills, education and languages as lists.
 */
object CvPdf {
    private const val FONT = "DejaVu Sans"

    private val fonts =
        listOf(
            Triple("DejaVuSans.ttf", 400, FontStyle.NORMAL),
            Triple("DejaVuSans-Bold.ttf", 700, FontStyle.NORMAL),
            Triple("DejaVuSans-Oblique.ttf", 400, FontStyle.ITALIC),
            Triple("DejaVuSans-BoldOblique.ttf", 700, FontStyle.ITALIC),
        )

    fun render(content: CvDocumentContent): ByteArray {
        val output = ByteArrayOutputStream()
        PdfRendererBuilder()
            .useFastMode()
            .apply {
                fonts.forEach { (file, weight, style) ->
                    useFont({ CvPdf::class.java.getResourceAsStream("/cv/fonts/$file") }, FONT, weight, style, true)
                }
            }
            // Everything the CV shows is in the document itself: nothing is fetched
            .useExternalResourceAccessControl(
                { uri, _ -> uri.startsWith("data:") },
                ExternalResourceControlPriority.RUN_AFTER_RESOLVING_URI,
            ).useExternalResourceAccessControl(
                { uri, _ -> uri.startsWith("data:") },
                ExternalResourceControlPriority.RUN_BEFORE_RESOLVING_URI,
            ).withHtmlContent(html(content), null)
            .toStream(output)
            .run()
        return output.toByteArray()
    }

    /** The CV as XHTML, which is what the PDF is drawn from. */
    fun html(content: CvDocumentContent): String {
        val labels = content.labels
        val cv = content.cv
        return buildString {
            append("<!DOCTYPE html>\n<html lang=\"${cv.language.name.lowercase()}\"><head><meta charset=\"utf-8\" />")
            append("<title>${esc(content.title)}</title><style>")
            append(STYLES)
            // The yellow band along the left edge of every page
            append("@page { background-image: url(data:image/png;base64,$YELLOW); background-size: 3mm 297mm; ")
            append("background-repeat: no-repeat; background-position: 0 0; }")
            append("</style></head><body>")

            // The name and the Flock logo, repeated on top of every page
            append("<div id=\"header\"><table class=\"layout\"><tr>")
            append("<td class=\"title\">${esc(content.title)}</td>")
            append("<td class=\"disc\">")
            content.disc?.let { append(img(it, "Flock")) }
            append("</td></tr></table></div>")

            content.photo?.let { append("<div class=\"photo\">${img(it, content.name)}</div>") }
            if (content.details.isNotEmpty()) {
                append("<table class=\"details\">")
                content.details.forEach { (label, value) ->
                    append("<tr><td class=\"label\">${esc(label)}:</td><td>${esc(value)}</td></tr>")
                }
                append("</table>")
            }

            if (!cv.summary.isNullOrBlank()) {
                append("<div class=\"summary markdown\">${CvMarkdown.html(cv.summary)}</div>")
            }

            if (cv.experiences.isNotEmpty()) {
                append("<div class=\"experience\"><h2>${esc(labels.workingExperience)}</h2>")
                append("<table class=\"overview\"><colgroup>")
                listOf(24, 32, 10, 34).forEach { append("<col style=\"width: $it%\" />") }
                append("</colgroup><thead><tr>")
                listOf(labels.period, labels.function, labels.months, labels.clientColumn).forEach { append("<th>${esc(it)}</th>") }
                append("</tr></thead><tbody>")
                cv.experiences.forEach {
                    append("<tr><td>${esc(content.periodText(it))}</td><td>${esc(it.role)}</td>")
                    append("<td>${content.monthsWorked(it)}</td><td>${esc(clientText(it))}</td></tr>")
                }
                append("</tbody></table></div>")
            }

            content.assignments.forEachIndexed { index, it ->
                append("<div class=\"assignment${if (index == 0) " first" else ""}\">")
                append("<table class=\"assignment-head\"><tr><td><table class=\"facts\">")
                listOfNotNull(
                    labels.period to content.longPeriodText(it),
                    labels.client to clientText(it),
                    labels.role to it.role,
                    it.technologies.takeIf { t -> t.isNotEmpty() }?.let { t -> labels.technologies to t.joinToString(", ") },
                ).forEach { (label, value) ->
                    append("<tr><th>${esc(label)}:</th><td>${esc(value)}</td></tr>")
                }
                append("</table></td>")
                content.logoOf(it)?.let { logo -> append("<td class=\"logo\">${img(logo, "Logo ${it.client}")}</td>") }
                append("</tr></table>")
                append("<div class=\"markdown\">${CvMarkdown.html(it.description)}</div>")
                append("</div>")
            }

            content.sectionsBeforeSkills.forEach { append(section(it.heading, it.items.map(::esc))) }
            content.skillGroups.forEach { (heading, skills) ->
                append(
                    section(
                        heading,
                        skills.map {
                            "<span class=\"skill\">${esc(it.name)}</span>" +
                                (
                                    it.level
                                        ?.takeIf { level ->
                                            level > 0
                                        }?.let { level -> "<span class=\"stars\">${"*".repeat(level)}</span>" }
                                        ?: ""
                                )
                        },
                    ),
                )
            }
            content.sectionsAfterSkills.forEach { append(section(it.heading, it.items.map(::esc))) }

            append("</body></html>")
        }
    }

    /** A yellow pixel, stretched to the band along the left edge of the page. */
    private val YELLOW: String =
        BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB)
            .apply { setRGB(0, 0, 0xFCDE00) }
            .let { image -> ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray() }
            .let { Base64.getEncoder().encodeToString(it) }

    private fun section(
        heading: String,
        items: List<String>,
    ) = buildString {
        append("<div class=\"section\"><h2>${esc(heading)}</h2>")
        if (items.isNotEmpty()) {
            append("<ul>")
            items.forEach { append("<li>$it</li>") }
            append("</ul>")
        }
        append("</div>")
    }

    private fun img(
        image: CvImage,
        alt: String,
    ) = "<img src=\"data:image/png;base64,${Base64.getEncoder().encodeToString(image.png)}\" alt=\"${esc(alt)}\" " +
        "style=\"width: ${image.width}pt; height: ${image.height}pt\" />"

    private fun esc(text: String) =
        text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")

    // The sizes of the template, in points; the page margins hold the header and the page number
    private val STYLES =
        """
        @page {
            size: A4;
            margin: 33mm 25mm 20mm 25mm;
            @top-center { content: element(header); vertical-align: bottom; }
            @bottom-right {
                content: counter(page);
                font: 10pt '$FONT';
                vertical-align: top;
                padding-top: 6mm;
            }
        }
        body { font-family: '$FONT'; font-size: 9pt; line-height: 1.5; color: #000; margin: 0; }
        p { margin: 0 0 1.5em 0; }
        a { color: #1a56c4; }
        table.layout { width: 100%; border-collapse: collapse; }
        table.layout td { padding: 0; }
        #header { position: running(header); width: 100%; padding-bottom: 14pt; }
        #header table { border-bottom: 0.75pt solid #9e9e9e; }
        #header .title { font-size: 17pt; line-height: 1.2; vertical-align: bottom; padding-bottom: 6pt; }
        #header .disc { text-align: right; vertical-align: bottom; width: 50pt; padding-bottom: 6pt; }
        .photo { float: right; margin: 8pt 0 8pt 12pt; }
        table.details { border-collapse: collapse; margin-bottom: 13.5pt; }
        table.details td { padding: 0; vertical-align: top; }
        table.details td.label { width: 144pt; }
        .summary { font-style: italic; text-align: justify; }
        .experience { clear: both; padding-top: 13.5pt; margin-bottom: 27pt; page-break-inside: avoid; }
        h2 { font-size: 9pt; font-weight: bold; margin: 0; }
        table.overview { width: 100%; border-collapse: collapse; -fs-table-paginate: paginate; }
        table.overview th, table.overview td {
            border: 0.75pt solid #000; padding: 5pt 4.5pt; text-align: left; vertical-align: top;
        }
        table.overview th { font-size: 8pt; font-weight: bold; }
        table.overview tr { page-break-inside: avoid; }
        .assignment { clear: both; margin-bottom: 13.5pt; }
        .assignment.first { page-break-before: always; }
        .assignment + .assignment { margin-top: 27pt; padding-top: 13.5pt; border-top: 0.75pt solid #9e9e9e; }
        table.assignment-head { width: 100%; border-collapse: collapse; margin-bottom: 13.5pt; page-break-inside: avoid; }
        table.assignment-head > tbody > tr > td, table.assignment-head > tr > td { padding: 0; vertical-align: top; }
        table.facts { border-collapse: collapse; line-height: 1.35; }
        table.facts th, table.facts td { padding: 0; vertical-align: top; text-align: left; }
        table.facts th { font-weight: bold; min-width: 82pt; padding-right: 4pt; white-space: nowrap; }
        table.facts td { font-style: italic; }
        td.logo { text-align: right; width: 100pt; }
        .markdown ul, .markdown ol { margin: 0 0 0.9em 0; padding-left: 1.6em; text-align: left; }
        .markdown li > p { margin: 0; }
        .markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6 {
            font-size: 10pt; font-weight: bold; margin: 0 0 0.5em 0;
        }
        .markdown blockquote { margin: 0 0 0.9em 0; padding-left: 1em; }
        .markdown code { font-family: monospace; font-size: 0.95em; }
        .section { clear: both; margin-bottom: 18pt; page-break-inside: avoid; }
        .section h2 { font-size: 13pt; font-weight: normal; color: #434343; margin: 0 0 8pt 0; }
        .section ul { margin: 0; padding-left: 36pt; list-style: disc; }
        .section li { padding-left: 4pt; }
        .skill { display: inline-block; min-width: 2in; padding-right: 18pt; }
        .stars { letter-spacing: 0.12em; }
        """.trimIndent()
}
