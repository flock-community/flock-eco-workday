package community.flock.eco.workday.application.cv

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle
import com.openhtmltopdf.outputdevice.helper.ExternalResourceControlPriority
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import community.flock.eco.workday.application.model.CvExperience
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context
import org.thymeleaf.templatemode.TemplateMode
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.Base64
import javax.imageio.ImageIO

/**
 * A CV in the Flock template as PDF: the Thymeleaf template `cv/cv.html` filled in with
 * the CV, then drawn by OpenHTMLtoPDF with DejaVu Sans embedded.
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

    private val templates =
        TemplateEngine().apply {
            setTemplateResolver(
                ClassLoaderTemplateResolver().apply {
                    prefix = "cv/"
                    suffix = ".html"
                    templateMode = TemplateMode.HTML
                    characterEncoding = "UTF-8"
                },
            )
        }

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
    fun html(content: CvDocumentContent): String =
        templates.process(
            "cv",
            Context().apply {
                setVariable("content", content)
                setVariable("pdf", Helpers)
                setVariable("band", BAND)
                setVariable(
                    "lang",
                    content.cv.language.name
                        .lowercase(),
                )
            },
        )

    /** What the template cannot easily do on its own. */
    object Helpers {
        /** An image as a data URL: the PDF fetches nothing from elsewhere. */
        fun src(image: CvImage) = dataUrl(image.png)

        /** The size of an image on the page. */
        fun size(image: CvImage) = "width: ${image.width}pt; height: ${image.height}pt"

        /** CV text written in Markdown, as XHTML. */
        fun markdown(text: String?) = CvMarkdown.html(text)

        fun client(experience: CvExperience) = clientText(experience)

        /** The rating of a skill as asterisks, the way the CV template shows it. */
        fun stars(level: Int) = "*".repeat(level)
    }

    /** A yellow pixel, stretched to the band along the left edge of the page. */
    private val BAND: String =
        BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB)
            .apply { setRGB(0, 0, 0xFCDE00) }
            .let { image -> ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray() }
            .let(::dataUrl)

    private fun dataUrl(png: ByteArray) = "data:image/png;base64,${Base64.getEncoder().encodeToString(png)}"
}
