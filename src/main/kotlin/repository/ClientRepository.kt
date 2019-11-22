package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Client
import java.util.Optional
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface ClientRepository : PagingAndSortingRepository<Client, Long> {

    fun findByCode(code: String): Optional<Client>
    fun deleteByCode(code: String)
}
