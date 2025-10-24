package community.flock.eco.core.services

interface CrudService<T, I> {
    fun create(item: T): T?

    fun read(id: I): T?

    fun update(
        id: I,
        item: T,
    ): T?

    fun delete(id: I): Unit?
}
