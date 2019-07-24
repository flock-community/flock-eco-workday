import moment from "moment";

function fetchById(userId) {

  return fetch(`/api/holidays?userId=${userId}`)
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
  return fetch('/api/holidays', opts)
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

export default {
  fetchById,
  postHoliday,
  getAllUsers,
  getUserById

}
