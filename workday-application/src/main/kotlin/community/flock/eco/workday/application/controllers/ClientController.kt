package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteClient
import community.flock.eco.workday.api.endpoint.GetClientAll
import community.flock.eco.workday.api.endpoint.GetClientByCode
import community.flock.eco.workday.api.endpoint.PostClient
import community.flock.eco.workday.api.endpoint.PutClient
import community.flock.eco.workday.application.forms.ClientForm
import community.flock.eco.workday.application.services.ClientService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.Client as ClientApi
import community.flock.eco.workday.api.model.ClientForm as ClientFormApi
import community.flock.eco.workday.application.model.Client as ClientInternal

@RestController
class ClientController(
    private val clientService: ClientService,
) : GetClientAll.Handler,
    GetClientByCode.Handler,
    PostClient.Handler,
    PutClient.Handler,
    DeleteClient.Handler {
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    override suspend fun getClientAll(request: GetClientAll.Request): GetClientAll.Response<*> {
        val pageable = request.queries.pageable
        val sort = pageable.sort?.takeIf { it.isNotEmpty() }?.let { Sort.by(*it.toTypedArray()) } ?: Sort.unsorted()
        val page = PageRequest.of(pageable.page, pageable.size, sort)
        return GetClientAll.Response200(
            clientService
                .findAll(page)
                .content
                .map { it.externalize() },
        )
    }

    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    override suspend fun getClientByCode(request: GetClientByCode.Request): GetClientByCode.Response<*> {
        val client =
            clientService.findByCode(request.path.code)
                ?: error("Client with code ${request.path.code} not found")
        return GetClientByCode.Response200(client.externalize())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun postClient(request: PostClient.Request): PostClient.Response<*> {
        val client =
            clientService.create(request.body.internalize())
                ?: error("Could not create client")
        return PostClient.Response200(client.externalize())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun putClient(request: PutClient.Request): PutClient.Response<*> {
        val client =
            clientService.update(request.path.code, request.body.internalize())
                ?: error("Client with code ${request.path.code} not found")
        return PutClient.Response200(client.externalize())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun deleteClient(request: DeleteClient.Request): DeleteClient.Response<*> {
        clientService.delete(request.path.code)
        return DeleteClient.Response200(Unit)
    }

    private fun ClientInternal.externalize() =
        ClientApi(
            id = id,
            code = code,
            name = name,
        )

    private fun ClientFormApi.internalize() =
        ClientForm(
            name = name ?: "",
        )
}
