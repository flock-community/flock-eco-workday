import {ResourceClient} from "../utils/ResourceClient"
import {PageableClient} from "../utils/PageableClient"

const path = "/api/clients"

const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

export const findByCode = code => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/${code}`, opts).then(res => res.json())
}

export const ClientClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
}
