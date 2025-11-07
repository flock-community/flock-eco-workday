package community.flock.eco.workday.core.authorities

import java.io.Serializable

interface Authority : Serializable {
    fun toName() = "${javaClass.simpleName}.${toString()}"
}
