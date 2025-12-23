package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Person
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PersonRepository : JpaRepository<Person, Long> {
    fun findByUuid(uuid: UUID): Optional<Person>

    fun findByUserCode(userCode: String): Optional<Person>

    fun existsByUuid(uuid: UUID): Boolean

    fun deleteByUuid(uuid: UUID): Unit

    fun findByUuidIn(userUuid: List<UUID>): Iterable<Person>

    fun findAllByActive(
        pageable: Pageable,
        active: Boolean,
    ): Page<Person>

    @Query("SELECT p FROM Person p WHERE LOWER(CONCAT(p.firstname, ' ', p.lastname)) LIKE LOWER(CONCAT('%', ?1, '%'))")
    fun findAllByFullName(
        pageable: Pageable,
        search: String,
    ): Page<Person>
}
