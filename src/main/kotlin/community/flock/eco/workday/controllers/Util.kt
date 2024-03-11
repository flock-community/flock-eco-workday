package community.flock.eco.workday.controllers

import java.util.UUID
import community.flock.eco.workday.api.UUID as UUIDApi

fun UUID.produce(): UUIDApi = UUIDApi(toString()).also(UUIDApi::validate)

// TODO Use validate function from Wirespec file (when migrating openapispec to wirespec file)
fun UUIDApi.validate() = Unit
