import moment from "moment";

const internalize = (it) =>({
  ...it,
  from: moment(it.from, "YYYY-MM-DD"),
  to: moment(it.to, "YYYY-MM-DD")
})
function fetchAllByUserCode(userCode) {

  return fetch(`/api/sickdays?userCode=${userCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw res.json()
      }
    })
    .then(data => data
      .map(internalize))
}

function fetchAll() {

    return fetch(`/api/sickdays`)
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else {
                throw res.json()
            }
        })
        .then(data => data
            .map(internalize))
}

function postSickday(sickday) {
  const opts = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sickday)
  }
  return fetch(`/api/sickdays`, opts)
    .then(res => res.json())

}


function putSickday(id, sickday) {
  const opts = {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sickday)
  }
  return fetch(`/api/sickdays/${id}`, opts)
    .then(res => res.json())

}

function deleteSickday(id) {
  const opts = {
    method: 'DELETE',
  }
  return fetch(`/api/sickdays/${id}`, opts)
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

    return fetch(`/api/sickdays/summary` + typeFilter)
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
  postSickday,
  putSickday,
  deleteSickday,
  getAllUsers,
  getUserById,
  fetchAll,
  getMe,
  getSummary
}
