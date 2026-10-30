package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Person
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface PersonRepository : JpaRepository<Person, Long> {
    fun findByUuid(uuid: UUID): Optional<Person>

    fun findByUserCode(userCode: String): Optional<Person>

    fun findFirstByEmailIgnoreCase(email: String): Person?

    fun existsByUuid(uuid: UUID): Boolean

    fun deleteByUuid(uuid: UUID): Unit

    fun findByUuidIn(userUuid: List<UUID>): Iterable<Person>

    // Only the columns a list of names needs: no user, authorities or photo get loaded.
    @Query("SELECT p.id AS id, p.uuid AS uuid, p.firstname AS firstname, p.lastname AS lastname FROM Person p WHERE p.active = true")
    fun findAllActiveNames(): List<PersonName>

    // Active persons with an internal contract running on the date: the engineers in employment.
    @Query(
        "SELECT DISTINCT p.id AS id, p.uuid AS uuid, p.firstname AS firstname, p.lastname AS lastname " +
            "FROM ContractInternal c JOIN c.person p " +
            "WHERE p.active = true AND c.from <= :date AND (c.to IS NULL OR c.to >= :date)",
    )
    fun findAllActiveInternalNames(date: LocalDate): List<PersonName>

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

interface PersonName {
    val id: Long
    val uuid: UUID
    val firstname: String
    val lastname: String
}
