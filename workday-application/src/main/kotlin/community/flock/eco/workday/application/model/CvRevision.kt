package community.flock.eco.workday.application.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import java.time.Instant
import java.util.UUID

/**
 * An earlier version of a [Cv]: what it held until it was saved at [savedAt]. The
 * content is a JSON snapshot ([CvSnapshot]), so a revision keeps its shape even when
 * the CV it belongs to changes.
 */
@Entity
class CvRevision(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    val cv: Cv,
    val savedAt: Instant,
    // TEXT in the database (changelog 039); the length is for schemas Hibernate generates
    @Column(nullable = false, length = 1_000_000)
    val content: String,
)

/**
 * The content of a CV as a revision stores it; months are `yyyy-MM`. The [Experience.id]
 * and [Skill.id] are the item ids; revisions from before item ids have none.
 */
data class CvSnapshot(
    val name: String,
    val language: CvLanguage,
    val place: String? = null,
    val phone: String? = null,
    val summary: String? = null,
    val experiences: List<Experience> = emptyList(),
    val skills: List<Skill> = emptyList(),
    val education: String? = null,
    val subjects: String? = null,
    val languages: String? = null,
) {
    data class Experience(
        val id: String? = null,
        val from: String,
        val to: String? = null,
        val role: String,
        val client: String,
        val employer: String? = null,
        val technologies: List<String> = emptyList(),
        val description: String? = null,
        val logoId: String? = null,
    )

    data class Skill(
        val id: String? = null,
        val category: String? = null,
        val name: String,
        val level: Int? = null,
    )
}
