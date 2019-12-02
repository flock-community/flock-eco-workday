const path = "/api/persons"

const getAll = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }

  return fetch(`${path}/`).then(res => res.json())
}

const getById = id => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/${id}`, opts).then(res => res.json())
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


const del = id => {
  const opts = {
    method: "DELETE",
  }
  return fetch(`${path}/${id}`, opts).then(res => res.json())
}

export const PersonService = {
  getAll,
  getById,
  post,
  delete: del,
}
