package community.flock.eco.workday.utils

/**
 * @param start <code>Int</code> range start. default 1
 * @param end <code>Int</code> range end. default 10
 * @return random generated number from range
 */
fun randomNumber(
    start: Int = 1,
    end: Int = 10,
): Int {
    return (start..end).shuffled().first()
}
