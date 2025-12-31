package community.flock.eco.workday.application.services

import java.util.UUID

interface DocumentStorage {
    fun storeDocument(byteArray: ByteArray): UUID

    fun readDocument(uuid: UUID): ByteArray
}
