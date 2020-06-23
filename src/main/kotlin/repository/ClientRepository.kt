package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Client
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ClientRepository : PagingAndSortingRepository<Client, Long> {

    fun findByCode(code: String): Optional<Client>
    fun deleteByCode(code: String)
}
