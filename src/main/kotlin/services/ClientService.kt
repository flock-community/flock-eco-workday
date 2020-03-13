package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class ClientService(
    private val clientRepository: ClientRepository
) {
    fun findAll(page: Pageable): Page<Client> = clientRepository
            .findAll(page)

    fun findByCode(code: String) = clientRepository
            .findByCode(code)
            .toNullable()

    @Transactional
    fun create(form: ClientForm): Client? = form
            .internalize()
            .save()

    @Transactional
    fun update(code: String, form: ClientForm): Client? = this.findByCode(code)
            ?.let {
                form.internalize(it).save() }

    @Transactional
    fun delete(code: String): Unit = clientRepository
            .deleteByCode(code)

    private fun ClientForm.internalize(it: Client? = null) = Client(
            id = it?.id ?: 0,
            name = this.name
    )

    private fun Client.save() = clientRepository.save(this)
}
