package community.flock.eco.workday.application.utils

import java.util.Base64

/**
 * The content type of the image these bytes hold: what the bytes are, not what an
 * upload claims. PNG, JPEG, GIF, WebP or SVG; null for anything else.
 */
fun ByteArray.imageContentType(): String? =
    when {
        startsWith(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A) -> "image/png"
        startsWith(0xFF, 0xD8, 0xFF) -> "image/jpeg"
        hasAsciiAt(0, "GIF87a") || hasAsciiAt(0, "GIF89a") -> "image/gif"
        hasAsciiAt(0, "RIFF") && hasAsciiAt(8, "WEBP") -> "image/webp"
        isSvg() -> "image/svg+xml"
        else -> null
    }

/** The bytes of a base64 string, optionally a data URL (`data:image/png;base64,...`). */
fun String.decodeBase64Image(): ByteArray = Base64.getDecoder().decode(substringAfter("base64,").trim())

/** The bytes as a data URL, which the browser can use directly as an `<img src>`. */
fun ByteArray.toDataUrl(contentType: String): String = "data:$contentType;base64,${Base64.getEncoder().encodeToString(this)}"

private val SVG_TAG = Regex("<svg[\\s>]", RegexOption.IGNORE_CASE)

private fun ByteArray.startsWith(vararg bytes: Int): Boolean = size >= bytes.size && bytes.indices.all { this[it] == bytes[it].toByte() }

private fun ByteArray.hasAsciiAt(
    offset: Int,
    text: String,
): Boolean = size >= offset + text.length && String(this, offset, text.length, Charsets.US_ASCII) == text

private fun ByteArray.isSvg(): Boolean {
    val head = String(this, 0, minOf(size, 2048), Charsets.UTF_8).trimStart('﻿', ' ', '\n', '\r', '\t')
    return head.startsWith("<") && SVG_TAG.containsMatchIn(head)
}
