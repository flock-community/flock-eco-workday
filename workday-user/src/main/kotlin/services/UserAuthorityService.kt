package community.flock.eco.feature.user.services

import community.flock.eco.core.authorities.Authority
import org.reflections.Reflections
import org.springframework.stereotype.Service

@Service
class UserAuthorityService {
    private final val reflections = Reflections("community.flock.eco")

    private val classes: MutableSet<Class<out Authority>> = reflections.getSubTypesOf(Authority::class.java).toMutableSet()

    fun addAuthority(clazz: Class<out Authority>) {
        this.classes.add(clazz)
    }

    fun allAuthorities(): List<Authority> =
        classes
            .filter { it.isEnum }
            .flatMap { it.enumConstants.toList() }
}
