package community.flock.eco.workday.services

import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.CvSnapshot
import community.flock.eco.workday.application.services.CvSync
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class CvSyncTest {
    private val ing =
        CvSnapshot.Experience(
            id = "ing",
            from = "2024-08",
            role = "Software Engineer",
            client = "ING",
            technologies = listOf("Kotlin"),
            description = "Rebuilt the portal.",
        )
    private val kotlin = CvSnapshot.Skill(id = "kotlin", category = "Programming", name = "Kotlin", level = 4)

    private val base =
        CvSnapshot(
            name = "Algemeen",
            language = CvLanguage.NL,
            place = "Hilversum",
            summary = "Engineer at heart.",
            experiences = listOf(ing),
            skills = listOf(kotlin),
        )

    @Test
    fun `facts the copy follows are taken over, texts are offered`() {
        val copy = base.copy(name = "ING")
        val changed =
            base.copy(
                place = "Utrecht",
                summary = "Engineer and coach.",
                experiences = listOf(ing.copy(role = "Lead Engineer", description = "Led the portal team.")),
                skills = listOf(kotlin.copy(level = 5)),
            )

        val result = CvSync.reconcile(copy, base, changed)

        assertThat(result.copy.place).isEqualTo("Utrecht")
        assertThat(result.copy.experiences.single().role).isEqualTo("Lead Engineer")
        assertThat(result.copy.skills.single().level).isEqualTo(5)
        // Texts stay until the copy takes them
        assertThat(result.copy.summary).isEqualTo("Engineer at heart.")
        assertThat(result.copy.experiences.single().description).isEqualTo("Rebuilt the portal.")

        val status = CvSync.status(result.copy, result.agreed, changed)
        assertThat(status.offers.map { it.address }).containsExactly("summary", "experience/ing/description")
        assertThat(status.offers.map { it.outdated }).containsOnly(false)
        assertThat(status.tailored).isEmpty()
    }

    @Test
    fun `a tailored fact stays, and is offered as outdated when the base changes it`() {
        val copy = base.copy(experiences = listOf(ing.copy(role = "Backend Engineer")))

        CvSync.status(copy, base, base).let { status ->
            assertThat(status.offers).isEmpty()
            assertThat(status.tailored.single().address).isEqualTo("experience/ing/role")
            assertThat(status.tailored.single().label).isEqualTo("ING · Software Engineer: role")
        }

        val changed = base.copy(experiences = listOf(ing.copy(role = "Lead Engineer")))
        val result = CvSync.reconcile(copy, base, changed)
        assertThat(result.copy.experiences.single().role).isEqualTo("Backend Engineer")
        val offer = CvSync.status(result.copy, result.agreed, changed).offers.single()
        assertThat(offer.address).isEqualTo("experience/ing/role")
        assertThat(offer.base).isEqualTo("Lead Engineer")
        assertThat(offer.copy).isEqualTo("Backend Engineer")
        assertThat(offer.outdated).isTrue()
    }

    @Test
    fun `a new assignment of the base is added, one it removed is offered`() {
        val dhl = ing.copy(id = "dhl", from = "2020-01", client = "DHL")
        val copy = base.copy(experiences = listOf(ing, dhl))
        val agreed = base.copy(experiences = listOf(ing, dhl))
        val rabo = ing.copy(id = "rabo", from = "2025-09", client = "Rabobank")
        val changed = base.copy(experiences = listOf(rabo, ing))

        val result = CvSync.reconcile(copy, agreed, changed)
        assertThat(result.copy.experiences.map { it.id }).containsExactlyInAnyOrder("ing", "dhl", "rabo")

        val offer = CvSync.status(result.copy, result.agreed, changed).offers.single()
        assertThat(offer.address).isEqualTo("experience/dhl")
        assertThat(offer.kind).isEqualTo(CvSync.Kind.REMOVED)

        val accepted = CvSync.accept(result.copy, result.agreed, changed, "experience/dhl")
        assertThat(accepted.copy.experiences.map { it.id }).containsExactlyInAnyOrder("ing", "rabo")
        assertThat(CvSync.status(accepted.copy, accepted.agreed, changed).offers).isEmpty()
    }

    @Test
    fun `left out and copy-only items are tailored`() {
        val own = ing.copy(id = "own", client = "Side project")
        val copy = base.copy(experiences = listOf(own), skills = emptyList())

        val tailored = CvSync.status(copy, base, base).tailored
        assertThat(tailored.map { it.address to it.kind }).containsExactlyInAnyOrder(
            "experience/ing" to CvSync.Kind.HIDDEN,
            "experience/own" to CvSync.Kind.COPY_ONLY,
            "skill/kotlin" to CvSync.Kind.HIDDEN,
        )

        // A left out assignment is not taken out of the base
        assertThatThrownBy { CvSync.promote(copy, base, "experience/ing") }.isInstanceOf(IllegalArgumentException::class.java)
        assertThat(CvSync.promote(copy, base, "experience/own").experiences.map { it.id }).containsExactly("ing", "own")
    }

    @Test
    fun `skip keeps the copy's text, accept takes the base's, promote puts the copy's in the base`() {
        val copy = base.copy(summary = "Tailored for ING.")
        val changed = base.copy(summary = "Engineer and coach.")

        val skipped = CvSync.skip(copy, base, changed, "summary")
        assertThat(skipped.copy.summary).isEqualTo("Tailored for ING.")
        val status = CvSync.status(skipped.copy, skipped.agreed, changed)
        assertThat(status.offers).isEmpty()
        assertThat(status.tailored.single().address).isEqualTo("summary")

        val accepted = CvSync.accept(copy, base, changed, "summary")
        assertThat(accepted.copy.summary).isEqualTo("Engineer and coach.")
        assertThat(CvSync.status(accepted.copy, accepted.agreed, changed).offers).isEmpty()

        assertThat(CvSync.promote(copy, changed, "summary").summary).isEqualTo("Tailored for ING.")
    }

    @Test
    fun `an unknown field is refused`() {
        listOf("name", "experience/ing/rate", "nonsense/x").forEach { address ->
            assertThatThrownBy { CvSync.accept(base, base, base, address) }.isInstanceOf(IllegalArgumentException::class.java)
        }
    }
}
