package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.model.CvLanguage
import java.time.YearMonth
import java.util.UUID

data class CvForm(
    val personId: UUID,
    val name: String,
    val language: CvLanguage,
    val place: String? = null,
    val phone: String? = null,
    val summary: String? = null,
    val experiences: List<CvExperienceForm> = emptyList(),
    val skills: List<CvSkillForm> = emptyList(),
    val education: String? = null,
    val subjects: String? = null,
    val languages: String? = null,
)

data class CvSkillForm(
    val category: String? = null,
    val name: String,
    val level: Int? = null,
)

data class CvExperienceForm(
    val from: YearMonth,
    val to: YearMonth? = null,
    val role: String,
    val client: String,
    val employer: String? = null,
    val technologies: List<String> = emptyList(),
    val description: String? = null,
)
