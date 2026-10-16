package community.flock.eco.workday.application.cv

import org.commonmark.ext.autolink.AutolinkExtension
import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension
import org.commonmark.node.Image
import org.commonmark.node.Node
import org.commonmark.node.Text
import org.commonmark.parser.Parser
import org.commonmark.renderer.NodeRenderer
import org.commonmark.renderer.html.HtmlNodeRendererContext
import org.commonmark.renderer.html.HtmlRenderer

/**
 * CV text written in Markdown, the way the CV in the browser renders it
 * (features/cv/CvMarkdown.tsx): bullet lists, **bold**, *italic*, links and so on. Raw
 * HTML shows as the text it is, and a single line break stays a line break, as in the
 * plain text descriptions written before.
 */
object CvMarkdown {
    private val extensions = listOf(AutolinkExtension.create(), StrikethroughExtension.create())

    private val parser = Parser.builder().extensions(extensions).build()

    private val html =
        HtmlRenderer
            .builder()
            .extensions(extensions)
            .escapeHtml(true)
            .sanitizeUrls(true)
            .softbreak("<br />")
            // An image is never fetched: it shows its description
            .nodeRendererFactory { context -> ImageAsText(context) }
            .build()

    fun parse(text: String): Node = parser.parse(text.replace("\r\n", "\n"))

    /** The Markdown as XHTML, ready for a document. */
    fun html(text: String?): String = if (text.isNullOrBlank()) "" else html.render(parse(text))

    private class ImageAsText(
        private val context: HtmlNodeRendererContext,
    ) : NodeRenderer {
        override fun getNodeTypes(): Set<Class<out Node>> = setOf(Image::class.java)

        override fun render(node: Node) {
            context.writer.text(altText(node))
        }
    }

    /** The description of an image: the text within its brackets. */
    fun altText(node: Node): String =
        buildString {
            var child = node.firstChild
            while (child != null) {
                if (child is Text) append(child.literal) else append(altText(child))
                child = child.next
            }
        }
}
