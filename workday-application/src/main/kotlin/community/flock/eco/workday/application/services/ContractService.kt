package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.ContractExternalForm
import community.flock.eco.workday.application.forms.ContractInternalForm
import community.flock.eco.workday.application.forms.ContractManagementForm
import community.flock.eco.workday.application.forms.ContractServiceForm
import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractManagement
import community.flock.eco.workday.application.model.ContractService
import community.flock.eco.workday.application.repository.ContractRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class ContractService(
    private val personRepository: PersonRepository,
    private val contractRepository: ContractRepository,
    private val entityManager: EntityManager,
) {
    fun findAll(page: Pageable): Page<Contract> =
        contractRepository
            .findAll(page)

    fun findByCode(code: String) =
        contractRepository
            .findByCode(code)
            .toNullable()

    fun findAllByPersonUuid(
        personUuid: UUID,
        page: Pageable = Pageable.unpaged(),
    ) = contractRepository
        .findAllByPersonUuid(personUuid, page)

    fun findAllByPersonUserCode(
        userCode: String,
        page: Pageable = Pageable.unpaged(),
    ) = contractRepository
        .findAllByPersonUserCode(userCode, page)

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): MutableList<Contract> {
        val query = "SELECT c FROM Contract c WHERE c.from <= :to AND (c.to is null OR c.to >= :from)"
        return entityManager
            .createQuery(query, Contract::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
    }

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): List<Contract> {
        val query = "SELECT c FROM Contract c WHERE c.from <= :to AND (c.to is null OR c.to >= :from) AND c.person.uuid = :personCode"
        return entityManager
            .createQuery(query, Contract::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
    }

    fun findAllByToBetween(
        start: LocalDate?,
        end: LocalDate?,
    ) = contractRepository.findAllByToBetween(start, end)

    fun findAllByToAfterOrToNull(
        to: LocalDate?,
        page: Pageable,
    ) = contractRepository.findAllByToAfterOrToNull(to, page)

    @Transactional
    fun create(form: ContractExternalForm): ContractExternal? =
        form
            .internalize()
            .save()

    @Transactional
    fun create(form: ContractInternalForm): ContractInternal? =
        form
            .internalize()
            .save()

    @Transactional
    fun create(form: ContractManagementForm): ContractManagement? =
        form
            .internalize()
            .save()

    @Transactional
    fun create(form: ContractServiceForm): ContractService? =
        form
            .internalize()
            .save()

    @Transactional
    fun update(
        code: String,
        form: ContractExternalForm,
    ): ContractExternal? =
        findByCode(code)
            .takeIf { it is ContractExternal }
            ?.let { it as ContractExternal }
            ?.let { form.internalize(it) }
            ?.save()

    @Transactional
    fun update(
        code: String,
        form: ContractInternalForm,
    ): ContractInternal? =
        findByCode(code)
            .takeIf { it is ContractInternal }
            ?.let { it as ContractInternal }
            ?.let { form.internalize(it) }
            ?.save()

    @Transactional
    fun update(
        code: String,
        form: ContractManagementForm,
    ): ContractManagement? =
        findByCode(code)
            .takeIf { it is ContractManagement }
            ?.let { it as ContractManagement }
            ?.let { form.internalize(it) }
            ?.save()

    @Transactional
    fun update(
        code: String,
        form: ContractServiceForm,
    ): ContractService? =
        findByCode(code)
            .takeIf { it is ContractService }
            ?.let { it as ContractService }
            ?.let { form.internalize(it) }
            ?.save()

    @Transactional
    fun deleteByCode(code: String): Unit =
        contractRepository
            .deleteByCode(code)

    private fun ContractExternalForm.internalize(it: ContractExternal? = null) =
        ContractExternal(
            id = it?.id ?: 0,
            from = this.from,
            to = this.to,
            billable = this.billable,
            hourlyRate = this.hourlyRate,
            hoursPerWeek = this.hoursPerWeek,
            person =
                it?.person
                    ?: this.personId.let { personRepository.findByUuid(it).toNullable() }
                    ?: error("Cannot find Person"),
        )

    private fun ContractInternalForm.internalize(it: ContractInternal? = null) =
        ContractInternal(
            id = it?.id ?: 0,
            from = from,
            to = to,
            billable = billable,
            monthlySalary = monthlySalary,
            hoursPerWeek = hoursPerWeek,
            holidayHours = holidayHours,
            hackHours = hackHours,
            person =
                it?.person
                    ?: personId.let { personRepository.findByUuid(it).toNullable() }
                    ?: error("Cannot find Person"),
        )

    private fun ContractManagementForm.internalize(it: ContractManagement? = null) =
        ContractManagement(
            id = it?.id ?: 0,
            from = this.from,
            to = this.to,
            monthlyFee = this.monthlyFee,
            person =
                it?.person
                    ?: this.personId.let { personRepository.findByUuid(it).toNullable() }
                    ?: error("Cannot find Person"),
        )

    private fun ContractServiceForm.internalize(it: ContractService? = null) =
        ContractService(
            id = it?.id ?: 0,
            from = this.from,
            to = this.to,
            monthlyCosts = this.monthlyCosts,
            description = this.description,
        )

    private fun ContractExternal.save() = contractRepository.save(this)

    private fun ContractManagement.save() = contractRepository.save(this)

    private fun ContractInternal.save() = contractRepository.save(this)

    private fun ContractService.save() = contractRepository.save(this)
}
