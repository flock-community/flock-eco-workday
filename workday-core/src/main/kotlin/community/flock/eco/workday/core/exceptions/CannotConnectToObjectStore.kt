package community.flock.eco.workday.core.exceptions

class CannotConnectToObjectStore(
    ex: Exception,
) : FlockEcoException("Cannot connect to object store", ex)
