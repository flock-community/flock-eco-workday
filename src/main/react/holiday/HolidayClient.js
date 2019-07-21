function fetchById(userId) {

  return fetch(`/api/holidays?userId=${userId}`)
    .then(res => res.json())
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

function getUsers() {
  return fetch(`/api/users/`)
      .then(res => res.json())
}

function getUserById(id) {
  return fetch(`/api/user/` + id)
      .then(res => res.json())
}

export default {
  fetchById,
  postHoliday,
  getUsers,
  getUserById

}
