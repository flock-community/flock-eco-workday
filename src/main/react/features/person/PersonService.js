const path = "/api/person"

const getById = id => {
  const opts = {
    method: "GET",
  }
  return fetch(`${path}/${id}`, opts).then(res => {
    return res.json()
  })
}

export const PersonService = {
  getById,
}
