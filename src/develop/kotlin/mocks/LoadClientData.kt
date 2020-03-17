package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadClientData(
    private val clientRepository: ClientRepository
) {
    val data: MutableSet<Client> = mutableSetOf()

    init {
        create("Client A")
        create("Client B")
        create("Client C")
        create("Client D")
    }

    private final fun create(name: String) = Client(
            code = name.toLowerCase().replace(" ", "_"),
            name = name)
            .save()

    fun Client.save(): Client = clientRepository
            .save(this)
            .also { data.add(it) }

    fun findClientByCode(code: String): Client = data
        .find { it.code == code }
        ?: error("Cannot find Client")
}
