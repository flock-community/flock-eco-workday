import {toPersonForm} from "./schema"
import {ResourceClient} from "../../utils/ResourceClient"
import {PageableClient} from "../../utils/PageableClient"

const path = "/api/persons"
const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

const getAll = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }

  return fetch(`${path}`, opts).then(res => res.json())
}

const post = async personForm => {
  return resourceClient.post(await toPersonForm(personForm))
}

const put = async (code, personForm) => {
  return resourceClient.put(code, await toPersonForm(personForm))
}

export const PersonService = {
  ...resourceClient,
  ...pageableClient,
  getAll,
  post,
  put,
}
