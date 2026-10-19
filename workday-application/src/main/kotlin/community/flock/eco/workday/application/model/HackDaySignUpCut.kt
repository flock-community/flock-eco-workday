package community.flock.eco.workday.application.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.ManyToOne
import java.io.Serializable

/**
 * The hours someone signed up for on a hack day before holiday or sickness cut that sign-up.
 * Kept so the sign-up can be put back when the absence is withdrawn or rejected.
 */
@Entity
@IdClass(HackDaySignUpCutId::class)
class HackDaySignUpCut(
    @Id
    @ManyToOne
    val event: Event,
    @Id
    @ManyToOne
    val person: Person,
    val hours: Double,
)

data class HackDaySignUpCutId(
    var event: Long? = null,
    var person: Long? = null,
) : Serializable
