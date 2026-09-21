package community.flock.eco.workday.person.domain

/**
 * A Dutch postal address.
 *
 * Dutch addresses split the house number into a numeric part and an optional
 * addition ("toevoeging", e.g. the "A" in "Sesamstraat 12A" or "bis"), and use
 * a postal code of four digits followed by two letters, written as `1234 AB`.
 */
data class Address(
    val street: String,
    val houseNumber: String,
    val houseNumberAddition: String?,
    val postalCode: String,
    val city: String,
) {
    companion object {
        private val POSTAL_CODE = Regex("^([1-9][0-9]{3})\\s*([A-Z]{2})$")

        /** Letter pairs that PostNL never issues, so a postal code ending in one is a typo. */
        private val UNUSED_LETTER_PAIRS = setOf("SA", "SD", "SS")

        private val HOUSE_NUMBER = Regex("^[1-9][0-9]{0,4}$")

        /**
         * Normalises [raw] to the canonical `1234 AB` form (upper case, one space),
         * or returns null when it is not a valid Dutch postal code.
         */
        fun normalizePostalCode(raw: String): String? {
            val match = POSTAL_CODE.matchEntire(raw.trim().uppercase()) ?: return null
            val (digits, letters) = match.destructured
            if (letters in UNUSED_LETTER_PAIRS) return null
            return "$digits $letters"
        }

        /**
         * Returns the trimmed [raw] house number, or null when it is not a plain
         * number between 1 and 99999. Letters and suffixes belong in [houseNumberAddition].
         */
        fun normalizeHouseNumber(raw: String): String? = raw.trim().takeIf { HOUSE_NUMBER.matches(it) }
    }
}
