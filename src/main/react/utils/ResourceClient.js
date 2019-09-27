export function ResourceClient(path) {

  const get = (id) => {
    const opts = {
      method: 'GET',
    }
    return fetch(`${path}/${id}`, opts)
      .then(res => res.json())
  }


  const post = (item) => {
    const opts = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item)
    }
    return fetch(path, opts)
      .then(res => res.json())
  }

  const put = (id, item) => {
    const opts = {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item)
    }
    return fetch(`${path}/${id}`, opts)
      .then(res => res.json())}

  const del = (id) => {
    const opts = {
      method: 'DELETE',
    }
    return fetch(`${path}/${id}`, opts)
      .then(res => res.json())}


  return {get, post, put, delete:del}

}
