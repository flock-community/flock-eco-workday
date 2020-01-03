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

const post = item => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  }

  return fetch(`${path}`, opts).then(res => res.json())
}

const put = item => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  }

  return fetch(`${path}/${item.id}`, opts).then(res => res.json())
}

export const PersonService = {
  ...client,
  getAll,
  post,
  put,
}
