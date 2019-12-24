import moment from "moment"
const path = {
  sickdays: `/api/sickdays`,
  persons: `/api/persons`,
}

const internalize = it => ({
  ...it,
  from: moment(it.from, "YYYY-MM-DD"),
  to: moment(it.to, "YYYY-MM-DD"),
})
function fetchAllByUserCode(userCode) {
  return fetch(`/api/sickdays?userCode=${userCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

function fetchAll() {
  return fetch(`/api/sickdays`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      throw res.json()
    })
    .then(data => data.map(internalize))
}

function getAllUsers() {
  return fetch(`/api/users/`).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

function getMe() {
  return fetch(`/api/users/me`).then(res => {
    if (res.ok) {
      return res.json()
    }
    throw res.json()
  })
}

function getUserById(id) {
  return fetch(`/api/user/${id}`).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

function getSummary(filter) {
  const typeFilter = filter.length > 0 ? `?type=${filter}` : filter

  return fetch(`/api/sickdays/summary${typeFilter}`).then(res => {
    if (res.status === 200) {
      return res.json()
    }
    throw res.json()
  })
}

export default {
  fetchAllByUserCode,
  getAllUsers,
  getUserById,
  fetchAll,
  getMe,
  getSummary,
}
