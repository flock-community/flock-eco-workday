package community.flock.eco.workday.core.data

interface LoadData<T> {
    fun load(n: Int = 33): Iterable<T>
}
