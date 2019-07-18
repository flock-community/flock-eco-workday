function fetchAll() {

  return fetch(`/api/holidays`)
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

export default {
  fetchAll,
  postHoliday
}
