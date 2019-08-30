import moment from "moment";

function fetchAllByUserCode(userCode) {

  return fetch(`/api/holidays?userCode=${userCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw res.json()
      }
    })
    .then(data => data
      .map(it => ({
        ...it,
        from: moment(it.from, "YYYY-MM-DD"),
        to: moment(it.to, "YYYY-MM-DD")
      })))
}

function fetchAll() {

    return fetch(`/api/holidays`)
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                throw res.json()
            }
        })
        .then(data => data
            .map(it => ({
                ...it,
                from: moment(it.from, "YYYY-MM-DD"),
                to: moment(it.to, "YYYY-MM-DD")
            })))
}

function postHoliday(holiday) {
  const opts = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holiday)
  }
  return fetch(`/api/holidays`, opts)
    .then(res => res.json())

}


function putHoliday(id, holiday) {
  const opts = {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holiday)
  }
  return fetch(`/api/holidays/${id}`, opts)
    .then(res => res.json())

}

function deleteHoliday(id) {
  const opts = {
    method: 'DELETE',
  }
  return fetch(`/api/holidays/${id}`, opts)
    .then(res => res.json())

}

function getAllUsers() {
  return fetch(`/api/users/`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw res.json()
      }
    })
}

function getMe() {
    return fetch(`/api/users/me`)
        .then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw res.json()
            }
        })
}

function getUserById(id) {
  return fetch(`/api/user/` + id)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw res.json()
      }
    })

}

function getSummary(filter) {

    var typeFilter = filter.length > 0 ? `?type=${filter}` : filter;

    return fetch(`/api/holidays/summary` + typeFilter)
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                throw res.json()
            }
        })

}

export default {
  fetchAllByUserCode,
  postHoliday,
  putHoliday,
  deleteHoliday,
  getAllUsers,
  getUserById,
  fetchAll,
  getMe,
  getSummary
}
