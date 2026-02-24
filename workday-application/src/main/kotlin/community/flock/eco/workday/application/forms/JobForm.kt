package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.model.JobStatus
import java.time.LocalDate

data class JobDocumentForm(
    val name: String,
    val file: String,
)

data class JobForm(
    val title: String,
    val description: String,
    val hourlyRate: Double? = null,
    val hoursPerWeek: Int? = null,
    val from: LocalDate? = null,
    val to: LocalDate? = null,
    val status: JobStatus = JobStatus.DRAFT,
    val clientCode: String? = null,
    val documents: List<JobDocumentForm> = emptyList(),
)
