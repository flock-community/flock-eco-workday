import {toPersonForm} from "./schema"
import {ResourceClient} from "../../utils/ResourceClient"

const path = "/api/persons"
const client = ResourceClient(path)

const getAll = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }

  return fetch(`${path}`, opts).then(res => res.json())
}

const get = code => {
  return client.get(code).then(toPersonForm)
}

const post = async personForm => {
  return client.post(await toPersonForm(personForm))
}

const put = async (code, personForm) => {
  return client.put(code, await toPersonForm(personForm))
}

export const PersonService = {
  ...client,
  getAll,
  get,
  post,
  put,
}
