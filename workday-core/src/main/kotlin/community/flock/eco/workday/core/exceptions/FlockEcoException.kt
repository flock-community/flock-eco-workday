package community.flock.eco.workday.core.exceptions

open class FlockEcoException
    @JvmOverloads
    constructor(
        msg: String,
        ex: Exception? = null,
    ) : RuntimeException(msg, ex)
