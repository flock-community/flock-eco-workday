package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Day
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import java.util.*

@Repository
interface ClientRepository : PagingAndSortingRepository<Client, Long>{

    fun findByCode(code:String): Optional<Client>
    fun deleteByCode(code:String)
}
