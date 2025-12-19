package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Client
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ClientRepository : JpaRepository<Client, Long> {
    fun findByCode(code: String): Optional<Client>

    fun deleteByCode(code: String)
}
