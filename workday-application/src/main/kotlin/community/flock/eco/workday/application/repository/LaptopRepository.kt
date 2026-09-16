package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Laptop
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface LaptopRepository : JpaRepository<Laptop, Long> {
    fun findByCode(code: String): Laptop?

    fun findBySerialNumberIgnoreCase(serialNumber: String): Laptop?

    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Laptop>

    fun deleteByCode(code: String)
}
