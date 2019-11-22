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

export const PersonService = {
  getAll,
  getById,
}
