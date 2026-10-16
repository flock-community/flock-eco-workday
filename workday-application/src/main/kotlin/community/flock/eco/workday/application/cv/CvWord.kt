package community.flock.eco.workday.application.cv

import community.flock.eco.workday.application.model.CvExperience
import org.commonmark.ext.gfm.strikethrough.Strikethrough
import org.commonmark.node.BlockQuote
import org.commonmark.node.BulletList
import org.commonmark.node.Code
import org.commonmark.node.Emphasis
import org.commonmark.node.FencedCodeBlock
import org.commonmark.node.HardLineBreak
import org.commonmark.node.Heading
import org.commonmark.node.HtmlBlock
import org.commonmark.node.HtmlInline
import org.commonmark.node.Image
import org.commonmark.node.IndentedCodeBlock
import org.commonmark.node.Link
import org.commonmark.node.ListBlock
import org.commonmark.node.ListItem
import org.commonmark.node.Node
import org.commonmark.node.OrderedList
import org.commonmark.node.SoftLineBreak
import org.commonmark.node.StrongEmphasis
import org.commonmark.node.Text
import org.commonmark.node.ThematicBreak
import java.awt.Color
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import javax.imageio.ImageIO
import kotlin.math.roundToInt
import kotlin.math.roundToLong
import org.commonmark.node.Paragraph as MarkdownParagraph

/**
 * A CV in the Flock template as a Word document (.docx), laid out like the CV in the
 * browser (features/cv/CvDocument.tsx) and its PDF: the name and the Flock logo on top
 * of every page, the yellow band along its left edge and its number at the bottom right;
 * the personal details with the photo, the profile, an overview of the working
 * experience, a section per assignment, and the skills, education and languages as lists.
 *
 * The document is written as WordprocessingML directly. Sizes are in twips (1/20 pt),
 * font sizes in half points and images in EMU (1/12700 pt).
 */
object CvWord {
    private const val INK = "000000"
    private const val RULE = "9E9E9E"
    private const val MUTED = "434343"
    private const val LINK = "1A56C4"
    private const val YELLOW = "FCDE00"
    private const val BODY_FONT = "Verdana"
    private const val TITLE_FONT = "Trebuchet MS"
    private const val HEADING_FONT = "Arial"

    private fun pt(points: Double) = (points * 20).roundToInt()

    private fun pt(points: Int) = points * 20

    private fun mm(millimetres: Double) = (millimetres / 25.4 * 1440).roundToInt()

    private fun emu(points: Double) = (points * 12700).roundToLong()

    private val PAGE_WIDTH = mm(210.0)
    private val PAGE_HEIGHT = mm(297.0)
    private val SIDE_MARGIN = mm(25.0)
    private val TEXT_WIDTH = PAGE_WIDTH - 2 * SIDE_MARGIN

    /** 1.5 times the 9pt body text, the line height of the CV. */
    private val BODY_LINE = pt(13.5)

    private const val PHOTO_SIZE = 91.0

    private const val SECTION_BULLETS = 1
    private const val MARKDOWN_BULLETS = 2
    private const val MARKDOWN_NUMBERS = 3

    fun render(content: CvDocumentContent): ByteArray = Writer(content).write()

    private class Writer(
        private val content: CvDocumentContent,
    ) {
        private val documentRels = Relationships()
        private val headerRels = Relationships()
        private val media = mutableListOf<Pair<String, ByteArray>>()
        private var drawings = 0

        /** The numbered lists of the Markdown: each counts from its own start. */
        private val numberedLists = mutableListOf<Int>()

        fun write(): ByteArray {
            val body = body()
            val header = header()
            val footer = footer()
            val output = ByteArrayOutputStream()
            ZipOutputStream(output).use { zip ->
                fun put(
                    name: String,
                    data: ByteArray,
                ) {
                    zip.putNextEntry(ZipEntry(name))
                    zip.write(data)
                    zip.closeEntry()
                }

                fun put(
                    name: String,
                    xml: String,
                ) = put(name, ("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n$xml").toByteArray())

                put("[Content_Types].xml", contentTypes())
                put(
                    "_rels/.rels",
                    Relationships()
                        .apply {
                            add(OFFICE_DOCUMENT, "word/document.xml")
                            add(CORE_PROPERTIES, "docProps/core.xml")
                        }.xml(),
                )
                put("docProps/core.xml", coreProperties())
                documentRels.add(STYLES, "styles.xml")
                documentRels.add(NUMBERING, "numbering.xml")
                documentRels.add(SETTINGS, "settings.xml")
                val headerId = documentRels.add(HEADER, "header1.xml")
                val footerId = documentRels.add(FOOTER, "footer1.xml")
                put("word/document.xml", document(body, headerId, footerId))
                put("word/_rels/document.xml.rels", documentRels.xml())
                put("word/header1.xml", "<w:hdr $NAMESPACES>$header</w:hdr>")
                put("word/_rels/header1.xml.rels", headerRels.xml())
                put("word/footer1.xml", "<w:ftr $NAMESPACES>$footer</w:ftr>")
                put("word/styles.xml", styles())
                put("word/numbering.xml", numbering())
                put("word/settings.xml", SETTINGS_XML)
                media.forEach { (name, data) -> put("word/media/$name", data) }
            }
            return output.toByteArray()
        }

        private fun document(
            body: String,
            headerId: String,
            footerId: String,
        ) = "<w:document $NAMESPACES><w:body>$body" +
            "<w:sectPr>" +
            "<w:headerReference w:type=\"default\" r:id=\"$headerId\"/>" +
            "<w:footerReference w:type=\"default\" r:id=\"$footerId\"/>" +
            "<w:pgSz w:w=\"$PAGE_WIDTH\" w:h=\"$PAGE_HEIGHT\"/>" +
            "<w:pgMar w:top=\"${mm(10.0)}\" w:right=\"$SIDE_MARGIN\" w:bottom=\"${mm(20.0)}\" w:left=\"$SIDE_MARGIN\" " +
            "w:header=\"${mm(10.0)}\" w:footer=\"${mm(8.0)}\" w:gutter=\"0\"/>" +
            "</w:sectPr></w:body></w:document>"

        /** The name and the Flock logo on top of every page, and the yellow band along its left edge. */
        private fun header(): String {
            val runs = StringBuilder(run(content.title, Format(font = TITLE_FONT, size = 34)))
            content.disc?.let { runs.append("<w:r><w:tab/></w:r>").append(inlineImage(it, "Flock", headerRels)) }
            runs.append(
                anchoredImage(
                    CvImage(yellowPixels(), mm(3.0) / 20.0, PAGE_HEIGHT / 20.0),
                    "",
                    headerRels,
                    "<wp:positionH relativeFrom=\"page\"><wp:posOffset>0</wp:posOffset></wp:positionH>" +
                        "<wp:positionV relativeFrom=\"page\"><wp:posOffset>0</wp:posOffset></wp:positionV>",
                    "<wp:wrapNone/>",
                    behind = true,
                ),
            )
            return paragraph(
                runs.toString(),
                Paragraph(
                    tabs = listOf("right" to TEXT_WIDTH),
                    border = "<w:bottom w:val=\"single\" w:sz=\"6\" w:space=\"6\" w:color=\"$RULE\"/>",
                    spacing = Spacing(after = pt(14), line = 240, lineRule = "auto"),
                ),
            )
        }

        private fun footer() =
            paragraph(
                "<w:fldSimple w:instr=\"PAGE\">${run("1", Format(font = HEADING_FONT, size = 20))}</w:fldSimple>",
                Paragraph(alignment = "right"),
            )

        private fun body(): String =
            buildString {
                val cv = content.cv
                val labels = content.labels

                // The photo floats at the right of the personal details and the profile
                content.photo?.let { photo ->
                    val anchor =
                        anchoredImage(
                            photo,
                            content.name,
                            documentRels,
                            "<wp:positionH relativeFrom=\"margin\"><wp:align>right</wp:align></wp:positionH>" +
                                "<wp:positionV relativeFrom=\"paragraph\"><wp:posOffset>${emu(8.0)}</wp:posOffset></wp:positionV>",
                            "<wp:wrapSquare wrapText=\"left\"/>",
                            distances = "distT=\"0\" distB=\"${emu(8.0)}\" distL=\"${emu(12.0)}\" distR=\"0\"",
                        )
                    append(paragraph(anchor, Paragraph(spacing = Spacing(after = 0, line = 20, lineRule = "exact"))))
                }

                if (content.details.isNotEmpty()) {
                    // Narrower with the photo beside it, as Word does not wrap a table around it
                    val width = if (content.photo != null) TEXT_WIDTH - pt(PHOTO_SIZE + 12) else TEXT_WIDTH
                    val labelWidth = pt(144)
                    append(
                        table(
                            listOf(labelWidth, width - labelWidth),
                            content.details.map { (label, value) ->
                                row(cell(labelWidth, cellParagraph(run("$label:"))) + cell(width - labelWidth, cellParagraph(run(value))))
                            },
                            borders = false,
                        ),
                    )
                    append(paragraph("", Paragraph(spacing = Spacing(after = 0))))
                }

                if (!cv.summary.isNullOrBlank()) {
                    append(markdown(cv.summary, Format(italic = true), alignment = "both"))
                }

                if (cv.experiences.isNotEmpty()) {
                    val widths = listOf(24, 32, 10, 34).map { TEXT_WIDTH * it / 100 }

                    fun boxed(
                        index: Int,
                        text: String,
                        format: Format = Format(),
                    ) = cell(widths[index], cellParagraph(run(text, format)), padded = true)
                    append(
                        paragraph(
                            run(labels.workingExperience, Format(bold = true)),
                            Paragraph(keepNext = true, spacing = Spacing(before = pt(13.5), after = 0)),
                        ),
                    )
                    val heading = Format(bold = true, size = 16)
                    append(
                        table(
                            widths,
                            listOf(
                                row(
                                    boxed(0, labels.period, heading) + boxed(1, labels.function, heading) +
                                        boxed(2, labels.months, heading) + boxed(3, labels.clientColumn, heading),
                                    header = true,
                                ),
                            ) +
                                cv.experiences.map {
                                    row(
                                        boxed(0, content.periodText(it)) + boxed(1, it.role) +
                                            boxed(2, content.monthsWorked(it).toString()) + boxed(3, clientText(it)),
                                    )
                                },
                            borders = true,
                        ),
                    )
                }

                content.assignments.forEachIndexed { index, it ->
                    if (index == 0) {
                        // The assignments always start on a page of their own
                        append(paragraph("", Paragraph(pageBreakBefore = true, spacing = Spacing(after = 0))))
                    } else {
                        // The grey rule of the header between assignments, after a blank line
                        append(
                            paragraph(
                                "",
                                Paragraph(
                                    border = "<w:top w:val=\"single\" w:sz=\"6\" w:space=\"1\" w:color=\"$RULE\"/>",
                                    spacing = Spacing(before = pt(27), after = 0),
                                ),
                            ),
                        )
                    }
                    append(assignmentHead(it))
                    append(paragraph("", Paragraph(spacing = Spacing(after = 0))))
                    append(markdown(it.description))
                }

                content.sectionsBeforeSkills.forEach { append(section(it.heading, it.items.map { item -> run(item) })) }
                content.skillGroups.forEach { (heading, skills) ->
                    append(
                        section(
                            heading,
                            skills.map {
                                val stars = it.level?.takeIf { level -> level > 0 }?.let { level -> "*".repeat(level) }
                                run(it.name) + (stars?.let { text -> "<w:r><w:tab/></w:r>" + run(text) } ?: "")
                            },
                            // Room for long names, which push their stars aside
                            tabs = listOf("left" to pt(40) + 2880),
                        ),
                    )
                }
                content.sectionsAfterSkills.forEach { append(section(it.heading, it.items.map { item -> run(item) })) }
            }

        /** Period, client, role and technologies of an assignment, with its logo at the right. */
        private fun assignmentHead(experience: CvExperience): String {
            val labels = content.labels
            val facts =
                listOfNotNull(
                    labels.period to content.longPeriodText(experience),
                    labels.client to clientText(experience),
                    labels.role to experience.role,
                    experience.technologies.takeIf { it.isNotEmpty() }?.let { labels.technologies to it.joinToString(", ") },
                )
            val logo = content.logoOf(experience)
            val labelWidth = pt(86)
            val logoWidth = if (logo != null) pt(102) else 0
            val valueWidth = TEXT_WIDTH - labelWidth - logoWidth
            val keep = Paragraph(keepNext = true, spacing = Spacing(after = 0, line = pt(9 * 1.35), lineRule = "auto"))
            return table(
                listOfNotNull(labelWidth, valueWidth, logoWidth.takeIf { logo != null }),
                facts.mapIndexed { index, (label, value) ->
                    val logoCell =
                        when {
                            logo == null -> ""
                            index == 0 ->
                                cell(
                                    logoWidth,
                                    paragraph(
                                        inlineImage(logo, "Logo ${experience.client}", documentRels),
                                        Paragraph(alignment = "right", spacing = Spacing(after = 0, line = 240, lineRule = "auto")),
                                    ),
                                    merge = "restart",
                                )
                            else -> cell(logoWidth, cellParagraph(""), merge = "continue")
                        }
                    row(
                        cell(labelWidth, paragraph(run("$label:", Format(bold = true)), keep)) +
                            cell(valueWidth, paragraph(run(value, Format(italic = true)), keep)) + logoCell,
                    )
                },
                borders = false,
            )
        }

        /** A section below the assignments: its heading in the template's style and a bulleted list. */
        private fun section(
            heading: String,
            items: List<String>,
            tabs: List<Pair<String, Int>> = emptyList(),
        ) = buildString {
            append(
                paragraph(
                    run(heading, Format(font = HEADING_FONT, size = 26, color = MUTED)),
                    Paragraph(keepNext = true, spacing = Spacing(after = pt(8), line = 240, lineRule = "auto")),
                ),
            )
            items.forEachIndexed { index, item ->
                val last = index == items.size - 1
                append(
                    paragraph(
                        item,
                        Paragraph(
                            keepNext = !last,
                            numbering = SECTION_BULLETS to 0,
                            tabs = tabs,
                            spacing = Spacing(after = if (last) pt(18) else 0),
                        ),
                    ),
                )
            }
            if (items.isEmpty()) append(paragraph("", Paragraph(spacing = Spacing(after = pt(10)))))
        }

        // Markdown

        private fun markdown(
            text: String?,
            format: Format = Format(),
            alignment: String? = null,
        ): String = if (text.isNullOrBlank()) "" else blocks(CvMarkdown.parse(text), format, alignment, -1).joinToString("") { it.xml() }

        /** A paragraph to be, so a list item can still add its bullet. */
        private inner class Block(
            val runs: String,
            val paragraph: Paragraph,
        ) {
            fun xml() = paragraph(runs, paragraph)
        }

        private fun blocks(
            parent: Node,
            format: Format,
            alignment: String?,
            level: Int,
        ): List<Block> {
            val result = mutableListOf<Block>()
            // Within a list item: the paragraphs below its first, without the room of a paragraph
            val inList = if (level >= 0) Paragraph(spacing = Spacing(after = 0), indent = pt(14.4) * (level + 1)) else Paragraph()
            parent.children().forEach { node ->
                when (node) {
                    is MarkdownParagraph -> result += Block(runs(node, format), inList.copy(alignment = alignment))
                    is Heading ->
                        result +=
                            Block(
                                runs(node, format.copy(bold = true, size = 20)),
                                Paragraph(keepNext = true, spacing = Spacing(after = pt(5))),
                            )
                    is ListBlock -> result += list(node, format, alignment, level + 1)
                    is BlockQuote ->
                        result +=
                            blocks(node, format, alignment, level).map {
                                Block(it.runs, it.paragraph.copy(indent = pt(9) + pt(14.4) * (level + 1)))
                            }
                    is FencedCodeBlock -> result += code(node.literal)
                    is IndentedCodeBlock -> result += code(node.literal)
                    is HtmlBlock -> result += Block(run(node.literal.trimEnd(), format), inList)
                    is ThematicBreak ->
                        result +=
                            Block("", Paragraph(border = "<w:bottom w:val=\"single\" w:sz=\"6\" w:space=\"1\" w:color=\"$RULE\"/>"))
                    else -> result += Block(runs(node, format), inList)
                }
            }
            return result
        }

        private fun code(literal: String) =
            Block(
                literal
                    .trimEnd('\n')
                    .lines()
                    .mapIndexed { index, line ->
                        (if (index > 0) "<w:r><w:br/></w:r>" else "") + run(line, Format(font = "Courier New"))
                    }.joinToString(""),
                Paragraph(),
            )

        private fun list(
            node: ListBlock,
            format: Format,
            alignment: String?,
            level: Int,
        ): List<Block> {
            val numId =
                if (node is OrderedList) {
                    (MARKDOWN_NUMBERS + 1 + numberedLists.size).also { numberedLists += node.markerStartNumber ?: 1 }
                } else {
                    MARKDOWN_BULLETS
                }
            val items = node.children().filterIsInstance<ListItem>()
            return items.flatMapIndexed { index, item ->
                val blocks = blocks(item, format, alignment, level)
                // The first paragraph of an item gets its bullet; a nested list keeps its own
                val first = blocks.firstOrNull()?.takeIf { it.paragraph.numbering == null }
                val rest = if (first != null) blocks.drop(1) else blocks
                val last = index == items.size - 1
                listOf(
                    Block(
                        first?.runs ?: "",
                        Paragraph(
                            numbering = numId to minOf(level, 3),
                            spacing = Spacing(after = if (last && rest.isEmpty() && level == 0) pt(8.1) else 0),
                        ),
                    ),
                ) + rest
            }
        }

        private fun runs(
            parent: Node,
            format: Format,
        ): String =
            parent.children().joinToString("") { node ->
                when (node) {
                    is Text -> run(node.literal, format)
                    is SoftLineBreak, is HardLineBreak -> "<w:r><w:br/></w:r>"
                    is Code -> run(node.literal, format.copy(font = "Courier New"))
                    is StrongEmphasis -> runs(node, format.copy(bold = true))
                    is Emphasis -> runs(node, format.copy(italic = true))
                    is Strikethrough -> runs(node, format.copy(strike = true))
                    is HtmlInline -> run(node.literal, format)
                    is Image -> run(CvMarkdown.altText(node), format)
                    is Link -> link(node, format)
                    else -> runs(node, format)
                }
            }

        private fun link(
            node: Link,
            format: Format,
        ): String {
            val text = runs(node, format.copy(color = LINK, underline = true))
            val target = node.destination?.takeIf { SAFE_LINK.containsMatchIn(it) } ?: return text
            val id = documentRels.add(HYPERLINK, target, external = true)
            return "<w:hyperlink r:id=\"$id\">$text</w:hyperlink>"
        }

        // Images

        private fun inlineImage(
            image: CvImage,
            description: String,
            rels: Relationships,
        ): String {
            val (id, name) = picture(image, rels)
            val cx = emu(image.width)
            val cy = emu(image.height)
            return "<w:r><w:drawing><wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">" +
                "<wp:extent cx=\"$cx\" cy=\"$cy\"/><wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>" +
                docPr(name, description) +
                "<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect=\"1\"/></wp:cNvGraphicFramePr>" +
                graphic(id, name, cx, cy) +
                "</wp:inline></w:drawing></w:r>"
        }

        private fun anchoredImage(
            image: CvImage,
            description: String,
            rels: Relationships,
            position: String,
            wrap: String,
            behind: Boolean = false,
            distances: String = "distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\"",
        ): String {
            val (id, name) = picture(image, rels)
            val cx = emu(image.width)
            val cy = emu(image.height)
            return "<w:r><w:drawing><wp:anchor $distances simplePos=\"0\" relativeHeight=\"${drawings + 1}\" " +
                "behindDoc=\"${if (behind) 1 else 0}\" locked=\"0\" layoutInCell=\"1\" allowOverlap=\"1\">" +
                "<wp:simplePos x=\"0\" y=\"0\"/>$position" +
                "<wp:extent cx=\"$cx\" cy=\"$cy\"/><wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>$wrap" +
                docPr(name, description) +
                "<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect=\"1\"/></wp:cNvGraphicFramePr>" +
                graphic(id, name, cx, cy) +
                "</wp:anchor></w:drawing></w:r>"
        }

        /** Adds the image to the package; the relationship id and the file name it got. */
        private fun picture(
            image: CvImage,
            rels: Relationships,
        ): Pair<String, String> {
            val name = "image${media.size + 1}.png"
            media += name to image.png
            return rels.add(IMAGE, "media/$name") to name
        }

        private fun docPr(
            name: String,
            description: String,
        ): String {
            drawings++
            return "<wp:docPr id=\"$drawings\" name=\"${esc(name)}\" descr=\"${esc(description)}\"/>"
        }

        private fun graphic(
            id: String,
            name: String,
            cx: Long,
            cy: Long,
        ) = "<a:graphic><a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\"><pic:pic>" +
            "<pic:nvPicPr><pic:cNvPr id=\"$drawings\" name=\"${esc(name)}\"/><pic:cNvPicPr/></pic:nvPicPr>" +
            "<pic:blipFill><a:blip r:embed=\"$id\"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>" +
            "<pic:spPr><a:xfrm><a:off x=\"0\" y=\"0\"/><a:ext cx=\"$cx\" cy=\"$cy\"/></a:xfrm>" +
            "<a:prstGeom prst=\"rect\"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic>"

        // Parts

        private fun contentTypes() =
            "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
                "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
                "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
                "<Default Extension=\"png\" ContentType=\"image/png\"/>" +
                override("/word/document.xml", "wordprocessingml.document.main") +
                override("/word/styles.xml", "wordprocessingml.styles") +
                override("/word/numbering.xml", "wordprocessingml.numbering") +
                override("/word/settings.xml", "wordprocessingml.settings") +
                override("/word/header1.xml", "wordprocessingml.header") +
                override("/word/footer1.xml", "wordprocessingml.footer") +
                "<Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/>" +
                "</Types>"

        private fun override(
            part: String,
            type: String,
        ) = "<Override PartName=\"$part\" ContentType=\"application/vnd.openxmlformats-officedocument.$type+xml\"/>"

        private fun coreProperties() =
            "<cp:coreProperties xmlns:cp=\"http://schemas.openxmlformats.org/package/2006/metadata/core-properties\" " +
                "xmlns:dc=\"http://purl.org/dc/elements/1.1/\">" +
                "<dc:title>${esc(content.title)}</dc:title><dc:creator>${esc(content.name)}</dc:creator>" +
                "</cp:coreProperties>"

        private fun styles() =
            "<w:styles $NAMESPACES><w:docDefaults>" +
                "<w:rPrDefault><w:rPr>" +
                "<w:rFonts w:ascii=\"$BODY_FONT\" w:hAnsi=\"$BODY_FONT\" w:eastAsia=\"$BODY_FONT\" w:cs=\"$BODY_FONT\"/>" +
                "<w:color w:val=\"$INK\"/><w:sz w:val=\"18\"/><w:szCs w:val=\"18\"/>" +
                "<w:lang w:val=\"${if (content.cv.language.name == "NL") "nl-NL" else "en-GB"}\"/></w:rPr></w:rPrDefault>" +
                "<w:pPrDefault><w:pPr>" +
                "<w:spacing w:after=\"$BODY_LINE\" w:line=\"$BODY_LINE\" w:lineRule=\"atLeast\"/>" +
                "</w:pPr></w:pPrDefault>" +
                "</w:docDefaults>" +
                "<w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\"><w:name w:val=\"Normal\"/><w:qFormat/></w:style>" +
                "<w:style w:type=\"table\" w:default=\"1\" w:styleId=\"TableNormal\"><w:name w:val=\"Normal Table\"/>" +
                "<w:tblPr><w:tblInd w:w=\"0\" w:type=\"dxa\"/><w:tblCellMar><w:top w:w=\"0\" w:type=\"dxa\"/>" +
                "<w:left w:w=\"0\" w:type=\"dxa\"/><w:bottom w:w=\"0\" w:type=\"dxa\"/><w:right w:w=\"0\" w:type=\"dxa\"/>" +
                "</w:tblCellMar></w:tblPr></w:style>" +
                "</w:styles>"

        private fun numbering(): String {
            fun bullets(
                id: Int,
                indent: Int,
                hanging: Int,
            ) = "<w:abstractNum w:abstractNumId=\"$id\"><w:multiLevelType w:val=\"hybridMultilevel\"/>" +
                (0..3).joinToString("") { level ->
                    "<w:lvl w:ilvl=\"$level\"><w:start w:val=\"1\"/><w:numFmt w:val=\"bullet\"/>" +
                        "<w:lvlText w:val=\"${listOf("•", "◦", "▪", "•")[level]}\"/><w:lvlJc w:val=\"left\"/>" +
                        "<w:pPr><w:ind w:left=\"${indent + level * pt(18)}\" w:hanging=\"$hanging\"/></w:pPr></w:lvl>"
                } + "</w:abstractNum>"
            val numbers =
                "<w:abstractNum w:abstractNumId=\"3\"><w:multiLevelType w:val=\"hybridMultilevel\"/>" +
                    (0..3).joinToString("") { level ->
                        "<w:lvl w:ilvl=\"$level\"><w:start w:val=\"1\"/><w:numFmt w:val=\"decimal\"/>" +
                            "<w:lvlText w:val=\"%${level + 1}.\"/><w:lvlJc w:val=\"left\"/>" +
                            "<w:pPr><w:ind w:left=\"${pt(14.4) * (level + 1)}\" w:hanging=\"${pt(14.4)}\"/></w:pPr></w:lvl>"
                    } + "</w:abstractNum>"
            return "<w:numbering $NAMESPACES>" +
                bullets(SECTION_BULLETS, pt(40), pt(18)) + bullets(MARKDOWN_BULLETS, pt(14.4), pt(14.4)) + numbers +
                "<w:num w:numId=\"$SECTION_BULLETS\"><w:abstractNumId w:val=\"$SECTION_BULLETS\"/></w:num>" +
                "<w:num w:numId=\"$MARKDOWN_BULLETS\"><w:abstractNumId w:val=\"$MARKDOWN_BULLETS\"/></w:num>" +
                numberedLists
                    .mapIndexed { index, start ->
                        "<w:num w:numId=\"${MARKDOWN_NUMBERS + 1 + index}\"><w:abstractNumId w:val=\"$MARKDOWN_NUMBERS\"/>" +
                            "<w:lvlOverride w:ilvl=\"0\"><w:startOverride w:val=\"$start\"/></w:lvlOverride></w:num>"
                    }.joinToString("") +
                "</w:numbering>"
        }
    }

    // Building blocks

    private data class Format(
        val bold: Boolean = false,
        val italic: Boolean = false,
        val strike: Boolean = false,
        val underline: Boolean = false,
        val font: String? = null,
        val size: Int? = null,
        val color: String? = null,
    )

    private data class Spacing(
        val before: Int? = null,
        val after: Int? = null,
        val line: Int? = null,
        val lineRule: String? = null,
    )

    private data class Paragraph(
        val keepNext: Boolean = false,
        val pageBreakBefore: Boolean = false,
        val numbering: Pair<Int, Int>? = null,
        val border: String? = null,
        val tabs: List<Pair<String, Int>> = emptyList(),
        val spacing: Spacing? = null,
        val indent: Int? = null,
        val alignment: String? = null,
    )

    private fun run(
        text: String,
        format: Format = Format(),
    ): String {
        val properties =
            buildString {
                format.font?.let { append("<w:rFonts w:ascii=\"$it\" w:hAnsi=\"$it\" w:eastAsia=\"$it\" w:cs=\"$it\"/>") }
                if (format.bold) append("<w:b/><w:bCs/>")
                if (format.italic) append("<w:i/><w:iCs/>")
                if (format.strike) append("<w:strike/>")
                format.color?.let { append("<w:color w:val=\"$it\"/>") }
                format.size?.let { append("<w:sz w:val=\"$it\"/><w:szCs w:val=\"$it\"/>") }
                if (format.underline) append("<w:u w:val=\"single\"/>")
            }
        val rPr = if (properties.isEmpty()) "" else "<w:rPr>$properties</w:rPr>"
        // A line break within a text becomes a break in the run
        return text.split("\n").joinToString("<w:br/>", "<w:r>$rPr", "</w:r>") {
            "<w:t xml:space=\"preserve\">${esc(it)}</w:t>"
        }
    }

    private fun paragraph(
        runs: String,
        paragraph: Paragraph = Paragraph(),
    ): String {
        val properties =
            buildString {
                if (paragraph.keepNext) append("<w:keepNext/>")
                if (paragraph.pageBreakBefore) append("<w:pageBreakBefore/>")
                paragraph.numbering?.let { (id, level) -> append("<w:numPr><w:ilvl w:val=\"$level\"/><w:numId w:val=\"$id\"/></w:numPr>") }
                paragraph.border?.let { append("<w:pBdr>$it</w:pBdr>") }
                if (paragraph.tabs.isNotEmpty()) {
                    append("<w:tabs>")
                    paragraph.tabs.forEach { (type, position) -> append("<w:tab w:val=\"$type\" w:pos=\"$position\"/>") }
                    append("</w:tabs>")
                }
                paragraph.spacing?.let {
                    append("<w:spacing")
                    it.before?.let { value -> append(" w:before=\"$value\"") }
                    it.after?.let { value -> append(" w:after=\"$value\"") }
                    it.line?.let { value -> append(" w:line=\"$value\" w:lineRule=\"${it.lineRule ?: "atLeast"}\"") }
                    append("/>")
                }
                paragraph.indent?.let { append("<w:ind w:left=\"$it\"/>") }
                paragraph.alignment?.let { append("<w:jc w:val=\"$it\"/>") }
            }
        return "<w:p>${if (properties.isEmpty()) "" else "<w:pPr>$properties</w:pPr>"}$runs</w:p>"
    }

    private fun table(
        widths: List<Int>,
        rows: List<String>,
        borders: Boolean,
    ): String {
        val line = if (borders) "w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"$INK\"" else "w:val=\"nil\""
        return "<w:tbl><w:tblPr><w:tblW w:w=\"${widths.sum()}\" w:type=\"dxa\"/><w:tblBorders>" +
            listOf("top", "left", "bottom", "right", "insideH", "insideV").joinToString("") { "<w:$it $line/>" } +
            "</w:tblBorders><w:tblLayout w:type=\"fixed\"/><w:tblLook w:val=\"0000\"/></w:tblPr>" +
            "<w:tblGrid>${widths.joinToString("") { "<w:gridCol w:w=\"$it\"/>" }}</w:tblGrid>" +
            rows.joinToString("") +
            "</w:tbl>"
    }

    private fun row(
        cells: String,
        header: Boolean = false,
    ) = "<w:tr><w:trPr><w:cantSplit/>${if (header) "<w:tblHeader/>" else ""}</w:trPr>$cells</w:tr>"

    private fun cell(
        width: Int,
        paragraphs: String,
        padded: Boolean = false,
        merge: String? = null,
    ): String {
        val margins =
            if (padded) {
                "<w:tcMar><w:top w:w=\"${pt(5)}\" w:type=\"dxa\"/><w:left w:w=\"${pt(4.5)}\" w:type=\"dxa\"/>" +
                    "<w:bottom w:w=\"${pt(5)}\" w:type=\"dxa\"/><w:right w:w=\"${pt(4.5)}\" w:type=\"dxa\"/></w:tcMar>"
            } else {
                "<w:tcMar><w:right w:w=\"${pt(4)}\" w:type=\"dxa\"/></w:tcMar>"
            }
        val vMerge =
            when (merge) {
                "restart" -> "<w:vMerge w:val=\"restart\"/>"
                "continue" -> "<w:vMerge/>"
                else -> ""
            }
        return "<w:tc><w:tcPr><w:tcW w:w=\"$width\" w:type=\"dxa\"/>$vMerge$margins</w:tcPr>$paragraphs</w:tc>"
    }

    /** A paragraph in a table cell: without the room below a paragraph. */
    private fun cellParagraph(runs: String) = paragraph(runs, Paragraph(spacing = Spacing(after = 0)))

    /** A few yellow pixels, stretched along the left edge of the page. */
    private fun yellowPixels(): ByteArray {
        val image = BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB)
        val graphics = image.createGraphics()
        graphics.color = Color(YELLOW.toInt(16))
        graphics.fillRect(0, 0, 4, 4)
        graphics.dispose()
        return ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray()
    }

    private fun Node.children(): List<Node> = generateSequence(firstChild) { it.next }.toList()

    /** Characters XML cannot hold at all are left out. */
    private val INVALID_XML = Regex("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\uFFFE\\uFFFF]")

    private val SAFE_LINK = Regex("^(https?:|mailto:)", RegexOption.IGNORE_CASE)

    private fun esc(text: String) =
        text
            .replace(INVALID_XML, "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")

    private class Relationships {
        private val entries = mutableListOf<String>()

        fun add(
            type: String,
            target: String,
            external: Boolean = false,
        ): String {
            val id = "rId${entries.size + 1}"
            entries +=
                "<Relationship Id=\"$id\" Type=\"$type\" Target=\"${esc(target)}\"${if (external) " TargetMode=\"External\"" else ""}/>"
            return id
        }

        fun xml() =
            "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
                entries.joinToString("") +
                "</Relationships>"
    }

    private const val RELS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    private const val OFFICE_DOCUMENT = "$RELS/officeDocument"
    private const val CORE_PROPERTIES = "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties"
    private const val STYLES = "$RELS/styles"
    private const val NUMBERING = "$RELS/numbering"
    private const val SETTINGS = "$RELS/settings"
    private const val HEADER = "$RELS/header"
    private const val FOOTER = "$RELS/footer"
    private const val IMAGE = "$RELS/image"
    private const val HYPERLINK = "$RELS/hyperlink"

    private const val NAMESPACES =
        "xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" " +
            "xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" " +
            "xmlns:wp=\"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing\" " +
            "xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" " +
            "xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\""

    private const val SETTINGS_XML =
        "<w:settings xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
            "<w:defaultTabStop w:val=\"720\"/><w:characterSpacingControl w:val=\"doNotCompress\"/>" +
            "<w:compat>" +
            "<w:compatSetting w:name=\"compatibilityMode\" w:uri=\"http://schemas.microsoft.com/office/word\" w:val=\"15\"/>" +
            "</w:compat>" +
            "</w:settings>"
}
