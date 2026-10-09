package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.model.CvLanguage
import java.time.YearMonth

/** What [FlockCvParser] recognised in the text of a CV. Anything it could not find is null or empty. */
data class ParsedCv(
    val name: String? = null,
    val email: String? = null,
    val place: String? = null,
    val phone: String? = null,
    val language: CvLanguage? = null,
    val summary: String? = null,
    val experiences: List<CvExperienceForm> = emptyList(),
    val education: String? = null,
    val subjects: String? = null,
    val languages: String? = null,
) {
    /** Without a name and without any experience, the text was not a CV. */
    fun isEmpty() = name == null && experiences.isEmpty()
}

/**
 * Reads the text of a CV in the Flock template (as extracted from the PDF) back into
 * its parts. The template is:
 *
 * - a "Curriculum Vitae - <name>" header and a "<name> page <n>" footer on every page;
 * - personal details as "Label value" lines (Name, Place, Phone, Mail, Date of birth);
 * - the profile text, up to the "Working experience" heading;
 * - an overview table with one "MM-yyyy - MM-yyyy Function Months Client" row per job;
 * - per assignment a block of Period / Client (or Employer) / Role / Technologies lines
 *   followed by the description;
 * - the Skills matrix and the Education, Subjects and Language sections.
 *
 * The skills matrix is not read: its ratings are star images, and its two columns of
 * categories and skills do not survive as text.
 *
 * The blocks are the primary source; a table row without a block (typically an old job
 * that got no write-up) becomes an experience without a description. Labels are
 * recognised in English and Dutch.
 */
object FlockCvParser {
    fun parse(text: String): ParsedCv {
        val lines = text.lines().map { it.normalized() }
        val name = lines.firstNotNullOfOrNull { HEADER.matchEntire(it)?.groupValues?.get(1)?.trim() }
        val footer = footerFor(name)
        val (content, sections) =
            splitSections(lines.filterNot { HEADER.matches(it) || footer.matches(it) || BROWSER_HEADER.matches(it) || BROWSER_FOOTER.matches(it) })

        val headingIndex = content.indexOfFirst { WORKING_EXPERIENCE.matches(it) }
        val firstBlockIndex = content.indexOfFirst { PERIOD.matches(it) }
        val introEnd =
            listOf(headingIndex, firstBlockIndex, content.size)
                .filter { it >= 0 }
                .min()

        val details = mutableMapOf<String, String>()
        val summaryLines = mutableListOf<String>()
        content.subList(0, introEnd).forEach { line ->
            val detail = PERSONAL_DETAILS.entries.firstNotNullOfOrNull { (key, regex) -> regex.matchEntire(line)?.let { key to it.groupValues[1].trim() } }
            when {
                // Personal details sit above the profile text; once that started, a line is text
                detail != null && summaryLines.none { it.isNotBlank() } -> details.putIfAbsent(detail.first, detail.second)
                else -> summaryLines.add(line)
            }
        }

        val tableEnd = if (firstBlockIndex >= 0) firstBlockIndex else content.size
        val rows =
            if (headingIndex in 0 until tableEnd) {
                content.subList(headingIndex + 1, tableEnd).mapNotNull { parseRow(it) }
            } else {
                emptyList()
            }
        val blocks = if (firstBlockIndex >= 0) parseBlocks(content.subList(firstBlockIndex, content.size)) else emptyList()
        val experiences = merge(blocks, rows)
        val summary = summaryLines.toText()

        return ParsedCv(
            name = details[NAME] ?: name,
            email = details[MAIL],
            place = details[PLACE],
            phone = details[PHONE],
            language = detectLanguage(listOfNotNull(summary) + experiences.mapNotNull { it.description }, blocks.any { it.current }),
            summary = summary,
            experiences = experiences,
            education = sections[EDUCATION]?.toText(),
            subjects = sections[SUBJECTS]?.toLines(),
            languages = sections[LANGUAGES]?.toLines(),
        )
    }

    /**
     * Takes the lines under a section heading (Skills, Education, ...) out of the text,
     * up to the next heading, assignment block or working experience heading.
     */
    private fun splitSections(lines: List<String>): Pair<List<String>, Map<String, List<String>>> {
        val sections = mutableMapOf<String, MutableList<String>>()
        var current: MutableList<String>? = null
        val rest =
            lines.filter { line ->
                val heading = SECTIONS.entries.firstOrNull { (_, regex) -> regex.matches(line) }?.key
                when {
                    heading != null -> {
                        current = sections.getOrPut(heading) { mutableListOf() }
                        false
                    }
                    current != null && (PERIOD.matches(line) || WORKING_EXPERIENCE.matches(line)) -> {
                        current = null
                        true
                    }
                    else -> current?.add(line)?.let { false } ?: true
                }
            }
        return rest to sections
    }

    /** One assignment as written up in a Period / Client / Role / Technologies block. */
    private data class Block(
        val from: YearMonth,
        val to: YearMonth?,
        val current: Boolean,
        val client: Client?,
        val role: String?,
        val technologies: List<String>,
        val description: String?,
    )

    /** One row of the working experience overview table. */
    private data class Row(
        val from: YearMonth,
        val to: YearMonth?,
        val role: String,
        val client: Client,
    )

    private data class Client(
        val name: String,
        val employer: String?,
    ) {
        val key = name.lowercase().filter { it.isLetterOrDigit() }
    }

    private fun parseBlocks(lines: List<String>): List<Block> =
        lines
            .fold(mutableListOf<MutableList<String>>()) { acc, line ->
                if (PERIOD.matches(line)) acc.add(mutableListOf(line)) else acc.lastOrNull()?.add(line)
                acc
            }.mapNotNull { parseBlock(it) }

    private fun parseBlock(lines: List<String>): Block? {
        val period = PERIOD.matchEntire(lines.first()) ?: return null
        val from = parseMonth(period.groupValues[1]) ?: return null
        val to = parseMonth(period.groupValues[2])
        var client: Client? = null
        var role: String? = null
        var technologies = emptyList<String>()

        // The labelled lines come straight after the period, the description after them
        var index = 1
        while (index < lines.size) {
            val line = lines[index]
            CLIENT.matchEntire(line)?.let { client = parseClient(it.groupValues[1]) }
                ?: ROLE.matchEntire(line)?.let { role = it.groupValues[1].trim() }
                ?: TECHNOLOGIES.matchEntire(line)?.let { technologies = parseTechnologies(it.groupValues[1]) }
                ?: break
            index++
        }

        return Block(
            from = from,
            to = to,
            current = to == null,
            client = client,
            role = role,
            technologies = technologies,
            description = lines.drop(index).toText(),
        )
    }

    private fun parseRow(line: String): Row? {
        val match = ROW.matchEntire(line) ?: return null
        return Row(
            from = parseMonth(match.groupValues[1]) ?: return null,
            to = parseMonth(match.groupValues[2]),
            role = match.groupValues[3].trim(),
            client = parseClient(match.groupValues[5]),
        )
    }

    /**
     * Pairs every table row with the block about the same job: same client and same
     * start month, else same client and same end month, else the only block left for
     * that client (the table and the blocks do not always agree on the period).
     */
    private fun merge(
        blocks: List<Block>,
        rows: List<Row>,
    ): List<CvExperienceForm> {
        val unmatched = blocks.toMutableList()
        val rowsByBlock = mutableMapOf<Block, Row>()
        val rowsWithoutBlock = mutableListOf<Row>()

        rows.forEach { row ->
            val sameClient = unmatched.filter { it.client?.key == row.client.key }
            val block =
                sameClient.firstOrNull { it.from == row.from }
                    ?: sameClient.firstOrNull { it.to != null && it.to == row.to }
                    ?: sameClient.singleOrNull()
            if (block != null) {
                unmatched.remove(block)
                rowsByBlock[block] = row
            } else {
                rowsWithoutBlock.add(row)
            }
        }

        val fromBlocks =
            blocks.map { block ->
                val row = rowsByBlock[block]
                val client = block.client ?: row?.client
                // A block without a client or role is kept with that field empty, for the user to fill in
                CvExperienceForm(
                    from = block.from,
                    to = block.to,
                    role = block.role ?: row?.role ?: "",
                    client = client?.name ?: "",
                    employer = client?.employer ?: row?.client?.employer,
                    technologies = block.technologies,
                    description = block.description,
                )
            }
        val fromRows =
            rowsWithoutBlock.map { row ->
                CvExperienceForm(
                    from = row.from,
                    to = row.to,
                    role = row.role,
                    client = row.client.name,
                    employer = row.client.employer,
                )
            }
        return (fromBlocks + fromRows).sortedWith(compareByDescending<CvExperienceForm> { it.from }.thenByDescending { it.to == null })
    }

    /** "ING (via Flock.)" is client ING via employer Flock; a row may mark a job as "<company> employer". */
    private fun parseClient(value: String): Client {
        val trimmed = value.trim()
        VIA.matchEntire(trimmed)?.let { return Client(it.groupValues[1].trim(), it.groupValues[2].trim().trimEnd('.').trim()) }
        return Client(EMPLOYER_SUFFIX.replace(trimmed, "").ifBlank { trimmed }, null)
    }

    private fun parseTechnologies(value: String) = value.split(",").map { it.trim() }.filter { it.isNotEmpty() }

    /** The "<name> page <n>" footer; without a known name any "... page <n>" line. */
    private fun footerFor(name: String?): Regex {
        val owner = name?.let { Regex.escape(it) } ?: ".+"
        return Regex("^$owner\\s+(page|pagina)\\s+\\d+$", RegexOption.IGNORE_CASE)
    }

    /** "08-2024" is August 2024; "now" and its Dutch counterparts mean no end yet. */
    private fun parseMonth(value: String): YearMonth? =
        MONTH.matchEntire(value.trim())?.let {
            runCatching { YearMonth.of(it.groupValues[2].toInt(), it.groupValues[1].toInt()) }.getOrNull()
        }

    /**
     * Rebuilds paragraphs from the extracted lines. Blank lines separate paragraphs;
     * the lines of a paragraph are joined, except where the line break means something:
     * list items, and lines that end in a colon or a link or start with one.
     */
    private fun List<String>.toText(): String? =
        joinToString("\n")
            .split(BLANK_LINES)
            .map { paragraph ->
                paragraph
                    .lines()
                    .filter { it.isNotBlank() }
                    .fold(StringBuilder()) { acc, line ->
                        val previous = acc.lines().last()
                        val keepBreak =
                            LIST_ITEM.containsMatchIn(line) ||
                                URL_START.containsMatchIn(line) ||
                                previous.endsWith(":") ||
                                URL_END.containsMatchIn(previous)
                        when {
                            acc.isEmpty() -> acc.append(line)
                            keepBreak -> acc.append("\n").append(line)
                            else -> acc.append(" ").append(line)
                        }
                    }.toString()
            }.filter { it.isNotBlank() }
            .joinToString("\n\n")
            .ifBlank { null }

    /** List-like sections (subjects, languages) keep one entry per line. */
    private fun List<String>.toLines(): String? = filter { it.isNotBlank() }.joinToString("\n").ifBlank { null }

    private fun detectLanguage(
        texts: List<String>,
        usesDutchNow: Boolean,
    ): CvLanguage? {
        val words = texts.flatMap { it.lowercase().split(NON_WORD) }
        val dutch = words.count { it in DUTCH_WORDS }
        val english = words.count { it in ENGLISH_WORDS }
        return when {
            dutch == 0 && english == 0 -> if (usesDutchNow) CvLanguage.NL else null
            dutch > english -> CvLanguage.NL
            else -> CvLanguage.EN
        }
    }

    /** PDF text comes with zero-width and non-breaking spaces between label and value. */
    private fun String.normalized() =
        replace(INVISIBLE, "")
            .replace(SPACES, " ")
            .trim()

    private const val NAME = "name"
    private const val PLACE = "place"
    private const val PHONE = "phone"
    private const val MAIL = "mail"
    private const val BIRTHDATE = "birthdate"
    private const val SKILLS = "skills"
    private const val EDUCATION = "education"
    private const val SUBJECTS = "subjects"
    private const val LANGUAGES = "languages"

    private val SECTIONS =
        mapOf(
            SKILLS to Regex("^(skills|vaardigheden|competenties)$", RegexOption.IGNORE_CASE),
            EDUCATION to Regex("^(education|opleiding|opleidingen)$", RegexOption.IGNORE_CASE),
            SUBJECTS to Regex("^(subjects|expertise|kennisgebieden)$", RegexOption.IGNORE_CASE),
            LANGUAGES to Regex("^(language|languages|taal|talen)$", RegexOption.IGNORE_CASE),
        )

    private val INVISIBLE = Regex("[\\u200B\\u200C\\u200D\\uFEFF\\u00B6]")
    private val SPACES = Regex("[\\s\\u00A0]+")
    private val BLANK_LINES = Regex("\\n\\s*\\n")
    private val NON_WORD = Regex("[^\\p{L}]+")
    private val LIST_ITEM = Regex("^(\\d+[).]|[-•*])\\s")
    private val URL_START = Regex("^https?://")
    private val URL_END = Regex("https?://\\S+$")

    private const val DASH = "\\s*[-–—]\\s*"
    private const val MONTH_PATTERN = "\\d{1,2}-\\d{4}"
    private const val END_PATTERN = "$MONTH_PATTERN|now|present|today|current|nu|heden|huidig"
    private val MONTH = Regex("^(\\d{1,2})-(\\d{4})$")
    // A CV printed from the browser can carry its print header (date, time, title) and footer (address, page of pages)
    private val BROWSER_HEADER = Regex("^\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4},?\\s+\\d{1,2}:\\d{2}(\\s*[AP]M)?(\\s.*)?$", RegexOption.IGNORE_CASE)
    private val BROWSER_FOOTER = Regex("^(https?|file):\\S*\\s+\\d+/\\d+$", RegexOption.IGNORE_CASE)
    private val HEADER = Regex("^Curriculum Vitae$DASH(.+)$", RegexOption.IGNORE_CASE)
    private val WORKING_EXPERIENCE = Regex("^(working experience|work experience|werkervaring)$", RegexOption.IGNORE_CASE)
    private val PERIOD = Regex("^(?:period|periode):?\\s+($MONTH_PATTERN)$DASH($END_PATTERN)$", RegexOption.IGNORE_CASE)
    private val CLIENT = Regex("^(?:client|klant|employer|werkgever|opdrachtgever):?\\s+(.+)$", RegexOption.IGNORE_CASE)
    private val ROLE = Regex("^(?:role|rol|function|functie):?\\s+(.+)$", RegexOption.IGNORE_CASE)
    private val TECHNOLOGIES = Regex("^(?:technologies|technology|technologie|technologieën|techniques|technieken):?\\s+(.+)$", RegexOption.IGNORE_CASE)
    private val ROW = Regex("^($MONTH_PATTERN)$DASH($END_PATTERN)\\s+(.+?)\\s+(\\d+)\\s+(.+)$", RegexOption.IGNORE_CASE)
    private val VIA = Regex("^(.+?)\\s*\\(via\\s+(.+)\\)$", RegexOption.IGNORE_CASE)
    private val EMPLOYER_SUFFIX = Regex("\\s+\\(?(employer|werkgever)\\)?$", RegexOption.IGNORE_CASE)

    private val PERSONAL_DETAILS =
        mapOf(
            NAME to Regex("^(?:name|naam):?\\s+(.+)$", RegexOption.IGNORE_CASE),
            PLACE to Regex("^(?:place|city|residence|woonplaats|plaats):?\\s+(.+)$", RegexOption.IGNORE_CASE),
            PHONE to Regex("^(?:phone|telephone|mobile|telefoon|telefoonnummer|mobiel):?\\s+(.+)$", RegexOption.IGNORE_CASE),
            MAIL to Regex("^(?:mail|e-mail|email):?\\s+(\\S+@\\S+)$", RegexOption.IGNORE_CASE),
            // Recognised so it does not end up in the profile text; the person holds the date of birth
            BIRTHDATE to Regex("^(?:date of birth|birth date|geboortedatum):?\\s+(.+)$", RegexOption.IGNORE_CASE),
        )

    private val DUTCH_WORDS = setOf("de", "het", "een", "en", "van", "met", "voor", "op", "dat", "te", "zijn", "werd", "wordt", "bij", "naar", "niet")
    private val ENGLISH_WORDS = setOf("the", "and", "of", "a", "with", "for", "on", "that", "to", "was", "were", "at", "by", "not", "he", "she")
}
