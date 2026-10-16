package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
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
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

/** The language a CV is written in. */
enum class CvLanguage {
    NL,
    EN,
}

/**
 * The curriculum vitae of a person, as Flock sends it to clients: a few personal
 * details, a profile text ([summary]), the working experience, a skills matrix and
 * the [education], [subjects] of expertise and spoken [languages] as free text.
 * Name, e-mail and date of birth are not copied onto the CV; they come from the [person].
 *
 * A person can have several CVs, each a version with its own [name] (say "2025 NL" or
 * "Frontend EN"); every save keeps the content before it as a [CvRevision].
 *
 * Per language one CV of a person is the [base], kept up to date; the others are copies
 * of it, made for a client or a role. A copy knows the base it was [basedOn] and when that
 * base had been saved when the copy was made ([basedOnUpdatedAt]; unknown for a CV that
 * became a copy because another CV was made the base). A person with several CVs in a
 * language from before bases existed has none until one is picked.
 */
@Entity
@EntityListeners(EventEntityListeners::class)
@Table(
    uniqueConstraints = [
        UniqueConstraint(name = "cv_person_name_unique", columnNames = ["person_id", "name"]),
        UniqueConstraint(name = "cv_person_language_base_unique", columnNames = ["person_id", "language", "base"]),
    ],
)
class Cv(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    // A CV is personal data: it goes when its person goes
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    val person: Person,
    @Column(length = CV_NAME_LENGTH)
    val name: String,
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
    @Convert(converter = BaseFlagConverter::class)
    @Column(nullable = true)
    val base: Boolean = false,
    // A copy loses its base only when the base is deleted, which is refused while it has copies
    @ManyToOne
    @JoinColumn(name = "based_on_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    val basedOn: Cv? = null,
    val basedOnUpdatedAt: Instant? = null,
    /**
     * For a copy: the base as this copy last agreed with it, field by field (a JSON
     * [CvSnapshot]). A field that still equals it follows the base; one that differs is
     * tailored. TEXT in the database (changelog 042).
     */
    @Column(length = 1_000_000)
    val baseSnapshot: String? = null,
) : AbstractCodeEntity(id, code) {
    override fun toString(): String = "Cv(id=$id, code=$code, person=${person.uuid}, name='$name', language=$language)"

    companion object {
        /** Room for a few paragraphs of profile or assignment text. */
        const val CV_TEXT_LENGTH = 10000

        const val CV_NAME_LENGTH = 100

        /** Room for a list of degrees, subjects or languages. */
        const val CV_SECTION_LENGTH = 2000
    }
}

/**
 * One assignment or job on a CV: from [from] up to and including [to] (no [to] means
 * it is the current one), working as [role] for [client], optionally via an
 * [employer] such as Flock. Its [itemId] stays the same when the CV is saved, and a
 * copy shares it with the assignment of the base it came from.
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
    /** An array column (TEXT[]), so a technology can hold any character, commas too. */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false)
    val technologies: List<String> = emptyList(),
    @Column(length = Cv.CV_TEXT_LENGTH)
    val description: String? = null,
    /** The [Logo] to show with the assignment; a deleted logo leaves none. */
    val logoId: UUID? = null,
    @Column(nullable = false)
    val itemId: UUID = UUID.randomUUID(),
)

/**
 * A skill in the skills matrix of a CV, grouped by [category] (Programming, Tools, ...)
 * and rated from 1 to 5 stars; no [level] means it is listed without a rating. Its
 * [itemId] works like that of [CvExperience].
 */
@Embeddable
class CvSkill(
    val category: String? = null,
    val name: String,
    @Column(name = "skill_level")
    val level: Int? = null,
    @Column(nullable = false)
    val itemId: UUID = UUID.randomUUID(),
)

/**
 * [Cv.base] is stored as TRUE or NULL, never FALSE: the unique constraint on person,
 * language and base then allows a single base next to any number of copies.
 */
@Converter
class BaseFlagConverter : AttributeConverter<Boolean, Boolean?> {
    override fun convertToDatabaseColumn(attribute: Boolean?): Boolean? = if (attribute == true) true else null

    override fun convertToEntityAttribute(dbData: Boolean?): Boolean = dbData == true
}

/** A month is stored as the first day of that month. */
@Converter
class YearMonthConverter : AttributeConverter<YearMonth?, LocalDate?> {
    override fun convertToDatabaseColumn(attribute: YearMonth?): LocalDate? = attribute?.atDay(1)

    override fun convertToEntityAttribute(dbData: LocalDate?): YearMonth? = dbData?.let(YearMonth::from)
}
