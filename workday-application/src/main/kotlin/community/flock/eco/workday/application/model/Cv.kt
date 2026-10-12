package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Converter
import jakarta.persistence.ElementCollection
import jakarta.persistence.Embeddable
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OrderColumn
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

/** The language a CV is written in; a person has at most one CV per language. */
enum class CvLanguage {
    NL,
    EN,
}

/**
 * The curriculum vitae of a person, as Flock sends it to clients: a few personal
 * details, a profile text ([summary]), the working experience, a skills matrix and
 * the [education], [subjects] of expertise and spoken [languages] as free text.
 * Name, e-mail and date of birth are not copied onto the CV; they come from the [person].
 */
@Entity
@EntityListeners(EventEntityListeners::class)
@Table(uniqueConstraints = [UniqueConstraint(name = "cv_person_language_unique", columnNames = ["person_id", "language"])])
class Cv(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    // A CV is personal data: it goes when its person goes
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    val person: Person,
    @Enumerated(EnumType.STRING)
    @Column(length = 2)
    val language: CvLanguage,
    val place: String? = null,
    val phone: String? = null,
    @Column(length = CV_TEXT_LENGTH)
    val summary: String? = null,
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cv_experience", joinColumns = [JoinColumn(name = "cv_id")])
    @OrderColumn(name = "experience_order")
    @OnDelete(action = OnDeleteAction.CASCADE)
    val experiences: List<CvExperience> = emptyList(),
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cv_skill", joinColumns = [JoinColumn(name = "cv_id")])
    @OrderColumn(name = "skill_order")
    @OnDelete(action = OnDeleteAction.CASCADE)
    val skills: List<CvSkill> = emptyList(),
    @Column(length = CV_SECTION_LENGTH)
    val education: String? = null,
    @Column(length = CV_SECTION_LENGTH)
    val subjects: String? = null,
    @Column(length = CV_SECTION_LENGTH)
    val languages: String? = null,
    val updatedAt: Instant = Instant.now(),
) : AbstractCodeEntity(id, code) {
    override fun toString(): String = "Cv(id=$id, code=$code, person=${person.uuid}, language=$language)"

    companion object {
        /** Room for a few paragraphs of profile or assignment text. */
        const val CV_TEXT_LENGTH = 10000

        /** Room for a list of degrees, subjects or languages. */
        const val CV_SECTION_LENGTH = 2000
    }
}

/**
 * One assignment or job on a CV: from [from] up to and including [to] (no [to] means
 * it is the current one), working as [role] for [client], optionally via an
 * [employer] such as Flock.
 */
@Embeddable
class CvExperience(
    @Column(name = "from_month")
    @Convert(converter = YearMonthConverter::class)
    val from: YearMonth,
    @Column(name = "to_month")
    @Convert(converter = YearMonthConverter::class)
    val to: YearMonth? = null,
    val role: String,
    val client: String,
    val employer: String? = null,
    @Column(length = 1000)
    @Convert(converter = TechnologiesConverter::class)
    val technologies: List<String> = emptyList(),
    @Column(length = Cv.CV_TEXT_LENGTH)
    val description: String? = null,
)

/**
 * A skill in the skills matrix of a CV, grouped by [category] (Programming, Tools, ...)
 * and rated from 1 to 5 stars; no [level] means it is listed without a rating.
 */
@Embeddable
class CvSkill(
    val category: String? = null,
    val name: String,
    @Column(name = "skill_level")
    val level: Int? = null,
)

/** A month is stored as the first day of that month. */
@Converter
class YearMonthConverter : AttributeConverter<YearMonth?, LocalDate?> {
    override fun convertToDatabaseColumn(attribute: YearMonth?): LocalDate? = attribute?.atDay(1)

    override fun convertToEntityAttribute(dbData: LocalDate?): YearMonth? = dbData?.let(YearMonth::from)
}

/** Technologies are stored as a JSON array of strings, so a technology may hold a comma. */
@Converter
class TechnologiesConverter : AttributeConverter<List<String>, String?> {
    override fun convertToDatabaseColumn(attribute: List<String>?): String? =
        attribute?.takeIf { it.isNotEmpty() }?.let(mapper::writeValueAsString)

    override fun convertToEntityAttribute(dbData: String?): List<String> =
        when {
            dbData.isNullOrBlank() -> emptyList()
            dbData.trimStart().startsWith("[") -> mapper.readValue(dbData, STRINGS)
            // Comma separated, as before the JSON array
            else -> dbData.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        }

    companion object {
        private val mapper = ObjectMapper()
        private val STRINGS = object : TypeReference<List<String>>() {}
    }
}
