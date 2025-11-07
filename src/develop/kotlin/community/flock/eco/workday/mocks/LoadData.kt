package community.flock.eco.workday.mocks

import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadData(
    private val userRepository: UserRepository,
) {
    fun loadWhenEmpty(block: () -> Unit) {
        println("[LoadData] loadWhenEmpty called. Current load value: $load")
        if (load == null) {
            val userCount = userRepository.count()
            load = userCount == 0L
            println("[LoadData] load was null. userRepository.count() = $userCount, setting load = $load")
        }

        if (load == true) {
            println("[LoadData] load == true, running block")
            block()
            println("[LoadData] block completed")
        } else {
            println("[LoadData] load == $load, NOT running block")
        }
    }

    companion object {
        var load: Boolean? = null
    }
}
