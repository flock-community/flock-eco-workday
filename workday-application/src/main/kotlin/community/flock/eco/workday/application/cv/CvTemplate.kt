package community.flock.eco.workday.application.cv

import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.CvSkill
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * The texts of the Flock CV template, the same as the CV in the browser shows them
 * (features/cv/cvText.ts), shared by the PDF and the Word document.
 */
class CvLabels(
    val title: String,
    val name: String,
    val place: String,
    val phone: String,
    val mail: String,
    val birthdate: String,
    val workingExperience: String,
    val period: String,
    val function: String,
    val months: String,
    val clientColumn: String,
    val client: String,
    val role: String,
    val technologies: String,
    val skills: String,
    val education: String,
    val subjects: String,
    val languages: String,
    val now: String,
    val monthNames: List<String>,
) {
    companion object {
        val NL =
            CvLabels(
                title = "Curriculum Vitae",
                name = "Naam",
                place = "Woonplaats",
                phone = "Telefoon",
                mail = "E-mail",
                birthdate = "Geboortedatum",
                workingExperience = "Werkervaring",
                period = "Periode",
                function = "Functie",
                months = "Maanden",
                clientColumn = "Opdrachtgever",
                client = "Klant",
                role = "Rol",
                technologies = "Technologieën",
                skills = "Vaardigheden",
                education = "Opleiding",
                subjects = "Kennisgebieden",
                languages = "Talen",
                now = "nu",
                monthNames =
                    listOf(
                        "januari",
                        "februari",
                        "maart",
                        "april",
                        "mei",
                        "juni",
                        "juli",
                        "augustus",
                        "september",
                        "oktober",
                        "november",
                        "december",
                    ),
            )

        val EN =
            CvLabels(
                title = "Curriculum Vitae",
                name = "Name",
                place = "Place",
                phone = "Telephone",
                mail = "Mail",
                birthdate = "Date of Birth",
                workingExperience = "Work experience",
                period = "Period",
                function = "Job Title",
                months = "Months",
                clientColumn = "Client/Company",
                client = "Client",
                role = "Role",
                technologies = "Technologies",
                skills = "Skills",
                education = "Education",
                subjects = "Subjects",
                languages = "Languages",
                now = "current",
                monthNames =
                    listOf(
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                    ),
            )

        fun of(language: CvLanguage): CvLabels =
            when (language) {
                CvLanguage.NL -> NL
                CvLanguage.EN -> EN
            }
    }
}

/** An image on the CV, as PNG, with its size on the page in points. */
class CvImage(
    val png: ByteArray,
    val width: Double,
    val height: Double,
)

/**
 * Everything a CV document shows: the [cv] with its [photo], the [logos] of its
 * assignments by id, and the Flock [disc] at the top of every page.
 */
class CvDocumentContent(
    val cv: Cv,
    val photo: CvImage?,
    val logos: Map<UUID, CvImage>,
    val disc: CvImage?,
    val today: YearMonth = YearMonth.now(),
) {
    val labels = CvLabels.of(cv.language)
    val name = cv.person.getFullName()
    val title = "${labels.title} - $name"

    /** The personal details that are filled in, label and value. */
    val details: List<Pair<String, String>> =
        listOfNotNull(
            labels.name to name,
            cv.place?.let { labels.place to it },
            cv.phone?.let { labels.phone to it },
            cv.person.email
                .takeIf { it.isNotBlank() }
                ?.let { labels.mail to it },
            cv.person.birthdate?.let { labels.birthdate to it.format(DMY_DATE) },
        ).filter { it.second.isNotBlank() }

    /** The assignments with something to tell, each in a section of its own. */
    val assignments: List<CvExperience> =
        cv.experiences.filter { !it.description.isNullOrBlank() || it.technologies.isNotEmpty() || logoOf(it) != null }

    fun logoOf(experience: CvExperience): CvImage? = experience.logoId?.let { logos[it] }

    /** `08-2024 - nu`, `12-2022 - 07-2024`. */
    fun periodText(experience: CvExperience): String =
        "${experience.from.format(CV_MONTH)} - ${experience.to?.format(CV_MONTH) ?: labels.now}"

    /** `augustus 2024 - nu`, `January 2026 - September 2026`: the period above an assignment. */
    fun longPeriodText(experience: CvExperience): String =
        "${monthName(experience.from)} - ${experience.to?.let(::monthName) ?: labels.now}"

    /** The months worked from the first up to and including the last (or this) month. */
    fun monthsWorked(experience: CvExperience): Long = maxOf(0, ChronoUnit.MONTHS.between(experience.from, experience.to ?: today) + 1)

    private fun monthName(month: YearMonth) = "${labels.monthNames[month.monthValue - 1]} ${month.year}"

    /** The skills by category, in the order the categories first appear, the best rated first. */
    val skillGroups: List<Pair<String, List<CvSkill>>> =
        cv.skills
            .groupBy { it.category?.trim()?.takeIf(String::isNotEmpty) }
            .map { (category, skills) -> (category ?: labels.skills) to skills.sortedByDescending { it.level ?: 0 } }

    /**
     * The free text sections below the skills, as headed lists: a later block of lines
     * starts with its own heading, like Training below Education.
     */
    val sectionsBeforeSkills: List<CvTextSection> = textSections(labels.education, cv.education)
    val sectionsAfterSkills: List<CvTextSection> =
        textSections(labels.subjects, cv.subjects) + textSections(labels.languages, cv.languages)

    companion object {
        private val CV_MONTH = DateTimeFormatter.ofPattern("MM-yyyy")
        private val DMY_DATE = DateTimeFormatter.ofPattern("dd-MM-yyyy")
    }
}

class CvTextSection(
    val heading: String,
    val items: List<String>,
)

/** `ING (via Flock)`, or just the client without an employer in between. */
fun clientText(experience: CvExperience): String =
    experience.employer?.takeIf { it.isNotBlank() }?.let { "${experience.client} (via $it)" } ?: experience.client

/** Splits CV text into paragraphs on blank lines; a single line break stays within a paragraph. */
fun paragraphs(text: String?): List<String> =
    (text ?: "")
        .replace("\r\n", "\n")
        .split(Regex("\n\\s*\n"))
        .map { it.trim() }
        .filter { it.isNotEmpty() }

private fun textSections(
    label: String,
    value: String?,
): List<CvTextSection> =
    paragraphs(value).mapIndexed { index, block ->
        val lines = block.lines()
        if (index == 0) CvTextSection(label, lines) else CvTextSection(lines.first(), lines.drop(1))
    }
