package community.flock.eco.workday.application.cv

import community.flock.eco.workday.application.model.CvExperience
import org.apache.poi.common.usermodel.PictureType
import org.apache.poi.util.Units
import org.apache.poi.wp.usermodel.HeaderFooterType
import org.apache.poi.xwpf.usermodel.LineSpacingRule
import org.apache.poi.xwpf.usermodel.ParagraphAlignment
import org.apache.poi.xwpf.usermodel.UnderlinePatterns
import org.apache.poi.xwpf.usermodel.XWPFAbstractNum
import org.apache.poi.xwpf.usermodel.XWPFDocument
import org.apache.poi.xwpf.usermodel.XWPFParagraph
import org.apache.poi.xwpf.usermodel.XWPFRun
import org.apache.poi.xwpf.usermodel.XWPFTable
import org.apache.poi.xwpf.usermodel.XWPFTableCell
import org.apache.xmlbeans.XmlOptions
import org.commonmark.ext.gfm.strikethrough.Strikethrough
import org.commonmark.node.BlockQuote
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
import org.openxmlformats.schemas.drawingml.x2006.wordprocessingDrawing.CTAnchor
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTAbstractNum
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPPr
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTStyles
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STLineSpacingRule
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STNumberFormat
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STStyleType
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTabJc
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblLayoutType
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth
import java.awt.Color
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.math.BigInteger
import javax.imageio.ImageIO
import kotlin.math.roundToInt
import org.commonmark.node.Paragraph as MarkdownParagraph

/**
 * A CV in the Flock template as a Word document (.docx), laid out like the CV in the
 * browser (features/cv/CvDocument.tsx) and its PDF: the name and the Flock logo on top
 * of every page, the yellow band along its left edge and its number at the bottom right;
 * the personal details with the photo, the profile, an overview of the working
 * experience, a section per assignment, and the skills, education and languages as lists.
 *
 * Written with Apache POI. Sizes are in twips (1/20 pt) unless they say otherwise.
 */
object CvWord {
    private const val INK = "000000"
    private const val RULE = "9E9E9E"
    private const val MUTED = "434343"
    private const val LINK = "1A56C4"
    private const val BODY_FONT = "Verdana"
    private const val TITLE_FONT = "Trebuchet MS"
    private const val HEADING_FONT = "Arial"
    private const val CODE_FONT = "Courier New"

    private fun pt(points: Double) = (points * 20).roundToInt()

    private fun pt(points: Int) = points * 20

    private fun mm(millimetres: Double) = (millimetres / 25.4 * 1440).roundToInt()

    private val PAGE_WIDTH = mm(210.0)
    private val PAGE_HEIGHT = mm(297.0)
    private val SIDE_MARGIN = mm(25.0)
    private val TEXT_WIDTH = PAGE_WIDTH - 2 * SIDE_MARGIN

    /** 1.5 times the 9pt body text, the line height of the CV. */
    private val BODY_LINE = pt(13.5)

    private const val PHOTO_SIZE = 91.0

    fun render(content: CvDocumentContent): ByteArray =
        XWPFDocument().use { document ->
            Writer(document, content).write()
            ByteArrayOutputStream().also { document.write(it) }.toByteArray()
        }

    private class Writer(
        private val document: XWPFDocument,
        private val content: CvDocumentContent,
    ) {
        private val labels = content.labels
        private val numbering = document.createNumbering()
        private val sectionBullets = numbering.addNum(abstractNum(bullets(pt(40), pt(18))))
        private val markdownBullets = numbering.addNum(abstractNum(bullets(pt(14.4), pt(14.4))))
        private val markdownNumbers = abstractNum(numbers())

        fun write() {
            page()
            styles()
            document.properties.coreProperties.apply {
                title = content.title
                creator = content.name
            }
            header()
            footer()
            body()
        }

        private fun page() {
            val section = document.document.body.addNewSectPr()
            section.addNewPgSz().apply {
                w = BigInteger.valueOf(PAGE_WIDTH.toLong())
                h = BigInteger.valueOf(PAGE_HEIGHT.toLong())
            }
            section.addNewPgMar().apply {
                top = BigInteger.valueOf(mm(10.0).toLong())
                bottom = BigInteger.valueOf(mm(20.0).toLong())
                left = BigInteger.valueOf(SIDE_MARGIN.toLong())
                right = BigInteger.valueOf(SIDE_MARGIN.toLong())
                header = BigInteger.valueOf(mm(10.0).toLong())
                footer = BigInteger.valueOf(mm(8.0).toLong())
                gutter = BigInteger.ZERO
            }
        }

        /** Verdana 9pt with a line height of 1.5, and tables without room around their cells. */
        private fun styles() {
            val styles = CTStyles.Factory.newInstance()
            styles.addNewDocDefaults().apply {
                addNewRPrDefault().addNewRPr().apply {
                    addNewRFonts().apply {
                        ascii = BODY_FONT
                        hAnsi = BODY_FONT
                        eastAsia = BODY_FONT
                        cs = BODY_FONT
                    }
                    addNewColor().setVal(INK)
                    addNewSz().setVal(BigInteger.valueOf(18))
                    addNewSzCs().setVal(BigInteger.valueOf(18))
                    addNewLang().setVal(if (content.cv.language.name == "NL") "nl-NL" else "en-GB")
                }
                addNewPPrDefault().addNewPPr().addNewSpacing().apply {
                    after = BigInteger.valueOf(BODY_LINE.toLong())
                    line = BigInteger.valueOf(BODY_LINE.toLong())
                    lineRule = STLineSpacingRule.AT_LEAST
                }
            }
            styles.addNewStyle().apply {
                type = STStyleType.PARAGRAPH
                styleId = "Normal"
                default = true
                addNewName().setVal("Normal")
            }
            document.createStyles().setStyles(styles)
        }

        /** The name and the Flock logo on top of every page, and the yellow band along its left edge. */
        private fun header() {
            val paragraph = document.createHeader(HeaderFooterType.DEFAULT).createParagraph()
            paragraph.tab(STTabJc.RIGHT, TEXT_WIDTH)
            paragraph
                .ppr()
                .addNewPBdr()
                .addNewBottom()
                .line(space = 6)
            paragraph.spacing(after = pt(14), line = 240, rule = STLineSpacingRule.AUTO)
            paragraph.text(content.title, Format(font = TITLE_FONT, size = 17.0))
            content.disc?.let {
                paragraph.createRun().addTab()
                paragraph.picture(it, "Flock")
            }
            // The band is a few yellow pixels, stretched along the left edge of the page
            paragraph
                .picture(CvImage(yellowPixels(), 3 / 25.4 * 72, 297 / 25.4 * 72), "")
                .float(
                    "<wp:positionH relativeFrom=\"page\"><wp:posOffset>0</wp:posOffset></wp:positionH>" +
                        "<wp:positionV relativeFrom=\"page\"><wp:posOffset>0</wp:posOffset></wp:positionV>",
                    "<wp:wrapNone/>",
                    behind = true,
                )
        }

        private fun footer() {
            val paragraph = document.createFooter(HeaderFooterType.DEFAULT).createParagraph()
            paragraph.alignment = ParagraphAlignment.RIGHT
            paragraph.ctp.addNewFldSimple().apply {
                instr = "PAGE"
                addNewR().apply {
                    addNewRPr().apply {
                        addNewRFonts().apply {
                            ascii = HEADING_FONT
                            hAnsi = HEADING_FONT
                        }
                        addNewSz().setVal(BigInteger.valueOf(20))
                    }
                    addNewT().stringValue = "1"
                }
            }
        }

        private fun body() {
            val cv = content.cv

            // The photo floats at the right of the personal details and the profile
            content.photo?.let { photo ->
                val paragraph = document.createParagraph()
                paragraph.spacing(after = 0, line = 20, rule = STLineSpacingRule.EXACT)
                paragraph.picture(photo, content.name).float(
                    "<wp:positionH relativeFrom=\"margin\"><wp:align>right</wp:align></wp:positionH>" +
                        "<wp:positionV relativeFrom=\"paragraph\"><wp:posOffset>${Units.toEMU(8.0)}</wp:posOffset></wp:positionV>",
                    "<wp:wrapSquare wrapText=\"left\"/>",
                    distances = "distT=\"0\" distB=\"${Units.toEMU(8.0)}\" distL=\"${Units.toEMU(12.0)}\" distR=\"0\"",
                )
            }

            if (content.details.isNotEmpty()) {
                // Narrower with the photo beside it, as Word does not wrap a table around it
                val width = if (content.photo != null) TEXT_WIDTH - pt(PHOTO_SIZE + 12) else TEXT_WIDTH
                val labelWidth = pt(144)
                val table = table(listOf(labelWidth, width - labelWidth), content.details.size, borders = false)
                content.details.forEachIndexed { index, (label, value) ->
                    val cells = table.getRow(index).tableCells
                    cells[0].paragraph().text("$label:")
                    cells[1].paragraph().text(value)
                }
                document.createParagraph().spacing(after = 0)
            }

            if (!cv.summary.isNullOrBlank()) {
                markdown(cv.summary, Format(italic = true), ParagraphAlignment.BOTH)
            }

            if (cv.experiences.isNotEmpty()) {
                document.createParagraph().apply {
                    keepNext(true)
                    spacing(before = pt(13.5), after = 0)
                    text(labels.workingExperience, Format(bold = true))
                }
                val widths = listOf(24, 32, 10, 34).map { TEXT_WIDTH * it / 100 }
                val table = table(widths, cv.experiences.size + 1, borders = true)
                table.setCellMargins(pt(5), pt(4.5), pt(5), pt(4.5))
                val heading = Format(bold = true, size = 8.0)
                table.getRow(0).isRepeatHeader = true
                listOf(labels.period, labels.function, labels.months, labels.clientColumn).forEachIndexed { column, text ->
                    table
                        .getRow(0)
                        .getCell(column)
                        .paragraph()
                        .text(text, heading)
                }
                cv.experiences.forEachIndexed { index, it ->
                    listOf(content.periodText(it), it.role, content.monthsWorked(it).toString(), clientText(it))
                        .forEachIndexed { column, text ->
                            table
                                .getRow(index + 1)
                                .getCell(column)
                                .paragraph()
                                .text(text)
                        }
                }
            }

            content.assignments.forEachIndexed { index, it ->
                if (index == 0) {
                    // The assignments always start on a page of their own
                    document.createParagraph().apply {
                        isPageBreak = true
                        spacing(after = 0)
                    }
                } else {
                    // The grey rule of the header between assignments, after a blank line
                    document.createParagraph().apply {
                        ppr().addNewPBdr().addNewTop().line(space = 1)
                        spacing(before = pt(27), after = 0)
                    }
                }
                assignmentHead(it)
                document.createParagraph().spacing(after = 0)
                markdown(it.description)
            }

            content.sectionsBeforeSkills.forEach { section(it.heading, it.items.map { item -> { p: XWPFParagraph -> p.text(item) } }) }
            content.skillGroups.forEach { (heading, skills) ->
                section(
                    heading,
                    skills.map { skill ->
                        { p: XWPFParagraph ->
                            p.text(skill.name)
                            skill.level?.takeIf { it > 0 }?.let { level ->
                                p.createRun().addTab()
                                p.text("*".repeat(level))
                            }
                        }
                    },
                    // Room for long names, which push their stars aside
                    tab = pt(40) + 2880,
                )
            }
            content.sectionsAfterSkills.forEach { section(it.heading, it.items.map { item -> { p: XWPFParagraph -> p.text(item) } }) }
        }

        /** Period, client, role and technologies of an assignment, with its logo at the right. */
        private fun assignmentHead(experience: CvExperience) {
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
            val table = table(listOfNotNull(labelWidth, valueWidth, logoWidth.takeIf { logo != null }), facts.size, borders = false)
            facts.forEachIndexed { index, (label, value) ->
                val cells = table.getRow(index).tableCells
                listOf(cells[0] to Format(bold = true, text = "$label:"), cells[1] to Format(italic = true, text = value))
                    .forEach { (cell, format) ->
                        cell.paragraph().apply {
                            keepNext(true)
                            spacing(after = 0, line = pt(9 * 1.35), rule = STLineSpacingRule.AUTO)
                            text(format.text, format)
                        }
                    }
                if (logo != null) {
                    val cell = cells[2]
                    cell.ctTc
                        .let { it.tcPr ?: it.addNewTcPr() }
                        .addNewVMerge()
                        .apply { if (index == 0) setVal(STMerge.RESTART) }
                    if (index == 0) {
                        cell.paragraph().apply {
                            alignment = ParagraphAlignment.RIGHT
                            spacing(after = 0, line = 240, rule = STLineSpacingRule.AUTO)
                            picture(logo, "Logo ${experience.client}")
                        }
                    } else {
                        cell.paragraph()
                    }
                }
            }
        }

        /** A section below the assignments: its heading in the template's style and a bulleted list. */
        private fun section(
            heading: String,
            items: List<(XWPFParagraph) -> Unit>,
            tab: Int? = null,
        ) {
            document.createParagraph().apply {
                keepNext(true)
                spacing(after = pt(8), line = 240, rule = STLineSpacingRule.AUTO)
                text(heading, Format(font = HEADING_FONT, size = 13.0, color = MUTED))
            }
            items.forEachIndexed { index, item ->
                val last = index == items.size - 1
                document.createParagraph().apply {
                    numID = sectionBullets
                    setNumILvl(BigInteger.ZERO)
                    keepNext(!last)
                    tab?.let { tab(STTabJc.LEFT, it) }
                    spacing(after = if (last) pt(18) else 0)
                    item(this)
                }
            }
            if (items.isEmpty()) document.createParagraph().spacing(after = pt(10))
        }

        // Markdown

        /** Markdown as paragraphs of the document, the way the CV shows it on screen. */
        private fun markdown(
            text: String?,
            format: Format = Format(),
            alignment: ParagraphAlignment? = null,
        ) {
            if (!text.isNullOrBlank()) blocks(CvMarkdown.parse(text), format, alignment, -1)
        }

        /** Adds the blocks of [parent]; the paragraphs it added. */
        private fun blocks(
            parent: Node,
            format: Format,
            alignment: ParagraphAlignment?,
            level: Int,
        ): List<XWPFParagraph> =
            parent.children().flatMap { node ->
                when (node) {
                    is ListBlock -> list(node, format, alignment, level + 1)
                    is BlockQuote ->
                        blocks(node, format, alignment, level).onEach {
                            it.indentationLeft = pt(9) + pt(14.4) * (level + 1)
                        }
                    else -> listOf(block(node, document.createParagraph(), format, alignment, level))
                }
            }

        /** Fills [paragraph] with a block that is not a list. */
        private fun block(
            node: Node,
            paragraph: XWPFParagraph,
            format: Format,
            alignment: ParagraphAlignment?,
            level: Int,
        ): XWPFParagraph {
            // Within a list item: the paragraphs below its first, without the room of a paragraph
            if (level >= 0 && paragraph.numID == null) {
                paragraph.spacing(after = 0)
                paragraph.indentationLeft = pt(14.4) * (level + 1)
            }
            when (node) {
                is Heading -> {
                    paragraph.keepNext(true)
                    paragraph.spacing(after = pt(5))
                    runs(node, paragraph, format.copy(bold = true, size = 10.0))
                }
                is FencedCodeBlock -> code(node.literal, paragraph)
                is IndentedCodeBlock -> code(node.literal, paragraph)
                is HtmlBlock -> paragraph.text(node.literal.trimEnd(), format)
                is ThematicBreak ->
                    paragraph
                        .ppr()
                        .addNewPBdr()
                        .addNewBottom()
                        .line(space = 1)
                else -> {
                    paragraph.alignment = alignment ?: paragraph.alignment
                    runs(node, paragraph, format)
                }
            }
            return paragraph
        }

        private fun code(
            literal: String,
            paragraph: XWPFParagraph,
        ) {
            literal.trimEnd('\n').lines().forEachIndexed { index, line ->
                if (index > 0) paragraph.createRun().addBreak()
                paragraph.text(line, Format(font = CODE_FONT))
            }
        }

        private fun list(
            node: ListBlock,
            format: Format,
            alignment: ParagraphAlignment?,
            level: Int,
        ): List<XWPFParagraph> {
            // Every numbered list counts from its own start
            val numId =
                if (node is OrderedList) {
                    numbering.addNum(markdownNumbers).also { id ->
                        numbering.getNum(id).ctNum.addNewLvlOverride().apply {
                            ilvl = BigInteger.ZERO
                            addNewStartOverride().setVal(BigInteger.valueOf((node.markerStartNumber ?: 1).toLong()))
                        }
                    }
                } else {
                    markdownBullets
                }
            val items = node.children().filterIsInstance<ListItem>()
            return items.flatMapIndexed { index, item ->
                // The first paragraph of an item gets its bullet; a nested list keeps its own
                val bullet =
                    document.createParagraph().apply {
                        numID = numId
                        setNumILvl(BigInteger.valueOf(minOf(level, 3).toLong()))
                        spacing(after = 0)
                    }
                val children = item.children()
                val first = children.firstOrNull()?.takeUnless { it is ListBlock || it is BlockQuote }
                first?.let { block(it, bullet, format, alignment, level) }
                val rest = children.drop(if (first != null) 1 else 0).flatMap { child -> blocks(Wrapper(child), format, alignment, level) }
                if (index == items.size - 1 && rest.isEmpty() && level == 0) bullet.spacing(after = pt(8.1))
                listOf(bullet) + rest
            }
        }

        private fun runs(
            parent: Node,
            paragraph: XWPFParagraph,
            format: Format,
        ) {
            parent.children().forEach { node ->
                when (node) {
                    is Text -> paragraph.text(node.literal, format)
                    is SoftLineBreak, is HardLineBreak -> paragraph.createRun().addBreak()
                    is Code -> paragraph.text(node.literal, format.copy(font = CODE_FONT))
                    is StrongEmphasis -> runs(node, paragraph, format.copy(bold = true))
                    is Emphasis -> runs(node, paragraph, format.copy(italic = true))
                    is Strikethrough -> runs(node, paragraph, format.copy(strike = true))
                    is HtmlInline -> paragraph.text(node.literal, format)
                    is Image -> paragraph.text(CvMarkdown.altText(node), format)
                    is Link -> link(node, paragraph, format)
                    else -> runs(node, paragraph, format)
                }
            }
        }

        private fun link(
            node: Link,
            paragraph: XWPFParagraph,
            format: Format,
        ) {
            val target = node.destination?.takeIf { SAFE_LINK.containsMatchIn(it) }
            if (target == null) return runs(node, paragraph, format)
            val linkFormat = format.copy(color = LINK, underline = true)
            val text = linkText(node)
            paragraph.createHyperlinkRun(target).apply {
                setText(text)
                apply(linkFormat)
            }
        }

        private fun linkText(node: Node): String =
            node.children().joinToString("") {
                when (it) {
                    is Text -> it.literal
                    is Code -> it.literal
                    else -> linkText(it)
                }
            }

        // Building blocks

        private fun table(
            widths: List<Int>,
            rows: Int,
            borders: Boolean,
        ): XWPFTable {
            val table = document.createTable(rows, widths.size)
            table.ctTbl.tblPr.apply {
                (tblW ?: addNewTblW()).apply {
                    w = BigInteger.valueOf(widths.sum().toLong())
                    type = STTblWidth.DXA
                }
                (tblLayout ?: addNewTblLayout()).type = STTblLayoutType.FIXED
            }
            // The columns, which Word needs to lay out a table of fixed widths
            (table.ctTbl.tblGrid ?: table.ctTbl.addNewTblGrid()).apply {
                gridColList.indices.reversed().forEach(::removeGridCol)
                widths.forEach { addNewGridCol().w = BigInteger.valueOf(it.toLong()) }
            }
            if (borders) {
                listOf(
                    table::setTopBorder,
                    table::setBottomBorder,
                    table::setLeftBorder,
                    table::setRightBorder,
                    table::setInsideHBorder,
                    table::setInsideVBorder,
                ).forEach { it(XWPFTable.XWPFBorderType.SINGLE, 6, 0, INK) }
            } else {
                table.removeBorders()
                table.setCellMargins(0, 0, 0, pt(4))
            }
            table.rows.forEach { row ->
                row.isCantSplitRow = true
                row.tableCells.forEachIndexed { index, cell ->
                    (cell.ctTc.tcPr ?: cell.ctTc.addNewTcPr()).addNewTcW().apply {
                        w = BigInteger.valueOf(widths[index].toLong())
                        type = STTblWidth.DXA
                    }
                }
            }
            return table
        }

        /** The paragraph of a table cell: without the room below a paragraph. */
        private fun XWPFTableCell.paragraph(): XWPFParagraph = paragraphs.first().apply { spacing(after = 0) }

        private fun XWPFParagraph.picture(
            image: CvImage,
            description: String,
        ): XWPFRun =
            createRun().apply {
                addPicture(
                    ByteArrayInputStream(image.png),
                    PictureType.PNG,
                    "image.png",
                    Units.toEMU(image.width),
                    Units.toEMU(image.height),
                )
                ctr
                    .getDrawingArray(0)
                    .getInlineArray(0)
                    .docPr.descr = description
            }

        /** Turns the picture of this run from one in the text into one placed on the page. */
        private fun XWPFRun.float(
            position: String,
            wrap: String,
            behind: Boolean = false,
            distances: String = "distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\"",
        ) {
            val drawing = ctr.getDrawingArray(0)
            val inline = drawing.getInlineArray(0)
            val anchor =
                CTAnchor.Factory.parse(
                    "<wp:anchor xmlns:wp=\"$WP\" $distances simplePos=\"0\" relativeHeight=\"${if (behind) 0 else 1}\" " +
                        "behindDoc=\"${if (behind) 1 else 0}\" locked=\"0\" layoutInCell=\"1\" allowOverlap=\"1\">" +
                        "<wp:simplePos x=\"0\" y=\"0\"/>$position" +
                        "<wp:extent cx=\"${inline.extent.cx}\" cy=\"${inline.extent.cy}\"/>" +
                        "<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>$wrap</wp:anchor>",
                    // The anchor is what is parsed, not a document around it
                    XmlOptions().setLoadReplaceDocumentElement(null),
                )
            anchor.docPr = inline.docPr
            anchor.addNewCNvGraphicFramePr()
            anchor.graphic = inline.graphic
            drawing.setAnchorArray(arrayOf(anchor))
            drawing.removeInline(0)
        }

        private fun abstractNum(abstract: CTAbstractNum): BigInteger {
            abstract.abstractNumId = BigInteger.valueOf(numbering.abstractNums.size.toLong())
            return numbering.addAbstractNum(XWPFAbstractNum(abstract, numbering))
        }
    }

    /** How a run of text looks; [text] is only there to pass a text along with it. */
    private data class Format(
        val bold: Boolean = false,
        val italic: Boolean = false,
        val strike: Boolean = false,
        val underline: Boolean = false,
        val font: String? = null,
        val size: Double? = null,
        val color: String? = null,
        val text: String = "",
    )

    private fun XWPFParagraph.text(
        text: String,
        format: Format = Format(),
    ) {
        createRun().apply {
            setText(text.replace(INVALID_XML, ""))
            apply(format)
        }
    }

    private fun XWPFRun.apply(format: Format) {
        if (format.bold) isBold = true
        if (format.italic) isItalic = true
        if (format.strike) isStrikeThrough = true
        if (format.underline) underline = UnderlinePatterns.SINGLE
        format.font?.let { fontFamily = it }
        format.size?.let { setFontSize(it) }
        format.color?.let { color = it }
    }

    private fun XWPFParagraph.ppr(): CTPPr = ctp.pPr ?: ctp.addNewPPr()

    /** Keeps the paragraph on the page of the next one (POI's own setter fails without paragraph properties). */
    private fun XWPFParagraph.keepNext(keep: Boolean) {
        ppr()
        isKeepNext = keep
    }

    private fun XWPFParagraph.spacing(
        before: Int? = null,
        after: Int? = null,
        line: Int? = null,
        rule: STLineSpacingRule.Enum = STLineSpacingRule.AT_LEAST,
    ): XWPFParagraph {
        val spacing = ppr().spacing ?: ppr().addNewSpacing()
        before?.let { spacing.before = BigInteger.valueOf(it.toLong()) }
        after?.let { spacing.after = BigInteger.valueOf(it.toLong()) }
        line?.let {
            spacing.line = BigInteger.valueOf(it.toLong())
            spacing.lineRule = rule
        }
        return this
    }

    private fun XWPFParagraph.tab(
        type: STTabJc.Enum,
        position: Int,
    ) {
        (ppr().tabs ?: ppr().addNewTabs()).addNewTab().apply {
            `val` = type
            pos = BigInteger.valueOf(position.toLong())
        }
    }

    private fun org.openxmlformats.schemas.wordprocessingml.x2006.main.CTBorder.line(space: Int) {
        `val` = STBorder.SINGLE
        sz = BigInteger.valueOf(6)
        this.space = BigInteger.valueOf(space.toLong())
        color = RULE
    }

    private fun bullets(
        indent: Int,
        hanging: Int,
    ) = CTAbstractNum.Factory.newInstance().apply {
        listOf("•", "◦", "▪", "•").forEachIndexed { level, bullet ->
            addNewLvl().apply {
                ilvl = BigInteger.valueOf(level.toLong())
                addNewStart().setVal(BigInteger.ONE)
                addNewNumFmt().setVal(STNumberFormat.BULLET)
                addNewLvlText().setVal(bullet)
                addNewPPr().addNewInd().apply {
                    left = BigInteger.valueOf((indent + level * pt(18)).toLong())
                    this.hanging = BigInteger.valueOf(hanging.toLong())
                }
            }
        }
    }

    private fun numbers() =
        CTAbstractNum.Factory.newInstance().apply {
            (0..3).forEach { level ->
                addNewLvl().apply {
                    ilvl = BigInteger.valueOf(level.toLong())
                    addNewStart().setVal(BigInteger.ONE)
                    addNewNumFmt().setVal(STNumberFormat.DECIMAL)
                    addNewLvlText().setVal("%${level + 1}.")
                    addNewPPr().addNewInd().apply {
                        left = BigInteger.valueOf((pt(14.4) * (level + 1)).toLong())
                        hanging = BigInteger.valueOf(pt(14.4).toLong())
                    }
                }
            }
        }

    /** A few yellow pixels. */
    private fun yellowPixels(): ByteArray {
        val image = BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB)
        val graphics = image.createGraphics()
        graphics.color = Color(0xFCDE00)
        graphics.fillRect(0, 0, 4, 4)
        graphics.dispose()
        return ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray()
    }

    private fun Node.children(): List<Node> = generateSequence(firstChild) { it.next }.toList()

    /** A single node as the child of a parent of its own, to add it as blocks. */
    private class Wrapper(
        child: Node,
    ) : org.commonmark.node.CustomBlock() {
        init {
            appendChild(child)
        }
    }

    /** Characters XML cannot hold at all are left out. */
    private val INVALID_XML = Regex("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\uFFFE\\uFFFF]")

    private val SAFE_LINK = Regex("^(https?:|mailto:)", RegexOption.IGNORE_CASE)

    private const val WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
}
