package community.flock.eco.workday.application.cv

import community.flock.eco.workday.application.services.LogoService
import org.apache.batik.transcoder.SVGAbstractTranscoder
import org.apache.batik.transcoder.TranscoderInput
import org.apache.batik.transcoder.TranscoderOutput
import org.apache.batik.transcoder.image.ImageTranscoder
import org.slf4j.LoggerFactory
import java.awt.RenderingHints
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

/**
 * The images of a CV as PNG, which both PDF and Word show, whatever they were uploaded
 * as (PNG, JPEG, GIF, WebP or SVG). They are drawn at a few times their size on the
 * page, to stay sharp when printed.
 */
object CvImages {
    private val log = LoggerFactory.getLogger(CvImages::class.java)

    /** Pixels per point of an image on the page: 4 is 288 dpi. */
    private const val PIXELS_PER_POINT = 4.0

    /** Uploads are at most half a megabyte, but a small file can still be huge in pixels. */
    private const val MAX_PIXELS = 8000

    /** The photo beside the personal details: a square, cropped to fill it, like on screen. */
    fun photo(
        data: ByteArray,
        size: Double,
    ): CvImage? = read(data, size)?.let { draw(it, size, size, cover = true) }

    /** A logo, as large as fits in [maxWidth] by [maxHeight] points, keeping its shape. */
    fun logo(
        data: ByteArray,
        maxWidth: Double,
        maxHeight: Double,
    ): CvImage? = read(data, maxOf(maxWidth, maxHeight))?.let { draw(it, maxWidth, maxHeight, cover = false) }

    /** The Flock disc at the top of every page. */
    fun disc(size: Double): CvImage? =
        CvImages::class.java
            .getResourceAsStream("/cv/flock-disc.svg")
            ?.use { it.readBytes() }
            ?.let { logo(it, size, size) }

    /** An image that cannot be read is left out, as the browser shows nothing for it either. */
    private fun read(
        data: ByteArray,
        size: Double,
    ): BufferedImage? =
        try {
            when (LogoService.contentTypeOf(data)) {
                "image/svg+xml" -> readSvg(data, (size * PIXELS_PER_POINT * 2).toFloat())
                null -> null
                else -> readRaster(data)
            }
        } catch (e: Exception) {
            log.warn("An image of a CV could not be read: {}", e.message)
            null
        }

    private fun readRaster(data: ByteArray): BufferedImage? =
        ImageIO.createImageInputStream(ByteArrayInputStream(data)).use { input ->
            val reader = ImageIO.getImageReaders(input).asSequence().firstOrNull() ?: return null
            try {
                reader.input = input
                if (reader.getWidth(0) > MAX_PIXELS || reader.getHeight(0) > MAX_PIXELS) return null
                reader.read(0)
            } finally {
                reader.dispose()
            }
        }

    /**
     * Draws an SVG [width] pixels wide. It never loads anything from elsewhere (other
     * files, web addresses) and never runs a script it holds.
     */
    private fun readSvg(
        data: ByteArray,
        width: Float,
    ): BufferedImage? {
        val text = String(data, Charsets.UTF_8)
        // No document types: they could pull in entities from elsewhere
        if (text.contains("<!DOCTYPE", ignoreCase = true)) return null
        var image: BufferedImage? = null
        val transcoder =
            object : ImageTranscoder() {
                override fun createImage(
                    w: Int,
                    h: Int,
                ) = BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB)

                override fun writeImage(
                    img: BufferedImage,
                    output: TranscoderOutput?,
                ) {
                    image = img
                }
            }
        transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_WIDTH, width)
        // Without a size of its own an SVG has the shape of its view box, as in the browser
        viewBoxRatio(text)?.let { transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_HEIGHT, width / it) }
        transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_MAX_HEIGHT, MAX_PIXELS.toFloat())
        transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_ALLOW_EXTERNAL_RESOURCES, false)
        transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_EXECUTE_ONLOAD, false)
        transcoder.addTranscodingHint(SVGAbstractTranscoder.KEY_ALLOWED_SCRIPT_TYPES, "")
        transcoder.transcode(TranscoderInput(ByteArrayInputStream(data)), null)
        return image
    }

    /** Width over height of the view box of an SVG without a width and height of its own. */
    private fun viewBoxRatio(svg: String): Float? {
        val root = Regex("<svg\\b[^>]*>", RegexOption.IGNORE_CASE).find(svg)?.value ?: return null
        if (Regex("\\s(width|height)\\s*=").containsMatchIn(root)) return null
        val box =
            Regex("viewBox\\s*=\\s*[\"']([^\"']*)[\"']")
                .find(root)
                ?.groupValues
                ?.get(1)
                ?.trim()
                ?.split(Regex("[\\s,]+"))
                ?.mapNotNull { it.toFloatOrNull() }
                ?: return null
        return if (box.size == 4 && box[2] > 0 && box[3] > 0) box[2] / box[3] else null
    }

    /**
     * Draws [image] in a box of [width] by [height] points: covering it (cropped) or
     * contained in it, in which case the box shrinks to the image.
     */
    private fun draw(
        image: BufferedImage,
        width: Double,
        height: Double,
        cover: Boolean,
    ): CvImage {
        val scaleX = width / image.width
        val scaleY = height / image.height
        val scale = if (cover) maxOf(scaleX, scaleY) else minOf(scaleX, scaleY)
        val drawnWidth = image.width * scale
        val drawnHeight = image.height * scale
        val boxWidth = if (cover) width else drawnWidth
        val boxHeight = if (cover) height else drawnHeight

        val canvas =
            BufferedImage(
                maxOf(1, Math.round(boxWidth * PIXELS_PER_POINT).toInt()),
                maxOf(1, Math.round(boxHeight * PIXELS_PER_POINT).toInt()),
                BufferedImage.TYPE_INT_ARGB,
            )
        val graphics = canvas.createGraphics()
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC)
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY)
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
            graphics.drawImage(
                image,
                Math.round((boxWidth - drawnWidth) / 2 * PIXELS_PER_POINT).toInt(),
                Math.round((boxHeight - drawnHeight) / 2 * PIXELS_PER_POINT).toInt(),
                Math.round(drawnWidth * PIXELS_PER_POINT).toInt(),
                Math.round(drawnHeight * PIXELS_PER_POINT).toInt(),
                null,
            )
        } finally {
            graphics.dispose()
        }
        val png = ByteArrayOutputStream().also { ImageIO.write(canvas, "png", it) }.toByteArray()
        return CvImage(png, boxWidth, boxHeight)
    }
}
