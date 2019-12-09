package community.flock.eco.workday.repository

import community.flock.eco.workday.filters.SickdayFilters
import community.flock.eco.workday.model.Sickday
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.persistence.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
class SickdayRepositoryImpl(
    @PersistenceContext
    val entity: EntityManager
) : SickdayRepositoryCustom {

//    @Query("SELECT s.* FROM sickday WHERE status = :status", nativeQuery = true)
//    override fun filterBy(@Param("status") filter: SickdayFilters): MutableList<Sickday>

    override fun filterBy(filter: SickdayFilters): Iterable<Any?> {
        val query: Query = entity.createNativeQuery("""
            SELECT *
            FROM "sickday"
            WHERE "status" = ?
            """.trimIndent(),
            Sickday::class.java)
        query.setParameter(1, filter.name)

        return query.resultList.toMutableList().asIterable()
    }
}
