package community.flock.eco.workday.application.cv

import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.services.LogoService
import org.springframework.stereotype.Service

/** A CV as a document to download: PDF or Word, in the Flock template. */
@Service
class CvDocumentService(
    private val logoService: LogoService,
) {
    private val disc by lazy { CvImages.disc(DISC_SIZE) }

    fun pdf(cv: Cv): ByteArray = CvPdf.render(content(cv))

    fun word(cv: Cv): ByteArray = CvWord.render(content(cv))

    /** The CV with its images; a logo deleted since, or an image that cannot be read, is left out. */
    fun content(cv: Cv): CvDocumentContent =
        CvDocumentContent(
            cv = cv,
            photo = cv.person.photoData?.let { CvImages.photo(it, PHOTO_SIZE) },
            logos =
                cv.experiences
                    .mapNotNull { it.logoId }
                    .distinct()
                    .mapNotNull { id ->
                        logoService.findById(id)?.let { CvImages.logo(it.data, LOGO_WIDTH, LOGO_HEIGHT) }?.let { id to it }
                    }.toMap(),
            disc = disc,
        )

    companion object {
        /** Sizes in points, as in the template. */
        const val PHOTO_SIZE = 91.0
        const val LOGO_WIDTH = 90.0
        const val LOGO_HEIGHT = 48.0
        const val DISC_SIZE = 44.0
    }
}
