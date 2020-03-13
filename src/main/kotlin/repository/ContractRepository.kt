package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractType
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ContractRepository : PagingAndSortingRepository<Contract, Long> {
    fun findByCode(code: String): Optional<Contract>
    fun findAllByPersonCode(personCode: String): Iterable<Contract>
    fun findAllByPersonUserCode(userCode: String): Iterable<Contract>
    fun deleteByCode(code: String)
    fun findAllByType(internal: ContractType): Iterable<Contract>
}
