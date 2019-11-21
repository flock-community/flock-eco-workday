const path = "/api/person"

const getById = id => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/${id}`, opts).then(res => res.json())
}

export const PersonService = {
  getById,
}
