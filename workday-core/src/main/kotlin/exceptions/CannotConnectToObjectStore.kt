package exceptions

import community.flock.eco.core.exceptions.FlockEcoException

class CannotConnectToObjectStore(ex: Exception) : FlockEcoException("Cannot connect to object store", ex)
