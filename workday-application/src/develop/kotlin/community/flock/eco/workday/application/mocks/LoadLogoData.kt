package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Logo
import community.flock.eco.workday.application.repository.LogoRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

/**
 * Seed logos for the CV assignments: plain coloured placeholders, no brand artwork. They
 * hold no text, since text in an SVG stays text in a printed CV.
 */
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadLogoData(
    private val logoRepository: LogoRepository,
    loadData: LoadData,
) {
    val data: MutableMap<String, Logo> = mutableMapOf()

    init {
        loadData.load {
            create("ING", background = "#ff6200", shape = circle("#ffffff"))
            create("DHL", background = "#ffcc00", shape = bars("#d40511"))
            create("bol.com", background = "#0000a4", shape = circle("#ffffff"))
        }
    }

    fun findByName(name: String): Logo? = data[name]

    private fun circle(color: String) = """<circle cx="120" cy="60" r="34" fill="$color"/>"""

    private fun bars(color: String) =
        (0..2).joinToString("") { """<rect x="${36 + it * 60}" y="38" width="48" height="44" rx="4" fill="$color"/>""" }

    private fun create(
        name: String,
        background: String,
        shape: String,
    ) {
        val svg =
            """<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">""" +
                """<rect width="240" height="120" rx="8" fill="$background"/>$shape</svg>"""
        data[name] = logoRepository.save(Logo(name = name, contentType = "image/svg+xml", data = svg.toByteArray()))
    }
}
