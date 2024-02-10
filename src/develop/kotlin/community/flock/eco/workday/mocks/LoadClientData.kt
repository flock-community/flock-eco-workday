package community.flock.eco.workday.mocks

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadClientData(
    private val clientRepository: ClientRepository,
    loadData: LoadData,
) {
    val data: MutableSet<Client> = mutableSetOf()

    init {
        loadData.loadWhenEmpty {
            create("Client A")
            create("Client B")
            create("Client C")
            create("Client D")
        }
    }

    private final fun create(name: String) =
        Client(
            code = name.lowercase().replace(" ", "_"),
            name = name,
        )
            .save()

    fun Client.save(): Client =
        clientRepository
            .save(this)
            .also { data.add(it) }

    fun findClientByCode(code: String): Client =
        data
            .find { it.code == code }
            ?: error("Cannot find Client")
}
